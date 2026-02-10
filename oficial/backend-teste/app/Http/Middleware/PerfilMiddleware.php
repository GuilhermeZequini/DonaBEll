<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class PerfilMiddleware
{
    public function handle(Request $request, Closure $next, ...$perfis)
    {
        $usuario = $request->user();

        if (!$usuario || !in_array($usuario->tipo_perfil, $perfis)) {
            return response()->json([
                'error' => 'Acesso negado'
            ], 403);
        }

        return $next($request);
    }
}
