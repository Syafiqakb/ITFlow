import api from "./api";

export interface Ticket {
  id: number;
  ticket_number: string;
  title: string;
  description: string;

  requester: {
    id: number;
    name: string;
    email: string;
  };

  category: {
    id: number;
    name: string;
    code: string;
  };

  priority: {
    id: number;
    name: string;
    code: string;
    level: number;
  };

  status: {
    id: number;
    name: string;
    code: string;
  };

  assignee: {
    id: number;
    name: string;
    email: string;
  } | null;

  created_at: string;
  updated_at: string;
  due_at: string | null;
  sla_status: "ON_TRACK" | "BREACHED" | "COMPLETED" | null;
  first_responded_at: string | null;
  response_sla_status: "PENDING" | "PASSED" | "BREACHED";
  resolved_at: string | null;
  closed_at: string | null;
}

interface TicketListResponse {
  data: Ticket[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface TicketFilters {
  search?: string;
  status?: string;
  priority?: string;
  assigned_to?: number;
  category?: string;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  category_id: number;
  priority_id: number;
}

export async function getTickets(
  page = 1,
  filters: TicketFilters = {},
): Promise<TicketListResponse> {
  const response = await api.get<TicketListResponse>("/tickets", {
    params: {
      page,
      search: filters.search || undefined,
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      assigned_to: filters.assigned_to || undefined,
      category: filters.category || undefined,
    },
  });

  return response.data;
}

export async function getTicket(id: number): Promise<Ticket> {
  const response = await api.get<{ data: Ticket }>(`/tickets/${id}`);

  return response.data.data;
}

export async function createTicket(
  payload: CreateTicketPayload,
): Promise<Ticket> {
  const response = await api.post<{ data: Ticket }>("/tickets", payload);

  return response.data.data;
}

export interface UpdateTicketPayload {
  title?: string;
  description?: string;
  category_id?: number;
  priority_id?: number;
  status_id?: number;
  assigned_to?: number | null;
}

export async function updateTicket(
  id: number,
  payload: UpdateTicketPayload,
): Promise<Ticket> {
  const response = await api.patch<{ data: Ticket }>(`/tickets/${id}`, payload);

  return response.data.data;
}