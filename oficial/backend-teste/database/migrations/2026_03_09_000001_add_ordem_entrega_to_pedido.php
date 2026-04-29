<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('Pedido', function (Blueprint $table) {
            $table->unsignedInteger('ordem_entrega')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('Pedido', function (Blueprint $table) {
            $table->dropColumn('ordem_entrega');
        });
    }
};
