import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";

const Home = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/dashboard/stats");
      setStats(res.data.data);
    } catch (error) {
      console.error("Dashboard stats error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const Value = ({ value }) => (
    <p className="text-3xl font-bold text-gray-800">
      {loading ? "..." : value ?? 0}
    </p>
  );

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-8 text-center">
          {/* Welcome Card */}
          <div className="bg-white rounded-2xl shadow-sm p-10 mb-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-2">
              Welcome back, Admin 👋
            </h2>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Banner */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-sm text-gray-500 mb-2">Banners</h3>
              <Value value={stats.banner} />
            </div>

            {/* Blog */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-sm text-gray-500 mb-2">Blogs</h3>
              <Value value={stats.blog} />
            </div>

            {/* Service */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-sm text-gray-500 mb-2">Services</h3>
              <Value value={stats.service} />
            </div>

            {/* Team */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-sm text-gray-500 mb-2">Team Members</h3>
              <Value value={stats.team} />
            </div>

            {/* Category */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-sm text-gray-500 mb-2">Categories</h3>
              <Value value={stats.category} />
            </div>

            {/* Portfolio */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-sm text-gray-500 mb-2">Portfolios</h3>
              <Value value={stats.portfolio} />
            </div>

            {/* Contact */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-sm text-gray-500 mb-2">Contacts</h3>
              <Value value={stats.contact} />
            </div>

            {/* Event */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-sm text-gray-500 mb-2">Events</h3>
              <Value value={stats.event} />
            </div>

            {/* Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-sm text-gray-500 mb-2">Cards</h3>
              <Value value={stats.card} />
            </div>

            {/* About */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-sm text-gray-500 mb-2">About</h3>
              <Value value={stats.about} />
            </div>

            {/* Process */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-sm text-gray-500 mb-2">Process</h3>
              <Value value={stats.process} />
            </div>

            {/* Price */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-sm text-gray-500 mb-2">Prices</h3>
              <Value value={stats.price} />
            </div>

            {/* Testimonial */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-sm text-gray-500 mb-2">Testimonials</h3>
              <Value value={stats.testimonial} />
            </div>

            {/* Logo */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-sm text-gray-500 mb-2">Logos</h3>
              <Value value={stats.logo} />
            </div>

            

          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
