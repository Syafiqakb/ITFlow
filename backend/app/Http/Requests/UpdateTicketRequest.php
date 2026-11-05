<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => [
                'sometimes',
                'required',
                'string',
                'min:5',
                'max:255',
            ],

            'description' => [
                'sometimes',
                'required',
                'string',
                'min:10',
            ],

            'category_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:ticket_categories,id',
            ],

            'priority_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:ticket_priorities,id',
            ],

            'status_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:ticket_statuses,id',
            ],

            'assigned_to' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:users,id',
            ],
        ];
    }
}
