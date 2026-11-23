import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import { getKnowledgeArticles } from "../services/knowledgeArticles";

function KnowledgeBase() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const {
    data: articles = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["knowledge-articles", search, category],
    queryFn: () => getKnowledgeArticles(search, category),
  });

  const categories = useMemo(() => {
    return Array.from(
      new Set(articles.map((article) => article.category)),
    ).sort();
  }, [articles]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Knowledge Base</h1>

        <p className="mt-1 text-sm text-gray-500">
          Find helpful guides and solutions for common IT issues.
        </p>
      </div>

      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <div>
            <label
              htmlFor="knowledge-search"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Search
            </label>

            <input
              id="knowledge-search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search articles..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
          </div>

          <div>
            <label
              htmlFor="knowledge-category"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Category
            </label>

            <select
              id="knowledge-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            >
              <option value="">All categories</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

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
              Try a different search term or category.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/knowledge-base/${article.id}`}
              className="block"
            >
              <Card className="h-full p-6 transition hover:border-gray-300 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                    {article.category}
                  </span>

                  <span className="text-xs text-gray-400">
                    {article.views} views
                  </span>
                </div>

                <h2 className="mt-4 text-lg font-semibold text-gray-900">
                  {article.title}
                </h2>

                <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                  {article.content}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-xs text-gray-500">
                    By {article.author?.name ?? "Unknown"}
                  </span>

                  <span className="text-xs font-medium text-gray-700">
                    Read article →
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default KnowledgeBase;
