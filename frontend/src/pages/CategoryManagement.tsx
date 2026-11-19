import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  createCategory,
  getCategories,
  updateCategory,
  type Category,
} from "../services/categories";
import { hasAnyRole } from "../utils/auth";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required").max(30, "Code is too long"),
  description: z.string(),
  is_active: z.boolean(),
});

type CategoryForm = z.infer<typeof categorySchema>;

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
            errors?: Record<string, string[]>;
          };
        };
      }
    ).response;

    const errors = response?.data?.errors;

    if (errors) {
      const firstError = Object.values(errors)[0]?.[0];

      if (firstError) {
        return firstError;
      }
    }

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  return fallback;
}

export default function CategoryManagement() {
  const canManageCategories = hasAnyRole(["Administrator", "IT Manager"]);

  const queryClient = useQueryClient();

  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    enabled: canManageCategories,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      is_active: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setShowCreateForm(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoryForm }) =>
      updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingCategory(null);
      reset();
    },
  });

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch =
        category.name.toLowerCase().includes(search.toLowerCase()) ||
        category.code.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && category.is_active) ||
        (statusFilter === "INACTIVE" && !category.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  const onCreateSubmit = (data: CategoryForm) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: CategoryForm) => {
    if (!editingCategory) {
      return;
    }

    updateMutation.mutate({
      id: editingCategory.id,
      payload: data,
    });
  };

  if (!canManageCategories) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-700">Access Denied</h1>

          <p className="mt-1 text-sm text-red-600">
            You are not authorized to access Category Management.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading categories...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <p className="text-red-500">Failed to load categories.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Category Management
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage ticket categories used by ITFlow.
        </p>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              setEditingCategory(null);

              reset({
                name: "",
                code: "",
                description: "",
                is_active: true,
              });

              setShowCreateForm(true);
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Create Category
          </button>
        </div>
      </div>

      {editingCategory && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Edit Category
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Update ticket category information.
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
                Code
              </label>

              <input
                type="text"
                {...register("code")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm uppercase"
              />

              {errors.code && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.code.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                {...register("description")}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" {...register("is_active")} />
              Active category
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
                  setEditingCategory(null);
                  reset();
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>

            {updateMutation.isError && (
              <p className="text-sm text-red-500">
                {getApiErrorMessage(
                  updateMutation.error,
                  "Failed to update category.",
                )}
              </p>
            )}
          </form>
        </div>
      )}

      {showCreateForm && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Create Category
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Create a new ticket category.
            </p>
          </div>

          <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
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
                Code
              </label>

              <input
                type="text"
                {...register("code")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm uppercase"
              />

              {errors.code && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.code.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                {...register("description")}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" {...register("is_active")} />
              Active category
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {createMutation.isPending ? "Creating..." : "Create Category"}
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
              <p className="text-sm text-red-500">
                {getApiErrorMessage(
                  createMutation.error,
                  "Failed to create category.",
                )}
              </p>
            )}
          </form>
        </div>
      )}

      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <input
          type="text"
          placeholder="Search name or code..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
        />

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
              <th className="px-6 py-3 font-semibold text-gray-700">Code</th>
              <th className="px-6 py-3 font-semibold text-gray-700">
                Description
              </th>
              <th className="px-6 py-3 font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filteredCategories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {category.name}
                </td>

                <td className="px-6 py-4 font-mono text-xs text-gray-600">
                  {category.code}
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {category.description ?? "-"}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={
                      category.is_active
                        ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                        : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                    }
                  >
                    {category.is_active ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingCategory(category);

                      reset({
                        name: category.name,
                        code: category.code,
                        description: category.description ?? "",
                        is_active: category.is_active,
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
          Showing {filteredCategories.length} of {categories.length} categories
        </div>
      </div>
    </div>
  );
}
