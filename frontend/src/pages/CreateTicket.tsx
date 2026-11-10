import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import Select from "../components/Select";
import Textarea from "../components/Textarea";
import { createTicket } from "../services/tickets";

const createTicketSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),

  category: z.string().min(1, "Please select a category"),

  priority: z.enum(["low", "medium", "high", "critical"]),

  description: z.string().min(10, "Description must be at least 10 characters"),
});

type CreateTicketForm = z.infer<typeof createTicketSchema>;

function CreateTicket() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTicketForm>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      title: "",
      category: "",
      priority: "medium",
      description: "",
    },
  });

  const navigate = useNavigate();

  const onSubmit = async (data: CreateTicketForm) => {
    try {
      const categoryMap: Record<string, number> = {
        hardware: 1,
        software: 2,
        network: 3,
        access: 4,
        email: 5,
        other: 6,
      };

      const priorityMap: Record<string, number> = {
        low: 1,
        medium: 2,
        high: 3,
        critical: 4,
      };

      const categoryKey = data.category.trim().toLowerCase();
      const priorityKey = data.priority.trim().toLowerCase();

      const categoryId = categoryMap[categoryKey];
      const priorityId = priorityMap[priorityKey];

      if (!categoryId || !priorityId) {
        alert(
          `Invalid category or priority.\nCategory: ${data.category}\nPriority: ${data.priority}`,
        );

        return;
      }

      const ticket = await createTicket({
        title: data.title,
        description: data.description,
        category_id: categoryId,
        priority_id: priorityId,
      });

      navigate(`/tickets/${ticket.id}`);
    } catch (error: any) {
      console.error("Create ticket error:", error);

      console.error("Response:", error.response?.data);

      alert(
        error.response?.data?.message ||
          JSON.stringify(error.response?.data) ||
          error.message ||
          "Unable to create ticket.",
      );
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Ticket</h1>

        <p className="mt-1 text-sm text-gray-500">
          Submit a new request to the IT service desk.
        </p>
      </div>

      {/* Success Message */}
      {submitted && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm font-medium text-green-800">
            Ticket form submitted successfully.
          </p>

          <p className="mt-1 text-xs text-green-700">
            Backend integration will be added in the next stage.
          </p>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Form Header */}
          <div className="border-b px-6 py-5">
            <h2 className="font-semibold text-gray-900">Ticket Information</h2>

            <p className="mt-1 text-sm text-gray-500">
              Provide the details of the issue or request.
            </p>
          </div>

          {/* Form Body */}
          <div className="space-y-5 p-6">
            <Input
              id="title"
              label="Title"
              placeholder="e.g. Cannot access company email"
              error={errors.title?.message}
              {...register("title")}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <Select
                id="category"
                label="Category"
                error={errors.category?.message}
                {...register("category")}
              >
                <option value="">Select category</option>
                <option value="hardware">Hardware</option>
                <option value="software">Software</option>
                <option value="network">Network</option>
                <option value="access">Access & Account</option>
                <option value="other">Other</option>
              </Select>

              <Select
                id="priority"
                label="Priority"
                error={errors.priority?.message}
                {...register("priority")}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </Select>
            </div>

            <Textarea
              id="description"
              label="Description"
              placeholder="Describe the issue in detail..."
              rows={6}
              error={errors.description?.message}
              {...register("description")}
            />

            {/* Attachment */}
            <div className="space-y-1.5">
              <label
                htmlFor="attachment"
                className="block text-sm font-medium text-gray-700"
              >
                Attachment
              </label>

              <input
                id="attachment"
                type="file"
                className="block w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:border-0 file:border-r file:border-gray-300 file:bg-gray-50 file:px-4 file:py-2 file:text-sm file:font-medium"
              />

              <p className="text-xs text-gray-500">
                Optional. You can attach screenshots or supporting files.
              </p>
            </div>
          </div>

          {/* Form Footer */}
          <div className="flex items-center justify-end gap-3 border-t bg-gray-50 px-6 py-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>

            <Button type="submit">Submit Ticket</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default CreateTicket;
