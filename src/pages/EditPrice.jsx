import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";

export default function EditPrice() {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  // =============================
  // FETCH PRICE
  // =============================
  useEffect(() => {
    fetchPrice();
  }, []);

  const fetchPrice = async () => {
    try {
      const res = await api.get("/admin/price/getPrices");
      const price = res.data.data.find((p) => p.id === Number(id));

      if (!price) {
        toast.error("Price Plan not found");
        return navigate("/price");
      }

      setValue("title", price.title);
      setValue("planPrice", price.planPrice);
      Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
        setValue(`description${n}`, price[`description${n}`]);
      });
    } catch (err) {
      toast.error("Failed to load price plan");
      console.error(err);
    }
  };

  // =============================
  // SUBMIT UPDATE
  // =============================
  const onSubmit = async (data) => {
    try {
      await api.put("/admin/price/updatePrice", {
        id,
        title: data.title,
        planPrice: data.planPrice,
        ...Object.fromEntries(
          Array.from({ length: 15 }, (_, i) => [
            `description${i + 1}`,
            data[`description${i + 1}`],
          ])
        ),

      });

      toast.success("Price plan updated successfully!");
      setTimeout(() => navigate("/price"), 800);

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

            {/* Back */}
            <button
              onClick={() => navigate("/price")}
              className="mb-6 px-4 py-2 rounded-lg text-sm font-medium
                         bg-black text-white hover:bg-white hover:text-black
                         border transition"
            >
              ← Back to Prices
            </button>

            <h2 className="text-2xl font-semibold mb-6">Edit Price</h2>

            {/* FORM */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">Plan Title</label>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: "Plan title is required" }}
                  render={({ field }) => (
                    <input {...field} className="w-full h-11 px-4 border rounded-lg" />
                  )}
                />
                {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium mb-1">Plan Price</label>
                <Controller
                  name="planPrice"
                  control={control}
                  rules={{ required: "Plan price is required" }}
                  render={({ field }) => (
                    <input type="number" step="0.01" {...field} className="w-full h-11 px-4 border rounded-lg" />
                  )}
                />
                {errors.planPrice && <p className="text-red-600 text-sm mt-1">{errors.planPrice.message}</p>}
              </div>

              {/* Descriptions */}
              {/* Descriptions */}
              {Array.from({ length: 15 }, (_, i) => i + 1).map(num => (
                <div key={num}>
                  <label className="block text-sm font-medium mb-1">
                    Description {num}
                  </label>

                  <Controller
                    name={`description${num}`}
                    control={control}
                    render={({ field }) => (
                      <textarea
                        rows="2"
                        {...field}
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
                             hover:bg-white hover:text-green-600 border transition disabled:opacity-60"
                >
                  {isSubmitting ? "Updating..." : "Update Price"}
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
