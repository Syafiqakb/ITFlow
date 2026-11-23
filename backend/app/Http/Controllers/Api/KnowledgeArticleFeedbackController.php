<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreKnowledgeArticleFeedbackRequest;
use App\Models\KnowledgeArticle;
use App\Models\KnowledgeArticleFeedback;
use Illuminate\Http\JsonResponse;

class KnowledgeArticleFeedbackController extends Controller
{
    public function store(
        StoreKnowledgeArticleFeedbackRequest $request,
        KnowledgeArticle $knowledgeArticle
    ): JsonResponse {
        if ($knowledgeArticle->status !== 'PUBLISHED') {
            return response()->json([
                'message' => 'Knowledge article not found.',
            ], 404);
        }

        $feedback = KnowledgeArticleFeedback::where(
            'knowledge_article_id',
            $knowledgeArticle->id
        )
            ->where('user_id', $request->user()->id)
            ->first();

        if ($feedback) {
            return response()->json([
                'message' => 'You have already submitted feedback for this article.',
            ], 409);
        }

        $data = $request->validated();

        KnowledgeArticleFeedback::create([
            'knowledge_article_id' => $knowledgeArticle->id,
            'user_id' => $request->user()->id,
            'helpful' => $data['helpful'],
        ]);

        if ($data['helpful']) {
            $knowledgeArticle->increment('helpful_count');
        } else {
            $knowledgeArticle->increment('not_helpful_count');
        }

        $knowledgeArticle->refresh();

        return response()->json([
            'message' => 'Feedback submitted successfully.',
            'data' => [
                'helpful_count' => $knowledgeArticle->helpful_count,
                'not_helpful_count' => $knowledgeArticle->not_helpful_count,
            ],
        ]);
    }
}