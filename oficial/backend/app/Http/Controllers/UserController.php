<?php

namespace App\Http\Controllers;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\StoreUserRequest;
use Illuminate\Session\Store;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::all();

        return response()->json($users, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        $data = $request ->validated();

        try {
            $user = new User();
            $user->fill($data);
            $user->password = Hash::make('password123');
            $user->save();

            return response()->json($user, 201);

        } catch (\Exception $Th) {
            return response()->json(['message' => 'Falha ao criar usuário'], 400);
        }

    }


    public function show(string $id)
    {
        try {
            $user = User::findOrFail($id);
            return response()->json($user, 200);

        } catch (\Exception $Th) {
            return response()->json(['message' => 'Falha ao procurar usuário'], 404);
        }
    }


    public function update(UpdateUserRequest $request, string $id)
    {
        $data = $request ->validated();

        try {
            $user = User::findOrFail($id);
            $user->update($data);

            return response()->json($user, 200);

        } catch (\Exception $ex) {
            return response()->json(['message' => 'Falha ao alterar usuário'], 400);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {

        try {
            $removed = User::destroy($id);
            if (!$removed){
                return response()->json(['message' => 'Usuário não encontrado'], 404);
            }

            return response()->json(null, 204);

        } catch (\Exception $ex) {
            return response()->json(['message' => 'Falha ao remover usuário'], 400);
        }
    }
}
