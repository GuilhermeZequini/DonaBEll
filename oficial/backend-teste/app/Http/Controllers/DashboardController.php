<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\Pedido;
use App\Models\Rota;

class DashboardController extends Controller
{
    /**
     * Pedidos agrupados por rota e por semana (domingo a sábado).
     * Retorna apenas rotas/semanas que têm pedidos.
     */
    public function index(Request $request)
    {
        $ano = (int) ($request->get('ano') ?? now()->year);
        $mes = $request->get('mes'); // opcional: filtrar por mês

        $query = Pedido::with(['cliente.usuario', 'cliente.rota', 'itens.produto'])
            ->whereYear('data_cadastro', $ano);

        // VENDEDOR vê apenas os próprios pedidos (criados por ele)
        $usuario = $request->user();
        if ($usuario && $usuario->tipo_perfil === 'VENDEDOR') {
            $query->where('Usuario_id', $usuario->id);
        }
        // CLIENTE vê apenas os pedidos dele
        if ($usuario && $usuario->tipo_perfil === 'CLIENTE') {
            $query->where('Cliente_Usuario_id', $usuario->id);
        }

        if ($mes !== null && $mes !== '') {
            $query->whereMonth('data_cadastro', (int) $mes);
        }

        $pedidos = $query->orderBy('data_cadastro')->get();

        // Agrupar por rota e por semana (domingo = início da semana)
        $porRotaSemana = [];

        foreach ($pedidos as $pedido) {
            $data = $pedido->data_cadastro ? Carbon::parse($pedido->data_cadastro) : null;
            if (!$data) {
                continue;
            }

            $inicioSemana = $data->copy()->startOfWeek(Carbon::SUNDAY);
            $fimSemana = $inicioSemana->copy()->addDays(6);
            $chaveSemana = $inicioSemana->format('Y-m-d');

            $cliente = $pedido->cliente ?? null;
            $rotaId = $cliente && $cliente->Rota_id ? $cliente->Rota_id : 'sem_rota';

            if (!isset($porRotaSemana[$rotaId])) {
                $porRotaSemana[$rotaId] = [];
            }
            if (!isset($porRotaSemana[$rotaId][$chaveSemana])) {
                $porRotaSemana[$rotaId][$chaveSemana] = [
                    'semana_inicio' => $inicioSemana->format('Y-m-d'),
                    'semana_fim' => $fimSemana->format('Y-m-d'),
                    'label' => $this->formatarLabelSemana($inicioSemana, $fimSemana),
                    'pedidos' => [],
                ];
            }

            $porRotaSemana[$rotaId][$chaveSemana]['pedidos'][] = $this->formatPedidoResumo($pedido);
        }

        // Montar resposta: rotas ordenadas, dentro de cada rota as semanas ordenadas
        $rotas = Rota::where('ativo', 1)->orderBy('ordem_prioridade')->orderBy('nome')->get();
        $resultado = [];

        foreach ($rotas as $rota) {
            if (!isset($porRotaSemana[$rota->id]) || empty($porRotaSemana[$rota->id])) {
                continue;
            }
            $semanas = $porRotaSemana[$rota->id];
            ksort($semanas);
            $resultado[] = [
                'rota' => ['id' => $rota->id, 'nome' => $rota->nome, 'ordem_prioridade' => $rota->ordem_prioridade],
                'semanas' => array_values($semanas),
            ];
        }

        // Sem rota
        if (isset($porRotaSemana['sem_rota']) && !empty($porRotaSemana['sem_rota'])) {
            $semanas = $porRotaSemana['sem_rota'];
            ksort($semanas);
            $resultado[] = [
                'rota' => ['id' => null, 'nome' => 'Sem rota', 'ordem_prioridade' => 999],
                'semanas' => array_values($semanas),
            ];
        }

        return response()->json([
            'ano' => $ano,
            'mes' => $mes ? (int) $mes : null,
            'por_rota' => $resultado,
        ], 200);
    }

    private function formatarLabelSemana(Carbon $inicio, Carbon $fim): string
    {
        $mesInicio = $this->nomeMes($inicio->month);
        $mesFim = $this->nomeMes($fim->month);
        $ano = $inicio->year;

        if ($mesInicio === $mesFim) {
            return sprintf('%d a %d de %s de %d', $inicio->day, $fim->day, $mesInicio, $ano);
        }
        return sprintf('%d/%s a %d/%s de %d', $inicio->day, $mesInicio, $fim->day, $mesFim, $ano);
    }

    private function nomeMes(int $mes): string
    {
        $meses = [
            1 => 'janeiro', 2 => 'fevereiro', 3 => 'março', 4 => 'abril',
            5 => 'maio', 6 => 'junho', 7 => 'julho', 8 => 'agosto',
            9 => 'setembro', 10 => 'outubro', 11 => 'novembro', 12 => 'dezembro',
        ];
        return $meses[$mes] ?? '';
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
            'data_cadastro' => $p->data_cadastro ? $p->data_cadastro->format('Y-m-d H:i:s') : null,
            'itens' => $itens,
        ];
    }
}
