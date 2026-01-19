import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../utils/api"; // 👈 axios instance

const Register = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // ✅ Register API call
  const onSubmit = async (data) => {
    try {
      await api.post("/admin/auth/register", data);

      toast.success("Account created successfully 🎉");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      toast.error(
        error?.response?.data?.error?.message || "Registration failed"
      );
    }
  };

  return (
    <>
      {/* Toast */}
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex items-center justify-center min-h-screen bg-white text-black">
        <div className="w-full max-w-md p-8 bg-white border border-black rounded-lg shadow-lg">
          <h2 className="text-3xl mb-6 text-center font-semibold">
            Admin Register
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <input
                type="text"
                placeholder="Name"
                className="w-full p-3 border border-black rounded"
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 3,
                    message: "Minimum 3 characters",
                  },
                })}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 border border-black rounded"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <input
                type="text"
                placeholder="Phone"
                className="w-full p-3 border border-black rounded"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Enter valid 10-digit number",
                  },
                })}
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 border border-black rounded"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Minimum 6 characters",
                  },
                })}
              />
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 bg-black text-white rounded hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="underline text-blue-600">
              Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
