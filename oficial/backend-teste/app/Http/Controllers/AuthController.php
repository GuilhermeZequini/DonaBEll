<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Usuario;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string',
            'senha' => 'required'
        ]);

        $email = $request->email;
        $senha = $request->senha;

        $usuario = Usuario::where('email', $email)->first();
        if (!$usuario) {
            return response()->json(['error' => 'Credenciais inválidas'], 401);
        }
        if (!Hash::check($senha, $usuario->senha)) {
            // Migração: se a senha antiga estava em texto puro, valida e converte para hash
            if ($usuario->senha === $senha) {
                $usuario->senha = Hash::make($senha);
                $usuario->save();
            } else {
                return response()->json(['error' => 'Credenciais inválidas'], 401);
            }
        }

        if (!$usuario->ativo) {
            return response()->json(['error' => 'Usuário inativo'], 403);
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
