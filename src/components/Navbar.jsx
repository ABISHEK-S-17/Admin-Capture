import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../utils/api";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [admin, setAdmin] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // ✅ VERIFY ADMIN ON ROUTE CHANGE
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsLoggedIn(false);
      setAdmin(null);
      return;
    }

    const fetchAdmin = async () => {
      try {
        const res = await api.get("/admin/auth/me");
        setAdmin(res.data.data); // { id, name, email? }
        setIsLoggedIn(true);
      } catch (err) {
        // 🔴 token invalid / expired
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setAdmin(null);
        navigate("/login");
      }
    };

    fetchAdmin();
  }, [location.pathname]);

  // Logout logic
  const confirmLogout = async () => {
    try {
      await api.post("/admin/auth/logout");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      setAdmin(null);
      setShowLogoutConfirm(false);
      navigate("/login");
    }
  };

  return (
    <>
      <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>

        <div className="flex items-center gap-6">
          {isLoggedIn ? (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="px-5 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition"
            >
              Login
            </Link>
          )}

          <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
            <img
              src="/src/assets/user-star.svg"
              alt="admin"
              className="w-10 h-10 rounded-full border border-gray-300"
            />
            <div className="leading-tight">
              <p className="text-sm font-medium text-gray-800">
                {admin?.name || "Admin"}
              </p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </header>

      {/* 🔴 Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999]">
          <div className="bg-white p-6 rounded-lg shadow-xl w-80 text-center">
            <h3 className="text-lg font-semibold mb-4">
              Are you sure you want to logout?
            </h3>

            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Confirm
              </button>

              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
