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

  due_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
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
