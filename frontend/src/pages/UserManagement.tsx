import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createUser, getUsers, updateUser, type User, type UpdateUserPayload } from "../services/users";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { hasAnyRole } from "../utils/auth";

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .refine(
      (value) => value === "" || value.length >= 8,
      "Password must be at least 8 characters",
    ),
  role_id: z.string().min(1, "Role is required"),
  department_id: z.string(),
  is_active: z.boolean(),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

export default function UserManagement() {
  const canManageUsers = hasAnyRole(["Administrator", "IT Manager"]);

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "ALL" || user.role_code === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && user.is_active) ||
        (statusFilter === "INACTIVE" && !user.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [editingUser, setEditingUser] = useState<User | null>(null);

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setShowCreateForm(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) =>
      updateUser(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUser(null);
      reset();
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role_id: "4",
      department_id: "",
      is_active: true,
    },
  });

  const onSubmit = (data: CreateUserForm) => {
    createMutation.mutate({
      ...data,
      role_id: Number(data.role_id),
      department_id: data.department_id ? Number(data.department_id) : null,
    });
  };

  const onEditSubmit = (data: CreateUserForm) => {
    if (!editingUser) {
      return;
    }

    updateMutation.mutate({
      id: editingUser.id,
      payload: {
        ...data,
        role_id: Number(data.role_id),
        department_id: data.department_id ? Number(data.department_id) : null,
      },
    });
  };

  if (!canManageUsers) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-700">Access Denied</h1>

          <p className="mt-1 text-sm text-red-600">
            You are not authorized to access User Management.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading users...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <p className="text-red-500">Failed to load users.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage ITFlow users, roles, departments, and account status.
        </p>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Create User
          </button>
        </div>
      </div>
      {editingUser && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Edit User</h2>

            <p className="mt-1 text-sm text-gray-500">
              Update user account information.
            </p>
          </div>

          <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Name
              </label>

              <input
                type="text"
                {...register("name")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
              />

              {errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                {...register("email")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
              />

              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                New Password
              </label>

              <input
                type="password"
                placeholder="Leave blank to keep current password"
                {...register("password")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
              />

              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Role
                </label>

                <select
                  {...register("role_id")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                >
                  <option value="1">Administrator</option>
                  <option value="2">IT Manager</option>
                  <option value="3">IT Support</option>
                  <option value="4">Employee</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Department
                </label>

                <select
                  {...register("department_id")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                >
                  <option value="">No Department</option>
                  <option value="1">Information Technology</option>
                  <option value="2">Human Resources</option>
                  <option value="3">Finance</option>
                  <option value="4">Operations</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" {...register("is_active")} />
              Active account
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingUser(null);
                  reset();
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>

            {updateMutation.isError && (
              <p className="text-sm text-red-500">Failed to update user.</p>
            )}
          </form>
        </div>
      )}

      {showCreateForm && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Create User</h2>

            <p className="mt-1 text-sm text-gray-500">
              Create a new ITFlow user account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Name
              </label>

              <input
                type="text"
                {...register("name")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
              />

              {errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                {...register("email")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
              />

              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>

              <input
                type="password"
                {...register("password")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
              />

              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Role
                </label>

                <select
                  {...register("role_id")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                >
                  <option value="1">Administrator</option>
                  <option value="2">IT Manager</option>
                  <option value="3">IT Support</option>
                  <option value="4">Employee</option>
                </select>

                {errors.role_id && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.role_id.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Department
                </label>

                <select
                  {...register("department_id")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                >
                  <option value="">No Department</option>
                  <option value="1">Information Technology</option>
                  <option value="2">Human Resources</option>
                  <option value="3">Finance</option>
                  <option value="4">Operations</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" {...register("is_active")} />
              Active account
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {createMutation.isPending ? "Creating..." : "Create User"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  reset();
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>

            {createMutation.isError && (
              <p className="text-sm text-red-500">Failed to create user.</p>
            )}
          </form>
        </div>
      )}
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <input
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
        />

        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="ALL">All Roles</option>
          <option value="ADMIN">Administrator</option>
          <option value="IT_MANAGER">IT Manager</option>
          <option value="IT_SUPPORT">IT Support</option>
          <option value="EMPLOYEE">Employee</option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-700">Name</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Email</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Role</th>
              <th className="px-6 py-3 font-semibold text-gray-700">
                Department
              </th>
              <th className="px-6 py-3 font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {user.name}
                </td>

                <td className="px-6 py-4 text-gray-600">{user.email}</td>

                <td className="px-6 py-4">{user.role ?? "-"}</td>

                <td className="px-6 py-4 text-gray-600">
                  {user.department ?? "-"}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={
                      user.is_active
                        ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                        : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                    }
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUser(user);

                      reset({
                        name: user.name,
                        email: user.email,
                        password: "",
                        role_id: user.role_id.toString(),
                        department_id: user.department_id?.toString() ?? "",
                        is_active: user.is_active,
                      });
                    }}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-gray-200 px-6 py-3 text-sm text-gray-500">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>
    </div>
  );
}
