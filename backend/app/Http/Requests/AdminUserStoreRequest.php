<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminUserStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole([
            'ADMIN',
            'IT_MANAGER',
        ]) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'password' => [
                'required',
                'string',
                'min:8',
            ],

            'role_id' => [
                'required',
                'integer',
                Rule::exists('roles', 'id')->where(
                    fn ($query) => $query->where('is_active', true)
                ),
            ],

            'department_id' => [
                'nullable',
                'integer',
                Rule::exists('departments', 'id')->where(
                    fn ($query) => $query->where('is_active', true)
                ),
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ];
    }
}