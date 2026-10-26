<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        return User::orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:150|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in(['admin', 'staff'])],
        ]);

        $user = User::create($data + ['is_active' => true]);

        return response()->json($user, 201);
    }

        public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'role' => ['sometimes', Rule::in(['admin', 'staff'])],
            'is_active' => 'sometimes|boolean',
        ]);

        $isSelf = $user->id === $request->user()->id;
        $disabling = array_key_exists('is_active', $data) && ! $data['is_active'];
        $demoting = array_key_exists('role', $data) && $data['role'] !== 'admin';

        if ($isSelf && ($disabling || $demoting)) {
            return response()->json(['message' => 'You cannot disable or demote your own account.'], 422);
        }

        $user->update($data);

        // Log the person out everywhere when the account is disabled
        if ($disabling) {
            $user->tokens()->delete();
        }

        return $user;
    }
}