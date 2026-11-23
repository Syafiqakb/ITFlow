import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createDepartment,
  getDepartments,
  updateDepartment,
  type Department,
} from "../services/departments";
import { hasAnyRole } from "../utils/auth";

const departmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z
    .string()
    .min(1, "Code is required")
    .max(20, "Code must not exceed 20 characters"),
  description: z.string(),
  is_active: z.boolean(),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

function DepartmentManagement() {
  const canManageDepartments = hasAnyRole(["Administrator", "IT Manager"]);

  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null,
  );
  const [formError, setFormError] = useState("");

  const {
    data: departments = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
    enabled: canManageDepartments,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      is_active: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["departments"],
      });

      setShowCreateForm(false);
      setFormError("");

      reset({
        name: "",
        code: "",
        description: "",
        is_active: true,
      });
    },
    onError: (error: any) => {
      setFormError(
        error?.response?.data?.errors?.code?.[0] ??
          error?.response?.data?.message ??
          "Failed to create department.",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: DepartmentFormData;
    }) => updateDepartment(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["departments"],
      });

      setEditingDepartment(null);
      setFormError("");

      reset({
        name: "",
        code: "",
        description: "",
        is_active: true,
      });
    },

    onError: (error: any) => {
      setFormError(
        error?.response?.data?.errors?.code?.[0] ??
          error?.response?.data?.message ??
          "Failed to update department.",
      );
    },
  });

  const filteredDepartments = useMemo(() => {
    return departments.filter((department) => {
      const matchesSearch =
        department.name.toLowerCase().includes(search.toLowerCase()) ||
        department.code.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && department.is_active) ||
        (statusFilter === "inactive" && !department.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [departments, search, statusFilter]);

  const onSubmit = (data: DepartmentFormData) => {
    setFormError("");

    if (editingDepartment) {
      updateMutation.mutate({
        id: editingDepartment.id,
        payload: data,
      });

      return;
    }

    createMutation.mutate(data);
  };

  const handleCreate = () => {
    setEditingDepartment(null);
    setFormError("");

    reset({
      name: "",
      code: "",
      description: "",
      is_active: true,
    });

    setShowCreateForm(true);
  };

  const handleEdit = (department: Department) => {
    setShowCreateForm(false);
    setEditingDepartment(department);
    setFormError("");

    reset({
      name: department.name,
      code: department.code,
      description: department.description ?? "",
      is_active: department.is_active,
    });
  };

  if (!canManageDepartments) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-700">Access denied</h1>

        <p className="mt-1 text-sm text-red-600">
          You do not have permission to manage departments.
        </p>
      </div>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Department Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage departments used across ITFlow.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Add Department
        </button>
      </div>

      {(showCreateForm || editingDepartment) && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingDepartment ? "Edit Department" : "Create Department"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {editingDepartment
                ? "Update department information."
                : "Add a new department to ITFlow."}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Name
                </label>

                <input
                  {...register("name")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                  placeholder="e.g. Human Resources"
                />

                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Code
                </label>

                <input
                  {...register("code")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase outline-none focus:border-gray-500"
                  placeholder="e.g. HR"
                />

                {errors.code && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.code.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                {...register("description")}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                placeholder="Department description..."
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                {...register("is_active")}
                className="h-4 w-4 rounded border-gray-300"
              />
              Active
            </label>

            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {formError}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : editingDepartment
                    ? "Update Department"
                    : "Create Department"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingDepartment(null);
                  setFormError("");

                  reset({
                    name: "",
                    code: "",
                    description: "",
                    is_active: true,
                  });
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search departments..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 text-sm text-gray-500">
            Loading departments...
          </div>
        ) : isError ? (
          <div className="p-6 text-sm text-red-600">
            Failed to load departments.
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">No departments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Department
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Code
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Users
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredDepartments.map((department) => (
                  <tr key={department.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {department.name}
                      </div>

                      {department.description && (
                        <div className="mt-1 max-w-md truncate text-xs text-gray-500">
                          {department.description}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {department.code}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {department.users_count}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          department.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {department.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleEdit(department)}
                        className="text-sm font-medium text-gray-700 hover:text-gray-900"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DepartmentManagement;
