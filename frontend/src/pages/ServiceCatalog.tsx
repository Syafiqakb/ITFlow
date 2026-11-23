import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import { getServiceCatalogs } from "../services/serviceCatalog";

function ServiceCatalog() {
  const {
    data: services = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["service-catalogs"],
    queryFn: getServiceCatalogs,
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <p className="text-sm text-gray-500">Loading service catalog...</p>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-6">
        <p className="text-sm text-red-600">Unable to load service catalog.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Service Catalog
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Choose an IT service you need.
        </p>
      </div>

      {services.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-gray-500">
            No services are currently available.
          </p>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <Card
              key={service.id}
              className="p-6 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-700">
                {service.icon?.slice(0, 1).toUpperCase() ?? "S"}
              </div>

              <h2 className="mt-5 text-lg font-semibold text-gray-900">
                {service.name}
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {service.description}
              </p>

              <Link
                to={`/service-catalog/${service.id}`}
                className="mt-5 inline-flex text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Request service →
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default ServiceCatalog;
