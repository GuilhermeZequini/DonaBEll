<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Produto;

class ProdutoController extends Controller
{
    public function index(Request $request)
    {
        $query = Produto::query()->orderBy('nome');

        $ativo = $request->get('ativo');
        if ($ativo !== null && $ativo !== '') {
            $query->where('ativo', $request->boolean('ativo'));
        }

        $perPage = (int) $request->get('per_page', 15);
        if ($perPage <= 0) {
            $perPage = 15;
        } elseif ($perPage > 100) {
            $perPage = 100;
        }

        $produtos = $query->paginate($perPage);
        return response()->json($produtos, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string|max:255',
            'preco_pf' => 'required|numeric|min:0',
            'preco_pj' => 'required|numeric|min:0',
            'ativo' => 'sometimes|boolean',
        ]);

        $produto = new Produto();
        $produto->nome = $request->nome;
        $produto->descricao = $request->descricao;
        $produto->preco_pf = $request->preco_pf;
        $produto->preco_pj = $request->preco_pj;
        $produto->data_cadastro = now();
        $produto->ativo = $request->boolean('ativo', true);
        $produto->save();

        return response()->json($produto, 201);
    }

    public function show(string $id)
    {
        $produto = Produto::find($id);
        if (!$produto) {
            return response()->json(['error' => 'Produto não encontrado'], 404);
        }
        return response()->json($produto, 200);
    }

    public function update(Request $request, string $id)
    {
        $produto = Produto::find($id);
        if (!$produto) {
            return response()->json(['error' => 'Produto não encontrado'], 404);
        }

        $request->validate([
            'nome' => 'sometimes|string|max:255',
            'descricao' => 'nullable|string|max:255',
            'preco_pf' => 'sometimes|numeric|min:0',
            'preco_pj' => 'sometimes|numeric|min:0',
            'ativo' => 'sometimes|boolean',
        ]);

        if ($request->has('nome')) $produto->nome = $request->nome;
        if ($request->has('descricao')) $produto->descricao = $request->descricao;
        if ($request->has('preco_pf')) $produto->preco_pf = $request->preco_pf;
        if ($request->has('preco_pj')) $produto->preco_pj = $request->preco_pj;
        if ($request->has('ativo')) $produto->ativo = $request->boolean('ativo');
        $produto->save();

        return response()->json($produto, 200);
    }

    public function destroy(string $id)
    {
        $produto = Produto::find($id);
        if (!$produto) {
            return response()->json(['error' => 'Produto não encontrado'], 404);
        }
        $produto->delete();
        return response()->json(null, 204);
    }
}
