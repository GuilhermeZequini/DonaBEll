<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Pedido;
use App\Models\Rota;

class ProducaoController extends Controller
{
    /** Pedidos aptos para produção: APROVADO, EM_PRODUCAO, PRONTO. Agrupados por rota (ordem de prioridade da rota). */
    public function index(Request $request)
    {
        $statusProdução = [
            Pedido::STATUS_APROVADO,
            Pedido::STATUS_EM_PRODUCAO,
            Pedido::STATUS_PRONTO,
        ];

        $pedidos = Pedido::with(['cliente.usuario', 'cliente.rota', 'itens.produto'])
            ->whereIn('status', $statusProdução)
            ->get();

        // Agrupar por rota: rota_id => [ pedidos ]. Rotas ordenadas por ordem_prioridade.
        $rotas = Rota::where('ativo', 1)->orderBy('ordem_prioridade')->orderBy('nome')->get();
        $porRota = [];
        foreach ($rotas as $rota) {
            $porRota[$rota->id] = [
                'rota' => ['id' => $rota->id, 'nome' => $rota->nome, 'ordem_prioridade' => $rota->ordem_prioridade],
                'pedidos' => [],
            ];
        }

        // Pedidos sem rota (cliente PF sem rota) - agrupar em "Sem rota"
        $porRota['sem_rota'] = ['rota' => ['id' => null, 'nome' => 'Sem rota', 'ordem_prioridade' => 999], 'pedidos' => []];

        foreach ($pedidos as $pedido) {
            $p = $pedido->cliente ? $pedido->cliente : null;
            $rotaId = $p && $p->Rota_id ? $p->Rota_id : 'sem_rota';
            if (!isset($porRota[$rotaId])) {
                $porRota[$rotaId] = [
                    'rota' => $rotaId === 'sem_rota'
                        ? ['id' => null, 'nome' => 'Sem rota', 'ordem_prioridade' => 999]
                        : ['id' => $rotaId, 'nome' => 'Rota ' . $rotaId, 'ordem_prioridade' => 999],
                    'pedidos' => [],
                ];
            }
            $porRota[$rotaId]['pedidos'][] = $this->formatPedidoResumo($pedido);
        }

        // Ordenar por ordem_prioridade e devolver array de colunas
        $rotasOrdenadas = $rotas->map(fn ($r) => $r->id)->all();
        $resultado = [];
        foreach ($rotasOrdenadas as $rid) {
            if (isset($porRota[$rid])) {
                $resultado[] = $porRota[$rid];
            }
        }
        if (!empty($porRota['sem_rota']['pedidos'])) {
            $resultado[] = $porRota['sem_rota'];
        }

        return response()->json(['por_rota' => $resultado], 200);
    }

    /** Consolidação: por rota, lista de produtos com quantidade total a produzir. */
    public function consolidacao(Request $request)
    {
        $statusProdução = [
            Pedido::STATUS_APROVADO,
            Pedido::STATUS_EM_PRODUCAO,
            Pedido::STATUS_PRONTO,
        ];

        $itens = DB::table('Itens_pedido')
            ->join('Pedido', 'Itens_pedido.Pedido_id', '=', 'Pedido.id')
            ->join('cliente', 'Pedido.Cliente_Usuario_id', '=', 'cliente.Usuario_id')
            ->join('Produto', 'Itens_pedido.Produto_id', '=', 'Produto.id')
            ->whereIn('Pedido.status', $statusProdução)
            ->select(
                'cliente.Rota_id',
                'Itens_pedido.Produto_id',
                'Produto.nome as produto_nome',
                DB::raw('SUM(Itens_pedido.quantidade) as quantidade_total')
            )
            ->groupBy('cliente.Rota_id', 'Itens_pedido.Produto_id', 'Produto.nome')
            ->orderBy('cliente.Rota_id')
            ->orderBy('Produto.nome')
            ->get();

        $porRota = [];
        foreach ($itens as $row) {
            $rotaId = $row->Rota_id ?? 'sem_rota';
            if (!isset($porRota[$rotaId])) {
                $porRota[$rotaId] = ['rota_id' => $rotaId, 'produtos' => []];
            }
            $porRota[$rotaId]['produtos'][] = [
                'Produto_id' => $row->Produto_id,
                'produto_nome' => $row->produto_nome,
                'quantidade_total' => (int) $row->quantidade_total,
            ];
        }

        $rotas = Rota::where('ativo', 1)->orderBy('ordem_prioridade')->get();
        $resultado = [];
        foreach ($rotas as $r) {
            $resultado[] = [
                'rota_id' => $r->id,
                'rota_nome' => $r->nome,
                'produtos' => isset($porRota[$r->id]) ? $porRota[$r->id]['produtos'] : [],
            ];
        }
        if (isset($porRota['sem_rota'])) {
            $resultado[] = [
                'rota_id' => null,
                'rota_nome' => 'Sem rota',
                'produtos' => $porRota['sem_rota']['produtos'],
            ];
        }

        return response()->json(['consolidacao' => $resultado], 200);
    }

    /** Atualizar status do pedido para EM_PRODUCAO ou PRONTO. */
    public function atualizarStatus(Request $request, string $id)
    {
        $request->validate([
            'status' => 'required|in:EM_PRODUCAO,PRONTO',
        ]);

        $pedido = Pedido::find($id);
        if (!$pedido) {
            return response()->json(['error' => 'Pedido não encontrado'], 404);
        }

        $novo = $request->status;
        $atual = $pedido->status;

        if ($novo === 'EM_PRODUCAO' && $atual !== Pedido::STATUS_APROVADO) {
            return response()->json(['message' => 'Só é possível marcar Em produção para pedidos Aprovados.'], 422);
        }
        if ($novo === 'PRONTO' && $atual !== Pedido::STATUS_EM_PRODUCAO) {
            return response()->json(['message' => 'Só é possível marcar Pronto para pedidos Em produção.'], 422);
        }

        $pedido->status = $novo;
        $pedido->save();

        return response()->json([
            'id' => $pedido->id,
            'status' => $pedido->status,
        ], 200);
    }

    private function formatPedidoResumo($p)
    {
        $cliente = $p->cliente ?? null;
        $itens = collect($p->itens ?? [])->map(fn ($i) => [
            'produto_nome' => $i->produto ? $i->produto->nome : null,
            'quantidade' => (int) $i->quantidade,
        ])->values()->all();

        return [
            'id' => $p->id,
            'cliente_nome' => $cliente && $cliente->usuario ? $cliente->usuario->nome : null,
            'status' => $p->status,
            'valor_total' => (float) $p->valor_total,
            'itens' => $itens,
        ];
    }
}
