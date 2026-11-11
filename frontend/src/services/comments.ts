import api from "./api";

export interface TicketComment {
  id: number;
  comment: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

interface CommentsResponse {
  data: TicketComment[];
}

interface CreateCommentResponse {
  message: string;
  data: TicketComment;
}

export async function getComments(ticketId: number): Promise<TicketComment[]> {
  const response = await api.get<CommentsResponse>(
    `/tickets/${ticketId}/comments`,
  );

  return response.data.data;
}

export async function createComment(
  ticketId: number,
  comment: string,
): Promise<TicketComment> {
  const response = await api.post<CreateCommentResponse>(
    `/tickets/${ticketId}/comments`,
    {
      comment,
    },
  );

  return response.data.data;
}
