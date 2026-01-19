import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Download, Printer, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";

export default function Testimonial() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [viewTestimonial, setViewTestimonial] = useState(null);

  // delete modal
  const [deleteIds, setDeleteIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const tableRef = useRef(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await api.get("/admin/testimonial/getTestimonials");
      setTestimonials(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch testimonials");
    }
  };

  const filtered = testimonials.filter((t) =>
    `${t.clientName} ${t.title} ${t.subTitle} ${t.role} ${t.description} ${t.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const last = currentPage * itemsPerPage;
  const first = last - itemsPerPage;
  const currentTestimonials = filtered.slice(first, last);

  // checkbox toggle
  const toggleCheckbox = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // delete
  const deleteClick = (id) => {
    const ids = selectedIds.includes(id) ? selectedIds : [id];
    setDeleteIds(ids);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await Promise.all(
        deleteIds.map((id) => api.put("/admin/testimonial/updateTestimonial", { id, status: "terminated" }))
      );

      setTestimonials((prev) => prev.filter((t) => !deleteIds.includes(t.id)));
      setSelectedIds([]);
      setShowDeleteModal(false);
      toast.success("Testimonial deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  // status change
  const changeStatus = async (id, status) => {
    const ids = selectedIds.includes(id) ? selectedIds : [id];

    try {
      await Promise.all(ids.map((id) => api.put("/admin/testimonial/updateTestimonial", { id, status })));

      setTestimonials((prev) => prev.map((t) => (ids.includes(t.id) ? { ...t, status } : t)));
      toast.success(`Updated ${ids.length} item(s)`);
    } catch {
      toast.error("Status update failed");
    }
  };

  // CSV
  const downloadCSV = () => {
    const selected = testimonials.filter((t) => selectedIds.includes(t.id));
    if (!selected.length) return toast.error("Select at least one");

    const csv = [
      ["ID", "Client", "Title", "SubTitle", "Role", "Status", "Description", "Profile"],
      ...selected.map((t) => [
        t.id,
        t.clientName,
        t.title,
        t.subTitle,
        t.role,
        t.status,
        t.description,
        t.clientProfile
      ]),
    ]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Testimonials.csv";
    a.click();
  };

  // PRINT CLEAN VIEW WITHOUT STATUS DROPDOWN OR CHECKBOX
  const handlePrint = () => {
  if (!tableRef.current) return;

  const table = tableRef.current.cloneNode(true);

  // ✅ Remove checkbox + action columns
  table.querySelectorAll("tr").forEach((row) => {
    if (row.children.length > 0) row.children[0].remove();        // checkbox
    if (row.children.length > 0) row.lastElementChild.remove();  // action
  });

  // ✅ Replace dropdown with real status text
  // Columns after removal:
  // ID(0) | Profile(1) | BgImage(2) | Client(3) | Title(4)
  // SubTitle(5) | Description(6) | Role(7) | Status(8)
  table.querySelectorAll("tbody tr").forEach((row, index) => {
    const statusCell = row.children[8];
    if (statusCell && currentTestimonials[index]) {
      statusCell.textContent =
        currentTestimonials[index].status?.toLowerCase() === "inactive"
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
        <title>Testimonials Report</title>
        <style>
          @page { size: A4; margin: 14mm; }

          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #111;
          }

          h1 {
            text-align: center;
            margin-bottom: 16px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }

          th {
            background: #111;
            color: #fff;
            padding: 6px;
            text-align: left;
          }

          td {
            padding: 6px;
            border-bottom: 1px solid #ddd;
            vertical-align: top;
            word-break: break-word;
          }

          tr:nth-child(even) {
            background: #f5f5f5;
          }

          img {
            max-width: 70px;
            height: auto;
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
        <h1>Testimonials List</h1>
        ${table.outerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = () => {
    // 🎯 Colorize status text
    const rows = printWindow.document.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      const cell = row.children[8];
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

            {/* Top Buttons */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-black text-white border border-black
                hover:bg-white hover:text-black transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md"
              >
                ← Back to Dashboard
              </button>

              <button
                onClick={() => navigate("/create-testimonial")}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 border border-gray-300
                hover:bg-black hover:text-white transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                + Add Testimonial
              </button>
            </div>

            {/* Title + Search + Action buttons */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
              <h2 className="text-xl font-semibold text-gray-800">Testimonials</h2>

              <div className="flex gap-3 flex-wrap">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-4 py-2 border rounded-lg text-sm"
                />

                <button onClick={downloadCSV} className="px-3 py-2 border rounded-lg text-sm flex items-center gap-2 hover:bg-gray-100 transition">
                  <Download size={16} /> Download
                </button>

                <button onClick={handlePrint} className="px-3 py-2 border rounded-lg text-sm flex items-center gap-2 hover:bg-gray-100 transition">
                  <Printer size={16} /> Print
                </button>
              </div>
            </div>

            {/* Table */}
            <div ref={tableRef} className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 font-semibold">
                  <tr>
                    <th className="p-4"><input type="checkbox" checked={selectedIds.length === testimonials.length} onChange={(e) => setSelectedIds(e.target.checked ? testimonials.map(t => t.id) : [])} /></th>
                    <th className="p-4 text-left">ID</th>
                    <th className="p-4 text-left">Profile</th>
                    <th className="p-4 text-left">BgImage</th>
                    <th className="p-4 text-left">Client</th>
                    <th className="p-4 text-left">Title</th>
                    <th className="p-4 text-left">SubTitle</th>
                    <th className="p-4 text-left">Description</th>
                    <th className="p-4 text-left">Role</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentTestimonials.length ? currentTestimonials.map((t) => (
                    <tr key={t.id} className={`border-t hover:bg-gray-50 ${selectedIds.includes(t.id) ? "bg-gray-100" : ""}`}>
                      <td className="p-4"><input type="checkbox" checked={selectedIds.includes(t.id)} onChange={() => toggleCheckbox(t.id)} /></td>
                      <td className="p-4">{t.id}</td>

                      <td className="p-4">
                        <img
                          src={
                            t.clientProfile
                              ? `${import.meta.env.VITE_API_BASE_URL}${t.clientProfile}`
                              : "/placeholder.png"
                          }
                          className="w-12 h-12 rounded-full object-cover shadow"
                        />
                      </td>
                      <td className="p-4">
                        <img
                          src={
                            t.bgImage
                              ? `${import.meta.env.VITE_API_BASE_URL}${t.bgImage}`
                              : "/placeholder.png"
                          }
                          className="w-28 h-14 object-cover rounded-md" style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}
                        />
                      </td>

                      <td className="p-4 font-medium">{t.clientName}</td>
                      <td className="p-4">{t.title}</td>
                      <td className="p-4">{t.subTitle}</td>
                      <td className="p-4">{t.description}</td>
                      <td className="p-4">{t.role}</td>

                      <td className="p-4">
                        <select
                          value={t.status?.trim().toLowerCase()}
                          onChange={(e) => changeStatus(t.id, e.target.value)}
                          className={`px-3 py-1 rounded-lg text-sm border cursor-pointer transition
      ${t.status?.trim().toLowerCase() === "active"
                              ? "bg-green-100 text-green-700 border-green-300"
                              : "bg-red-100 text-red-700 border-red-300"}
    `}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => setViewTestimonial(t)} className="w-9 h-9 border rounded-lg hover:bg-gray-100 flex items-center justify-center"><Eye size={16} /></button>
                          <button onClick={() => navigate(`/edit-testimonial/${t.id}`)} className="w-9 h-9 border rounded-lg hover:bg-gray-100 flex items-center justify-center"><Pencil size={16} /></button>
                          <button onClick={() => deleteClick(t.id)} className="w-9 h-9 border rounded-lg hover:bg-red-50 text-red-600 flex items-center justify-center"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="9" className="p-6 text-center text-gray-500">No testimonials found</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center py-10">
                <div className="w-full flex justify-between border-t pt-3">

                  <div onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} className={`flex items-center cursor-pointer ${currentPage === 1 ? "text-gray-400 pointer-events-none" : "hover:text-black"} `}>
                    <ChevronLeft size={18} /><span className="ml-2">Previous</span>
                  </div>

                  <div className="hidden sm:flex">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                      <p key={n} onClick={() => setCurrentPage(n)} className={`px-4 py-2 mx-1 rounded border text-sm cursor-pointer
                      ${currentPage === n ? "bg-black text-white border-black" : "hover:bg-black hover:text-white"}`}>
                        {n}
                      </p>
                    ))}
                  </div>

                  <div onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} className={`flex items-center cursor-pointer ${currentPage === totalPages ? "text-gray-400 pointer-events-none" : "hover:text-black"} `}>
                    <span className="mr-2">Next</span><ChevronRight size={18} />
                  </div>

                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* VIEW MODAL */}
      {viewTestimonial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-xl p-6 relative">
            <button onClick={() => setViewTestimonial(null)} className="absolute top-3 right-3 text-lg font-bold">✕</button>

            <h3 className="text-xl font-semibold mb-4 text-center">{viewTestimonial.title}</h3>

            <div className="flex flex-col items-center mb-4">
              <img
                src={
                  viewTestimonial.clientProfile
                    ? `${import.meta.env.VITE_API_BASE_URL}${viewTestimonial.clientProfile}`
                    : "/placeholder.png"
                }
                className="w-28 h-28 rounded-full object-cover shadow-md"
              />


              <p className="font-medium mt-2">{viewTestimonial.clientName}</p>
              <p className="text-gray-600 text-sm">{viewTestimonial.role}</p>
            </div>

            <p><b>Subtitle:</b> {viewTestimonial.subTitle}</p>
            <p className="mt-2"><b>Description:</b> {viewTestimonial.description}</p>
               {/* 📌 Show Background Image */}
              {viewTestimonial.bgImage && (
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}${viewTestimonial.bgImage}`}
                  className="w-full h-40 object-cover rounded-lg mt-4 shadow-md"
                />
              )}
          </div>
        </div>
      )}


      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-80 text-center">
            <h3 className="text-lg font-semibold mb-4">
              Delete {deleteIds.length > 1 ? "selected testimonials?" : "this testimonial?"}
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
