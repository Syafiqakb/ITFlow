import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Card from "../components/Card";
import {
  createServiceCatalog,
  deleteServiceCatalog,
  getAdminServiceCatalogs,
  updateServiceCatalog,
  type AdminServiceCatalog,
  type CreateServiceCatalogPayload,
} from "../services/serviceCatalog";
import { getCategories } from "../services/categories";

function ServiceCatalogManagement() {
  const queryClient = useQueryClient();

  const [editingService, setEditingService] =
    useState<AdminServiceCatalog | null>(null);

  const [form, setForm] = useState<CreateServiceCatalogPayload>({
    name: "",
    code: "",
    description: "",
    icon: "",
    category_id: 0,
    is_active: true,
  });

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["admin-service-catalogs"],
    queryFn: getAdminServiceCatalogs,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const createMutation = useMutation({
    mutationFn: createServiceCatalog,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-service-catalogs"],
      });

      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: CreateServiceCatalogPayload;
    }) => updateServiceCatalog(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-service-catalogs"],
      });

      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteServiceCatalog,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-service-catalogs"],
      });
    },
  });

  function resetForm() {
    setEditingService(null);

    setForm({
      name: "",
      code: "",
      description: "",
      icon: "",
      category_id: 0,
      is_active: true,
    });
  }

  function handleEdit(service: AdminServiceCatalog) {
    setEditingService(service);

    setForm({
      name: service.name,
      code: service.code,
      description: service.description ?? "",
      icon: service.icon ?? "",
      category_id: service.category_id,
      is_active: service.is_active,
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.category_id) {
      return;
    }

    if (editingService) {
      updateMutation.mutate({
        id: editingService.id,
        payload: form,
      });

      return;
    }

    createMutation.mutate(form);
  }

  function handleDelete(service: AdminServiceCatalog) {
    const confirmed = window.confirm(`Delete "${service.name}"?`);

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(service.id);
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Service Catalog Management
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage services available in the employee service catalog.
        </p>
      </div>

      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {editingService ? "Edit Service" : "Add Service"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {editingService
                ? "Update the selected service."
                : "Create a new service catalog item."}
            </p>
          </div>

          {editingService && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Service Name
            </label>

            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value,
                })
              }
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Code
            </label>

            <input
              type="text"
              value={form.code}
              onChange={(event) =>
                setForm({
                  ...form,
                  code: event.target.value.toUpperCase(),
                })
              }
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>

            <textarea
              rows={4}
              value={form.description}
              onChange={(event) =>
                setForm({
                  ...form,
                  description: event.target.value,
                })
              }
              className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Icon
            </label>

            <input
              type="text"
              value={form.icon}
              onChange={(event) =>
                setForm({
                  ...form,
                  icon: event.target.value,
                })
              }
              placeholder="e.g. laptop"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category
            </label>

            <select
              value={form.category_id}
              onChange={(event) =>
                setForm({
                  ...form,
                  category_id: Number(event.target.value),
                })
              }
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            >
              <option value={0}>Select category</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 md:col-span-2">
            <input
              id="service-active"
              type="checkbox"
              checked={form.is_active}
              onChange={(event) =>
                setForm({
                  ...form,
                  is_active: event.target.checked,
                })
              }
              className="h-4 w-4 rounded border-gray-300"
            />

            <label
              htmlFor="service-active"
              className="text-sm font-medium text-gray-700"
            >
              Active service
            </label>
          </div>

          <div className="flex justify-end md:col-span-2">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving
                ? "Saving..."
                : editingService
                  ? "Update Service"
                  : "Add Service"}
            </button>
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Services</h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-sm text-gray-500">Loading services...</div>
        ) : services.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">No services found.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-gray-900">
                      {service.name}
                    </h3>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        service.is_active
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {service.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-gray-400">
                    {service.code} · {service.category_name ?? "No category"}
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    {service.description}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(service)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(service)}
                    disabled={deleteMutation.isPending}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default ServiceCatalogManagement;
