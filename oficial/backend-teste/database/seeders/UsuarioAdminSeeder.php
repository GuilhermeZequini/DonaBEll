<?php

namespace Database\Seeders;

use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsuarioAdminSeeder extends Seeder
{
    /**
     * Cria o usuário padrão admin (nome: admin, email: admin, senha: admin).
     */
    public function run(): void
    {
        if (Usuario::where('email', 'admin')->exists()) {
            return;
        }

        $usuario = new Usuario();
        $usuario->nome = 'admin';
        $usuario->email = 'admin';
        $usuario->senha = Hash::make('admin');
        $usuario->tipo_perfil = 'GERENTE';
        $usuario->ativo = 1;
        $usuario->data_cadastro = now();
        $usuario->save();
    }
}
