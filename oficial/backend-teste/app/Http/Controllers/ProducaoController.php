<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Pedido;
use App\Models\Rota;

class ProducaoController extends Controller
{
    /**
     * Pedidos APROVADO, EM_PRODUCAO, PRONTO.
     * Agrupados por semana (domingo a sábado, data do pedido) e, em cada semana, por rota.
     * Só entram rotas com pelo menos um pedido naquela semana.
     */
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

        $rotas = Rota::where('ativo', 1)->orderBy('ordem_prioridade')->orderBy('nome')->get();
        $rotasOrdenadas = $rotas->map(fn ($r) => $r->id)->all();

        /** @var array<string, array{semana_inicio: string, semana_fim: string, label: string, _rotas: array}> $porSemana */
        $porSemana = [];

        foreach ($pedidos as $pedido) {
            $data = $pedido->data_cadastro ? Carbon::parse($pedido->data_cadastro) : null;
            if (!$data) {
                continue;
            }

            $inicioSemana = $data->copy()->startOfWeek(Carbon::SUNDAY);
            $fimSemana = $inicioSemana->copy()->addDays(6);
            $chaveSemana = $inicioSemana->format('Y-m-d');

            if (!isset($porSemana[$chaveSemana])) {
                $porSemana[$chaveSemana] = [
                    'semana_inicio' => $inicioSemana->format('Y-m-d'),
                    'semana_fim' => $fimSemana->format('Y-m-d'),
                    'label' => $this->formatarLabelSemanaProducao($inicioSemana, $fimSemana),
                    '_rotas' => [],
                ];
            }

            $cliente = $pedido->cliente;
            $rotaId = $cliente && $cliente->Rota_id ? $cliente->Rota_id : 'sem_rota';

            if (!isset($porSemana[$chaveSemana]['_rotas'][$rotaId])) {
                $porSemana[$chaveSemana]['_rotas'][$rotaId] = [
                    'rota' => $this->metaRotaProducao($rotaId, $rotas),
                    'pedidos' => [],
                ];
            }

            $porSemana[$chaveSemana]['_rotas'][$rotaId]['pedidos'][] = $this->formatPedidoResumo($pedido);
        }

        ksort($porSemana);

        $resultadoSemanas = [];
        foreach ($porSemana as $bloco) {
            $map = $bloco['_rotas'];
            $porRotaSemana = [];

            foreach ($rotasOrdenadas as $rid) {
                if (!empty($map[$rid]['pedidos'])) {
                    $porRotaSemana[] = $map[$rid];
                }
            }
            if (!empty($map['sem_rota']['pedidos'])) {
                $porRotaSemana[] = $map['sem_rota'];
            }

            if (!empty($porRotaSemana)) {
                unset($bloco['_rotas']);
                $bloco['por_rota'] = $porRotaSemana;
                $resultadoSemanas[] = $bloco;
            }
        }

