<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pedido;
use App\Models\ItemPedido;
use App\Models\Cliente;
use App\Models\Produto;

class PedidoController extends Controller
{
    public function index(Request $request)
    {
        $query = Pedido::with(['cliente.usuario', 'cliente.rota', 'itens.produto', 'vendedor']);

        $status = $request->get('status');
        if ($status && $this->statusValido($status)) {
            $query->where('status', $status);
        }

        $clienteId = $request->get('cliente_id');
        if ($clienteId) {
            $query->where('Cliente_Usuario_id', $clienteId);
        }

        $perPage = (int) $request->get('per_page', 15);
        $perPage = max(1, min(100, $perPage ?: 15));

        $paginado = $query->orderByDesc('data_cadastro')->paginate($perPage);
        $paginado->getCollection()->transform(fn ($p) => $this->formatPedido($p));

        return response()->json($paginado, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'Cliente_Usuario_id' => 'required|exists:cliente,Usuario_id',
            'itens' => 'required|array|min:1',
            'itens.*.Produto_id' => 'required|exists:produto,id',
            'itens.*.quantidade' => 'required|integer|min:1',
            'observacao' => 'nullable|string|max:255',
        ]);

        $cliente = Cliente::with('usuario')->find($request->Cliente_Usuario_id);
        if (!$cliente) {
            return response()->json(['message' => 'Cliente não encontrado.'], 404);
        }

        $tipoCliente = $cliente->tipo_cliente; // PF ou PJ
        $precoCampo = $tipoCliente === 'PJ' ? 'preco_pj' : 'preco_pf';

        $valorTotal = 0;
        $itensParaSalvar = [];

        foreach ($request->itens as $item) {
            $produto = Produto::find($item['Produto_id']);
            if (!$produto || !$produto->ativo) {
                return response()->json(['message' => "Produto ID {$item['Produto_id']} não encontrado ou inativo."], 422);
            }
            $qty = (int) $item['quantidade'];
            $preco = (float) $produto->$precoCampo;
            $itensParaSalvar[] = [
                'Produto_id' => $produto->id,
                'quantidade' => $qty,
                'preco_unitario' => $preco,
                'observacao' => $item['observacao'] ?? null,
            ];
            $valorTotal += $qty * $preco;
        }

        $pedido = new Pedido();
        $pedido->Usuario_id = $request->user()->id;
        $pedido->Cliente_Usuario_id = $request->Cliente_Usuario_id;
        $pedido->data_cadastro = now();
        $pedido->status = Pedido::STATUS_NOVO;
        $pedido->observacao = $request->observacao;
        $pedido->valor_total = round($valorTotal, 2);
        $pedido->save();

        foreach ($itensParaSalvar as $row) {
            $row['Pedido_id'] = $pedido->id;
            ItemPedido::create($row);
        }

