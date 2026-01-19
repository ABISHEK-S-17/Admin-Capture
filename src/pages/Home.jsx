import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const Home = () => {
  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Right Section */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 text-center">
          {/* Welcome Card */}
          <div className="bg-white rounded-2xl shadow-sm p-10 mb-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-2">
              Welcome back, Admin 👋
            </h2>

          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-sm text-gray-500 mb-2">Total Banners</h3>
              <p className="text-3xl font-bold text-gray-800">12</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-sm text-gray-500 mb-2">Blogs</h3>
              <p className="text-3xl font-bold text-gray-800">24</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-sm text-gray-500 mb-2">Services</h3>
              <p className="text-3xl font-bold text-gray-800">8</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-sm text-gray-500 mb-2">Team Members</h3>
              <p className="text-3xl font-bold text-gray-800">6</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
