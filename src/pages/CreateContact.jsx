import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";

export default function CreateContact() {
  const navigate = useNavigate();

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.post("/admin/contact/createContact", data);
      toast.success("Contact created successfully!");
      setTimeout(() => navigate("/contact"), 800);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create contact");
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

            {/* Back Button Same as Banner */}
            <button
              onClick={() => navigate("/contact")}
              className="mb-6 px-4 py-2 rounded-lg text-sm font-medium
                         bg-black text-white hover:bg-white hover:text-black
                         border transition"
            >
              ← Back to Contacts
            </button>

            <h2 className="text-2xl font-semibold mb-6">Create Contact</h2>

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

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: "Email is required",
                    pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" }
                  }}
                  render={({ field }) => (
                    <input
                      type="email"
                      {...field}
                      placeholder="Enter email"
                      className="w-full h-11 px-4 border rounded-lg"
                    />
                  )}
                />
                {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Controller
                  name="phone"
                  control={control}
                  rules={{ required: "Phone is required" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      placeholder="Enter phone number"
                      className="w-full h-11 px-4 border rounded-lg"
                    />
                  )}
                />
                {errors.phone && <p className="text-red-600 text-sm">{errors.phone.message}</p>}
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <Controller
                  name="subject"
                  control={control}
                  rules={{ required: "Subject is required" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      placeholder="Enter subject"
                      className="w-full h-11 px-4 border rounded-lg"
                    />
                  )}
                />
                {errors.subject && <p className="text-red-600 text-sm">{errors.subject.message}</p>}
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
                      placeholder="Enter description"
                      className="w-full px-4 py-3 border rounded-lg"
                    />
                  )}
                />
                {errors.description && <p className="text-red-600 text-sm">{errors.description.message}</p>}
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
                  {isSubmitting ? "Saving..." : "Create Contact"}
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
