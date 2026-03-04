<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Rota;

class RotaController extends Controller
{
    /**
     * Lista rotas. Se ?ativo=1, retorna só ativas (para dropdowns).
     */
    public function index(Request $request)
    {
        $query = Rota::query()->orderBy('ordem_prioridade')->orderBy('nome');

        // Para dropdowns de clientes (?ativo=1), não paginar
        if ($request->boolean('ativo')) {
            $query->where('ativo', 1);
            $rotas = $query->get();
            return response()->json($rotas, 200);
        }

        $perPage = (int) $request->get('per_page', 15);
        if ($perPage <= 0) {
            $perPage = 15;
        } elseif ($perPage > 100) {
            $perPage = 100;
        }

        $rotas = $query->paginate($perPage);
        return response()->json($rotas, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nome' => 'required|string|max:255',
            'ordem_prioridade' => 'required|integer|min:0',
            'descricao' => 'nullable|string',
            'ativo' => 'sometimes|boolean',
        ]);

        $rota = new Rota();
        $rota->nome = $request->nome;
        $rota->ordem_prioridade = (int) $request->ordem_prioridade;
        $rota->descricao = $request->descricao;
        $rota->ativo = $request->boolean('ativo', true);
        $rota->save();

        return response()->json($rota, 201);
    }

    public function show(string $rota)
    {
        $rota = Rota::find($rota);
        if (!$rota) {
            return response()->json(['error' => 'Rota não encontrada'], 404);
        }
        return response()->json($rota, 200);
    }

    public function update(Request $request, string $rota)
    {
        $rota = Rota::find($rota);
        if (!$rota) {
            return response()->json(['error' => 'Rota não encontrada'], 404);
        }

        $request->validate([
            'nome' => 'sometimes|string|max:255',
            'ordem_prioridade' => 'sometimes|integer|min:0',
            'descricao' => 'nullable|string',
            'ativo' => 'sometimes|boolean',
        ]);

        if ($request->has('nome')) $rota->nome = $request->nome;
        if ($request->has('ordem_prioridade')) $rota->ordem_prioridade = (int) $request->ordem_prioridade;
        if ($request->has('descricao')) $rota->descricao = $request->descricao;
        if ($request->has('ativo')) $rota->ativo = $request->boolean('ativo');
        $rota->save();

        return response()->json($rota, 200);
    }

    public function destroy(string $rota)
    {
        $rota = Rota::find($rota);
        if (!$rota) {
            return response()->json(['error' => 'Rota não encontrada'], 404);
        }
        $rota->delete();
        return response()->json(null, 204);
    }
}
