import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import Badge from "../components/Badge";
import Button from "../components/Button";
import Card from "../components/Card";
import { getTicket, updateTicket } from "../services/tickets";
import { getUsers } from "../services/users";

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

  const { data: users = [], isLoading: isUsersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const queryClient = useQueryClient();

  const [statusId, setStatusId] = useState<number | null>(null);
  const [priorityId, setPriorityId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState<number | null>(null);

  useEffect(() => {
    if (ticket) {
      setTitle(ticket.title);
      setDescription(ticket.description);
      setStatusId(ticket.status.id);
      setPriorityId(ticket.priority.id);
      setAssignedTo(ticket.assignee?.id ?? null);
    }
  }, [ticket]);

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!statusId || !priorityId) {
        throw new Error("Status and priority are required.");
      }

      return updateTicket(ticketId, {
        title,
        description,
        status_id: statusId,
        priority_id: priorityId,
        assigned_to: assignedTo,
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ticket", ticketId],
      });

      queryClient.invalidateQueries({
        queryKey: ["tickets"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard-tickets"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard-stats"],
      });

      alert("Ticket updated successfully.");
    },

    onError: (error: any) => {
      console.error("Update ticket error:", error);
      console.error("Response:", error.response?.data);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Unable to update ticket.",
      );
    },
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
      {/* Update Ticket */}
      <div className="mt-6">
        <Card>
          <div className="border-b px-6 py-4">
            {/* Title */}
            <div className="px-6 pt-5">
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none"
                placeholder="Enter ticket title"
              />
            </div>

            {/* Description */}
            <div className="px-6 pt-5">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none"
                placeholder="Enter ticket description"
              />
            </div>
          </div>

          <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={statusId ?? ""}
                onChange={(e) => setStatusId(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none"
              >
                <option value="">Select status</option>
                <option value="1">NEW</option>
                <option value="2">ASSIGNED</option>
                <option value="3">IN_PROGRESS</option>
                <option value="4">WAITING_USER</option>
                <option value="5">RESOLVED</option>
                <option value="6">CLOSED</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Priority
              </label>

              <select
                value={priorityId ?? ""}
                onChange={(e) => setPriorityId(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none"
              >
                <option value="">Select priority</option>
                <option value="1">LOW</option>
                <option value="2">MEDIUM</option>
                <option value="3">HIGH</option>
                <option value="4">CRITICAL</option>
              </select>
            </div>
            {/* Assigned To */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Assigned To
              </label>

              <select
                value={assignedTo ?? ""}
                onChange={(e) =>
                  setAssignedTo(e.target.value ? Number(e.target.value) : null)
                }
                disabled={isUsersLoading}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                <option value="">
                  {isUsersLoading ? "Loading users..." : "Unassigned"}
                </option>

                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                    {user.role ? ` — ${user.role}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t px-6 py-4">
            <Button
              type="button"
              onClick={() => updateMutation.mutate()}
              disabled={
                updateMutation.isPending ||
                statusId === null ||
                priorityId === null
              }
            >
              {updateMutation.isPending ? "Updating..." : "Update Ticket"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default TicketDetail;
