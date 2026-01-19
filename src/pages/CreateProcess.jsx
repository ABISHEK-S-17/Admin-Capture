import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";

export default function CreateProcess() {
  const navigate = useNavigate();

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.post("/admin/process/createProcess", {
        title: data.title,
        description: data.description,
      });

      toast.success("Process created successfully!");
      setTimeout(() => navigate("/process"), 800);

    } catch (error) {
      console.error(error);
      toast.error("Failed to create process");
    }
  };


  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Toaster position="top-center" />
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-xl shadow-sm border p-6 w-full">

            {/* Back Button (exact same UI) */}
            <button
              onClick={() => navigate("/process")}
              className="mb-6 px-4 py-2 rounded-lg text-sm font-medium
                         bg-black text-white hover:bg-white hover:text-black
                         border transition"
            >
              ← Back to Process
            </button>

            <h2 className="text-2xl font-semibold mb-6">Create Process</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Title (same UI) */}
              <div>
                <label className="block text-sm font-medium mb-1">Process Title</label>

                <Controller
                  name="title"
                  control={control}
                  rules={{ required: "Process title is required" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      placeholder="Enter process title"
                      className="w-full h-11 px-4 border rounded-lg"
                    />
                  )}
                />
                {errors.title && <p className="text-red-600 text-sm">{errors.title.message}</p>}
              </div>

              {/* Description (same UI) */}
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>

                <Controller
                  name="description"
                  control={control}
                  rules={{ required: "Description is required" }}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows="3"
                      placeholder="Enter process description"
                      className="w-full px-4 py-3 border rounded-lg"
                    />
                  )}
                />
                {errors.description && (
                  <p className="text-red-600 text-sm">{errors.description.message}</p>
                )}
              </div>

              {/* Submit button identical to CreateBanner */}
              <div className="text-center pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 w-48 rounded-lg bg-green-600 text-white
                             hover:bg-white hover:text-green-600
                             border transition disabled:opacity-60"
                >
                  {isSubmitting ? "Saving..." : "Create Process"}
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
