<?php

use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\RotaController;
use App\Http\Controllers\ProdutoController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\ProducaoController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RelatoriosController;
use App\Http\Controllers\EntregasController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', function (Request $request) {
        return $request->user();
    });

    Route::get('/rotas', [RotaController::class, 'index']);

    // Acesso "comercial/gestão" (produção NÃO pode acessar)
    Route::middleware('perfil:CLIENTE,VENDEDOR,GERENTE,ENTREGADOR')->group(function () {
        Route::apiResource('clientes', ClienteController::class);
        // Produtos: leitura liberada para VENDEDOR (e demais perfis comerciais)
        Route::get('produtos', [ProdutoController::class, 'index']);
        Route::get('produtos/{produto}', [ProdutoController::class, 'show']);
        Route::apiResource('pedidos', PedidoController::class);
        Route::post('pedidos/{id}/aprovar', [PedidoController::class, 'aprovar']);
        Route::post('pedidos/{id}/rejeitar', [PedidoController::class, 'rejeitar']);
        Route::get('dashboard', [DashboardController::class, 'index']);
    });

    // Produtos: escrita apenas gerente
    Route::middleware('perfil:GERENTE')->group(function () {
        Route::post('produtos', [ProdutoController::class, 'store']);
        Route::put('produtos/{produto}', [ProdutoController::class, 'update']);
        Route::delete('produtos/{produto}', [ProdutoController::class, 'destroy']);
    });

    // Relatórios: apenas gerente
    Route::middleware('perfil:GERENTE')->group(function () {
        Route::get('relatorios', [RelatoriosController::class, 'index']);
    });

    // Produção: produção (e gerente, se precisar acompanhar)
    Route::middleware('perfil:PRODUCAO,GERENTE')->group(function () {
        Route::get('producao', [ProducaoController::class, 'index']);
        Route::get('producao/consolidacao', [ProducaoController::class, 'consolidacao']);
        Route::put('producao/pedidos/{pedido}/status', [ProducaoController::class, 'atualizarStatus']);
    });

    // Entregas: entregador e gerente
    Route::middleware('perfil:ENTREGADOR,GERENTE')->group(function () {
        Route::get('entregas', [EntregasController::class, 'index']);
        Route::put('entregas/{pedido}/entregue', [EntregasController::class, 'marcarEntregue']);
        Route::post('entregas/reordenar', [EntregasController::class, 'reordenar']);
    });

    Route::middleware('perfil:GERENTE')->group(function () {
        Route::apiResource('usuarios', UsuarioController::class);
        Route::post('/rotas', [RotaController::class, 'store']);
        Route::get('/rotas/{rota}', [RotaController::class, 'show']);
        Route::put('/rotas/{rota}', [RotaController::class, 'update']);
        Route::delete('/rotas/{rota}', [RotaController::class, 'destroy']);
    });

});

