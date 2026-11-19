import api from "./api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string | null;
  role_code: string | null;
  role_id: number;
  department: string | null;
  department_id: number | null;
  is_active: boolean;
}

export interface UsersResponse {
  data: User[];
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role_id: number;
  department_id: number | null;
  is_active: boolean;
}

export interface UpdateUserPayload {
  name: string;
  email: string;
  password?: string;
  role_id: number;
  department_id: number | null;
  is_active: boolean;
}

export async function getUsers(): Promise<User[]> {
  const response = await api.get<UsersResponse>("/admin/users");

  return response.data.data;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const response = await api.post<{
    message: string;
    data: User;
  }>("/admin/users", payload);

  return response.data.data;
}

export async function updateUser(
  id: number,
  payload: UpdateUserPayload,
): Promise<User> {
  const response = await api.put<{
    message: string;
    data: User;
  }>(`/admin/users/${id}`, payload);

  return response.data.data;
}