<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Pedido;
use App\Models\Cliente;
use App\Models\Produto;
use App\Models\Rota;

class RelatoriosController extends Controller
{
    /** Status considerados para relatórios (pedidos efetivos, excluindo rejeitado/cancelado). */
    private const STATUS_VALIDOS = [
        Pedido::STATUS_NOVO,
        Pedido::STATUS_APROVADO,
        Pedido::STATUS_EM_PRODUCAO,
        Pedido::STATUS_PRONTO,
        Pedido::STATUS_EM_ENTREGA,
        Pedido::STATUS_ENTREGUE,
    ];

    /**
     * Retorna todos os relatórios. Parâmetros opcionais: ano, mes.
     */
    public function index(Request $request)
    {
        $ano = (int) ($request->get('ano') ?? now()->year);
        $mes = $request->has('mes') && $request->get('mes') !== '' ? (int) $request->get('mes') : null;

        return response()->json([
            'ano' => $ano,
            'mes' => $mes,
            'clientes_mais_pedidos' => $this->clientesMaisPedidos($ano, $mes),
            'produtos_mais_vendidos' => $this->produtosMaisVendidos($ano, $mes),
            'meses_mais_produtivos' => $this->mesesMaisProdutivos($ano),
            'produtos_por_mes' => $this->produtosPorMes($ano),
            'faturamento_por_mes' => $this->faturamentoPorMes($ano),
            'rotas_mais_pedidos' => $this->rotasMaisPedidos($ano, $mes),
            'vendedores_mais_vendas' => $this->vendedoresMaisVendas($ano, $mes),
            'pedidos_por_status' => $this->pedidosPorStatus($ano, $mes),
            'faturamento_por_cliente' => $this->faturamentoPorCliente($ano, $mes),
        ], 200);
    }

    /** Top clientes por quantidade de pedidos. */
    private function clientesMaisPedidos(int $ano, ?int $mes): array
    {
        $query = Pedido::query()
            ->whereIn('status', self::STATUS_VALIDOS)
            ->whereYear('data_cadastro', $ano);

        if ($mes) {
            $query->whereMonth('data_cadastro', $mes);
        }

        return $query
            ->select('Cliente_Usuario_id', DB::raw('COUNT(*) as total_pedidos'), DB::raw('SUM(valor_total) as valor_total'))
            ->groupBy('Cliente_Usuario_id')
            ->orderByDesc('total_pedidos')
            ->limit(15)
            ->get()
            ->map(function ($row) {
                $cliente = Cliente::with('usuario')->find($row->Cliente_Usuario_id);
                return [
                    'cliente_id' => $row->Cliente_Usuario_id,
                    'cliente_nome' => $cliente && $cliente->usuario ? $cliente->usuario->nome : 'Cliente #' . $row->Cliente_Usuario_id,
                    'total_pedidos' => (int) $row->total_pedidos,
                    'valor_total' => (float) $row->valor_total,
                ];
            })
            ->values()
            ->all();
    }

    /** Top produtos por quantidade vendida. */
    private function produtosMaisVendidos(int $ano, ?int $mes): array
    {
        $query = DB::table('itens_pedido')
            ->join('pedido', 'itens_pedido.Pedido_id', '=', 'pedido.id')
            ->join('produto', 'itens_pedido.Produto_id', '=', 'produto.id')
            ->whereIn('pedido.status', self::STATUS_VALIDOS)
            ->whereYear('pedido.data_cadastro', $ano);

        if ($mes) {
            $query->whereMonth('pedido.data_cadastro', $mes);
        }

        return $query
            ->select(
                'produto.id as produto_id',
                'produto.nome as produto_nome',
                DB::raw('SUM(itens_pedido.quantidade) as quantidade_total'),
                DB::raw('SUM(itens_pedido.quantidade * itens_pedido.preco_unitario) as valor_total')
            )
            ->groupBy('produto.id', 'produto.nome')
            ->orderByDesc('quantidade_total')
            ->limit(15)
            ->get()
            ->map(fn ($r) => [
                'produto_id' => $r->produto_id,
                'produto_nome' => $r->produto_nome,
                'quantidade_total' => (int) $r->quantidade_total,
                'valor_total' => (float) $r->valor_total,
            ])
            ->values()
            ->all();
    }

