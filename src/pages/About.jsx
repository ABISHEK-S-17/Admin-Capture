/********************************************************************
  ⚠ EXACT Banner UI CLONE — Only API route names + text changed
********************************************************************/

import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Pencil, Trash2, Download, Printer, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";

export default function About() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [Abouts, setAbouts] = useState([]);
  const [viewAbout, setViewAbout] = useState(null);

  const [deleteAboutIds, setDeleteAboutIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const tableRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      const res = await api.get("/admin/about/getAbouts");
      setAbouts(res.data.data);
    } catch {
      toast.error("Failed to fetch About list");
    }
  };

  const filteredAbouts = Abouts.filter((item) =>
    `${item.id} ${item.title} ${item.description} ${item.status}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAbouts.length / itemsPerPage);
  const current = filteredAbouts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  // DELETE (SINGLE / MULTI)
  const handleDeleteClick = (id) => {
    const ids = selectedIds.includes(id) ? selectedIds : [id];
    setDeleteAboutIds(ids);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await Promise.all(deleteAboutIds.map(id => api.put("/admin/about/deleteAbout", { id, status: "terminated" })));
      setAbouts(prev => prev.filter(b => !deleteAboutIds.includes(b.id)));
      setSelectedIds(prev => prev.filter(id => !deleteAboutIds.includes(id)));
      setShowDeleteModal(false);
      toast.success("Deleted successfully");
    } catch {
      toast.error("Delete failed");
    }
  };

  // STATUS CHANGE
  const handleStatusChange = async (id, status) => {
    const ids = selectedIds.includes(id) ? selectedIds : [id];

    try {
      await Promise.all(ids.map(i => api.put("/admin/about/updateAbout", { id: i, status })));

      setAbouts(prev => prev.map(item => ids.includes(item.id) ? { ...item, status } : item));
      toast.success("Status updated");
    } catch {
      toast.error("Status update failed");
    }
  };

  // CSV DOWNLOAD
  const handleDownload = () => {
    const selected = Abouts.filter(a => selectedIds.includes(a.id));
    if (!selected.length) return toast.error("Select at least one");

    const csv = [
      ["ID", "Title", "Image", "Description", "Status"],
      ...selected.map(a => [a.id, a.title, a.image, a.description, a.status])
    ].map(e => e.join(",")).join("\n");

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "About.csv";
    a.click();
  };

  // PRINT — EXACT SAME BANNER METHOD
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
    const statusCell = row.children[4];
    if (statusCell && current[index]) {
      statusCell.textContent =
        current[index].status === "inactive" ? "Inactive" : "Active";
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
        <h1>About Report</h1>
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

            {/* TOP BUTTONS — SAME */}
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => navigate("/")} className="px-4 py-2 rounded-lg text-sm font-medium bg-black text-white border border-black hover:bg-white hover:text-black transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow">← Back to Dashboard</button>
              <button onClick={() => navigate("/create-about")} className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-800 border border-gray-300 hover:bg-black hover:text-white transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow">+ Create About</button>
            </div>

            {/* TITLE + SEARCH + ACTIONS — SAME */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-800">About</h2>

              <div className="flex flex-wrap items-center gap-3">
                <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-4 py-2 border rounded-lg text-sm" />
                <button onClick={handleDownload} className="px-3 py-2 border rounded-lg text-sm flex items-center gap-2 hover:bg-gray-100 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow"><Download size={16} />Download</button>
                <button onClick={handlePrint} className="px-3 py-2 border rounded-lg text-sm flex items-center gap-2 hover:bg-gray-100 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow"><Printer size={16} />Print</button>
              </div>
            </div>

            {/* TABLE — 100% MATCH */}
            <div className="overflow-x-auto border rounded-lg" ref={tableRef}>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 font-semibold">
                  <tr>
                    <th className="p-4 text-left"><input type="checkbox" checked={Abouts.length && selectedIds.length === Abouts.length} onChange={(e) => setSelectedIds(e.target.checked ? Abouts.map(a => a.id) : [])} /></th>
                    <th className="p-4 text-left">ID</th>
                    <th className="p-4 text-left">Image</th>
                    <th className="p-4 text-left">Title</th>
                    <th className="p-4 text-left">Description</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {current.length ? current.map(a => (
                    <tr key={a.id} className={`border-t hover:bg-gray-50 ${selectedIds.includes(a.id) ? "bg-gray-100" : ""}`}>
                      <td className="p-4"><input checked={selectedIds.includes(a.id)} onChange={() => handleCheckboxChange(a.id)} type="checkbox" /></td>
                      <td className="p-4">{a.id}</td>

                      <td className="p-4">
                        <img src={a.image ? `${import.meta.env.VITE_API_BASE_URL}${a.image}` : "/placeholder.png"} className="w-28 h-14 object-cover rounded-md" style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }} />
                      </td>

                      <td className="p-4 font-medium">{a.title}</td>
                      <td className="p-4">{a.description}</td>

                      <td className="p-4">
                        <select value={a.status} onChange={(e) => handleStatusChange(a.id, e.target.value)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium border cursor-pointer ${a.status === "active" ? "bg-green-100 text-green-800 border-green-300" : "bg-red-100 text-red-800 border-red-300"}`}>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>

                        </select>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => setViewAbout(a)} className="w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-100"><Eye size={16} /></button>
                          <button onClick={() => navigate(`/edit-about/${a.id}`)} className="w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-100"><Pencil size={16} /></button>
                          <button onClick={() => handleDeleteClick(a.id)} className="w-9 h-9 border rounded-lg text-red-600 flex items-center justify-center hover:bg-red-50"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  )) :
                    <tr><td colSpan="7" className="p-6 text-center text-gray-500">No records found</td></tr>}
                </tbody>
              </table>
            </div>

            {/* PAGINATION — SAME */}
            {totalPages > 1 && (
              <div className="flex justify-center py-10">
                <div className="flex justify-between items-center w-full border-t pt-3">
                  <div onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} className={`flex items-center cursor-pointer ${currentPage === 1 ? "text-gray-400 pointer-events-none" : "hover:text-black"}`}><ChevronLeft />Previous</div>
                  <div className="hidden sm:flex">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                      <p key={n} onClick={() => setCurrentPage(n)} className={`px-4 py-2 mr-3 rounded-lg border cursor-pointer ${currentPage === n ? "bg-black text-white border-black" : "hover:bg-black hover:text-white"}`}>{n}</p>
                    ))}
                  </div>
                  <div onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={`flex items-center cursor-pointer ${currentPage === totalPages ? "text-gray-400 pointer-events-none" : "hover:text-black"}`}>Next<ChevronRight /></div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* VIEW MODAL — SAME LOOK AS BANNER */}
      {viewAbout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-xl p-6 relative">
            <button onClick={() => setViewAbout(null)} className="absolute top-3 right-3 text-lg font-bold">✕</button>
            <h3 className="text-xl font-semibold mb-6 text-center">{viewAbout.title}</h3>
            <div className="mb-4"><span className="font-medium">Description: </span>{viewAbout.description || "-"}</div>
            <div className="border rounded-lg p-2" style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>
              <img src={`${import.meta.env.VITE_API_BASE_URL}${viewAbout.image}`} className="w-full h-auto object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL — SAME */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-80 text-center">
            <h3 className="text-lg font-semibold mb-4">
              Are you sure you want to delete {deleteAboutIds.length > 1 ? "selected records?" : "this item?"}
            </h3>
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
