<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens;
   

    protected $table = 'usuario';
    protected $primaryKey = 'id';
    public $timestamps = false;


    protected $fillable = [
        'nome',
        'email',
        'senha',
        'tipo_perfil',
        'ativo'
    ];

    protected $hidden = ['senha'];
}
