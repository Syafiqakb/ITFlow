<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminTicketCategoryUpdateRequest extends FormRequest
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
        $categoryId = $this->route('ticketCategory')->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => [
                'required',
                'string',
                'max:30',
                Rule::unique('ticket_categories', 'code')
                    ->ignore($categoryId),
            ],
            'description' => ['nullable', 'string'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}