import api from "./api";

export interface TicketStatusReport {
  status: string;
  total: number;
}

export interface TicketPriorityReport {
  priority: string;
  total: number;
}

export interface TicketCategoryReport {
  category: string;
  total: number;
}

export interface TicketAssigneeReport {
  assignee: string;
  total: number;
}

export interface TicketTrendReport {
  month: string;
  total: number;
}

export interface SlaPerformanceReport {
  total_with_sla: number;
  sla_met: number;
  sla_breached: number;
  sla_on_track: number;
  compliance_rate: number;
}

export async function getTicketStatusReport(): Promise<TicketStatusReport[]> {
  const response = await api.get("/reports/tickets/status");

  return response.data.data;
}

export async function getTicketPriorityReport(): Promise<
  TicketPriorityReport[]
> {
  const response = await api.get("/reports/tickets/priority");

  return response.data.data;
}

export async function getTicketCategoryReport(): Promise<
  TicketCategoryReport[]
> {
  const response = await api.get("/reports/tickets/category");

  return response.data.data;
}

export async function getTicketAssigneeReport(): Promise<
  TicketAssigneeReport[]
> {
  const response = await api.get("/reports/tickets/assignee");

  return response.data.data;
}

export async function getTicketTrendReport(): Promise<TicketTrendReport[]> {
  const response = await api.get("/reports/tickets/trend");

  return response.data.data;
}

export async function getSlaPerformanceReport(): Promise<SlaPerformanceReport> {
  const response = await api.get("/reports/tickets/sla");

  return response.data.data;
}
