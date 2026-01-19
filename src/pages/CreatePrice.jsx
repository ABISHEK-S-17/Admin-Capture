import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";

export default function CreatePrice() {
  const navigate = useNavigate();
  const [preview] = useState(null); // kept for matching structure (not used)

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.post("/admin/price/createPrice", {
        title: data.title,
        planPrice: data.planPrice,
        ...Object.fromEntries(
          Array.from({ length: 15 }, (_, i) => [
            `description${i + 1}`,
            data[`description${i + 1}`],
          ])
        ),
      });

      toast.success("Price Plan created successfully!");
      setTimeout(() => navigate("/price"), 800);

    } catch (error) {
      console.error(error);
      toast.error("Failed to create price plan");
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

            {/* Back Button */}
            <button
              onClick={() => navigate("/price")}
              className="mb-6 px-4 py-2 rounded-lg text-sm font-medium
                         bg-black text-white hover:bg-white hover:text-black
                         border transition"
            >
              ← Back to Prices
            </button>

            <h2 className="text-2xl font-semibold mb-6">Create Price Plan</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">Plan Title</label>

                <Controller
                  name="title"
                  control={control}
                  rules={{ required: "Title is required" }}
                  render={({ field }) => (
                    <input {...field} placeholder="Enter plan title"
                      className="w-full h-11 px-4 border rounded-lg" />
                  )}
                />
                {errors.title && <p className="text-red-600 text-sm">{errors.title.message}</p>}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium mb-1">Plan Price</label>

                <Controller
                  name="planPrice"
                  control={control}
                  rules={{ required: "Price is required" }}
                  render={({ field }) => (
                    <input {...field} type="number" step="0.01" placeholder="Enter price"
                      className="w-full h-11 px-4 border rounded-lg" />
                  )}
                />
                {errors.planPrice && <p className="text-red-600 text-sm">{errors.planPrice.message}</p>}
              </div>

              {/* 6 Description fields same style */}
              {Array.from({ length: 15 }, (_, i) => i + 1).map(i => (
  <div key={i}>
    <label className="block text-sm font-medium mb-1">
      Description {i}
    </label>

    <Controller
      name={`description${i}`}
      control={control}
      render={({ field }) => (
        <textarea
          {...field}
          rows="2"
          placeholder={`Enter description ${i}`}
          className="w-full px-4 py-3 border rounded-lg"
        />
      )}
    />
  </div>
))}




              {/* Submit */}
              <div className="text-center pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 w-48 rounded-lg bg-green-600 text-white
                             hover:bg-white hover:text-green-600 border
                             transition disabled:opacity-60"
                >
                  {isSubmitting ? "Saving..." : "Create Price"}
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
