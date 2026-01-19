import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";

export default function EditTeam() {
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
  // FETCH TEAM MEMBER
  // =============================
  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await api.get("/admin/team/getTeams");
      const team = res.data.data.find((t) => t.id === Number(id));

      if (!team) {
        toast.error("Team member not found");
        return navigate("/team");
      }

      setValue("name", team.name);
      setValue("role", team.role);

      setPreview(
        team.image
          ? `${import.meta.env.VITE_API_BASE_URL}${team.image}`
          : null
      );
    } catch (err) {
      toast.error("Failed to load member");
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
      formData.append("name", data.name);
      formData.append("role", data.role);

      if (data.image instanceof File) {
        formData.append("image", data.image);
      }

      await api.put("/admin/team/updateTeam", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Team member updated successfully!");

      setTimeout(() => navigate("/team"), 800);
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
              onClick={() => navigate("/team")}
              className="mb-6 px-4 py-2 rounded-lg text-sm font-medium
                        bg-black text-white hover:bg-white hover:text-black
                        border transition"
            >
              ← Back to Team
            </button>

            <h2 className="text-2xl font-semibold mb-6">Edit Team Member</h2>

            {/* FORM */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Name is required" }}
                  render={({ field }) => (
                    <input {...field}
                      className="w-full h-11 px-4 border rounded-lg focus:ring-1 focus:ring-black"
                    />
                  )}
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: "Role is required" }}
                  render={({ field }) => (
                    <input {...field}
                      className="w-full h-11 px-4 border rounded-lg focus:ring-1 focus:ring-black"
                    />
                  )}
                />
                {errors.role && <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>}
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium mb-2">Member Image</label>
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
                  {isSubmitting ? "Updating..." : "Update Team"}
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