        return response()->json($this->formatPedido(Pedido::with(['cliente.usuario', 'cliente.rota', 'itens.produto'])->find($pedido->id)), 201);
    }

    public function show(string $pedido)
    {
        $pedido = Pedido::with(['cliente.usuario', 'cliente.rota', 'itens.produto', 'vendedor'])->find($pedido);
        if (!$pedido) {
            return response()->json(['error' => 'Pedido não encontrado'], 404);
        }
        return response()->json($this->formatPedido($pedido), 200);
    }

    public function update(Request $request, string $pedido)
    {
        $pedido = Pedido::with(['cliente', 'itens'])->find($pedido);
        if (!$pedido) {
            return response()->json(['error' => 'Pedido não encontrado'], 404);
        }
        if ($pedido->status !== Pedido::STATUS_NOVO) {
            return response()->json(['message' => 'Só é possível alterar pedidos com status Novo.'], 422);
        }

        $request->validate([
            'itens' => 'sometimes|array|min:1',
            'itens.*.Produto_id' => 'required_with:itens|exists:produto,id',
            'itens.*.quantidade' => 'required_with:itens|integer|min:1',
            'observacao' => 'nullable|string|max:255',
        ]);

        if ($request->has('observacao')) {
            $pedido->observacao = $request->observacao;
        }

        if ($request->has('itens')) {
            $cliente = $pedido->cliente;
            $tipoCliente = $cliente->tipo_cliente;
            $precoCampo = $tipoCliente === 'PJ' ? 'preco_pj' : 'preco_pf';

            ItemPedido::where('Pedido_id', $pedido->id)->delete();
            $valorTotal = 0;
            foreach ($request->itens as $item) {
                $produto = Produto::find($item['Produto_id']);
                if (!$produto || !$produto->ativo) {
                    return response()->json(['message' => "Produto ID {$item['Produto_id']} não encontrado ou inativo."], 422);
                }
                $qty = (int) $item['quantidade'];
                $preco = (float) $produto->$precoCampo;
                ItemPedido::create([
                    'Pedido_id' => $pedido->id,
                    'Produto_id' => $produto->id,
                    'quantidade' => $qty,
                    'preco_unitario' => $preco,
                    'observacao' => $item['observacao'] ?? null,
                ]);
                $valorTotal += $qty * $preco;
            }
            $pedido->valor_total = round($valorTotal, 2);
        }

        $pedido->save();
        return response()->json($this->formatPedido(Pedido::with(['cliente.usuario', 'cliente.rota', 'itens.produto'])->find($pedido->id)), 200);
    }

    public function destroy(string $pedido)
    {
        $pedido = Pedido::find($pedido);
        if (!$pedido) {
            return response()->json(['error' => 'Pedido não encontrado'], 404);
        }
        if ($pedido->status !== Pedido::STATUS_NOVO && $pedido->status !== Pedido::STATUS_REJEITADO) {
            return response()->json(['message' => 'Só é possível excluir pedidos Novo ou Rejeitado.'], 422);
        }
        ItemPedido::where('Pedido_id', $pedido->id)->delete();
        $pedido->delete();
        return response()->json(null, 204);
    }

    /** Aprovar pedido (gerente). */
    public function aprovar(Request $request, string $id)
    {
        $pedido = Pedido::find($id);
        if (!$pedido) {
            return response()->json(['error' => 'Pedido não encontrado'], 404);
        }
        if ($pedido->status !== Pedido::STATUS_NOVO) {
            return response()->json(['message' => 'Só é possível aprovar pedidos com status Novo.'], 422);
        }
        $pedido->status = Pedido::STATUS_APROVADO;
        $pedido->save();
        return response()->json($this->formatPedido(Pedido::with(['cliente.usuario', 'cliente.rota', 'itens.produto'])->find($pedido->id)), 200);
    }

    /** Rejeitar pedido (gerente). */
    public function rejeitar(Request $request, string $id)
    {
        $pedido = Pedido::find($id);
        if (!$pedido) {
            return response()->json(['error' => 'Pedido não encontrado'], 404);
        }
        if ($pedido->status !== Pedido::STATUS_NOVO) {
            return response()->json(['message' => 'Só é possível rejeitar pedidos com status Novo.'], 422);
        }
        $pedido->status = Pedido::STATUS_REJEITADO;
        $pedido->save();
        return response()->json($this->formatPedido(Pedido::with(['cliente.usuario', 'cliente.rota', 'itens.produto'])->find($pedido->id)), 200);
    }

    private function statusValido(string $s): bool
    {
        return in_array($s, [
            Pedido::STATUS_NOVO, Pedido::STATUS_APROVADO, Pedido::STATUS_REJEITADO,
            Pedido::STATUS_EM_PRODUCAO, Pedido::STATUS_PRONTO, Pedido::STATUS_EM_ENTREGA,
            Pedido::STATUS_ENTREGUE, Pedido::STATUS_CANCELADO,
        ], true);
    }

    private function formatPedido($p)
    {
        $cliente = $p->cliente ?? null;
        $rota = $cliente->rota ?? null;
        $vendedor = $p->vendedor ?? null;
        $itens = collect($p->itens ?? [])->map(function ($i) {
            $prod = $i->produto ?? null;
            return [
                'id' => $i->id,
                'Pedido_id' => $i->Pedido_id,
                'Produto_id' => $i->Produto_id,
                'produto_nome' => $prod ? $prod->nome : null,
                'quantidade' => (int) $i->quantidade,
                'preco_unitario' => (float) $i->preco_unitario,
                'observacao' => $i->observacao,
            ];
        })->values()->all();

        return [
            'id' => $p->id,
            'Usuario_id' => $p->Usuario_id,
            'vendedor_nome' => $vendedor ? $vendedor->nome : null,
            'Cliente_Usuario_id' => $p->Cliente_Usuario_id,
            'cliente_nome' => $cliente && $cliente->usuario ? $cliente->usuario->nome : null,
            'cliente_tipo' => $cliente ? $cliente->tipo_cliente : null,
            'rota_id' => $rota ? $rota->id : null,
            'rota_nome' => $rota ? $rota->nome : null,
            'data_cadastro' => $p->data_cadastro ? $p->data_cadastro->format('Y-m-d H:i:s') : null,
            'status' => $p->status,
            'observacao' => $p->observacao,
            'valor_total' => (float) $p->valor_total,
            'itens' => $itens,
        ];
    }
}
