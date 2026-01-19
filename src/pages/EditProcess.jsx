import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";

export default function EditProcess() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [preview, setPreview] = useState(null); // preview stays for future if image added

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  // =============================
  // FETCH PROCESS (same logic as banner)
  // =============================
  useEffect(() => {
    fetchProcess();
  }, []);

  const fetchProcess = async () => {
    try {
      const res = await api.get("/admin/process/getProcesses");
      const process = res.data.data.find((p) => p.id === Number(id));

      if (!process) {
        toast.error("Process not found");
        return navigate("/process");
      }

      setValue("title", process.title);
      setValue("description", process.description);
      setPreview(null);

    } catch (err) {
      toast.error("Failed to load process");
      console.error(err);
    }
  };

  // =============================
  // SUBMIT UPDATE (same flow)
  // =============================
  const onSubmit = async (data) => {
    try {
      await api.put("/admin/process/updateProcess", {
        id,
        title: data.title,
        description: data.description
      });

      toast.success("Process updated successfully!");
      setTimeout(() => navigate("/process"), 800);

    } catch (err) {
      toast.error("Update failed");
      console.error(err);
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

            {/* Back Button - identical */}
            <button
              onClick={() => navigate("/process")}
              className="mb-6 px-4 py-2 rounded-lg text-sm font-medium
                         bg-black text-white hover:bg-white hover:text-black
                         border transition"
            >
              ← Back to Processes
            </button>

            <h2 className="text-2xl font-semibold mb-6">Edit Process</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">Process Title</label>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: "Process title is required" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      className="w-full h-11 px-4 border rounded-lg focus:ring-1 focus:ring-black"
                    />
                  )}
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
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
                      className="w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black"
                    />
                  )}
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Preview kept for consistency UI structure */}
              {preview && (
                <div className="mt-4 inline-block border rounded-lg p-2"
                  style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>
                  <img src={preview} className="w-64 h-36 object-cover rounded-lg" />
                </div>
              )}

              {/* Submit */}
              <div className="text-center pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 w-48 rounded-lg bg-green-600 text-white
                            hover:bg-white hover:text-green-600 border transition
                            disabled:opacity-60"
                >
                  {isSubmitting ? "Updating..." : "Update Process"}
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
