<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KnowledgeArticle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\StoreKnowledgeArticleRequest;
use App\Http\Requests\UpdateKnowledgeArticleRequest;
use Illuminate\Support\Str;

class KnowledgeArticleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $articles = KnowledgeArticle::query()
            ->with('author:id,name')
            ->where('status', 'PUBLISHED')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search');

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('content', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('category'), function ($query) use ($request) {
                $query->where('category', $request->string('category'));
            })
            ->latest()
            ->get();

        return response()->json([
            'data' => $articles->map(function ($article) {
                return [
                    'id' => $article->id,
                    'title' => $article->title,
                    'slug' => $article->slug,
                    'content' => $article->content,
                    'category' => $article->category,
                    'status' => $article->status,
                    'views' => $article->views,
                    'helpful_count' => $article->helpful_count,
                    'not_helpful_count' => $article->not_helpful_count,
                    'author' => $article->author
                        ? [
                            'id' => $article->author->id,
                            'name' => $article->author->name,
                        ]
                        : null,
                    'created_at' => $article->created_at,
                    'updated_at' => $article->updated_at,
                ];
            }),
        ]);
    }

    public function show(KnowledgeArticle $knowledgeArticle): JsonResponse
    {
        abort_unless(
            $knowledgeArticle->status === 'PUBLISHED',
            404
        );

        $knowledgeArticle->increment('views');

        $knowledgeArticle->load('author:id,name');

        return response()->json([
            'data' => [
                'id' => $knowledgeArticle->id,
                'title' => $knowledgeArticle->title,
                'slug' => $knowledgeArticle->slug,
                'content' => $knowledgeArticle->content,
                'category' => $knowledgeArticle->category,
                'status' => $knowledgeArticle->status,
                'views' => $knowledgeArticle->views,
                'helpful_count' => $knowledgeArticle->helpful_count,
                'not_helpful_count' => $knowledgeArticle->not_helpful_count,
                'author' => $knowledgeArticle->author
                    ? [
                        'id' => $knowledgeArticle->author->id,
                        'name' => $knowledgeArticle->author->name,
                    ]
                    : null,
                'created_at' => $knowledgeArticle->created_at,
                'updated_at' => $knowledgeArticle->updated_at,
            ],
        ]);
    }

    public function store(
        StoreKnowledgeArticleRequest $request
    ): JsonResponse {
        $data = $request->validated();

        $article = KnowledgeArticle::create([
            'author_id' => $request->user()->id,
            'title' => $data['title'],
            'slug' => $data['slug'],
            'content' => $data['content'],
            'category' => $data['category'],
            'status' => $data['status'],
        ]);

        $article->load('author:id,name');

        return response()->json([
            'message' => 'Knowledge article created successfully.',
            'data' => $article,
        ], 201);
    }

    public function update(
        UpdateKnowledgeArticleRequest $request,
        KnowledgeArticle $knowledgeArticle
    ): JsonResponse {
        $data = $request->validated();

        $knowledgeArticle->update([
            'title' => $data['title'],
            'slug' => $data['slug'],
            'content' => $data['content'],
            'category' => $data['category'],
            'status' => $data['status'],
        ]);

        $knowledgeArticle->load('author:id,name');

        return response()->json([
            'message' => 'Knowledge article updated successfully.',
            'data' => $knowledgeArticle->fresh(),
        ]);
    }

    public function destroy(
        KnowledgeArticle $knowledgeArticle
    ): JsonResponse {
        $knowledgeArticle->delete();

        return response()->json([
            'message' => 'Knowledge article deleted successfully.',
        ]);
    }


}