<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Usuario;

class AuthController extends Controller
{
  public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'senha' => 'required'
        ]);

        $usuario = Usuario::where('email', $request->email)->first();

        if (!$usuario || $usuario->senha !== $request->senha) {
            return response()->json(['error' => 'Credenciais inválidas'], 401);
        }

        // 4️⃣ gera token
        $token = $usuario->createToken('auth_token')->plainTextToken;


        return response()->json([
            'message' => 'Login válido',
            'token' => $token,
            'usuario' => [
                'id' => $usuario->id,
                'nome' => $usuario->nome,
                'tipo_perfil' => $usuario->tipo_perfil
            ]
        ], 200);
    }

    public function logout(Request $request)
    {
        // remove apenas o token atual
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout realizado com sucesso'
        ]);
    }
}
