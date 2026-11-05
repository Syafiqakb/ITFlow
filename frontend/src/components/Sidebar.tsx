import { NavLink } from "react-router-dom";

const menuItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    label: "My Tickets",
    path: "/tickets",
  },
  {
    label: "Create Ticket",
    path: "/tickets/create",
  },
];

function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="border-b px-6 py-5">
        <h1 className="text-xl font-bold text-gray-900">ITFlow</h1>
        <p className="text-xs text-gray-500">IT Service Management</p>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase text-gray-400">
          Workspace
        </p>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}

        <div className="pt-6">
          <p className="mb-2 px-3 text-xs font-semibold uppercase text-gray-400">
            Support
          </p>

          <NavLink
            to="/support/tickets"
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            All Tickets
          </NavLink>
        </div>

        <div className="pt-6">
          <p className="mb-2 px-3 text-xs font-semibold uppercase text-gray-400">
            Administration
          </p>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            Users
          </NavLink>

          <NavLink
            to="/admin/categories"
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            Categories
          </NavLink>
        </div>
      </nav>

      <div className="border-t p-4">
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-sm font-medium text-gray-900">John Doe</p>
          <p className="text-xs text-gray-500">IT Support</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
