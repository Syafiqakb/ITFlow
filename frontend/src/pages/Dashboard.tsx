import { useQuery } from "@tanstack/react-query";

import Button from "../components/Button";
import Card from "../components/Card";
import Badge from "../components/Badge";

import { getTickets } from "../services/tickets";
import { getDashboardStats } from "../services/dashboard";

function Dashboard() {
  const {
    data: ticketResponse,
    isLoading: isTicketsLoading,
    isError: isTicketsError,
  } = useQuery({
    queryKey: ["dashboard-tickets"],
    queryFn: () => getTickets(),
  });

  const {
    data: dashboardStats,
    isLoading: isStatsLoading,
    isError: isStatsError,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  const tickets = ticketResponse?.data ?? [];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

        <p className="mt-1 text-sm text-gray-500">
          Overview of your IT service desk activity.
        </p>
      </div>
      
      {/* API Status */}
      {isTicketsError || isStatsError ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">Unable to load dashboard data.</p>
        </div>
      ) : null}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="p-5">
          <p className="text-sm text-gray-500">Total Tickets</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {isStatsLoading ? "—" : (dashboardStats?.total_tickets ?? 0)}
          </p>

          <p className="mt-2 text-xs text-gray-500">All tickets</p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-gray-500">Open Tickets</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {isStatsLoading ? "—" : (dashboardStats?.open_tickets ?? 0)}
          </p>

          <p className="mt-2 text-xs text-gray-500">
            Tickets requiring attention
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-gray-500">In Progress</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {isStatsLoading ? "—" : (dashboardStats?.in_progress_tickets ?? 0)}
          </p>

          <p className="mt-2 text-xs text-gray-500">Currently being handled</p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-gray-500">Resolved</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {isStatsLoading ? "—" : (dashboardStats?.resolved_tickets ?? 0)}
          </p>

          <p className="mt-2 text-xs text-gray-500">Successfully resolved</p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-gray-500">Closed</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {isStatsLoading ? "—" : (dashboardStats?.closed_tickets ?? 0)}
          </p>

          <p className="mt-2 text-xs text-gray-500">Completed tickets</p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-gray-500">SLA Breached</p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {isStatsLoading ? "—" : (dashboardStats?.sla_breached ?? 0)}
          </p>

          <p className="mt-2 text-xs text-red-500">
            Requires immediate attention
          </p>
        </Card>
      </div>

      {/* Recent Tickets */}
      <div className="mt-6">
        <Card>
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="font-semibold text-gray-900">Recent Tickets</h2>

              <p className="mt-1 text-xs text-gray-500">
                Latest activity from the service desk
              </p>
            </div>

            <Button variant="secondary">View All</Button>
          </div>

          <div className="divide-y">
            {isTicketsLoading && (
              <div className="px-5 py-6 text-center">
                <p className="text-sm text-gray-500">Loading tickets...</p>
              </div>
            )}

            {isTicketsError && (
              <div className="px-5 py-6 text-center">
                <p className="text-sm text-red-600">Unable to load tickets.</p>
              </div>
            )}

            {!isTicketsLoading && !isTicketsError && tickets.length === 0 && (
              <div className="px-5 py-6 text-center">
                <p className="text-sm text-gray-500">No tickets found.</p>
              </div>
            )}

            {!isTicketsLoading &&
              !isTicketsError &&
              tickets.slice(0, 5).map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {ticket.ticket_number}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">{ticket.title}</p>
                  </div>

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
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
