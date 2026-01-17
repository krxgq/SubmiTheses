"use client";

import { useState } from "react";
import { useRouter } from "@/lib/navigation";
import { Button } from "flowbite-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { createSubject, type CreateSubjectRequest } from "@/lib/api/subjects";

// Client component for creating new subjects - simplified with single name/description fields
export function SubjectCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createSubject({
        name: formData.name,
        description: formData.description || undefined,
      });
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create subject");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-background-elevated p-6 rounded-xl border border-border"
    >
      <Input
        label="Subject Name"
        id="name"
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        helperText="Enter the subject name"
      /> 

      <Textarea
        label="Description"
        id="description"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        rows={3}
        helperText="Optional description of the subject"
      />

      {error && (
        <div className="text-danger bg-danger/10 border border-danger/30 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button className="bg-primary hover:bg-primary-hover text-text-inverse px-6 py-2.5 rounded-lg font-medium transition-all" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Subject"}
        </Button>
        <Button
          className="bg-primary hover:bg-primary-hover text-text-inverse px-6 py-2.5 rounded-lg font-medium transition-all"
          onClick={() => router.push("/admin")}
          type="button"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
