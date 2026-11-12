import api from "./api";

export interface TicketAttachment {
  id: number;
  original_name: string;
  file_name: string;
  mime_type: string | null;
  file_size: number;
  uploaded_by: {
    id: number;
    name: string;
  };
  created_at: string;
}

interface AttachmentsResponse {
  data: TicketAttachment[];
}

interface UploadAttachmentResponse {
  message: string;
  data: TicketAttachment;
}

export async function getAttachments(
  ticketId: number,
): Promise<TicketAttachment[]> {
  const response = await api.get<AttachmentsResponse>(
    `/tickets/${ticketId}/attachments`,
  );

  return response.data.data;
}

export async function uploadAttachment(
  ticketId: number,
  file: File,
): Promise<TicketAttachment> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post<UploadAttachmentResponse>(
    `/tickets/${ticketId}/attachments`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data.data;
}

export async function deleteAttachment(
  ticketId: number,
  attachmentId: number,
): Promise<void> {
  await api.delete(`/tickets/${ticketId}/attachments/${attachmentId}`);
}
