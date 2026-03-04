<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Cliente;
use App\Models\Usuario;
use App\Models\Rota;

class ClienteController extends Controller
{
    public function index(Request $request)
    {
        $query = Cliente::with(['usuario', 'rota']);
        
        $tipo = $request->get('tipo');
        if ($tipo && in_array($tipo, ['PF', 'PJ'])) {
            $query->where('tipo_cliente', $tipo);
        }
        
        $rotaId = $request->get('rota_id');
        if ($rotaId) {
            $query->where('Rota_id', $rotaId);
        }

        $perPage = (int) $request->get('per_page', 15);
        if ($perPage <= 0) {
            $perPage = 15;
        } elseif ($perPage > 100) {
            $perPage = 100;
        }

        $paginado = $query->paginate($perPage);
        $paginado->getCollection()->transform(function ($c) {
            return $this->formatCliente($c);
        });
        
        return response()->json($paginado, 200);
    }

    /** Senha padrão para novos usuários cliente criados automaticamente */
    private const SENHA_PADRAO_CLIENTE = '123456';

    public function store(Request $request)
    {
        $request->validate([
            'nome' => 'required|string|max:255',
            'tipo_cliente' => 'required|in:PF,PJ',
            'CNPJ_CPF' => 'required|string|max:14|unique:cliente,CNPJ_CPF',
            'email' => 'nullable|email',
            'telefone' => 'nullable|string|max:20',
            'rua' => 'nullable|string|max:45',
            'numero' => 'nullable|string|max:45',
            'bairro' => 'nullable|string|max:45',
            'cidade' => 'nullable|string|max:45',
            'complemento' => 'nullable|string|max:45',
            'Rota_id' => 'nullable|exists:rota,id',
        ]);

        if ($request->tipo_cliente === 'PJ' && !$request->Rota_id) {
            return response()->json(['message' => 'Pessoa Jurídica deve ter uma rota de entrega.'], 422);
        }

        // Sempre cria um usuário CLIENTE com senha padrão para acesso ao sistema
        $email = $request->filled('email')
            ? $request->email
            : 'cliente' . preg_replace('/\D/', '', $request->CNPJ_CPF) . '_' . time() . '@donabell.local';
        if (Usuario::where('email', $email)->exists()) {
            $email = 'cliente' . time() . '_' . bin2hex(random_bytes(4)) . '@donabell.local';
        }

        $usuario = new Usuario();
        $usuario->nome = $request->nome;
        $usuario->email = $email;
        $usuario->senha = Hash::make(self::SENHA_PADRAO_CLIENTE);
        $usuario->tipo_perfil = 'CLIENTE';
        $usuario->ativo = 1;
        $usuario->data_cadastro = now();
        $usuario->save();

        $cliente = new Cliente();
        $cliente->Usuario_id = $usuario->id;
        $cliente->tipo_cliente = $request->tipo_cliente;
        $cliente->CNPJ_CPF = $request->CNPJ_CPF;
        $cliente->telefone = $request->telefone;
        $cliente->numero = $request->numero;
        $cliente->rua = $request->rua;
        $cliente->bairro = $request->bairro;
        $cliente->cidade = $request->cidade;
        $cliente->complemento = $request->complemento;
        $cliente->Rota_id = $request->Rota_id;
        $cliente->save();

        return response()->json($this->formatCliente(Cliente::with(['usuario', 'rota'])->find($usuario->id)), 201);
    }

    public function show(string $cliente)
    {
        // Na estrutura atual, o ID do cliente é o Usuario_id
        $cliente = Cliente::with(['usuario', 'rota'])->find($cliente);
        if (!$cliente) {
            return response()->json(['error' => 'Cliente não encontrado'], 404);
        }
        return response()->json($this->formatCliente($cliente), 200);
    }

