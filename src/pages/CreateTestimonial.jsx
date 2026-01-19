import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";

export default function CreateTestimonial() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [bgPreview, setBgPreview] = useState(null);

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("clientName", data.clientName);
      formData.append("title", data.title);
      formData.append("subTitle", data.subTitle);
      formData.append("description", data.description);
      formData.append("role", data.role);
      formData.append("clientProfile", data.clientProfile);
      formData.append("bgImage", data.bgImage);

      await api.post("/admin/testimonial/createTestimonial", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Testimonial Created Successfully!");
      setTimeout(() => navigate("/testimonial"), 800);
    } catch (error) {
      toast.error("Failed to create testimonial");
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
              onClick={() => navigate("/testimonial")}
              className="mb-6 px-4 py-2 rounded-lg text-sm font-medium bg-black text-white 
              hover:bg-white hover:text-black border transition"
            >
              ← Back to Testimonials
            </button>

            <h2 className="text-2xl font-semibold mb-6">Create Testimonial</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Client Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Client Name</label>
                <Controller
                  name="clientName"
                  control={control}
                  rules={{ required: "Client name is required" }}
                  render={({ field }) => (
                    <input {...field} placeholder="Enter client name" className="w-full h-11 px-4 border rounded-lg" />
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
                    <input {...field} placeholder="Enter title" className="w-full h-11 px-4 border rounded-lg" />
                  )}
                />
                {errors.title && <p className="text-red-600 text-sm">{errors.title.message}</p>}
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-medium mb-1">Sub Title</label>
                <Controller
                  name="subTitle"
                  control={control}
                  rules={{ required: "Subtitle is required" }}
                  render={({ field }) => (
                    <input {...field} placeholder="Enter subtitle" className="w-full h-11 px-4 border rounded-lg" />
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
                    <input {...field} placeholder="Client role" className="w-full h-11 px-4 border rounded-lg" />
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
                    <textarea {...field} rows="3" placeholder="Write testimonial..." className="w-full px-4 py-3 border rounded-lg" />
                  )}
                />
                {errors.description && <p className="text-red-600 text-sm">{errors.description.message}</p>}
              </div>



              {/* Profile Image */}
              <div>
                <label className="block text-sm font-medium mb-2">Client Image</label>
                <Controller
                  name="clientProfile"
                  control={control}
                  rules={{ required: "Client profile image is required" }}
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
                {errors.clientProfile && <p className="text-red-600 text-sm">{errors.clientProfile.message}</p>}

                {preview && (
                  <div className="mt-4 inline-block border rounded-lg p-2 shadow">
                    <img src={preview} className="w-28 h-28 rounded-full object-cover" />
                  </div>
                )}
              </div>

              {/* Background Image */}
              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Background Image</label>

                <Controller
                  name="bgImage"
                  control={control}
                  rules={{ required: "Background image is required" }} // remove if optional
                  render={({ field }) => (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        field.onChange(file);
                        setBgPreview(URL.createObjectURL(file));
                      }}
                      className="block"
                    />
                  )}
                />

                {errors.bgImage && <p className="text-red-600 text-sm mt-1">{errors.bgImage.message}</p>}

                {/* Preview same as banner */}
                {bgPreview && (
                  <div
                    className="mt-4 inline-block border rounded-lg p-2"
                    style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}
                  >
                    <img src={bgPreview} className="w-64 h-36 object-cover rounded-lg" />
                  </div>
                )}
              </div>


              {/* Submit */}
              <div className="text-center pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 w-48 rounded-lg bg-green-600 text-white hover:bg-white hover:text-green-600 border transition"
                >
                  {isSubmitting ? "Saving..." : "Create Testimonial"}
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
