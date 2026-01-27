<?php

namespace App\Http\Controllers;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\StoreUserRequest;


class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(request $request)
    {

        $currentPage = $request->get('current_page') ?? 1; // página atual
        $regPerPage = 10; // registros por página
        $skip = ($currentPage - 1) * $regPerPage; // isso faz co  que a pagina 1 comece do registro 0 e a pagina 2 = 10
        $users = User::skip($skip)->take($regPerPage)->orderBy('id')->get();

        return response()->json($users->toResourceCollection(), 200);
    }


    public function store(StoreUserRequest $request)
    {
        $data = $request ->validated();

        try {
            $user = new User();
            $user->fill($data);
            $user->password = Hash::make('password123');
            $user->save();

            return response()->json($user->toResource(), 201);

        } catch (\Exception $Th) {
            return response()->json(['message' => 'Falha ao criar usuário'], 400);
        }

    }


    public function show(string $id)
    {
        try {
            $user = User::findOrFail($id);
            return response()->json($user->toResource(), 200);

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

            return response()->json($user->toResource(), 200);

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
