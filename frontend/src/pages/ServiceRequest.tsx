import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Card from "../components/Card";
import {
  getServiceCatalogs,
  type ServiceCatalog,
} from "../services/serviceCatalog";
import { createTicket } from "../services/tickets";

const serviceRequestSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters.")
    .max(255, "Title must not exceed 255 characters."),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters."),

  priority_id: z.number().int().min(1).max(4),

  service_detail: z
    .string()
    .min(2, "Please provide the requested detail.")
    .max(255, "Detail must not exceed 255 characters."),
});

type ServiceRequestForm = z.infer<typeof serviceRequestSchema>;

function ServiceRequest() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const serviceId = Number(id);

  const {
    data: services = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["service-catalogs"],
    queryFn: getServiceCatalogs,
  });

  const service: ServiceCatalog | undefined = services.find(
    (item) => item.id === serviceId,
  );

  const mutation = useMutation({
    mutationFn: (data: ServiceRequestForm) => {
      if (!service) {
        throw new Error("Service not found.");
      }

      return createTicket({
        title: data.title,
        description: `${data.description}\n\nService Detail: ${data.service_detail}`,
        category_id: service.category_id,
        priority_id: data.priority_id,
        service_catalog_id: service.id,
      });
    },

    onSuccess: (ticket) => {
      navigate(`/tickets/${ticket.id}`);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceRequestForm>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      priority_id: 2,
      service_detail: "",
    },
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <p className="text-sm text-gray-500">Loading service...</p>
      </Card>
    );
  }

  if (isError || !service) {
    return (
      <Card className="p-6">
        <p className="text-sm text-red-600">Service not found.</p>

        <Link
          to="/service-catalog"
          className="mt-4 inline-block text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          ← Back to Service Catalog
        </Link>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          to="/service-catalog"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back to Service Catalog
        </Link>

        <h1 className="mt-4 text-2xl font-semibold text-gray-900">
          {service.name}
        </h1>

        <p className="mt-1 text-sm text-gray-500">{service.description}</p>
      </div>

      <Card className="p-6">
        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Request Title
            </label>

            <input
              type="text"
              placeholder={`e.g. ${service.name}`}
              {...register("title")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />

            {errors.title && (
              <p className="mt-1 text-sm text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>

            <textarea
              rows={6}
              placeholder="Describe what you need..."
              {...register("description")}
              className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />

            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {service.name === "Laptop / PC Request"
                ? "Device Type"
                : service.name === "Software Installation"
                  ? "Software Name"
                  : service.name === "Application Access"
                    ? "Application Name"
                    : service.name === "Account Request"
                      ? "Account Type"
                      : service.name === "Network Access"
                        ? "Access Type"
                        : "Peripheral Type"}
            </label>

            <select
              {...register("service_detail")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            >
              <option value="">Select an option</option>

              {service.name === "Laptop / PC Request" && (
                <>
                  <option value="Laptop">Laptop</option>
                  <option value="Desktop">Desktop</option>
                </>
              )}

              {service.name === "Software Installation" && (
                <>
                  <option value="Microsoft Office">Microsoft Office</option>
                  <option value="Google Chrome">Google Chrome</option>
                  <option value="Visual Studio Code">Visual Studio Code</option>
                  <option value="Other">Other</option>
                </>
              )}

              {service.name === "Application Access" && (
                <>
                  <option value="ERP System">ERP System</option>
                  <option value="HR System">HR System</option>
                  <option value="Finance System">Finance System</option>
                  <option value="Other">Other</option>
                </>
              )}

              {service.name === "Account Request" && (
                <>
                  <option value="Email Account">Email Account</option>
                  <option value="VPN Account">VPN Account</option>
                  <option value="System Account">System Account</option>
                </>
              )}

              {service.name === "Network Access" && (
                <>
                  <option value="Wi-Fi">Wi-Fi</option>
                  <option value="LAN">LAN</option>
                  <option value="VPN">VPN</option>
                </>
              )}

              {service.name === "Peripheral Request" && (
                <>
                  <option value="Monitor">Monitor</option>
                  <option value="Keyboard">Keyboard</option>
                  <option value="Mouse">Mouse</option>
                  <option value="Printer">Printer</option>
                  <option value="Other">Other</option>
                </>
              )}
            </select>

            {errors.service_detail && (
              <p className="mt-1 text-sm text-red-600">
                {errors.service_detail.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Priority
            </label>

            <select
              {...register("priority_id", { valueAsNumber: true })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            >
              <option value="1">Low</option>
              <option value="2">Medium</option>
              <option value="3">High</option>
              <option value="4">Critical</option>
            </select>

            {errors.priority_id && (
              <p className="mt-1 text-sm text-red-600">
                {errors.priority_id.message}
              </p>
            )}
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Ticket Category
            </p>

            <p className="mt-1 text-sm font-medium text-gray-900">
              {service.category_name}
            </p>
          </div>

          {mutation.isError && (
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-600">
                Unable to submit your request. Please try again.
              </p>
            </div>
          )}

          <div className="flex justify-end border-t border-gray-100 pt-5">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mutation.isPending ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default ServiceRequest;
