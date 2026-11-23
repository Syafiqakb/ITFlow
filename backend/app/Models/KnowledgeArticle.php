<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KnowledgeArticle extends Model
{
    protected $fillable = [
        'author_id',
        'title',
        'slug',
        'content',
        'category',
        'status',
        'views',
        'helpful_count',
        'not_helpful_count',
    ];

    protected $casts = [
        'views' => 'integer',
        'helpful_count' => 'integer',
        'not_helpful_count' => 'integer',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function feedback(): HasMany
    {
        return $this->hasMany(
            KnowledgeArticleFeedback::class,
            'knowledge_article_id'
        );
    }
}