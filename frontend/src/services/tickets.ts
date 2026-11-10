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

export async function getTickets(): Promise<TicketListResponse> {
  const response = await api.get<TicketListResponse>("/tickets");

  return response.data;
}
