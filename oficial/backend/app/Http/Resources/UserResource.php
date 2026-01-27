<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */

    // essa função define quais campos serão retornados na API, dessa forma não expondo campos sensíveis como senha
    public function toArray(Request $request): array
    {
        //return parent::toArray($request);
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'data_cadastro' => $this->created_at,
            'data_atualizacao' => $this->updated_at,
        ];
    }
}
