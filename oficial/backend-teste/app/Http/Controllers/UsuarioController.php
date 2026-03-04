<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Usuario;

class UsuarioController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->get('per_page', 15);
        if ($perPage <= 0) {
            $perPage = 15;
        } elseif ($perPage > 100) {
            $perPage = 100;
        }

        $usuarios = Usuario::orderByDesc('id')->paginate($perPage);
        return response()->json($usuarios, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nome' => 'required|string|max:255',
            'email' => 'required|email|unique:usuario,email',
            'senha' => 'required|string|min:4',
            'tipo_perfil' => 'required|in:CLIENTE,VENDEDOR,GERENTE,PRODUCAO,ENTREGADOR',
            'ativo' => 'sometimes|boolean',
        ]);

        if ($request->tipo_perfil === 'CLIENTE') {
            return response()->json([
                'message' => 'Clientes devem ser cadastrados pela aba Clientes.',
            ], 422);
        }

        $usuario = new Usuario();
        $usuario->nome = $request->nome;
        $usuario->email = $request->email;
        $usuario->senha = Hash::make($request->senha);
        $usuario->tipo_perfil = $request->tipo_perfil;
        $usuario->ativo = $request->boolean('ativo', true);
        $usuario->data_cadastro = now();
        $usuario->save();

        return response()->json($usuario, 201);
    }

    public function show(string $id)
    {
        $usuario = Usuario::find($id);

        if (!$usuario) {
            return response()->json(['error' => 'Usuário não encontrado'], 404);
        }

        return response()->json($usuario, 200);
    }

    public function update(Request $request, string $id)
    {
        $usuario = Usuario::find($id);

        if (!$usuario) {
            return response()->json(['error' => 'Usuário não encontrado'], 404);
        }

        $request->validate([
            'nome' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:usuario,email,' . $id,
            'senha' => 'sometimes|string|min:4',
            'tipo_perfil' => 'sometimes|in:CLIENTE,VENDEDOR,GERENTE,PRODUCAO,ENTREGADOR',
            'ativo' => 'sometimes|boolean',
        ]);

        if ($request->has('nome')) $usuario->nome = $request->nome;
        if ($request->has('email')) $usuario->email = $request->email;
        if ($request->has('senha')) $usuario->senha = Hash::make($request->senha);
        if ($request->has('tipo_perfil')) $usuario->tipo_perfil = $request->tipo_perfil;
        if ($request->has('ativo')) $usuario->ativo = $request->boolean('ativo');
        $usuario->save();

        return response()->json($usuario, 200);
    }

    public function destroy(string $id)
    {
        $usuario = Usuario::find($id);

        if (!$usuario) {
            return response()->json(['error' => 'Usuário não encontrado'], 404);
        }

        $usuario->delete();
        return response()->json(null, 204);
    }
}
