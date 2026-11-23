import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import Card from "../components/Card";
import { getKnowledgeArticle, submitKnowledgeArticleFeedback } from "../services/knowledgeArticles";
import { useState, useEffect } from "react";

function KnowledgeArticleDetail() {
  const { id } = useParams();

  const articleId = Number(id);

  const queryClient = useQueryClient();

  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  const {
    data: article,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["knowledge-article", articleId],
    queryFn: () => getKnowledgeArticle(articleId),
    enabled: Number.isInteger(articleId) && articleId > 0,
  });

  useEffect(() => {
    if (article?.user_feedback) {
      setFeedbackSubmitted(true);
    }
  }, [article]);

  const handleFeedback = async (helpful: boolean) => {
    if (feedbackSubmitted || feedbackLoading) {
      return;
    }

    setFeedbackLoading(true);
    setFeedbackError("");

    try {
      const result = await submitKnowledgeArticleFeedback(articleId, helpful);

      queryClient.setQueryData(
        ["knowledge-article", articleId],
        (currentArticle: typeof article | undefined) => {
          if (!currentArticle) {
            return currentArticle;
          }

          return {
            ...currentArticle,
            helpful_count: result.helpful_count,
            not_helpful_count: result.not_helpful_count,
          };
        },
      );

      setFeedbackSubmitted(true);
    } catch (error) {
      const response = (
        error as {
          response?: {
            data?: {
              message?: string;
            };
          };
        }
      ).response;

      setFeedbackError(response?.data?.message ?? "Failed to submit feedback.");
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <p className="text-sm text-gray-500">Loading article...</p>
      </Card>
    );
  }

  if (isError || !article) {
    return (
      <Card className="p-6">
        <p className="text-sm font-medium text-gray-900">Article not found</p>

        <Link
          to="/knowledge-base"
          className="mt-4 inline-block text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          ← Back to Knowledge Base
        </Link>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        to="/knowledge-base"
        className="inline-flex text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        ← Back to Knowledge Base
      </Link>

      <Card className="p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            {article.category}
          </span>

          <span className="text-xs text-gray-400">{article.views} views</span>
        </div>

        <h1 className="mt-5 text-3xl font-bold text-gray-900">
          {article.title}
        </h1>

        <div className="mt-3 text-sm text-gray-500">
          By {article.author?.name ?? "Unknown"} ·{" "}
          {new Date(article.created_at).toLocaleDateString()}
        </div>

        <div className="my-8 border-t border-gray-100" />

        <article className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
          {article.content}
        </article>

        <div className="mt-10 border-t border-gray-100 pt-6">
          <p className="text-sm font-medium text-gray-900">
            Was this article helpful?
          </p>

          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={() => handleFeedback(true)}
              disabled={feedbackSubmitted || feedbackLoading}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              👍 Helpful ({article.helpful_count})
            </button>

            <button
              type="button"
              onClick={() => handleFeedback(false)}
              disabled={feedbackSubmitted || feedbackLoading}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              👎 Not Helpful ({article.not_helpful_count})
            </button>
          </div>

          {feedbackSubmitted && (
            <p className="mt-3 text-sm text-green-600">
              Thanks for your feedback!
            </p>
          )}

          {feedbackError && (
            <p className="mt-3 text-sm text-red-600">{feedbackError}</p>
          )}
        </div>
      </Card>
    </div>
  );
}

export default KnowledgeArticleDetail;