    /** Meses mais produtivos do ano (por faturamento). */
    private function mesesMaisProdutivos(int $ano): array
    {
        $meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

        return Pedido::query()
            ->whereIn('status', self::STATUS_VALIDOS)
            ->whereYear('data_cadastro', $ano)
            ->select(DB::raw('MONTH(data_cadastro) as mes'), DB::raw('COUNT(*) as total_pedidos'), DB::raw('SUM(valor_total) as valor_total'))
            ->groupBy(DB::raw('MONTH(data_cadastro)'))
            ->orderByDesc('valor_total')
            ->get()
            ->map(fn ($r) => [
                'mes' => (int) $r->mes,
                'mes_nome' => $meses[(int) $r->mes - 1] ?? '',
                'total_pedidos' => (int) $r->total_pedidos,
                'valor_total' => (float) $r->valor_total,
            ])
            ->values()
            ->all();
    }

    /** Produtos vendidos por mês. */
    private function produtosPorMes(int $ano): array
    {
        $meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

        $rows = DB::table('itens_pedido')
            ->join('pedido', 'itens_pedido.Pedido_id', '=', 'pedido.id')
            ->join('produto', 'itens_pedido.Produto_id', '=', 'produto.id')
            ->whereIn('pedido.status', self::STATUS_VALIDOS)
            ->whereYear('pedido.data_cadastro', $ano)
            ->select(
                DB::raw('MONTH(pedido.data_cadastro) as mes'),
                'produto.id as produto_id',
                'produto.nome as produto_nome',
                DB::raw('SUM(itens_pedido.quantidade) as quantidade')
            )
            ->groupBy(DB::raw('MONTH(pedido.data_cadastro)'), 'produto.id', 'produto.nome')
            ->orderBy(DB::raw('MONTH(pedido.data_cadastro)'))
            ->orderByDesc('quantidade')
            ->get();

        $porMes = [];
        foreach ($rows as $r) {
            $m = (int) $r->mes;
            if (!isset($porMes[$m])) {
                $porMes[$m] = ['mes' => $m, 'mes_nome' => $meses[$m - 1] ?? '', 'produtos' => []];
            }
            $porMes[$m]['produtos'][] = [
                'produto_id' => $r->produto_id,
                'produto_nome' => $r->produto_nome,
                'quantidade' => (int) $r->quantidade,
            ];
        }
        ksort($porMes);
        return array_values($porMes);
    }

    /** Faturamento por mês. */
    private function faturamentoPorMes(int $ano): array
    {
        $meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

        return Pedido::query()
            ->whereIn('status', self::STATUS_VALIDOS)
            ->whereYear('data_cadastro', $ano)
            ->select(DB::raw('MONTH(data_cadastro) as mes'), DB::raw('COUNT(*) as total_pedidos'), DB::raw('SUM(valor_total) as valor_total'))
            ->groupBy(DB::raw('MONTH(data_cadastro)'))
            ->orderBy(DB::raw('MONTH(data_cadastro)'))
            ->get()
            ->map(fn ($r) => [
                'mes' => (int) $r->mes,
                'mes_nome' => $meses[(int) $r->mes - 1] ?? '',
                'total_pedidos' => (int) $r->total_pedidos,
                'valor_total' => (float) $r->valor_total,
            ])
            ->values()
            ->all();
    }

