<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    protected $table = 'cliente';
    protected $primaryKey = 'Usuario_id';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'Usuario_id',
        'nome',
        'tipo_cliente',
        'CNPJ_CPF',
        'telefone',
        'numero',
        'rua',
        'bairro',
        'cidade',
        'complemento',
        'Rota_id',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'Usuario_id', 'id');
    }

    public function rota()
    {
        return $this->belongsTo(Rota::class, 'Rota_id', 'id');
    }
}
