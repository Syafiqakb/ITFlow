import api from "./api";

export interface DashboardStats {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  resolved_tickets: number;
  closed_tickets: number;
  sla_breached: number;
}

interface DashboardStatsResponse {
  data: DashboardStats;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get<DashboardStatsResponse>("/dashboard/stats");

  return response.data.data;
}
