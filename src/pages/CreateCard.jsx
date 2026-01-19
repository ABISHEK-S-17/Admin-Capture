import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";

export default function CreateCard() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("image", data.image);

      await api.post("/admin/card/createCard", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Card created successfully!");
      setTimeout(() => navigate("/card"), 800);

    } catch (error) {
      toast.error("Failed to create card");
      console.error(error);
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

            <button
              onClick={() => navigate("/card")}
              className="mb-6 px-4 py-2 rounded-lg text-sm font-medium
                         bg-black text-white hover:bg-white hover:text-black
                         border transition"
            >
              ← Back to Cards
            </button>

            <h2 className="text-2xl font-semibold mb-6">Create Card</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">Card Title</label>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: "Card title is required" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      placeholder="Enter card title"
                      className="w-full h-11 px-4 border rounded-lg "
                    />
                  )}
                />
                {errors.title && <p className="text-red-600 text-sm">{errors.title.message}</p>}
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
                      placeholder="Enter card description"
                      className="w-full px-4 py-3 border rounded-lg "
                    />
                  )}
                />
                {errors.description && <p className="text-red-600 text-sm">{errors.description.message}</p>}
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium mb-2">Card Image</label>
                <Controller
                  name="image"
                  control={control}
                  rules={{ required: "Card image is required" }}
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
                {errors.image && <p className="text-red-600 text-sm mt-1">{errors.image.message}</p>}

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
                             hover:bg-white hover:text-green-600 border
                             transition disabled:opacity-60"
                >
                  {isSubmitting ? "Saving..." : "Create Card"}
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
