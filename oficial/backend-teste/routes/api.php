<?php

use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

//Route::get('/user', function (Request $request) {
//    return $request->user();
//})->middleware('auth:sanctum');



Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', function (Request $request) {
        return $request->user();
    });

    // 🔒 somente GERENTE
    Route::middleware('perfil:GERENTE')->group(function () {
        Route::apiResource('usuarios', UsuarioController::class);
    });

});

