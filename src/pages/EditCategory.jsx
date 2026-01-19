import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";

export default function EditCategory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [preview, setPreview] = useState(null);

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  // =========================
  // FETCH CATEGORY
  // =========================
  useEffect(() => {
    fetchCategory();
  }, []);

  const fetchCategory = async () => {
    try {
      const res = await api.get("/admin/category/getCategories");
      const category = res.data.data.find(
        (c) => c.id === Number(id)
      );

      if (!category) {
        toast.error("Category not found");
        navigate("/category");
        return;
      }

      setValue("name", category.name);
      setPreview(
        category.image
          ? `${import.meta.env.VITE_API_BASE_URL}${category.image}`
          : null
      );
    } catch (error) {
      toast.error("Failed to load category");
      console.error(error);
    }
  };

  // =========================
  // SUBMIT
  // =========================
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("name", data.name);

      // only send image if user selected new one
      if (data.image instanceof File) {
        formData.append("image", data.image);
      }

      await api.put("/admin/category/updateCategory", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Category updated successfully!");

      setTimeout(() => {
        navigate("/category");
      }, 800);
    } catch (error) {
      console.error(error);
      toast.error("Update failed");
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
              onClick={() => navigate("/category")}
              className="mb-6 px-4 py-2 rounded-lg text-sm font-medium
                         bg-black text-white hover:bg-white hover:text-black
                         border transition"
            >
              ← Back to Categories
            </button>

            <h2 className="text-2xl font-semibold mb-6">Edit Category</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* CATEGORY NAME */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category Name
                </label>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Category name is required" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      className="w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  )}
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* CATEGORY IMAGE */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category Image
                </label>
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
                    style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}
                  >
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-48 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* SUBMIT */}
              <div className="text-center pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 w-48 rounded-lg bg-green-600 text-white
                             hover:bg-white hover:text-green-600
                             border transition disabled:opacity-60"
                >
                  {isSubmitting ? "Updating..." : "Update Category"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
