import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Pencil, Trash2, Download, Printer, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";

export default function Process() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [viewProcess, setViewProcess] = useState(null);

  // Delete modal
  const [deleteProcessIds, setDeleteProcessIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const tableRef = useRef(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    try {
      const res = await api.get("/admin/process/getProcesses");
      setProcesses(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch processes");
      console.error(error);
    }
  };

  const filteredProcesses = processes.filter((p) =>
    `${p.id} ${p.title} ${p.description} ${p.status}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProcesses.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProcesses = filteredProcesses.slice(indexOfFirstItem, indexOfLastItem);

  // Checkbox toggle
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Delete selected or single
  const handleDeleteClick = (id) => {
    const idsToDelete = selectedIds.includes(id) ? selectedIds : [id];
    setDeleteProcessIds(idsToDelete);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await Promise.all(
        deleteProcessIds.map((id) =>
          api.put("/admin/process/deleteProcess", { id, status: "terminated" })
        )
      );

      setProcesses(prev => prev.filter(p => !deleteProcessIds.includes(p.id)));
      setSelectedIds(prev => prev.filter(id => !deleteProcessIds.includes(id)));
      setDeleteProcessIds([]);
      setShowDeleteModal(false);
      toast.success("Process deleted successfully!");
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
          api.put("/admin/process/updateProcess", { id, status: newStatus })
        )
      );

      setProcesses(prev =>
        prev.map(p => (idsToUpdate.includes(p.id) ? { ...p, status: newStatus } : p))
      );

      toast.success(`Updated ${idsToUpdate.length} process(es) to "${newStatus}"`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  // Download CSV
  const handleDownload = () => {
    const selected = processes.filter(p => selectedIds.includes(p.id));
    if (!selected.length) return toast.error("Please select at least one process");

    const csv = [
      ["ID", "Title", "Description", "Status"],
      ...selected.map((p) => [p.id, p.title, p.description, p.status]),
    ].map((e) => e.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "process.csv";
    a.click();
  };

  // Print
const handlePrint = () => {
  if (!tableRef.current) return;

  const table = tableRef.current.cloneNode(true);

  // ✅ Remove checkbox + action columns
  table.querySelectorAll("tr").forEach((row) => {
    if (row.children.length > 0) row.children[0].remove();       // checkbox
    if (row.children.length > 0) row.lastElementChild.remove(); // action
  });

  // ✅ Convert status dropdown → text
  // After removal: ID(0) | Title(1) | Description(2) | Status(3)
  table.querySelectorAll("tbody tr").forEach((row, index) => {
    const statusCell = row.children[3];
    if (statusCell && currentProcesses[index]) {
      statusCell.textContent =
        currentProcesses[index].status === "inactive"
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
        <title>Process Report</title>
        <style>
          @page { size: A4; margin: 18mm; }

          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #111;
          }

          h1 {
            margin-bottom: 14px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }

          th {
            background: #111;
            color: #fff;
            padding: 9px;
            text-align: left;
          }

          td {
            padding: 7px;
            border-bottom: 1px solid #ddd;
          }

          tr:nth-child(even) {
            background: #f7f7f7;
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
        <h1>Process Report</h1>
        ${table.outerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = () => {
    // 🎯 Highlight status colors
    const rows = printWindow.document.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      const cell = row.children[3];
      if (!cell) return;

      const value = cell.textContent.toLowerCase();
      cell.className =
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

            {/* Top Buttons 100% same */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-black text-white border border-black hover:bg-white hover:text-black transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md">
                ← Back to Dashboard
              </button>
              <button
                onClick={() => navigate("/create-process")}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-800 border border-gray-300 hover:bg-black hover:text-white hover:border-black transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg">
                + Create Process
              </button>
            </div>

            {/* Title + Search + Buttons */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Processes</h2>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Search processes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-4 py-2 border rounded-lg text-sm"
                />

                <button onClick={handleDownload} className="px-3 py-2 border rounded-lg text-sm flex items-center gap-2 hover:bg-gray-100 transition">
                  <Download size={16} /> Download
                </button>

                <button onClick={handlePrint} className="px-3 py-2 border rounded-lg text-sm flex items-center gap-2 hover:bg-gray-100 transition">
                  <Printer size={16} /> Print
                </button>
              </div>
            </div>

            {/* TABLE identical layout */}
            <div className="overflow-x-auto border rounded-lg" ref={tableRef}>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 font-semibold">
                  <tr>
                    <th className="p-4 text-left"><input type="checkbox"
                      checked={processes.length && selectedIds.length === processes.length}
                      onChange={(e) => setSelectedIds(e.target.checked ? processes.map(p => p.id) : [])}
                    /></th>
                    <th className="p-4 text-left">ID</th>
                    <th className="p-4 text-left">Title</th>
                    <th className="p-4 text-left">Description</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentProcesses.length ? currentProcesses.map(p => (
                    <tr key={p.id} className={`border-t hover:bg-gray-50 ${selectedIds.includes(p.id) && "bg-gray-100"}`}>
                      <td className="p-4"><input checked={selectedIds.includes(p.id)} onChange={() => handleCheckboxChange(p.id)} type="checkbox" /></td>
                      <td className="p-4">{p.id}</td>
                      <td className="p-4 font-medium">{p.title}</td>
                      <td className="p-4">{p.description}</td>

                      {/* Status SAME UI */}
                      <td className="p-4">
                        <select value={p.status} onChange={(e) => handleStatusChange(p.id, e.target.value)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium border cursor-pointer 
                         ${p.status === "active" ? "bg-green-100 text-green-800 border-green-300" : "bg-red-100 text-red-800 border-red-300"} hover:brightness-95`}>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>

                      {/* ACTION */}
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => setViewProcess(p)} className="w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-100"><Eye size={16} /></button>
                          <button onClick={() => navigate(`/edit-process/${p.id}`)} className="w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-100"><Pencil size={16} /></button>
                          <button onClick={() => handleDeleteClick(p.id)} className="w-9 h-9 border rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" className="p-6 text-center text-gray-500">No Processes Found</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination SAME */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center py-10 w-full">
                <div className="w-full flex items-center justify-between border-t border-gray-200">

                  <div onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    className={`flex items-center pt-3 cursor-pointer ${currentPage === 1 && "text-gray-400 pointer-events-none"}`}>
                    <ChevronLeft size={18} /><p className="ml-2 text-sm font-medium leading-none">Previous</p>
                  </div>

                  <div className="sm:flex hidden">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                      <p key={num} onClick={() => setCurrentPage(num)}
                        className={`px-4 py-2 mr-3 rounded-lg text-sm cursor-pointer border 
                         ${currentPage === num ? "text-white bg-black" : "hover:bg-black hover:text-white"}`}>
                        {num}
                      </p>
                    ))}
                  </div>

                  <div onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={`flex items-center pt-3 cursor-pointer ${currentPage === totalPages && "text-gray-400 pointer-events-none"}`}>
                    <p className="mr-2 text-sm font-medium leading-none">Next</p><ChevronRight size={18} />
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* View Modal SAME LOOK */}
      {viewProcess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-xl p-6 relative">
            <button onClick={() => setViewProcess(null)} className="absolute top-3 right-3 text-lg font-bold">✕</button>
            <h3 className="text-xl font-semibold mb-6 text-center">{viewProcess.title}</h3>
            <p className="mb-2"><b>Description:</b> {viewProcess.description || "-"}</p>
          </div>
        </div>
      )}

      {/* Delete Modal SAME */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-80 text-center">
            <h3 className="text-lg font-semibold mb-4">Delete {deleteProcessIds.length > 1 ? 'selected processes' : 'this process'}?</h3>
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
