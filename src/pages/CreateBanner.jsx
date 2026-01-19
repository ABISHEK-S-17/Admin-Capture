import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";

export default function CreateBanner() {
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

      await api.post("/admin/banner/createBanner", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Banner created successfully!");

      setTimeout(() => navigate("/banner"), 800);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create banner");
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
              onClick={() => navigate("/banner")}
              className="mb-6 px-4 py-2 rounded-lg text-sm font-medium
                         bg-black text-white hover:bg-white hover:text-black
                         border transition"
            >
              ← Back to Banners
            </button>

            <h2 className="text-2xl font-semibold mb-6">Create Banner</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Banner Title */}
              <div>
                <label className="block text-sm font-medium mb-1">Banner Title</label>

                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      placeholder="Enter banner title"
                      className="w-full h-11 px-4 border rounded-lg "
                    />
                  )}
                />
                {errors.title && <p className="text-red-600 text-sm">{errors.title.message}</p>}
              </div>

              {/* Banner Description */}
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>

                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows="3"
                      placeholder="Enter banner description"
                      className="w-full px-4 py-3 border rounded-lg "
                    />
                  )}
                />
                {errors.description && <p className="text-red-600 text-sm">{errors.description.message}</p>}
              </div>

              {/* Banner Image */}
              <div>
                <label className="block text-sm font-medium mb-2">Banner Image</label>

                <Controller
                  name="image"
                  control={control}
                  rules={{ required: "Banner image is required" }}
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
                             hover:bg-white hover:text-green-600
                             border transition disabled:opacity-60"
                >
                  {isSubmitting ? "Saving..." : "Create Banner"}
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
