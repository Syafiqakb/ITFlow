import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import Badge from "../components/Badge";
import Button from "../components/Button";
import Card from "../components/Card";
import { getUsers } from "../services/users";
import { getTicket, updateTicket } from "../services/tickets";
import { getComments, createComment } from "../services/comments";

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

  const { data: comments = [], isLoading: isCommentsLoading } = useQuery({
    queryKey: ["ticket-comments", ticketId],
    queryFn: () => getComments(ticketId),
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
  const [comment, setComment] = useState("");

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

  const commentMutation = useMutation({
    mutationFn: () => {
      return createComment(ticketId, comment);
    },

    onSuccess: () => {
      setComment("");

      queryClient.invalidateQueries({
        queryKey: ["ticket-comments", ticketId],
      });
    },

    onError: (error: any) => {
      console.error("Create comment error:", error);
      console.error("Response:", error.response?.data);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Unable to add comment.",
      );
    },
  });

  const getAllowedStatuses = () => {
    switch (ticket?.status.code) {
      case "NEW":
        return [{ id: 2, code: "ASSIGNED" }];

      case "ASSIGNED":
        return [{ id: 3, code: "IN_PROGRESS" }];

      case "IN_PROGRESS":
        return [
          { id: 4, code: "WAITING_USER" },
          { id: 5, code: "RESOLVED" },
        ];

      case "WAITING_USER":
        return [{ id: 3, code: "IN_PROGRESS" }];

      case "RESOLVED":
        return [{ id: 6, code: "CLOSED" }];

      case "CLOSED":
        return [];

      default:
        return [];
    }
  };

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
                <option value={ticket?.status.id ?? ""}>
                  {ticket?.status.name ?? "Current status"}
                </option>

                {getAllowedStatuses().map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.code}
                  </option>
                ))}
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
      <Card className="mt-6 p-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Activity</h2>

          <p className="mt-1 text-sm text-gray-500">
            Conversation and updates for this ticket.
          </p>
        </div>

        {/* Add Comment */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            Add Comment
          </label>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Write a comment..."
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none"
          />

          <div className="mt-3 flex justify-end">
            <Button
              onClick={() => commentMutation.mutate()}
              disabled={commentMutation.isPending || comment.trim().length < 2}
            >
              {commentMutation.isPending ? "Adding..." : "Add Comment"}
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="mt-8 space-y-5">
          {isCommentsLoading ? (
            <p className="text-sm text-gray-500">Loading activity...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-gray-500">No activity yet.</p>
          ) : (
            comments.map((item) => (
              <div
                key={item.id}
                className="border-b border-gray-100 pb-5 last:border-b-0"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.user.name}
                    </p>

                    <p className="text-xs text-gray-500">{item.user.email}</p>
                  </div>

                  <p className="text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">
                  {item.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

export default TicketDetail;
