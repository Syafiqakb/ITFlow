import api from "./api";

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  users_count: number;
}

export interface DepartmentResponse {
  data: Department[];
}

export async function getDepartments(): Promise<Department[]> {
  const response = await api.get<DepartmentResponse>("/admin/departments");

  return response.data.data;
}

export interface CreateDepartmentPayload {
  name: string;
  code: string;
  description: string;
  is_active: boolean;
}

export async function createDepartment(
  payload: CreateDepartmentPayload,
): Promise<Department> {
  const response = await api.post<{
    message: string;
    data: Department;
  }>("/admin/departments", payload);

  return response.data.data;
}

export interface UpdateDepartmentPayload {
  name: string;
  code: string;
  description: string;
  is_active: boolean;
}

export async function updateDepartment(
  id: number,
  payload: UpdateDepartmentPayload,
): Promise<Department> {
  const response = await api.put<{
    message: string;
    data: Department;
  }>(`/admin/departments/${id}`, payload);

  return response.data.data;
}
