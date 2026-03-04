<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Verifica se a coluna 'id' já existe
        if (!Schema::hasColumn('cliente', 'id')) {
            // Remove a constraint de chave primária atual se existir
            try {
                DB::statement('ALTER TABLE cliente DROP PRIMARY KEY');
            } catch (\Exception $e) {
                // Ignora se não existir
            }

            // Adiciona campo id como nova chave primária
            DB::statement('ALTER TABLE cliente ADD id INT AUTO_INCREMENT PRIMARY KEY FIRST');
        }

        // Adiciona campo nome se não existir
        if (!Schema::hasColumn('cliente', 'nome')) {
            Schema::table('cliente', function (Blueprint $table) {
                $table->string('nome', 255)->after('id');
            });
        }

        // Torna Usuario_id nullable (usa SQL direto para não depender de doctrine/dbal)
        DB::statement('ALTER TABLE cliente MODIFY Usuario_id INT NULL');

        // Remove e recria a foreign key como nullable
        try {
            DB::statement('ALTER TABLE cliente DROP FOREIGN KEY fk_Cliente_Usuario1');
        } catch (\Exception $e) {
            // Ignora se não existir
        }

        Schema::table('cliente', function (Blueprint $table) {
            $table->foreign('Usuario_id', 'fk_Cliente_Usuario1')
                  ->references('id')
                  ->on('usuario')
                  ->onDelete('set null');
        });

        // Migra dados: preenche 'nome' com o nome do usuário vinculado onde nome estiver vazio
        DB::statement("
            UPDATE cliente c
            LEFT JOIN usuario u ON c.Usuario_id = u.id
            SET c.nome = COALESCE(NULLIF(TRIM(c.nome), ''), u.nome, 'Cliente sem nome')
            WHERE c.nome IS NULL OR TRIM(c.nome) = ''
        ");
    }

    public function down(): void
    {
        Schema::table('cliente', function (Blueprint $table) {
            $table->dropForeign('fk_Cliente_Usuario1');
        });

        Schema::table('cliente', function (Blueprint $table) {
            $table->dropColumn('id');
            $table->dropColumn('nome');
        });

        DB::statement('ALTER TABLE cliente MODIFY Usuario_id INT NOT NULL');
        DB::statement('ALTER TABLE cliente ADD PRIMARY KEY (Usuario_id)');

        Schema::table('cliente', function (Blueprint $table) {
            $table->foreign('Usuario_id', 'fk_Cliente_Usuario1')
                  ->references('id')
                  ->on('usuario');
        });
    }
};
