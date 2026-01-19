import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";

export default function CreateTeam() {
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
      formData.append("name", data.name);
      formData.append("role", data.role);
      formData.append("image", data.image);

      await api.post("/admin/team/createTeam", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Team member created successfully!");

      setTimeout(() => navigate("/team"), 800);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create team member");
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
              onClick={() => navigate("/team")}
              className="mb-6 px-4 py-2 rounded-lg text-sm font-medium
                         bg-black text-white hover:bg-white hover:text-black
                         border transition"
            >
              ← Back to Team
            </button>

            <h2 className="text-2xl font-semibold mb-6">Create Team Member</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Name is required" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      placeholder="Enter name"
                      className="w-full h-11 px-4 border rounded-lg"
                    />
                  )}
                />
                {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: "Role is required" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      placeholder="Enter role"
                      className="w-full h-11 px-4 border rounded-lg"
                    />
                  )}
                />
                {errors.role && <p className="text-red-600 text-sm">{errors.role.message}</p>}
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium mb-2">Member Image</label>
                <Controller
                  name="image"
                  control={control}
                  rules={{ required: "Image is required" }}
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
                {errors.image && <p className="text-red-600 text-sm mt-1">{errors.image.message}</p>}
              </div>
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
                             hover:bg-white hover:text-green-600
                             border transition disabled:opacity-60"
                >
                  {isSubmitting ? "Saving..." : "Create Team"}
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
