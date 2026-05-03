<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ItemPedido extends Model
{
    protected $table = 'itens_pedido';
    public $timestamps = false;

    protected $fillable = [
        'Pedido_id',
        'Produto_id',
        'quantidade',
        'preco_unitario',
        'observacao',
    ];

    protected $casts = [
        'quantidade' => 'integer',
        'preco_unitario' => 'decimal:2',
    ];

    public function pedido()
    {
        return $this->belongsTo(Pedido::class, 'Pedido_id', 'id');
    }

    public function produto()
    {
        return $this->belongsTo(Produto::class, 'Produto_id', 'id');
    }
}
