import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import { useState } from "react";
import api from "../utils/api"; // Make sure this points to your axios instance
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react"; // Import icons

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await api.post("/admin/auth/login", data);

      // Save token to localStorage
      localStorage.setItem("token", response.data.data.token);

      // Success toast
      toast.success("Login successful 🎉");

      // Navigate to dashboard/home after a short delay
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      toast.error(
        error?.response?.data?.error?.message || "Invalid email or password"
      );
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex items-center justify-center min-h-screen bg-white text-black">
        <div className="w-full max-w-md p-8 bg-white border border-black rounded-lg shadow-lg">
          <h2 className="text-3xl mb-6 text-center font-semibold">Admin Login</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Input */}
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 border border-black rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full p-3 border border-black rounded pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Minimum 6 characters required",
                  },
                })}
              />
              {/* Eye Icon */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 hover:text-black"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 bg-black text-white rounded hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Register Link */}
          <p className="mt-4 text-center text-sm">
            Don’t have an account?{" "}
            <Link to="/register" className="underline text-blue-600 hover:text-blue-800">
              Register
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
