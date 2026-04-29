<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\Pedido;
use App\Models\Rota;

class EntregasController extends Controller
{
    /**
     * Lista pedidos PRONTOS com rota atribuída, agrupados por semana e por rota.
     * Semana: domingo a sábado (baseado em data_cadastro).
     * Dentro de cada rota, ordenados por ordem_entrega e id.
     */
    public function index(Request $request)
    {
        $ano = (int) ($request->get('ano') ?? now()->year);
        $mes = $request->has('mes') && $request->get('mes') !== '' ? (int) $request->get('mes') : null;

        $query = Pedido::with(['cliente.usuario', 'cliente.rota', 'itens.produto'])
            ->where('status', Pedido::STATUS_PRONTO)
            ->whereHas('cliente', fn ($q) => $q->whereNotNull('Rota_id'))
            ->whereYear('data_cadastro', $ano);

        if ($mes !== null) {
            $query->whereMonth('data_cadastro', $mes);
        }

        $pedidos = $query->orderBy('data_cadastro')->get();
        $rotas = Rota::where('ativo', 1)->orderBy('ordem_prioridade')->orderBy('nome')->get();

        // Agrupar por semana e por rota: por_semana[chaveSemana][rotaId] = pedidos
        $porSemana = [];

        foreach ($pedidos as $pedido) {
            $data = $pedido->data_cadastro ? Carbon::parse($pedido->data_cadastro) : null;
            if (!$data) {
                continue;
            }

            $inicioSemana = $data->copy()->startOfWeek(Carbon::SUNDAY);
            $fimSemana = $inicioSemana->copy()->addDays(6);
            $chaveSemana = $inicioSemana->format('Y-m-d');

            $rotaId = $pedido->cliente?->Rota_id;
            if (!$rotaId) {
                continue;
            }

            if (!isset($porSemana[$chaveSemana])) {
                $porSemana[$chaveSemana] = [
                    'semana_inicio' => $inicioSemana->format('Y-m-d'),
                    'semana_fim' => $fimSemana->format('Y-m-d'),
                    'label' => $this->formatarLabelSemana($inicioSemana, $fimSemana),
                    'por_rota' => [],
                ];
            }

            $rota = $rotas->firstWhere('id', $rotaId);
            if (!$rota) {
                continue;
            }

            if (!isset($porSemana[$chaveSemana]['por_rota'][$rotaId])) {
                $porSemana[$chaveSemana]['por_rota'][$rotaId] = [
                    'rota' => ['id' => $rota->id, 'nome' => $rota->nome, 'ordem_prioridade' => $rota->ordem_prioridade],
                    'pedidos' => [],
                ];
            }

            $porSemana[$chaveSemana]['por_rota'][$rotaId]['pedidos'][] = $this->formatPedidoResumo($pedido);
        }

        foreach ($porSemana as $chave => $bloco) {
            foreach ($bloco['por_rota'] as $rotaId => $col) {
                usort($porSemana[$chave]['por_rota'][$rotaId]['pedidos'], function ($a, $b) {
                    $oa = $a['ordem_entrega'] ?? 999999;
                    $ob = $b['ordem_entrega'] ?? 999999;
                    if ($oa !== $ob) {
                        return $oa <=> $ob;
                    }
                    return ($a['id'] ?? 0) <=> ($b['id'] ?? 0);
                });
            }
            $colunas = array_values(array_filter($bloco['por_rota'], fn ($c) => !empty($c['pedidos'])));
            usort($colunas, fn ($a, $b) => ($a['rota']['ordem_prioridade'] ?? 0) <=> ($b['rota']['ordem_prioridade'] ?? 0));
            $porSemana[$chave]['por_rota'] = $colunas;
        }

        $porSemana = array_filter($porSemana, fn ($b) => !empty($b['por_rota']));
        ksort($porSemana);

        return response()->json([
            'ano' => $ano,
            'mes' => $mes,
            'por_semana' => array_values($porSemana),
        ], 200);
    }

    private function formatarLabelSemana(Carbon $inicio, Carbon $fim): string
    {
        $meses = [1 => 'janeiro', 2 => 'fevereiro', 3 => 'março', 4 => 'abril', 5 => 'maio', 6 => 'junho',
            7 => 'julho', 8 => 'agosto', 9 => 'setembro', 10 => 'outubro', 11 => 'novembro', 12 => 'dezembro'];
        $mesInicio = $meses[$inicio->month] ?? '';
        $mesFim = $meses[$fim->month] ?? '';
        $ano = $inicio->year;
        if ($mesInicio === $mesFim) {
            return sprintf('%d a %d de %s de %d', $inicio->day, $fim->day, $mesInicio, $ano);
        }
        return sprintf('%d/%s a %d/%s de %d', $inicio->day, $mesInicio, $fim->day, $mesFim, $ano);
    }

    /**
     * Marca pedido como ENTREGUE. Apenas pedidos PRONTOS.
     */
    public function marcarEntregue(Request $request, string $id)
    {
        $pedido = Pedido::find($id);
        if (!$pedido) {
            return response()->json(['error' => 'Pedido não encontrado'], 404);
        }
        if ($pedido->status !== Pedido::STATUS_PRONTO) {
            return response()->json(['message' => 'Só é possível marcar como entregue pedidos com status Pronto.'], 422);
        }

        $pedido->status = Pedido::STATUS_ENTREGUE;
        $pedido->save();

        return response()->json(['id' => $pedido->id, 'status' => $pedido->status], 200);
    }

    /**
     * Reordena pedidos dentro de uma rota.
     * Body: { rota_id: 1, pedido_ids: [3, 1, 5, 2, 4] }
     */
    public function reordenar(Request $request)
    {
        $request->validate([
            'rota_id' => 'required|integer|exists:rota,id',
            'pedido_ids' => 'required|array',
            'pedido_ids.*' => 'required|integer|exists:Pedido,id',
        ]);

        $rotaId = (int) $request->rota_id;
        $ids = $request->pedido_ids;

        foreach ($ids as $pos => $pedidoId) {
            Pedido::where('id', $pedidoId)
                ->whereHas('cliente', fn ($q) => $q->where('Rota_id', $rotaId))
                ->update(['ordem_entrega' => $pos]);
        }

        return response()->json(['message' => 'Ordem atualizada'], 200);
    }

    private function formatPedidoResumo($p)
    {
        $cliente = $p->cliente ?? null;
        $rota = $cliente?->rota ?? null;
        $itens = collect($p->itens ?? [])->map(fn ($i) => [
            'produto_nome' => $i->produto ? $i->produto->nome : null,
            'quantidade' => (int) $i->quantidade,
        ])->values()->all();

        return [
            'id' => $p->id,
            'cliente_nome' => $cliente && $cliente->usuario ? $cliente->usuario->nome : null,
            'status' => $p->status,
            'valor_total' => (float) $p->valor_total,
            'data_cadastro' => $p->data_cadastro ? $p->data_cadastro->format('Y-m-d H:i:s') : null,
            'ordem_entrega' => $p->ordem_entrega,
            'rota_id' => $rota ? $rota->id : null,
            'rota_nome' => $rota ? $rota->nome : null,
            'itens' => $itens,
        ];
    }
}
