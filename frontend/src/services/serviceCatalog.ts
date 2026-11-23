import api from "./api";

export interface ServiceCatalog {
  id: number;
  name: string;
  code: string;
  description: string | null;
  icon: string | null;
  category_id: number;
  category_name: string | null;
}

interface ServiceCatalogResponse {
  data: ServiceCatalog[];
}

export async function getServiceCatalogs(): Promise<ServiceCatalog[]> {
  const response = await api.get<ServiceCatalogResponse>("/service-catalogs");

  return response.data.data;
}

export interface AdminServiceCatalog extends ServiceCatalog {
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AdminServiceCatalogResponse {
  data: AdminServiceCatalog[];
}

export interface CreateServiceCatalogPayload {
  name: string;
  code: string;
  description: string;
  icon: string;
  category_id: number;
  is_active: boolean;
}

export interface UpdateServiceCatalogPayload {
  name: string;
  code: string;
  description: string;
  icon: string;
  category_id: number;
  is_active: boolean;
}

export async function getAdminServiceCatalogs(): Promise<
  AdminServiceCatalog[]
> {
  const response = await api.get<AdminServiceCatalogResponse>(
    "/admin/service-catalogs",
  );

  return response.data.data;
}

export async function createServiceCatalog(
  payload: CreateServiceCatalogPayload,
): Promise<AdminServiceCatalog> {
  const response = await api.post<{ data: AdminServiceCatalog }>(
    "/admin/service-catalogs",
    payload,
  );

  return response.data.data;
}

export async function updateServiceCatalog(
  id: number,
  payload: UpdateServiceCatalogPayload,
): Promise<AdminServiceCatalog> {
  const response = await api.put<{ data: AdminServiceCatalog }>(
    `/admin/service-catalogs/${id}`,
    payload,
  );

  return response.data.data;
}

export async function deleteServiceCatalog(id: number): Promise<void> {
  await api.delete(`/admin/service-catalogs/${id}`);
}