        return response()->json(['por_semana' => $resultadoSemanas], 200);
    }

    /** @param \Illuminate\Support\Collection<int, Rota> $rotas */
    private function metaRotaProducao(int|string $rotaId, $rotas): array
    {
        if ($rotaId === 'sem_rota') {
            return ['id' => null, 'nome' => 'Sem rota', 'ordem_prioridade' => 999];
        }
        $r = $rotas->firstWhere('id', $rotaId);

        return $r
            ? ['id' => $r->id, 'nome' => $r->nome, 'ordem_prioridade' => $r->ordem_prioridade]
            : ['id' => (int) $rotaId, 'nome' => 'Rota ' . $rotaId, 'ordem_prioridade' => 999];
    }

    private function formatarLabelSemanaProducao(Carbon $inicio, Carbon $fim): string
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
     * Consolidação por semana (domingo a sábado, data de cadastro do pedido).
     * Query: n_semanas (1–26, padrão 1) — semana atual e semanas anteriores, uma entrada por semana.
     */
    public function consolidacao(Request $request)
    {
        $request->validate([
            'n_semanas' => 'sometimes|integer|min:1|max:26',
        ]);
        $nSemanas = min(max((int) $request->query('n_semanas', 1), 1), 26);

        $now = Carbon::now();
        $inicioRange = $now->copy()->startOfWeek(Carbon::SUNDAY)->subWeeks($nSemanas - 1)->startOfDay();
        $fimRange = $now->copy()->startOfWeek(Carbon::SUNDAY)->addDays(6)->endOfDay();

        $statusProdução = [
            Pedido::STATUS_APROVADO,
            Pedido::STATUS_EM_PRODUCAO,
            Pedido::STATUS_PRONTO,
        ];

        $rows = DB::table('itens_pedido')
            ->join('pedido', 'itens_pedido.Pedido_id', '=', 'pedido.id')
            ->join('cliente', 'pedido.Cliente_Usuario_id', '=', 'cliente.Usuario_id')
            ->join('produto', 'itens_pedido.Produto_id', '=', 'produto.id')
            ->whereIn('pedido.status', $statusProdução)
            ->whereNotNull('pedido.data_cadastro')
            ->whereBetween('pedido.data_cadastro', [$inicioRange, $fimRange])
            ->select(
                'cliente.Rota_id',
                'itens_pedido.Produto_id',
                'produto.nome as produto_nome',
                'itens_pedido.quantidade',
                'pedido.data_cadastro'
            )
            ->get();

        /** @var array<string, array<int|string, array<int, array{produto_nome: string, quantidade_total: int}>>> $bucket chave semana (Y-m-d domingo) */
        $bucket = [];
        foreach ($rows as $row) {
            $d = Carbon::parse($row->data_cadastro);
            $wk = $d->copy()->startOfWeek(Carbon::SUNDAY)->format('Y-m-d');
            $rid = $row->Rota_id === null ? 'sem_rota' : (int) $row->Rota_id;
            $pid = (int) $row->Produto_id;
            if (!isset($bucket[$wk][$rid][$pid])) {
                $bucket[$wk][$rid][$pid] = [
                    'produto_nome' => $row->produto_nome,
                    'quantidade_total' => 0,
                ];
            }
            $bucket[$wk][$rid][$pid]['quantidade_total'] += (int) $row->quantidade;
        }

        $semanas = [];
        for ($k = 0; $k < $nSemanas; $k++) {
            $domingo = $now->copy()->startOfWeek(Carbon::SUNDAY)->subWeeks($k);
            $chave = $domingo->format('Y-m-d');
            $sabado = $domingo->copy()->addDays(6);
            $labelBase = $this->formatarLabelSemanaProducao($domingo->copy(), $sabado->copy());
            $label = $k === 0
                ? 'Semana atual (' . $labelBase . ')'
                : $labelBase;
            $meta = [
                'tipo' => 'semana',
                'label' => $label,
                'inicio' => $domingo->format('Y-m-d'),
                'fim' => $sabado->format('Y-m-d'),
            ];
            $mapPorRota = $this->mapaProdutosPorRotaDaSemana($bucket[$chave] ?? []);
            $semanas[] = [
                'periodo' => $meta,
                'consolidacao' => $this->resultadoConsolidacaoOrdenadoPorRotas($mapPorRota),
            ];
        }

        return response()->json(['semanas' => $semanas], 200);
    }

    /**
     * @param array<int|string, array<int, array{produto_nome: string, quantidade_total: int}>> $porRotaBruto
     * @return array<int|string, array<int, array{Produto_id: int, produto_nome: string, quantidade_total: int}>>
     */
    private function mapaProdutosPorRotaDaSemana(array $porRotaBruto): array
    {
        $map = [];
        foreach ($porRotaBruto as $rid => $byPid) {
            $lista = [];
            foreach ($byPid as $pid => $info) {
                $lista[] = [
                    'Produto_id' => $pid,
                    'produto_nome' => $info['produto_nome'],
                    'quantidade_total' => $info['quantidade_total'],
                ];
            }
            usort($lista, fn ($a, $b) => strcmp($a['produto_nome'], $b['produto_nome']));
            $map[$rid] = $lista;
        }

        return $map;
    }

    /**
     * @param array<int|string, array<int, array{Produto_id: int, produto_nome: string, quantidade_total: int}>> $mapPorRota
     * @return array<int, array{rota_id: int|null, rota_nome: string, produtos: array<int, array<string, mixed>>}>
     */
    private function resultadoConsolidacaoOrdenadoPorRotas(array $mapPorRota): array
    {
        $rotas = Rota::where('ativo', 1)->orderBy('ordem_prioridade')->orderBy('nome')->get();
        $resultado = [];
        foreach ($rotas as $r) {
            if (!empty($mapPorRota[$r->id])) {
                $resultado[] = [
                    'rota_id' => $r->id,
                    'rota_nome' => $r->nome,
                    'produtos' => $mapPorRota[$r->id],
                ];
            }
        }
        if (!empty($mapPorRota['sem_rota'])) {
            $resultado[] = [
                'rota_id' => null,
                'rota_nome' => 'Sem rota',
                'produtos' => $mapPorRota['sem_rota'],
            ];
        }

        return $resultado;
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
        // Para perfil PRODUCAO: não retornar nenhum valor monetário.
        $ocultarValores = request()->user() && request()->user()->tipo_perfil === 'PRODUCAO';

        $cliente = $p->cliente ?? null;
        $itens = collect($p->itens ?? [])->map(fn ($i) => [
            'produto_nome' => $i->produto ? $i->produto->nome : null,
            'quantidade' => (int) $i->quantidade,
        ])->values()->all();

        $resumo = [
            'id' => $p->id,
            'cliente_nome' => $cliente && $cliente->usuario ? $cliente->usuario->nome : null,
            'status' => $p->status,
            'data_cadastro' => $p->data_cadastro ? $p->data_cadastro->format('Y-m-d H:i:s') : null,
            'itens' => $itens,
        ];

        if (!$ocultarValores) {
            $resumo['valor_total'] = (float) $p->valor_total;
        }

        return $resumo;
    }
}
