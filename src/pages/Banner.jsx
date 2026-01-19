import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Pencil, Trash2, Download, Printer, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";

export default function Banner() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [Banners, setBanners] = useState([]);
  const [viewBanner, setViewBanner] = useState(null);

  // Delete modal
  const [deleteBannerIds, setDeleteBannerIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const tableRef = useRef(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await api.get("/admin/banner/getBanners");
      setBanners(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch banners");
      console.error(error);
    }
  };

  const filteredBanners = Banners.filter((banner) =>
    `${banner.id} ${banner.title} ${banner.description} ${banner.status}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBanners.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBanners = filteredBanners.slice(indexOfFirstItem, indexOfLastItem);

  // Checkbox toggle
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Delete selected or single
  const handleDeleteClick = (id) => {
    const idsToDelete = selectedIds.includes(id) ? selectedIds : [id];
    setDeleteBannerIds(idsToDelete);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await Promise.all(
        deleteBannerIds.map((id) =>
          api.put("/admin/banner/deleteBanner", { id, status: "terminated" })
        )
      );

      setBanners(prev => prev.filter(b => !deleteBannerIds.includes(b.id)));
      setSelectedIds(prev => prev.filter(id => !deleteBannerIds.includes(id)));
      setDeleteBannerIds([]);
      setShowDeleteModal(false);
      toast.success("Banner deleted successfully!");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // Change status
  const handleStatusChange = async (id, newStatus) => {
    const idsToUpdate = selectedIds.includes(id) ? selectedIds : [id];

    try {
      await Promise.all(
        idsToUpdate.map((id) =>
          api.put("/admin/banner/updateBanner", { id, status: newStatus })
        )
      );

      setBanners(prev =>
        prev.map(b =>
          idsToUpdate.includes(b.id) ? { ...b, status: newStatus } : b
        )
      );

      toast.success(`Updated ${idsToUpdate.length} banner(s) to "${newStatus}"`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Download CSV
  const handleDownload = () => {
    const selected = Banners.filter((b) => selectedIds.includes(b.id));
    if (!selected.length) return toast.error("Please select at least one banner");

    const csv = [
      ["ID", "Title", "Image", "Description", "Status"],
      ...selected.map((b) => [b.id, b.title, b.image, b.description, b.status]),
    ].map((e) => e.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Banners.csv";
    a.click();
  };

// Print banners
const handlePrint = () => {
  if (!tableRef.current) return;

  const table = tableRef.current.cloneNode(true);

  // ✅ Remove checkbox + action column
  table.querySelectorAll("tr").forEach((row) => {
    if (row.children.length > 0) row.children[0].remove(); // checkbox
    if (row.children.length > 0) row.lastElementChild.remove(); // action
  });

  // ✅ Convert dropdown → text (Status column index = 4)
  table.querySelectorAll("tbody tr").forEach((row, index) => {
    const statusCell = row.children[4]; // Status column
    if (statusCell && currentBanners[index]) {
      statusCell.textContent =
        currentBanners[index].status === "inactive"
          ? "Inactive"
          : "Active";
    }
  });

  const printWindow = window.open("", "_blank", "width=1200,height=800");

  if (!printWindow) {
    toast.error("Popup blocked. Please allow popups.");
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <style>
          @page { size: A4; margin: 20mm; }

          body {
            font-family: "Segoe UI", Arial, sans-serif;
            color: #111;
          }

          h1 {
            margin-bottom: 16px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }

          th {
            background: #111;
            color: #fff;
            padding: 10px;
            text-align: left;
          }

          td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
            vertical-align: middle;
          }

          tr:nth-child(even) {
            background: #f7f7f7;
          }

          img {
            max-height: 55px;
            border-radius: 4px;
          }

          .status-active {
            color: #137333;
            font-weight: bold;
          }

          .status-inactive {
            color: #b00020;
            font-weight: bold;
          }
        </style>
      </head>

      <body>
        <h1>Banner Report</h1>
        ${table.outerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = () => {
    // 🎯 Highlight status after render
    const rows = printWindow.document.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      const statusCell = row.children[4];
      if (!statusCell) return;

      const value = statusCell.textContent.toLowerCase();
      statusCell.className =
        value === "active" ? "status-active" : "status-inactive";
    });

    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
};

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Toaster position="top-center" />
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">

            {/* Top Buttons */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 rounded-lg text-sm font-medium
                           bg-black text-white border border-black
                           hover:bg-white hover:text-black transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md"
              >
                ← Back to Dashboard
              </button>
              <button
                onClick={() => navigate("/create-banner")}
                className="px-4 py-2 rounded-lg text-sm font-medium
                          bg-gray-200 text-gray-800 border border-gray-300
                          hover:bg-black hover:text-white hover:border-black
                          transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                + Create Banner
              </button>
            </div>

            {/* Title + Search + Actions */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Banners</h2>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Search banners..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-4 py-2 border rounded-lg text-sm"
                />

                <button
                  onClick={handleDownload}
                  className="px-3 py-2 border rounded-lg text-sm
                 flex items-center gap-2 hover:bg-gray-100
                 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow"
                >
                  <Download size={16} /> Download
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3 py-2 border rounded-lg text-sm
                 flex items-center gap-2 hover:bg-gray-100
                 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow"
                >
                  <Printer size={16} /> Print
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border rounded-lg" ref={tableRef}>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 font-semibold">
                  <tr>
                    <th className="p-4 text-left">
                      <input
                        type="checkbox"
                        checked={Banners.length && selectedIds.length === Banners.length}
                        onChange={(e) => setSelectedIds(e.target.checked ? Banners.map((b) => b.id) : [])}
                      />
                    </th>
                    <th className="p-4 text-left">ID</th>
                    <th className="p-4 text-left">Image</th>
                    <th className="p-4 text-left">Title</th>
                    <th className="p-4 text-left">Description</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentBanners.length ? currentBanners.map(banner => (
                    <tr key={banner.id} className={`border-t hover:bg-gray-50 ${selectedIds.includes(banner.id) ? "bg-gray-100" : ""}`}>
                      <td className="p-4">
                        <input type="checkbox" checked={selectedIds.includes(banner.id)} onChange={() => handleCheckboxChange(banner.id)} />
                      </td>
                      <td className="p-4">{banner.id}</td>
                      <td className="p-4">
                        <img src={banner.image ? `${import.meta.env.VITE_API_BASE_URL}${banner.image}` : "/placeholder.png"} className="w-28 h-14 object-cover rounded-md" style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }} />
                      </td>
                      <td className="p-4 font-medium">{banner.title || "-"}</td>
                      <td className="p-4">{banner.description || "-"}</td>

                      {/* Status Dropdown */}
                      <td className="p-4">
                        <select
                          value={banner.status}
                          onChange={(e) => handleStatusChange(banner.id, e.target.value)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium border cursor-pointer transition ${banner.status === "active" ? "bg-green-100 text-green-800 border-green-300" : "bg-red-100 text-red-800 border-red-300"} hover:brightness-95`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => setViewBanner(banner)} className="w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-100"><Eye size={16} /></button>
                          <button onClick={() => navigate(`/edit-banner/${banner.id}`)} className="w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-100"><Pencil size={16} /></button>
                          <button onClick={() => handleDeleteClick(banner.id)} className="w-9 h-9 border rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" className="p-6 text-center text-gray-500">No Banners found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center py-10 w-full">
                <div className="w-full flex items-center justify-between border-t border-gray-200">
                  <div onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} className={`flex items-center pt-3 cursor-pointer ${currentPage === 1 ? "text-gray-400 pointer-events-none" : "text-gray-800 hover:text-black"}`}>
                    <ChevronLeft size={18} />
                    <p className="text-sm ml-2 font-medium leading-none">Previous</p>
                  </div>

                  <div className="sm:flex hidden">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                      <p key={number} onClick={() => setCurrentPage(number)} className={`text-sm font-medium leading-none cursor-pointer rounded-lg px-4 py-2 mr-3 border ${currentPage === number ? "text-white bg-black border-black" : "text-gray-600 border-transparent hover:text-white hover:bg-black"}`}>{number}</p>
                    ))}
                  </div>

                  <div onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} className={`flex items-center pt-3 cursor-pointer ${currentPage === totalPages ? "text-gray-400 pointer-events-none" : "text-gray-800 hover:text-black"}`}>
                    <p className="text-sm font-medium leading-none mr-2">Next</p>
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* View Modal */}
      {viewBanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-xl p-6 relative">
            <button onClick={() => setViewBanner(null)} className="absolute top-3 right-3 text-lg font-bold">✕</button>
            <h3 className="text-xl font-semibold mb-6 text-center">{viewBanner.title}</h3>
            <div className="mb-4">
              <span className="font-medium">Description: </span>
              <span>{viewBanner.description || "-"}</span>
            </div>
            <div className="w-full max-h-[80vh] overflow-auto border rounded-lg p-2" style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>
              <img src={viewBanner.image ? `${import.meta.env.VITE_API_BASE_URL}${viewBanner.image}` : "/placeholder.png"} alt={viewBanner.title} className="w-full h-auto object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-80 text-center">
            <h3 className="text-lg font-semibold mb-4">Are you sure you want to delete {deleteBannerIds.length > 1 ? "selected banners" : "this banner"}?</h3>
            <div className="flex justify-center gap-4 mt-4">
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Confirm</button>
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400">Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
