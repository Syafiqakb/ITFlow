import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Card from "../../components/Card";
import { getKnowledgeArticlesForManagement, deleteKnowledgeArticle } from "../../services/knowledgeArticles";
import { hasAnyRole } from "../../utils/auth";

function KnowledgeBaseManagement() {
  const {
    data: articles = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-knowledge-articles"],
    queryFn: () => getKnowledgeArticlesForManagement(),
  });

  const canManageKnowledgeBase = hasAnyRole([
    "Administrator",
    "IT Manager",
    "IT Support",
  ]);

  const canDeleteKnowledgeBase = hasAnyRole([
  "Administrator",
  "IT Manager",
]);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (articleId: number) => deleteKnowledgeArticle(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-knowledge-articles"],
      });
    },
  });

  if (!canManageKnowledgeBase) {
    return (
      <Card className="p-6">
        <p className="text-sm font-medium text-red-600">
          You are not authorized to access this page.
        </p>
      </Card>
    );
  }

  const deleteError = deleteMutation.isError;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {deleteError && (
          <Card className="p-4">
            <p className="text-sm text-red-600">
              Unable to delete knowledge article.
            </p>
          </Card>
        )}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Knowledge Base
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage knowledge articles and IT documentation.
          </p>
        </div>

        <Link
          to="/admin/knowledge-base/create"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Create Article
        </Link>
      </div>

      {isLoading ? (
        <Card className="p-6">
          <p className="text-sm text-gray-500">Loading knowledge articles...</p>
        </Card>
      ) : isError ? (
        <Card className="p-6">
          <p className="text-sm text-red-600">
            Unable to load knowledge articles.
          </p>
        </Card>
      ) : articles.length === 0 ? (
        <Card className="p-6">
          <div className="py-8 text-center">
            <p className="text-sm font-medium text-gray-900">
              No articles found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Create your first knowledge article.
            </p>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 font-medium text-gray-600">
                    Article
                  </th>

                  <th className="px-6 py-3 font-medium text-gray-600">
                    Category
                  </th>

                  <th className="px-6 py-3 font-medium text-gray-600">
                    Author
                  </th>

                  <th className="px-6 py-3 font-medium text-gray-600">Views</th>

                  <th className="px-6 py-3 font-medium text-gray-600">
                    Status
                  </th>

                  <th className="px-6 py-3 font-medium text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {article.title}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {article.slug}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {article.category}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {article.author?.name ?? "Unknown"}
                    </td>

                    <td className="px-6 py-4 text-gray-600">{article.views}</td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                        {article.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/admin/knowledge-base/${article.id}/edit`}
                          className="text-sm font-medium text-gray-700 hover:text-gray-900"
                        >
                          Edit
                        </Link>

                        {canDeleteKnowledgeBase && (
                          <button
                            type="button"
                            disabled={deleteMutation.isPending}
                            onClick={() => {
                              const confirmed = window.confirm(
                                `Delete "${article.title}"? This action cannot be undone.`,
                              );

                              if (confirmed) {
                                deleteMutation.mutate(article.id);
                              }
                            }}
                            className="text-sm font-medium text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

export default KnowledgeBaseManagement;
