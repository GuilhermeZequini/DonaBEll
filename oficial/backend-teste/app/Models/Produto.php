<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Produto extends Model
{
    protected $table = 'produto';
    public $timestamps = false;

    protected $fillable = [
        'nome',
        'descricao',
        'preco_pf',
        'preco_pj',
        'data_cadastro',
        'ativo',
    ];

    protected $casts = [
        'preco_pf' => 'decimal:2',
        'preco_pj' => 'decimal:2',
        'ativo' => 'boolean',
    ];
}
