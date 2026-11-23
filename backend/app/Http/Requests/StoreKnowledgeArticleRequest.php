<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreKnowledgeArticleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole([
            'ADMIN',
            'IT_MANAGER',
            'IT_SUPPORT',
        ]) ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:knowledge_articles,slug'],
            'content' => ['required', 'string'],
            'category' => ['required', 'string', 'max:100'],
            'status' => ['required', 'in:DRAFT,PUBLISHED'],
        ];
    }
}