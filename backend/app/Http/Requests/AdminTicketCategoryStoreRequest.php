<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdminTicketCategoryStoreRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:30', 'unique:ticket_categories,code'],
            'description' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}