import api from "./api";

export interface Category {
  id: number;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
}

export interface CategoryResponse {
  data: Category[];
}

export async function getCategories(): Promise<Category[]> {
  const response = await api.get<CategoryResponse>("/admin/categories");

  return response.data.data;
}

export interface CreateCategoryPayload {
  name: string;
  code: string;
  description: string;
  is_active: boolean;
}

export async function createCategory(
  payload: CreateCategoryPayload,
): Promise<Category> {
  const response = await api.post<{
    message: string;
    data: Category;
  }>("/admin/categories", payload);

  return response.data.data;
}

export interface UpdateCategoryPayload {
  name: string;
  code: string;
  description: string;
  is_active: boolean;
}

export async function updateCategory(
  id: number,
  payload: UpdateCategoryPayload,
): Promise<Category> {
  const response = await api.put<{
    message: string;
    data: Category;
  }>(`/admin/categories/${id}`, payload);

  return response.data.data;
}

export async function getActiveCategories(): Promise<Category[]> {
  const response = await api.get<CategoryResponse>("/ticket-categories");
  return response.data.data;
}
