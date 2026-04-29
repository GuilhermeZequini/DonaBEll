<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    protected $table = 'Pedido';
    public $timestamps = false;

    protected $fillable = [
        'Usuario_id',
        'entrega_id',
        'Cliente_Usuario_id',
        'data_cadastro',
        'status',
        'observacao',
        'valor_total',
        'ordem_entrega',
    ];

    protected $casts = [
        'data_cadastro' => 'datetime',
        'valor_total' => 'decimal:2',
    ];

    public const STATUS_NOVO = 'NOVO';
    public const STATUS_APROVADO = 'APROVADO';
    public const STATUS_REJEITADO = 'REJEITADO';
    public const STATUS_EM_PRODUCAO = 'EM_PRODUCAO';
    public const STATUS_PRONTO = 'PRONTO';
    public const STATUS_EM_ENTREGA = 'EM_ENTREGA';
    public const STATUS_ENTREGUE = 'ENTREGUE';
    public const STATUS_CANCELADO = 'CANCELADO';

    public function vendedor()
    {
        return $this->belongsTo(Usuario::class, 'Usuario_id', 'id');
    }

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'Cliente_Usuario_id', 'Usuario_id');
    }

    public function itens()
    {
        return $this->hasMany(ItemPedido::class, 'Pedido_id', 'id');
    }
}
