<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Throwable;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string',
            'senha' => 'required'
        ]);

        $email = trim((string) $request->input('email', ''));
        $senha = (string) $request->input('senha', '');

        $usuario = Usuario::where('email', $email)->first()
            ?? Usuario::whereRaw('TRIM(email) = ?', [$email])->first();
        if (!$usuario) {
            return response()->json(['error' => 'Credenciais inválidas'], 401);
        }

        // Remove só lixo comum de import (ex.: \n no fim do varchar) sem alterar o hash bcrypt
        $senhaDb = is_string($usuario->senha) ? rtrim($usuario->senha, "\r\n\t ") : $usuario->senha;

        if (!Hash::check($senha, $senhaDb)) {
            // Migração: senha antiga em texto puro (compara com valor bruto ou trimado)
            $plainOk = is_string($usuario->senha)
                && ($usuario->senha === $senha || trim($usuario->senha) === $senha);
            if ($plainOk) {
                $usuario->senha = Hash::make($senha);
                $usuario->save();
            } else {
                return response()->json(['error' => 'Credenciais inválidas'], 401);
            }
        }

        if (!$usuario->ativo) {
            return response()->json(['error' => 'Usuário inativo'], 403);
        }

        // Token Sanctum (tabela personal_access_tokens + APP_KEY)
        try {
            $token = $usuario->createToken('auth_token')->plainTextToken;
        } catch (Throwable $e) {
            Log::error('login.create_token', [
                'usuario_id' => $usuario->id,
                'erro' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Falha ao gerar token de acesso.',
                'detail' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }

        return response()->json([
            'message' => 'Login válido',
            'token' => $token,
            'usuario' => [
                'id' => $usuario->id,
                'nome' => $usuario->nome,
                'tipo_perfil' => $usuario->tipo_perfil,
            ],
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
