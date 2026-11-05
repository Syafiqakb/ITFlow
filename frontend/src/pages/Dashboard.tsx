import Badge from "../components/Badge";
import Button from "../components/Button";
import Card from "../components/Card";

function Dashboard() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

          <p className="mt-1 text-sm text-gray-500">
            Overview of your IT service desk.
          </p>
        </div>

        <Button>Create Ticket</Button>
      </div>

      {/* Ticket Status */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge variant="success">Resolved</Badge>

        <Badge variant="warning">In Progress</Badge>

        <Badge variant="danger">SLA Breached</Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm text-gray-500">Open Tickets</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">24</p>

          <p className="mt-2 text-xs text-gray-500">
            Tickets requiring attention
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-gray-500">In Progress</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">12</p>

          <p className="mt-2 text-xs text-gray-500">Currently being handled</p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-gray-500">Resolved</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">86</p>

          <p className="mt-2 text-xs text-gray-500">Successfully resolved</p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-gray-500">SLA Breached</p>

          <p className="mt-2 text-3xl font-bold text-red-600">3</p>

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
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  IT-2026-000124
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Cannot access company email
                </p>
              </div>

              <Badge variant="warning">In Progress</Badge>
            </div>

            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  IT-2026-000123
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Laptop performance issue
                </p>
              </div>

              <Badge variant="info">Assigned</Badge>
            </div>

            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  IT-2026-000122
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Request access to shared folder
                </p>
              </div>

              <Badge variant="success">Resolved</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
