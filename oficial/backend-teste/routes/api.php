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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', function (Request $request) {
        return $request->user();
    });

    Route::get('/rotas', [RotaController::class, 'index']);

    Route::apiResource('clientes', ClienteController::class);
    Route::apiResource('produtos', ProdutoController::class);
    Route::apiResource('pedidos', PedidoController::class);
    Route::post('pedidos/{id}/aprovar', [PedidoController::class, 'aprovar']);
    Route::post('pedidos/{id}/rejeitar', [PedidoController::class, 'rejeitar']);

    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::get('relatorios', [RelatoriosController::class, 'index']);
    Route::get('producao', [ProducaoController::class, 'index']);
    Route::get('producao/consolidacao', [ProducaoController::class, 'consolidacao']);
    Route::put('producao/pedidos/{pedido}/status', [ProducaoController::class, 'atualizarStatus']);

    Route::middleware('perfil:GERENTE')->group(function () {
        Route::apiResource('usuarios', UsuarioController::class);
        Route::post('/rotas', [RotaController::class, 'store']);
        Route::get('/rotas/{rota}', [RotaController::class, 'show']);
        Route::put('/rotas/{rota}', [RotaController::class, 'update']);
        Route::delete('/rotas/{rota}', [RotaController::class, 'destroy']);
    });

});

