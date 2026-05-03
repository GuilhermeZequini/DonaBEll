<?php

use App\Models\Usuario;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('admin:reset-senha {email?} {--senha=admin}', function () {
    $rawEmail = $this->argument('email');
    $email = ($rawEmail !== null && $rawEmail !== '') ? trim((string) $rawEmail) : 'admin';
    $senha = (string) $this->option('senha');

    $usuario = Usuario::where('email', $email)->first()
        ?? Usuario::whereRaw('TRIM(email) = ?', [$email])->first();

    if (!$usuario) {
        $this->error("Usuário com email \"{$email}\" não encontrado.");

        return 1;
    }

    $usuario->senha = Hash::make($senha);
    $usuario->save();

    $this->info("Senha atualizada para o usuário id {$usuario->id} ({$usuario->email}).");

    return 0;
})->purpose('Gera novo hash de senha para um usuário (ex.: admin após import do banco)');
