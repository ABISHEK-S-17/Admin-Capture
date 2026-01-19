import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";

export default function EditTestimonial() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [preview, setPreview] = useState(null);
  const [bgPreview, setBgPreview] = useState(null);

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  // =============================
  // FETCH TESTIMONIAL DATA
  // =============================
  useEffect(() => {
    fetchTestimonial();
  }, []);

  const fetchTestimonial = async () => {
    try {
      const res = await api.get("/admin/testimonial/getTestimonials");
      const testimonial = res.data.data.find((t) => t.id === Number(id));

      if (!testimonial) {
        toast.error("Testimonial not found");
        return navigate("/testimonial");
      }

      setValue("clientName", testimonial.clientName);
      setValue("title", testimonial.title);
      setValue("subTitle", testimonial.subTitle);
      setValue("description", testimonial.description);
      setValue("role", testimonial.role);
      setValue("status", testimonial.status);

      setPreview(
        testimonial.clientProfile
          ? `${import.meta.env.VITE_API_BASE_URL}${testimonial.clientProfile}`
          : null
      );

      setBgPreview(
        testimonial.bgImage
          ? `${import.meta.env.VITE_API_BASE_URL}${testimonial.bgImage}`
          : null
      );

    } catch (err) {
      toast.error("Failed to load testimonial");
      console.log(err);
    }
  };

  // =============================
  // UPDATE SUBMIT
  // =============================
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("clientName", data.clientName);
      formData.append("title", data.title);
      formData.append("subTitle", data.subTitle);
      formData.append("description", data.description);
      formData.append("role", data.role);
      formData.append("status", data.status);

      if (data.clientProfile instanceof File) {
        formData.append("clientProfile", data.clientProfile);
      }

      if (data.bgImage instanceof File) {
        formData.append("bgImage", data.bgImage);
      }


      await api.put("/admin/testimonial/updateTestimonial", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Testimonial updated successfully!");

      setTimeout(() => navigate("/testimonial"), 800);
    } catch (err) {
      toast.error("Update failed");
      console.log(err);
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
              onClick={() => navigate("/testimonial")}
              className="mb-6 px-4 py-2 rounded-lg text-sm font-medium
              bg-black text-white hover:bg-white hover:text-black border transition"
            >
              ← Back to Testimonials
            </button>

            <h2 className="text-2xl font-semibold mb-6">Edit Testimonial</h2>

            {/* ================= FORM ================= */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Client name */}
              <div>
                <label className="block text-sm font-medium mb-1">Client Name</label>
                <Controller
                  name="clientName"
                  control={control}
                  rules={{ required: "Client name is required" }}
                  render={({ field }) => (
                    <input {...field} className="w-full h-11 px-4 border rounded-lg focus:ring-1 focus:ring-black" />
                  )}
                />
                {errors.clientName && <p className="text-red-600 text-sm">{errors.clientName.message}</p>}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: "Title is required" }}
                  render={({ field }) => (
                    <input {...field} className="w-full h-11 px-4 border rounded-lg focus:ring-1 focus:ring-black" />
                  )}
                />
                {errors.title && <p className="text-red-600 text-sm">{errors.title.message}</p>}
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-medium mb-1">Subtitle</label>
                <Controller
                  name="subTitle"
                  control={control}
                  rules={{ required: "Subtitle is required" }}
                  render={({ field }) => (
                    <input {...field} className="w-full h-11 px-4 border rounded-lg focus:ring-1 focus:ring-black" />
                  )}
                />
                {errors.subTitle && <p className="text-red-600 text-sm">{errors.subTitle.message}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: "Role is required" }}
                  render={({ field }) => (
                    <input {...field} className="w-full h-11 px-4 border rounded-lg focus:ring-1 focus:ring-black" />
                  )}
                />
                {errors.role && <p className="text-red-600 text-sm">{errors.role.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Controller
                  name="description"
                  control={control}
                  rules={{ required: "Description is required" }}
                  render={({ field }) => (
                    <textarea {...field} rows="3" className="w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black" />
                  )}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <select {...field} className="h-11 px-4 border rounded-lg w-full">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  )}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Client Image</label>
                <Controller
                  name="clientProfile"
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
                    />
                  )}
                />
              </div>

              {preview && (
                <div className="mt-4 inline-block border rounded-lg p-2 shadow">
                  <img src={preview} className="w-32 h-32 object-cover rounded-full" />
                </div>
              )}
              {/* Background Image */}
              <div>
                <label className="block text-sm font-medium mb-2">Background Image</label>
                <Controller
                  name="bgImage"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        field.onChange(file);
                        setBgPreview(URL.createObjectURL(file));
                      }}
                    />
                  )}
                />
              </div>

              {/* BG Preview */}
              {bgPreview && (
                <div className="mt-4 inline-block border rounded-lg p-2 shadow">
                  <img src={bgPreview} className="w-64 h-36 object-cover rounded-lg" />
                </div>
              )}

              {/* Submit */}
              <div className="text-center pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 w-48 rounded-lg bg-green-600 text-white
                  hover:bg-white hover:text-green-600 border transition disabled:opacity-60"
                >
                  {isSubmitting ? "Updating..." : "Update Testimonial"}
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
