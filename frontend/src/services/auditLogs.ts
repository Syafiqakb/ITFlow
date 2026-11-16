import api from "./api";

export interface AuditLog {
  id: number;
  action: string;
  description: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  user: {
    id: number;
    name: string;
  } | null;
  created_at: string;
}

interface AuditLogsResponse {
  data: AuditLog[];
}

export async function getAuditLogs(ticketId: number): Promise<AuditLog[]> {
  const response = await api.get<AuditLogsResponse>(
    `/tickets/${ticketId}/audit-logs`,
  );

  return response.data.data;
}
