import api from "./api";

export interface KnowledgeArticle {
  id: number;
  title: string;
  slug: string;
  content: string;
  category: string;
  status: "DRAFT" | "PUBLISHED";
  views: number;
  helpful_count: number;
  not_helpful_count: number;
  user_feedback: {
    helpful: boolean;
  } | null;
  author: {
    id: number;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

interface KnowledgeArticlesResponse {
  data: KnowledgeArticle[];
}

interface KnowledgeArticleResponse {
  data: KnowledgeArticle;
}

interface KnowledgeArticleFeedbackResponse {
  data: {
    helpful_count: number;
    not_helpful_count: number;
  };
}

export async function getKnowledgeArticles(
  search?: string,
  category?: string,
): Promise<KnowledgeArticle[]> {
  const response = await api.get<KnowledgeArticlesResponse>(
    "/knowledge-articles",
    {
      params: {
        search: search || undefined,
        category: category || undefined,
      },
    },
  );

  return response.data.data;
}

export async function getKnowledgeArticle(
  id: number,
): Promise<KnowledgeArticle> {
  const response = await api.get<KnowledgeArticleResponse>(
    `/knowledge-articles/${id}`,
  );

  return response.data.data;
}

export async function submitKnowledgeArticleFeedback(
  id: number,
  helpful: boolean,
): Promise<KnowledgeArticleFeedbackResponse["data"]> {
  const response = await api.post<KnowledgeArticleFeedbackResponse>(
    `/knowledge-articles/${id}/feedback`,
    {
      helpful,
    },
  );

  return response.data.data;
}