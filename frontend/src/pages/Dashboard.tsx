import { useQueries, useQuery } from "@tanstack/react-query";

import Button from "../components/Button";
import Card from "../components/Card";
import Badge from "../components/Badge";

import { getTickets } from "../services/tickets";
import { getDashboardStats } from "../services/dashboard";
import {
  getTicketStatusReport,
  getTicketPriorityReport,
  getTicketCategoryReport,
  getTicketAssigneeReport,
  getTicketTrendReport,
  getSlaPerformanceReport,
} from "../services/reports";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { hasAnyRole } from "../utils/auth";

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

  const canViewReports = hasAnyRole([
    "Administrator",
    "IT Manager",
    "IT Support",
  ]);

  const reportQueries = useQueries({
    queries: [
      {
        queryKey: ["report-ticket-status"],
        queryFn: getTicketStatusReport,
        enabled: canViewReports,
      },
      {
        queryKey: ["report-ticket-priority"],
        queryFn: getTicketPriorityReport,
        enabled: canViewReports,
      },
      {
        queryKey: ["report-ticket-category"],
        queryFn: getTicketCategoryReport,
        enabled: canViewReports,
      },
      {
        queryKey: ["report-ticket-assignee"],
        queryFn: getTicketAssigneeReport,
        enabled: canViewReports,
      },
      {
        queryKey: ["report-ticket-trend"],
        queryFn: getTicketTrendReport,
        enabled: canViewReports,
      },
      {
        queryKey: ["report-sla-performance"],
        queryFn: getSlaPerformanceReport,
        enabled: canViewReports,
      },
    ],
  });

  const tickets = ticketResponse?.data ?? [];

  const [
    statusReport,
    priorityReport,
    categoryReport,
    assigneeReport,
    trendReport,
    slaReport,
  ] = reportQueries;

  const trendData = trendReport.data ?? [];
  const statusData = statusReport.data ?? [];
  const priorityData = priorityReport.data ?? [];
  const categoryData = categoryReport.data ?? [];
  const assigneeData = assigneeReport.data ?? [];
  const slaData = slaReport.data;

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
        {/* Reporting Charts */}
        {canViewReports && (
        <div className="mt-6 space-y-6">
          {/* Ticket Trend */}
          <Card>
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold text-gray-900">Ticket Trend</h2>

              <p className="mt-1 text-xs text-gray-500">
                Monthly ticket creation trend
              </p>
            </div>

            <div className="p-5">
              {trendReport.isLoading ? (
                <div className="flex h-72 items-center justify-center">
                  <p className="text-sm text-gray-500">Loading chart...</p>
                </div>
              ) : trendReport.isError ? (
                <div className="flex h-72 items-center justify-center">
                  <p className="text-sm text-red-600">
                    Unable to load ticket trend.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Status + Priority */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Status */}
            <Card>
              <div className="border-b px-5 py-4">
                <h2 className="font-semibold text-gray-900">
                  Ticket Status Distribution
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Current distribution of tickets by status
                </p>
              </div>

              <div className="p-5">
                {statusReport.isLoading ? (
                  <div className="flex h-72 items-center justify-center">
                    <p className="text-sm text-gray-500">Loading chart...</p>
                  </div>
                ) : statusReport.isError ? (
                  <div className="flex h-72 items-center justify-center">
                    <p className="text-sm text-red-600">
                      Unable to load ticket status report.
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />

                      <Bar
                        dataKey="total"
                        fill="#2563eb"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            {/* Priority */}
            <Card>
              <div className="border-b px-5 py-4">
                <h2 className="font-semibold text-gray-900">
                  Ticket Priority Distribution
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Current distribution of tickets by priority
                </p>
              </div>

              <div className="p-5">
                {priorityReport.isLoading ? (
                  <div className="flex h-72 items-center justify-center">
                    <p className="text-sm text-gray-500">Loading chart...</p>
                  </div>
                ) : priorityReport.isError ? (
                  <div className="flex h-72 items-center justify-center">
                    <p className="text-sm text-red-600">
                      Unable to load ticket priority report.
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={priorityData}
                        dataKey="total"
                        nameKey="priority"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {priorityData.map((entry) => (
                          <Cell key={entry.priority} />
                        ))}
                      </Pie>

                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </div>

          {/* Category + Assignment */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Category */}
            <Card>
              <div className="border-b px-5 py-4">
                <h2 className="font-semibold text-gray-900">
                  Ticket Category Distribution
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Current distribution of tickets by category
                </p>
              </div>

              <div className="p-5">
                {categoryReport.isLoading ? (
                  <div className="flex h-72 items-center justify-center">
                    <p className="text-sm text-gray-500">Loading chart...</p>
                  </div>
                ) : categoryReport.isError ? (
                  <div className="flex h-72 items-center justify-center">
                    <p className="text-sm text-red-600">
                      Unable to load ticket category report.
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={categoryData}
                      layout="vertical"
                      margin={{ left: 20, right: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis type="number" allowDecimals={false} />

                      <YAxis type="category" dataKey="category" width={120} />

                      <Tooltip />

                      <Bar dataKey="total" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            {/* Assignment */}
            <Card>
              <div className="border-b px-5 py-4">
                <h2 className="font-semibold text-gray-900">
                  Ticket Assignment
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Current ticket workload by assignee
                </p>
              </div>

              <div className="p-5">
                {assigneeReport.isLoading ? (
                  <div className="flex h-72 items-center justify-center">
                    <p className="text-sm text-gray-500">Loading chart...</p>
                  </div>
                ) : assigneeReport.isError ? (
                  <div className="flex h-72 items-center justify-center">
                    <p className="text-sm text-red-600">
                      Unable to load ticket assignment report.
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={assigneeData}
                      layout="vertical"
                      margin={{ left: 20, right: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis type="number" allowDecimals={false} />

                      <YAxis type="category" dataKey="assignee" width={120} />

                      <Tooltip />

                      <Bar dataKey="total" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </div>

          {/* SLA Performance */}
          <Card>
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold text-gray-900">SLA Performance</h2>

              <p className="mt-1 text-xs text-gray-500">
                Service level agreement performance across tickets
              </p>
            </div>

            <div className="p-5">
              {slaReport.isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <p className="text-sm text-gray-500">Loading SLA data...</p>
                </div>
              ) : slaReport.isError ? (
                <div className="flex h-40 items-center justify-center">
                  <p className="text-sm text-red-600">
                    Unable to load SLA performance.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-gray-500">Total with SLA</p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {slaData?.total_with_sla ?? 0}
                    </p>
                  </div>

                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-gray-500">SLA Met</p>

                    <p className="mt-2 text-2xl font-bold text-green-600">
                      {slaData?.sla_met ?? 0}
                    </p>
                  </div>

                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-gray-500">SLA Breached</p>

                    <p className="mt-2 text-2xl font-bold text-red-600">
                      {slaData?.sla_breached ?? 0}
                    </p>
                  </div>

                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-gray-500">Compliance Rate</p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {slaData?.compliance_rate ?? 0}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