    /** Rotas com mais pedidos. */
    private function rotasMaisPedidos(int $ano, ?int $mes): array
    {
        $query = DB::table('pedido')
            ->join('cliente', 'pedido.Cliente_Usuario_id', '=', 'cliente.Usuario_id')
            ->leftJoin('rota', 'cliente.Rota_id', '=', 'rota.id')
            ->whereIn('pedido.status', self::STATUS_VALIDOS)
            ->whereYear('pedido.data_cadastro', $ano);

        if ($mes) {
            $query->whereMonth('pedido.data_cadastro', $mes);
        }

        return $query
            ->select(
                DB::raw('COALESCE(rota.id, 0) as rota_id'),
                DB::raw('COALESCE(rota.nome, "Sem rota") as rota_nome'),
                DB::raw('COUNT(*) as total_pedidos'),
                DB::raw('SUM(pedido.valor_total) as valor_total')
            )
            ->groupBy(DB::raw('COALESCE(rota.id, 0)'), DB::raw('COALESCE(rota.nome, "Sem rota")'))
            ->orderByDesc('total_pedidos')
            ->limit(15)
            ->get()
            ->map(fn ($r) => [
                'rota_id' => (int) $r->rota_id === 0 ? null : (int) $r->rota_id,
                'rota_nome' => $r->rota_nome ?? 'Sem rota',
                'total_pedidos' => (int) $r->total_pedidos,
                'valor_total' => (float) $r->valor_total,
            ])
            ->values()
            ->all();
    }

    /** Vendedores com mais vendas. */
    private function vendedoresMaisVendas(int $ano, ?int $mes): array
    {
        $query = DB::table('pedido')
            ->join('usuario', 'pedido.Usuario_id', '=', 'usuario.id')
            ->whereIn('pedido.status', self::STATUS_VALIDOS)
            ->whereYear('pedido.data_cadastro', $ano);

        if ($mes) {
            $query->whereMonth('pedido.data_cadastro', $mes);
        }

        return $query
            ->select(
                'usuario.id as usuario_id',
                'usuario.nome as usuario_nome',
                DB::raw('COUNT(*) as total_pedidos'),
                DB::raw('SUM(pedido.valor_total) as valor_total')
            )
            ->groupBy('usuario.id', 'usuario.nome')
            ->orderByDesc('valor_total')
            ->limit(10)
            ->get()
            ->map(fn ($r) => [
                'usuario_id' => $r->usuario_id,
                'usuario_nome' => $r->usuario_nome,
                'total_pedidos' => (int) $r->total_pedidos,
                'valor_total' => (float) $r->valor_total,
            ])
            ->values()
            ->all();
    }

    /** Pedidos por status. */
    private function pedidosPorStatus(int $ano, ?int $mes): array
    {
        $query = Pedido::query()
            ->whereYear('data_cadastro', $ano);

        if ($mes) {
            $query->whereMonth('data_cadastro', $mes);
        }

        return $query
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->get()
            ->map(fn ($r) => ['status' => $r->status, 'total' => (int) $r->total])
            ->values()
            ->all();
    }

    /** Faturamento por cliente (top por valor). */
    private function faturamentoPorCliente(int $ano, ?int $mes): array
    {
        $query = Pedido::query()
            ->whereIn('status', self::STATUS_VALIDOS)
            ->whereYear('data_cadastro', $ano);

        if ($mes) {
            $query->whereMonth('data_cadastro', $mes);
        }

        return $query
            ->select('Cliente_Usuario_id', DB::raw('COUNT(*) as total_pedidos'), DB::raw('SUM(valor_total) as valor_total'))
            ->groupBy('Cliente_Usuario_id')
            ->orderByDesc('valor_total')
            ->limit(15)
            ->get()
            ->map(function ($row) {
                $cliente = Cliente::with('usuario')->find($row->Cliente_Usuario_id);
                return [
                    'cliente_id' => $row->Cliente_Usuario_id,
                    'cliente_nome' => $cliente && $cliente->usuario ? $cliente->usuario->nome : 'Cliente #' . $row->Cliente_Usuario_id,
                    'total_pedidos' => (int) $row->total_pedidos,
                    'valor_total' => (float) $row->valor_total,
                ];
            })
            ->values()
            ->all();
    }
}