    public function update(Request $request, string $cliente)
    {
        $cliente = Cliente::with('usuario')->find($cliente);
        if (!$cliente) {
            return response()->json(['error' => 'Cliente não encontrado'], 404);
        }

        $request->validate([
            'nome' => 'sometimes|string|max:255',
            'tipo_cliente' => 'sometimes|in:PF,PJ',
            'CNPJ_CPF' => 'sometimes|string|max:14|unique:cliente,CNPJ_CPF,' . $cliente->Usuario_id,
            'email' => 'nullable|email',
            'telefone' => 'nullable|string|max:20',
            'rua' => 'nullable|string|max:45',
            'numero' => 'nullable|string|max:45',
            'bairro' => 'nullable|string|max:45',
            'cidade' => 'nullable|string|max:45',
            'complemento' => 'nullable|string|max:45',
            'Rota_id' => 'nullable|exists:rota,id',
            'Usuario_id' => 'nullable|exists:usuario,id', // Vincular/desvincular usuário
            'criar_usuario' => 'sometimes|boolean',
            'senha' => 'required_if:criar_usuario,true|string|min:4',
            'ativo' => 'sometimes|boolean',
        ]);

        // Atualiza dados do cliente (tabela cliente não tem coluna nome; nome fica em usuario)
        if ($request->has('tipo_cliente')) $cliente->tipo_cliente = $request->tipo_cliente;
        if ($request->has('CNPJ_CPF')) $cliente->CNPJ_CPF = $request->CNPJ_CPF;
        if ($request->has('telefone')) $cliente->telefone = $request->telefone;
        if ($request->has('numero')) $cliente->numero = $request->numero;
        if ($request->has('rua')) $cliente->rua = $request->rua;
        if ($request->has('bairro')) $cliente->bairro = $request->bairro;
        if ($request->has('cidade')) $cliente->cidade = $request->cidade;
        if ($request->has('complemento')) $cliente->complemento = $request->complemento;
        if ($request->has('Rota_id')) $cliente->Rota_id = $request->Rota_id;

        // Gerencia vínculo com usuário
        if ($request->has('Usuario_id')) {
            // Se passou null, desvincula
            if ($request->Usuario_id === null) {
                $cliente->Usuario_id = null;
            } else {
                // Vincula a usuário existente
                $usuario = Usuario::find($request->Usuario_id);
                if (!$usuario) {
                    return response()->json(['message' => 'Usuário não encontrado.'], 404);
                }
                $cliente->Usuario_id = $usuario->id;
            }
        } elseif ($request->boolean('criar_usuario') && !$cliente->Usuario_id) {
            // Cria novo usuário se solicitado e cliente não tem usuário
            $usuario = new Usuario();
            $usuario->nome = $request->has('nome') ? $request->nome : ($cliente->usuario->nome ?? '');
            $usuario->email = $request->email;
            $usuario->senha = Hash::make($request->senha);
            $usuario->tipo_perfil = 'CLIENTE';
            $usuario->ativo = 1;
            $usuario->data_cadastro = now();
            $usuario->save();
            $cliente->Usuario_id = $usuario->id;
        }

        // Atualiza dados do usuário vinculado (se existir)
        if ($cliente->Usuario_id && $cliente->usuario) {
            if ($request->has('nome')) $cliente->usuario->nome = $request->nome;
            if ($request->has('email')) $cliente->usuario->email = $request->email;
            if ($request->has('ativo')) $cliente->usuario->ativo = $request->boolean('ativo');
            $cliente->usuario->save();
        }

        // Valida se PJ tem rota
        $tipoClienteFinal = $cliente->tipo_cliente;
        if ($tipoClienteFinal === 'PJ' && !$cliente->Rota_id) {
            return response()->json(['message' => 'Pessoa Jurídica deve ter uma rota de entrega.'], 422);
        }

        $cliente->save();

        return response()->json($this->formatCliente(Cliente::with(['usuario', 'rota'])->find($cliente->Usuario_id)), 200);
    }

    public function destroy(string $cliente)
    {
        $cliente = Cliente::find($cliente);
        if (!$cliente) {
            return response()->json(['error' => 'Cliente não encontrado'], 404);
        }

        // Remove o cliente
        $usuarioId = $cliente->Usuario_id;
        $cliente->delete();

        // Remove o usuário apenas se estiver vinculado e não for usado por outro cliente
        if ($usuarioId) {
            $outroCliente = Cliente::where('Usuario_id', $usuarioId)->exists();
            if (!$outroCliente) {
                Usuario::destroy($usuarioId);
            }
        }

        return response()->json(null, 204);
    }

    private function formatCliente($c)
    {
        $usuario = $c->usuario ?? null;
        $rota = $c->rota ?? null;
        // Na estrutura atual, cliente não tem coluna nome; o nome vem do usuario. Id para API é Usuario_id.
        return [
            'id' => $c->Usuario_id,
            'Usuario_id' => $c->Usuario_id,
            'nome' => $usuario->nome ?? '',
            'email' => $usuario->email ?? null,
            'tipo_cliente' => $c->tipo_cliente,
            'CNPJ_CPF' => $c->CNPJ_CPF,
            'telefone' => $c->telefone,
            'numero' => $c->numero,
            'rua' => $c->rua,
            'bairro' => $c->bairro,
            'cidade' => $c->cidade,
            'complemento' => $c->complemento,
            'Rota_id' => $c->Rota_id,
            'rota_nome' => $rota ? $rota->nome : null,
            'ativo' => (bool) ($usuario->ativo ?? true),
            'tem_usuario' => !is_null($c->Usuario_id),
        ];
    }
}
