<?php

namespace Database\Seeders;

use App\Models\Usuario;
use App\Models\Rota;
use App\Models\Produto;
use App\Models\Cliente;
use App\Models\Pedido;
use App\Models\ItemPedido;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DadosTesteSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedUsuarios();
        $this->seedRotas();
        $this->seedProdutos();
        $this->seedClientes();
        $this->seedPedidos();
    }

    private function seedUsuarios(): void
    {
        $usuarios = [
            ['nome' => 'admin', 'email' => 'admin', 'senha' => 'admin', 'tipo' => 'GERENTE'],
            ['nome' => 'Vendedor João', 'email' => 'vendedor@teste.com', 'senha' => '123456', 'tipo' => 'VENDEDOR'],
            ['nome' => 'Vendedor Maria', 'email' => 'maria@teste.com', 'senha' => '123456', 'tipo' => 'VENDEDOR'],
            ['nome' => 'Produção Ana', 'email' => 'producao@teste.com', 'senha' => '123456', 'tipo' => 'PRODUCAO'],
            ['nome' => 'Entregador Pedro', 'email' => 'entregador@teste.com', 'senha' => '123456', 'tipo' => 'ENTREGADOR'],
        ];

        foreach ($usuarios as $u) {
            if (Usuario::where('email', $u['email'])->exists()) {
                continue;
            }
            $usuario = new Usuario();
            $usuario->nome = $u['nome'];
            $usuario->email = $u['email'];
            $usuario->senha = Hash::make($u['senha']);
            $usuario->tipo_perfil = $u['tipo'];
            $usuario->ativo = 1;
            if (\Schema::hasColumn('usuario', 'data_cadastro')) {
                $usuario->data_cadastro = now();
            }
            $usuario->save();
        }
    }

    private function seedRotas(): void
    {
        $rotas = [
            ['nome' => 'Rota Norte', 'ordem_prioridade' => 1, 'ativo' => 1],
            ['nome' => 'Rota Sul', 'ordem_prioridade' => 2, 'ativo' => 1],
            ['nome' => 'Rota Centro', 'ordem_prioridade' => 3, 'ativo' => 1],
        ];

        foreach ($rotas as $r) {
            if (Rota::where('nome', $r['nome'])->exists()) {
                continue;
            }
            Rota::create($r);
        }
    }

    private function seedProdutos(): void
    {
        $produtos = [
            ['nome' => 'Pão Francês', 'preco_pf' => 0.80, 'preco_pj' => 0.65],
            ['nome' => 'Pão de Forma', 'preco_pf' => 12.00, 'preco_pj' => 10.50],
            ['nome' => 'Bolo de Chocolate', 'preco_pf' => 35.00, 'preco_pj' => 30.00],
            ['nome' => 'Bolo de Cenoura', 'preco_pf' => 32.00, 'preco_pj' => 28.00],
            ['nome' => 'Torta Salgada', 'preco_pf' => 45.00, 'preco_pj' => 40.00],
            ['nome' => 'Coxinha', 'preco_pf' => 8.00, 'preco_pj' => 6.50],
            ['nome' => 'Empada', 'preco_pf' => 7.00, 'preco_pj' => 5.80],
            ['nome' => 'Biscoito Recheado', 'preco_pf' => 6.50, 'preco_pj' => 5.20],
            ['nome' => 'Sonho', 'preco_pf' => 5.00, 'preco_pj' => 4.20],
            ['nome' => 'Café 500g', 'preco_pf' => 28.00, 'preco_pj' => 24.00],
        ];

        foreach ($produtos as $p) {
            if (Produto::where('nome', $p['nome'])->exists()) {
                continue;
            }
            Produto::create([
                'nome' => $p['nome'],
                'descricao' => null,
                'preco_pf' => $p['preco_pf'],
                'preco_pj' => $p['preco_pj'],
                'data_cadastro' => now(),
                'ativo' => true,
            ]);
        }
    }

    private function seedClientes(): void
    {
        $rotas = Rota::where('ativo', 1)->get()->keyBy('id');
        if ($rotas->isEmpty()) {
            return;
        }

        $rotaIds = $rotas->pluck('id')->toArray();

        $clientes = [
            ['nome' => 'Padaria Norte', 'email' => 'padaria.norte@teste.com', 'cnpj' => '11111111000111', 'tipo' => 'PJ', 'rota_index' => 0],
            ['nome' => 'Supermercado Silva', 'email' => 'super.silva@teste.com', 'cnpj' => '22222222000122', 'tipo' => 'PJ', 'rota_index' => 0],
            ['nome' => 'Restaurante Central', 'email' => 'rest.central@teste.com', 'cnpj' => '33333333000133', 'tipo' => 'PJ', 'rota_index' => 1],
            ['nome' => 'Lan house Sul', 'email' => 'lan.sul@teste.com', 'cnpj' => '44444444000144', 'tipo' => 'PJ', 'rota_index' => 1],
            ['nome' => 'Cafeteria Centro', 'email' => 'cafe.centro@teste.com', 'cnpj' => '55555555000155', 'tipo' => 'PJ', 'rota_index' => 2],
            ['nome' => 'Delícia do Bairro', 'email' => 'delicia@teste.com', 'cnpj' => '66666666000166', 'tipo' => 'PJ', 'rota_index' => 2],
            ['nome' => 'Mercadinho Rápido', 'email' => 'merc.rapido@teste.com', 'cnpj' => '77777777000177', 'tipo' => 'PJ', 'rota_index' => 0],
            ['nome' => 'Bar do Zé', 'email' => 'bar.ze@teste.com', 'cnpj' => '88888888000188', 'tipo' => 'PJ', 'rota_index' => 1],
        ];

        $vendedorIds = Usuario::where('tipo_perfil', 'VENDEDOR')->orWhere('tipo_perfil', 'GERENTE')->pluck('id')->toArray();
        if (empty($vendedorIds)) {
            return;
        }

        foreach ($clientes as $c) {
            if (Usuario::where('email', $c['email'])->exists()) {
                continue;
            }
            $rotaId = $rotaIds[$c['rota_index'] % count($rotaIds)] ?? $rotaIds[0];

            $usuario = new Usuario();
            $usuario->nome = $c['nome'];
            $usuario->email = $c['email'];
            $usuario->senha = Hash::make('123456');
            $usuario->tipo_perfil = 'CLIENTE';
            $usuario->ativo = 1;
            if (\Schema::hasColumn('usuario', 'data_cadastro')) {
                $usuario->data_cadastro = now();
            }
            $usuario->save();

            $cliente = new Cliente();
            $cliente->Usuario_id = $usuario->id;
            $cliente->tipo_cliente = $c['tipo'];
            $cliente->CNPJ_CPF = $c['cnpj'];
            $cliente->telefone = '11999999999';
            $cliente->numero = '100';
            $cliente->rua = 'Rua das Flores';
            $cliente->bairro = 'Centro';
            $cliente->cidade = 'São Paulo';
            $cliente->Rota_id = $rotaId;
            if (\Schema::hasColumn('cliente', 'nome')) {
                $cliente->nome = $c['nome'];
            }
            $cliente->save();
        }
    }

    private function seedPedidos(): void
    {
        $clientes = Cliente::with('usuario')->get();
        $produtos = Produto::where('ativo', true)->get();
        $vendedores = Usuario::whereIn('tipo_perfil', ['VENDEDOR', 'GERENTE'])->pluck('id')->toArray();

        if ($clientes->isEmpty() || $produtos->isEmpty() || empty($vendedores)) {
            return;
        }

        $statuses = [
            Pedido::STATUS_NOVO,
            Pedido::STATUS_APROVADO,
            Pedido::STATUS_EM_PRODUCAO,
            Pedido::STATUS_PRONTO,
            Pedido::STATUS_EM_ENTREGA,
            Pedido::STATUS_ENTREGUE,
        ];

        $hoje = Carbon::now();
        $semanas = [
            $hoje->copy()->subWeeks(2)->startOfWeek(Carbon::SUNDAY),
            $hoje->copy()->subWeek()->startOfWeek(Carbon::SUNDAY),
            $hoje->copy()->startOfWeek(Carbon::SUNDAY),
        ];

        $ordemEntrega = 0;
        foreach ($semanas as $inicioSemana) {
            for ($i = 0; $i < 4; $i++) {
                $cliente = $clientes->random();
                $vendedorId = $vendedores[array_rand($vendedores)];
                $status = $statuses[array_rand($statuses)];
                $dataCadastro = $inicioSemana->copy()->addDays(rand(0, 5))->setTime(rand(8, 17), rand(0, 59));

                $produto = $produtos->random();
                $preco = $cliente->tipo_cliente === 'PJ' ? $produto->preco_pj : $produto->preco_pf;
                $qtd = rand(2, 15);
                $valorTotal = round($preco * $qtd, 2);

                $pedido = Pedido::create([
                    'Usuario_id' => $vendedorId,
                    'Cliente_Usuario_id' => $cliente->Usuario_id,
                    'data_cadastro' => $dataCadastro,
                    'status' => $status,
                    'observacao' => rand(0, 1) ? 'Pedido urgente' : null,
                    'valor_total' => $valorTotal,
                    'ordem_entrega' => $status === Pedido::STATUS_PRONTO ? $ordemEntrega++ : null,
                ]);

                ItemPedido::create([
                    'Pedido_id' => $pedido->id,
                    'Produto_id' => $produto->id,
                    'quantidade' => $qtd,
                    'preco_unitario' => $preco,
                ]);
            }
        }

        // Garantir pedidos PRONTOS com rota para a tela de Entregas
        $clientesComRota = $clientes->filter(fn ($c) => $c->Rota_id !== null);
        if ($clientesComRota->isNotEmpty()) {
            $semanaAtual = $hoje->copy()->startOfWeek(Carbon::SUNDAY);
            foreach ($clientesComRota->take(5) as $idx => $cliente) {
                $produto = $produtos->random();
                $preco = $cliente->tipo_cliente === 'PJ' ? $produto->preco_pj : $produto->preco_pf;
                $qtd = rand(3, 10);
                $valorTotal = round($preco * $qtd, 2);
                $vendedorId = $vendedores[array_rand($vendedores)];

                $pedido = Pedido::create([
                    'Usuario_id' => $vendedorId,
                    'Cliente_Usuario_id' => $cliente->Usuario_id,
                    'data_cadastro' => $semanaAtual->copy()->addDays(rand(1, 4)),
                    'status' => Pedido::STATUS_PRONTO,
                    'valor_total' => $valorTotal,
                    'ordem_entrega' => $idx,
                ]);

                ItemPedido::create([
                    'Pedido_id' => $pedido->id,
                    'Produto_id' => $produto->id,
                    'quantidade' => $qtd,
                    'preco_unitario' => $preco,
                ]);
            }
        }
    }
}
