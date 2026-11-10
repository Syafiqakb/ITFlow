import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import Badge from "../components/Badge";
import Button from "../components/Button";
import Card from "../components/Card";
import { getTicket } from "../services/tickets";

function TicketDetail() {
  const { id } = useParams<{ id: string }>();

  const ticketId = Number(id);

  const {
    data: ticket,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => getTicket(ticketId),
    enabled: Number.isInteger(ticketId),
  });

  if (isLoading) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-gray-500">Loading ticket...</p>
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div>
        <Card className="p-6">
          <p className="text-sm text-red-600">Unable to load ticket.</p>

          <div className="mt-4">
            <Link to="/tickets">
              <Button variant="secondary">Back to Tickets</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {ticket.ticket_number}
            </h1>

            <Badge
              variant={
                ticket.status.code === "RESOLVED" ||
                ticket.status.code === "CLOSED"
                  ? "success"
                  : ticket.status.code === "IN_PROGRESS"
                    ? "warning"
                    : ticket.status.code === "ASSIGNED"
                      ? "info"
                      : "default"
              }
            >
              {ticket.status.name}
            </Badge>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Ticket details and information.
          </p>
        </div>

        <Link to="/tickets">
          <Button variant="secondary">Back to Tickets</Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ticket Information */}
        <div className="lg:col-span-2">
          <Card>
            <div className="border-b px-6 py-5">
              <h2 className="text-lg font-semibold text-gray-900">
                {ticket.title}
              </h2>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm font-medium text-gray-700">Description</p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                {ticket.description}
              </p>
            </div>
          </Card>
        </div>

        {/* Ticket Metadata */}
        <div>
          <Card>
            <div className="border-b px-6 py-4">
              <h2 className="font-semibold text-gray-900">
                Ticket Information
              </h2>
            </div>

            <div className="divide-y">
              <div className="px-6 py-4">
                <p className="text-xs text-gray-500">Requester</p>

                <p className="mt-1 text-sm font-medium text-gray-900">
                  {ticket.requester.name}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {ticket.requester.email}
                </p>
              </div>

              <div className="px-6 py-4">
                <p className="text-xs text-gray-500">Category</p>

                <p className="mt-1 text-sm font-medium text-gray-900">
                  {ticket.category.name}
                </p>
              </div>

              <div className="px-6 py-4">
                <p className="text-xs text-gray-500">Priority</p>

                <div className="mt-1">
                  <Badge
                    variant={
                      ticket.priority.code === "CRITICAL"
                        ? "danger"
                        : ticket.priority.code === "HIGH"
                          ? "warning"
                          : ticket.priority.code === "MEDIUM"
                            ? "info"
                            : "default"
                    }
                  >
                    {ticket.priority.name}
                  </Badge>
                </div>
              </div>

              <div className="px-6 py-4">
                <p className="text-xs text-gray-500">Assigned To</p>

                <p className="mt-1 text-sm font-medium text-gray-900">
                  {ticket.assignee?.name ?? "Unassigned"}
                </p>
              </div>

              <div className="px-6 py-4">
                <p className="text-xs text-gray-500">Created</p>

                <p className="mt-1 text-sm text-gray-700">
                  {new Date(ticket.created_at).toLocaleString()}
                </p>
              </div>

              <div className="px-6 py-4">
                <p className="text-xs text-gray-500">Due Date</p>

                <p className="mt-1 text-sm text-gray-700">
                  {ticket.due_at
                    ? new Date(ticket.due_at).toLocaleString()
                    : "Not set"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default TicketDetail;
