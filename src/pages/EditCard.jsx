import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";

export default function EditCard() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [preview, setPreview] = useState(null);

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  // =============================
  // FETCH CARD
  // =============================
  useEffect(() => {
    fetchCard();
  }, []);

  const fetchCard = async () => {
    try {
      const res = await api.get("/admin/card/getCards");
      const card = res.data.data.find((c) => c.id === Number(id));

      if (!card) {
        toast.error("Card not found");
        return navigate("/card");
      }

      setValue("title", card.title);
      setValue("description", card.description);

      setPreview(
        card.image
          ? `${import.meta.env.VITE_API_BASE_URL}${card.image}`
          : null
      );
    } catch (err) {
      toast.error("Failed to load card");
      console.error(err);
    }
  };

  // =============================
  // SUBMIT UPDATE
  // =============================
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("title", data.title);
      formData.append("description", data.description);

      if (data.image instanceof File) {
        formData.append("image", data.image);
      }

      await api.put("/admin/card/updateCard", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Card updated successfully!");
      setTimeout(() => navigate("/card"), 800);

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

            {/* Back Button COPY of Banner UI */}
            <button
              onClick={() => navigate("/card")}
              className="mb-6 px-4 py-2 rounded-lg text-sm font-medium
                        bg-black text-white hover:bg-white hover:text-black
                        border transition"
            >
              ← Back to Cards
            </button>

            <h2 className="text-2xl font-semibold mb-6">Edit Card</h2>

            {/* FORM */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">Card Title</label>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: "Card title is required" }}
                  render={({ field }) => (
                    <input {...field}
                      className="w-full h-11 px-4 border rounded-lg focus:ring-1 focus:ring-black"
                    />
                  )}
                />
                {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Controller
                  name="description"
                  control={control}
                  rules={{ required: "Description is required" }}
                  render={({ field }) => (
                    <textarea {...field} rows="3"
                      className="w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black"
                    />
                  )}
                />
                {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Card Image</label>
                <Controller
                  name="image"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        field.onChange(file);
                        setPreview(URL.createObjectURL(file));
                      }}
                      className="block"
                    />
                  )}
                />

                {preview && (
                  <div className="mt-4 inline-block border rounded-lg p-2"
                    style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>
                    <img src={preview} className="w-64 h-36 object-cover rounded-lg" />
                  </div>
                )}
              </div>


              {/* Submit */}
              <div className="text-center pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 w-48 rounded-lg bg-green-600 text-white
                            hover:bg-white hover:text-green-600 border transition disabled:opacity-60"
                >
                  {isSubmitting ? "Updating..." : "Update Card"}
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
