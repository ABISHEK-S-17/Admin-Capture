import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Pencil, Trash2, Download, Printer, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";

export default function Blog() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewBlog, setViewBlog] = useState(null);

  const [deleteIds, setDeleteIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const tableRef = useRef(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await api.get("/admin/blog/getBlogs");
      setBlogs(res.data.data);
    } catch {
      toast.error("Failed to load blogs");
    }
  };

  const filteredBlogs = blogs.filter(b =>
    `${b.id} ${b.title} ${b.categories} ${b.description} ${b.date} ${b.status}`
      .toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const last = currentPage * itemsPerPage;
  const first = last - itemsPerPage;
  const currentBlogs = filteredBlogs.slice(first, last);

  // Select Checkbox
  const toggleCheckbox = (id) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  // Delete / Bulk Delete
  const deleteClick = (id) => {
    const ids = selectedIds.includes(id) ? selectedIds : [id];
    setDeleteIds(ids);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await Promise.all(
        deleteIds.map(id =>
          api.put("/admin/blog/deleteBlog", { id, status: "terminated" })
        )
      );

      setBlogs(prev => prev.filter(b => !deleteIds.includes(b.id)));
      setSelectedIds([]);
      setDeleteIds([]);
      setShowDeleteModal(false);
      toast.success("Blog deleted successfully");
    } catch {
      toast.error("Delete failed");
    }
  };

  // Update Status
  const changeStatus = async (id, status) => {
    const ids = selectedIds.includes(id) ? selectedIds : [id];

    try {
      await Promise.all(ids.map(id =>
        api.put("/admin/blog/updateBlog", { id, status })
      ));

      setBlogs(prev => prev.map(b => ids.includes(b.id) ? { ...b, status } : b));
      toast.success("Status updated");
    } catch {
      toast.error("Status update failed");
    }
  };

  // CSV Export
  const downloadCSV = () => {
    const selected = blogs.filter(b => selectedIds.includes(b.id));
    if (!selected.length) return toast.error("Select at least one blog");

    const csv = [
      ["ID", "Title", "Date", "Image", "Categories", "Description", "Status"],
      ...selected.map(b => [b.id, b.title, b.date, b.image, b.categories, b.description, b.status])
    ].map(r => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Blogs.csv";
    a.click();
  };

  // Print
 const handlePrint = () => {
  if (!tableRef.current) return;

  const table = tableRef.current.cloneNode(true);

  // ✅ Remove checkbox + action columns
  table.querySelectorAll("tr").forEach((row) => {
    if (row.children.length > 0) row.children[0].remove();        // checkbox
    if (row.children.length > 0) row.lastElementChild.remove();  // action
  });

  // ✅ Replace <select> with real status text
  // After removal columns:
  // ID(0) | Image(1) | Title(2) | Date(3) | Categories(4) | Description(5) | Status(6)
  table.querySelectorAll("tbody tr").forEach((row, index) => {
    const statusCell = row.children[6];
    if (statusCell && currentBlogs[index]) {
      statusCell.textContent =
        currentBlogs[index].status === "inactive"
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
        <title>Blog Report</title>
        <style>
          @page { size: A4; margin: 16mm; }

          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #111;
          }

          h1 {
            margin-bottom: 14px;
            text-align: center;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }

          th {
            background: #111;
            color: #fff;
            padding: 8px;
            text-align: left;
          }

          td {
            padding: 6px;
            border-bottom: 1px solid #ddd;
            vertical-align: top;
            word-break: break-word;
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

          img {
            max-width: 90px;
            height: auto;
            border-radius: 4px;
          }
        </style>
      </head>

      <body>
        <h1>Blog List</h1>
        ${table.outerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = () => {
    // 🎯 Apply status coloring
    const rows = printWindow.document.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      const cell = row.children[6];
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

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white border rounded-xl shadow-sm p-6">

            {/* Top Buttons */}
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => navigate("/")}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-black text-white border border-black
                           hover:bg-white hover:text-black transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md">
                ← Back to Dashboard
              </button>

              <button onClick={() => navigate("/create-blog")}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 border border-gray-300 text-gray-800
                           hover:bg-black hover:text-white hover:border-black transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg">
                + Create Blog
              </button>
            </div>

            {/* Search - Download - Print */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Blogs</h2>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  placeholder="Search blogs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-4 py-2 border rounded-lg text-sm"
                />

                <button onClick={downloadCSV}
                  className="px-3 py-2 border rounded-lg text-sm flex items-center gap-2 hover:bg-gray-100
                             transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow">
                  <Download size={16} /> Download
                </button>

                <button onClick={handlePrint}
                  className="px-3 py-2 border rounded-lg text-sm flex items-center gap-2 hover:bg-gray-100
                             transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow">
                  <Printer size={16} /> Print
                </button>
              </div>
            </div>

            {/* Table */}
            <div ref={tableRef} className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 font-semibold">
                  <tr>
                    <th className="p-4"><input type="checkbox"
                      checked={blogs.length && selectedIds.length === blogs.length}
                      onChange={(e) => setSelectedIds(e.target.checked ? blogs.map(b => b.id) : [])}
                    /></th>
                    <th className="p-4 text-left">ID</th>
                    <th className="p-4 text-left">Image</th>
                    <th className="p-4 text-left">Title</th>
                    <th className="p-4 text-left">Date</th>
                    <th className="p-4 text-left">Categories</th>
                    <th className="p-4 text-left">Description</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentBlogs.length ? currentBlogs.map(blog => (
                    <tr key={blog.id}
                      className={`border-t hover:bg-gray-50 ${selectedIds.includes(blog.id) ? "bg-gray-100" : ""}`}>
                      <td className="p-4"><input type="checkbox"
                        checked={selectedIds.includes(blog.id)}
                        onChange={() => toggleCheckbox(blog.id)}
                      /></td>

                      <td className="p-4">{blog.id}</td>

                      <td className="p-4">
                        <img src={blog.image ? `${import.meta.env.VITE_API_BASE_URL}${blog.image}` : "/placeholder.png"}
                          className="w-28 h-14 object-cover rounded-md"
                          style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }} />
                      </td>

                      <td className="p-4 font-medium">{blog.title}</td>
                      <td className="p-4">{blog.date}</td>
                      <td className="p-4">{blog.categories}</td>
                      <td className="p-4 max-w-xs truncate">{blog.description || "-"}</td>

                      <td className="p-4">
                        <select
                          value={blog.status}
                          onChange={(e) => changeStatus(blog.id, e.target.value)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium border cursor-pointer transition 
                            ${blog.status === "active"
                              ? "bg-green-100 text-green-800 border-green-300"
                              : "bg-red-100 text-red-800 border-red-300"} hover:brightness-95`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => setViewBlog(blog)}
                            className="w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-100">
                            <Eye size={16} />
                          </button>

                          <button onClick={() => navigate(`/edit-blog/${blog.id}`)}
                            className="w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-100">
                            <Pencil size={16} />
                          </button>

                          <button onClick={() => deleteClick(blog.id)}
                            className="w-9 h-9 border rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="9" className="p-6 text-center text-gray-500">No Blogs Found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center py-10 w-full">
                <div className="w-full flex items-center justify-between border-t">

                  <div onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    className={`flex items-center pt-3 cursor-pointer ${currentPage === 1 ? "text-gray-400 pointer-events-none" : "text-gray-800 hover:text-black"
                      }`}
                  >
                    <ChevronLeft size={18} /><span className="ml-1">Previous</span>
                  </div>

                  <div className="hidden sm:flex">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                      <p key={n}
                        onClick={() => setCurrentPage(n)}
                        className={`cursor-pointer px-4 py-2 mx-1 rounded border text-sm ${currentPage === n
                            ? "bg-black text-white border-black"
                            : "hover:bg-black hover:text-white"
                          }`}
                      >{n}</p>
                    ))}
                  </div>

                  <div onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    className={`flex items-center pt-3 cursor-pointer ${currentPage === totalPages ? "text-gray-400 pointer-events-none" : "text-gray-800 hover:text-black"
                      }`}
                  >
                    <span className="mr-1">Next</span><ChevronRight size={18} />
                  </div>

                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* View Modal */}
      {viewBlog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-xl relative">

            <button onClick={() => setViewBlog(null)}
              className="absolute top-3 right-3 text-lg font-bold hover:text-red-600">✕</button>

            <h3 className="text-xl font-semibold mb-4 text-center">{viewBlog.title}</h3>

            <div className="mb-3"><b>Date:</b> {viewBlog.date}</div>
            <div className="mb-3"><b>Category:</b> {viewBlog.categories}</div>
            <div className="mb-3"><b>Description:</b> {viewBlog.description || "-"}</div>

            <div className="mt-4 border rounded-lg p-2">
              <img src={viewBlog.image ? `${import.meta.env.VITE_API_BASE_URL}${viewBlog.image}` : "/placeholder.png"}
                className="w-full max-h-[400px] object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80 text-center">
            <h3 className="font-semibold mb-4">
              Delete {deleteIds.length > 1 ? "selected blogs?" : "this blog?"}
            </h3>

            <div className="flex justify-center gap-4">
              <button onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Confirm
              </button>

              <button onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
