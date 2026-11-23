import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import Card from "../../components/Card";
import {
  getKnowledgeArticleForManagement,
  updateKnowledgeArticle,
  type KnowledgeArticlePayload,
} from "../../services/knowledgeArticles";
import { hasAnyRole } from "../../utils/auth";

const articleSchema = z.object({
  title: z.string().min(1, "Title is required."),
  slug: z.string().min(1, "Slug is required."),
  content: z.string().min(1, "Content is required."),
  category: z.string().min(1, "Category is required."),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

function KnowledgeArticleEdit() {
  const { id } = useParams<{ id: string }>();
  const articleId = Number(id);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const canManageKnowledgeBase = hasAnyRole([
    "Administrator",
    "IT Manager",
    "IT Support",
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
  });

  const {
    data: article,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-knowledge-article", articleId],
    queryFn: () => getKnowledgeArticleForManagement(articleId),
    enabled:
      canManageKnowledgeBase && Number.isInteger(articleId) && articleId > 0,
  });

  const mutation = useMutation({
    mutationFn: (payload: KnowledgeArticlePayload) =>
      updateKnowledgeArticle(articleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-knowledge-articles"],
      });

      queryClient.invalidateQueries({
        queryKey: ["knowledge-article", articleId],
      });

      navigate("/admin/knowledge-base");
    },
  });

  const onSubmit = (values: ArticleFormValues) => {
    mutation.mutate(values);
  };

  if (!canManageKnowledgeBase) {
    return (
      <Card className="p-6">
        <p className="text-sm font-medium text-red-600">
          You are not authorized to access this page.
        </p>
      </Card>
    );
  }

  if (!Number.isInteger(articleId) || articleId <= 0) {
    return (
      <Card className="p-6">
        <p className="text-sm font-medium text-red-600">
          Invalid knowledge article.
        </p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <p className="text-sm text-gray-500">Loading knowledge article...</p>
      </Card>
    );
  }

  if (isError || !article) {
    return (
      <Card className="p-6">
        <p className="text-sm text-red-600">
          Unable to load knowledge article.
        </p>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          to="/admin/knowledge-base"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back to Knowledge Base
        </Link>

        <h1 className="mt-4 text-2xl font-semibold text-gray-900">
          Edit Knowledge Article
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Update the selected knowledge article.
        </p>
      </div>

      <Card className="p-6">
        <form
          key={article.id}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Title
            </label>

            <input
              {...register("title")}
              defaultValue={article.title}
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />

            {errors.title && (
              <p className="mt-1 text-xs text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Slug
            </label>

            <input
              {...register("slug")}
              defaultValue={article.slug}
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />

            {errors.slug && (
              <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category
            </label>

            <input
              {...register("category")}
              defaultValue={article.category}
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />

            {errors.category && (
              <p className="mt-1 text-xs text-red-600">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Content
            </label>

            <textarea
              {...register("content")}
              defaultValue={article.content}
              rows={10}
              className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />

            {errors.content && (
              <p className="mt-1 text-xs text-red-600">
                {errors.content.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Status
            </label>

            <select
              {...register("status")}
              defaultValue={article.status}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>

          {mutation.isError && (
            <p className="text-sm text-red-600">
              Unable to update knowledge article.
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
            <Link
              to="/admin/knowledge-base"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default KnowledgeArticleEdit;
