<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateKnowledgeArticleRequest extends FormRequest
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
        $articleId = $this->route('knowledgeArticle')->id;

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('knowledge_articles', 'slug')
                    ->ignore($articleId),
            ],
            'content' => ['required', 'string'],
            'category' => ['required', 'string', 'max:100'],
            'status' => ['required', 'in:DRAFT,PUBLISHED'],
        ];
    }
}