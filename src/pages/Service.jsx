import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Pencil, Trash2, Download, Printer, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";

export default function Service() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [Services, setServices] = useState([]);
  const [viewService, setViewService] = useState(null);

  // Delete modal state
  const [deleteServiceIds, setDeleteServiceIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const tableRef = useRef(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get("/admin/service/getServices"); // change API
      setServices(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch services");
    }
  };

  const filteredServices = Services.filter((s) =>
    `${s.id} ${s.title} ${s.description} ${s.status}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const currentServices = filteredServices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const handleDeleteClick = (id) => {
    const ids = selectedIds.includes(id) ? selectedIds : [id];
    setDeleteServiceIds(ids);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await Promise.all(
        deleteServiceIds.map((id) =>
          api.put("/admin/service/deleteService", { id, status: "terminated" }) // change API
        )
      );

      setServices(prev => prev.filter(s => !deleteServiceIds.includes(s.id)));
      setSelectedIds([]);
      setShowDeleteModal(false);
      toast.success("Service deleted successfully!");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const ids = selectedIds.length ? selectedIds : [id];

    try {
      await Promise.all(
        ids.map((id) => api.put("/admin/service/updateService", { id, status: newStatus }))
      );

      setServices(prev => prev.map(s => ids.includes(s.id) ? { ...s, status: newStatus } : s));
      toast.success(`Updated ${ids.length} service(s) to "${newStatus}"`);
    } catch {
      toast.error("Status update failed");
    }
  };

  const handleDownload = () => {
    const selected = Services.filter(s => selectedIds.includes(s.id));
    if (!selected.length) return toast.error("Select at least one service");

    const csv = [
      ["ID", "Title", "Image", "Description", "Status"],
      ...selected.map(s => [s.id, s.title, s.image, s.description, s.status])
    ].map(e => e.join(",")).join("\n");

    const link = URL.createObjectURL(new Blob([csv]));
    const a = document.createElement("a");
    a.href = link;
    a.download = "Services.csv";
    a.click();
  };
  //Print
  const handlePrint = () => {
  if (!tableRef.current) return;

  const table = tableRef.current.cloneNode(true);

  // ✅ Remove checkbox + action column
  table.querySelectorAll("tr").forEach((row) => {
    if (row.children.length > 0) row.children[0].remove();       // checkbox
    if (row.children.length > 0) row.lastElementChild.remove(); // action
  });

  // ✅ Convert dropdown → text (Status column index = 4 after removal)
  table.querySelectorAll("tbody tr").forEach((row, index) => {
    const statusCell = row.children[4];
    if (statusCell && currentServices[index]) {
      statusCell.textContent =
        currentServices[index].status === "inactive"
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
        <h1>Service Report</h1>
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

            {/* Top Buttons identical */}
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => navigate("/")} className="px-4 py-2 rounded-lg text-sm font-medium bg-black text-white border hover:bg-white hover:text-black transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow">
                ← Back to Dashboard
              </button>
              <button onClick={() => navigate("/create-service")} className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 hover:bg-black hover:text-white transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow">
                + Create Service
              </button>
            </div>

            {/* Header section identical */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-4">
              <h2 className="text-xl font-semibold">Services</h2>

              <div className="flex items-center gap-3">
                <input className="px-3 py-2 border rounded-lg text-sm" placeholder="Search services..."
                  value={search} onChange={(e) => setSearch(e.target.value)} />

                <button onClick={handleDownload} className="px-3 py-2 border rounded-lg text-sm flex items-center gap-2 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow">
                  <Download size={16} /> Download
                </button>

                <button onClick={handlePrint} className="px-3 py-2 border rounded-lg text-sm flex items-center gap-2 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow">
                  <Printer size={16} /> Print
                </button>
              </div>
            </div>

            {/* Table identical UI */}
            <div className="overflow-x-auto border rounded-lg" ref={tableRef}>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 font-semibold">
                  <tr>
                    <th className="p-4 text-left"><input type="checkbox"
                      onChange={(e) => setSelectedIds(e.target.checked ? Services.map(s => s.id) : [])}
                      checked={selectedIds.length === Services.length && Services.length} /></th>
                    <th className="p-4 text-left">ID</th>
                    <th className="p-4 text-left">Image</th>
                    <th className="p-4 text-left">Title</th>
                    <th className="p-4 text-left">Description</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentServices.length ? currentServices.map(service => (
                    <tr key={service.id} className="border-t hover:bg-gray-50">
                      <td className="p-4"><input type="checkbox" checked={selectedIds.includes(service.id)} onChange={() => handleCheckboxChange(service.id)} /></td>
                      <td className="p-4">{service.id}</td>

                      <td className="p-4">
                        <img src={service.image ? `${import.meta.env.VITE_API_BASE_URL}${service.image}` : "/placeholder.png"}
                          className="w-28 h-14 rounded-md object-cover" style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }} />
                      </td>

                      <td className="p-4 font-medium">{service.title}</td>
                      <td className="p-4">{service.description || "-"}</td>

                      <td className="p-4">
                        <select
                          value={service.status}
                          onChange={(e) => handleStatusChange(service.id, e.target.value)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium border cursor-pointer transition ${service.status === "active" ? "bg-green-100 text-green-800 border-green-300" : "bg-red-100 text-red-800 border-red-300"} hover:brightness-95`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => setViewService(service)} className="w-9 h-9 border rounded-lg flex items-center justify-center"><Eye size={16} /></button>
                          <button onClick={() => navigate(`/edit-service/${service.id}`)} className="w-9 h-9 border rounded-lg flex items-center justify-center"><Pencil size={16} /></button>
                          <button onClick={() => handleDeleteClick(service.id)} className="w-9 h-9 border rounded-lg flex items-center justify-center text-red-600"><Trash2 size={16} /></button>
                        </div>
                      </td>

                    </tr>
                  )) : (
                    <tr><td colSpan="7" className="p-6 text-center text-gray-500">No Services Found</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination identical */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center py-10 border-t">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="flex items-center gap-2 text-sm">
                  <ChevronLeft /> Previous
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <span key={n} onClick={() => setCurrentPage(n)}
                      className={`px-3 py-1 rounded cursor-pointer border ${currentPage === n ? "bg-black text-white border-black" : "hover:bg-black hover:text-white"}`}>
                      {n}
                    </span>
                  ))}
                </div>

                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="flex items-center gap-2 text-sm">
                  Next <ChevronRight />
                </button>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* View Modal — identical to service */}
      {viewService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-xl p-6 relative">

            <button onClick={() => setViewService(null)} className="absolute top-3 right-3 text-xl font-bold">✕</button>
            <h3 className="text-xl font-semibold text-center mb-4">{viewService.title}</h3>

            <p className="mb-4"><b>Description:</b> {viewService.description || "-"}</p>

            <div className="border rounded-lg p-2 max-h-[80vh] overflow-auto" style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>
              <img src={viewService.image ? `${import.meta.env.VITE_API_BASE_URL}${viewService.image}` : "/placeholder.png"}
                className="w-full h-auto object-contain" />
            </div>

          </div>
        </div>
      )}

      {/* Delete Modal identical */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-80 text-center">
            <h3 className="text-lg font-semibold mb-4">
              Delete {deleteServiceIds.length > 1 ? "selected services" : "this service"}?
            </h3>

            <div className="flex justify-center gap-4 mt-4">
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md">Confirm</button>
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-300 rounded-md">Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
