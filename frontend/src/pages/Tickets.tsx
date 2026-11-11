import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import Badge from "../components/Badge";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import Select from "../components/Select";
import { getUsers } from "../services/users";
import { getTickets, type TicketFilters } from "../services/tickets";

function Tickets() {
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState<TicketFilters>({
    search: "",
    status: "",
    priority: "",
    assigned_to: undefined,
    category: "",
  });

  const { data: users = [], isLoading: isUsersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const {
    data: ticketResponse,
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ["tickets", page, filters],
    queryFn: () => getTickets(page, filters),
    placeholderData: (previousData) => previousData,
  });

  const tickets = ticketResponse?.data ?? [];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor all IT service desk tickets.
          </p>
        </div>
      </div>

      {/* Ticket List */}
      <Card>
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="font-semibold text-gray-900">All Tickets</h2>

            <p className="mt-1 text-xs text-gray-500">
              {ticketResponse?.meta.total ?? 0} total tickets
            </p>
          </div>

          <Button>Create Ticket</Button>
        </div>

        {isLoading && (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-gray-500">Loading tickets...</p>
          </div>
        )}

        {isError && (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-red-600">Unable to load tickets.</p>
          </div>
        )}

        <div className="border-b px-5 py-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Input
              label="Search"
              placeholder="Search ticket number or title..."
              value={filters.search}
              onChange={(event) => {
                setPage(1);

                setFilters((current) => ({
                  ...current,
                  search: event.target.value,
                }));
              }}
            />

            <Select
              label="Status"
              value={filters.status}
              onChange={(event) => {
                setPage(1);

                setFilters((current) => ({
                  ...current,
                  status: event.target.value,
                }));
              }}
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING_USER">Waiting User</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </Select>

            <Select
              label="Priority"
              value={filters.priority}
              onChange={(event) => {
                setPage(1);

                setFilters((current) => ({
                  ...current,
                  priority: event.target.value,
                }));
              }}
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </Select>
            <Select
              label="Assignee"
              value={filters.assigned_to ?? ""}
              onChange={(event) => {
                setPage(1);

                setFilters((current) => ({
                  ...current,
                  assigned_to: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                }));
              }}
            >
              <option value="">
                {isUsersLoading ? "Loading users..." : "All Assignees"}
              </option>

              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
            <Select
              label="Category"
              value={filters.category}
              onChange={(event) => {
                setPage(1);

                setFilters((current) => ({
                  ...current,
                  category: event.target.value,
                }));
              }}
            >
              <option value="">All Categories</option>
              <option value="HARDWARE">Hardware</option>
              <option value="SOFTWARE">Software</option>
              <option value="NETWORK">Network</option>
              <option value="ACCESS">Access</option>
              <option value="EMAIL">Email</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              variant="secondary"
              disabled={
                !filters.search &&
                !filters.status &&
                !filters.priority &&
                !filters.assigned_to &&
                !filters.category
              }
              onClick={() => {
                setFilters({
                  search: "",
                  status: "",
                  priority: "",
                  assigned_to: undefined,
                  category: "",
                });

                setPage(1);
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>

        {!isLoading && !isError && tickets.length === 0 && (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-gray-500">No tickets found.</p>
          </div>
        )}

        {!isLoading && !isError && tickets.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Ticket
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Title
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Category
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Priority
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Assignee
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Created
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {ticket.ticket_number}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {ticket.requester.name}
                      </p>
                    </td>

                    <td className="max-w-xs px-5 py-4">
                      <p className="truncate text-sm text-gray-900">
                        {ticket.title}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-700">
                        {ticket.category.name}
                      </p>
                    </td>

                    <td className="px-5 py-4">
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
                    </td>

                    <td className="px-5 py-4">
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
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-700">
                        {ticket.assignee?.name ?? "Unassigned"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-700">
                        {new Date(ticket.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <Link to={`/tickets/${ticket.id}`}>
                        <Button variant="ghost" className="px-2">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t px-5 py-4">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium text-gray-700">
                  {ticketResponse?.meta.from ?? 0}
                </span>{" "}
                to{" "}
                <span className="font-medium text-gray-700">
                  {ticketResponse?.meta.to ?? 0}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-700">
                  {ticketResponse?.meta.total ?? 0}
                </span>{" "}
                tickets
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  disabled={isFetching || !ticketResponse?.links.prev}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </Button>

                <span className="px-2 text-sm text-gray-600">
                  Page {ticketResponse?.meta.current_page ?? 1} of{" "}
                  {ticketResponse?.meta.last_page ?? 1}
                </span>

                <Button
                  variant="secondary"
                  disabled={isFetching || !ticketResponse?.links.next}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default Tickets;
