import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Pencil, Trash2, Download, Printer, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";

export default function Price() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [prices, setPrices] = useState([]);
  const [viewPrice, setViewPrice] = useState(null);

  const [deletePriceIds, setDeletePriceIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const tableRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const getDescriptions = (item, count = 15) =>
  Array.from({ length: count }, (_, i) => item[`description${i + 1}`]).filter(Boolean);


  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      const res = await api.get("/admin/price/getPrices");
      setPrices(res.data.data);
    } catch {
      toast.error("Failed to fetch prices");
    }
  };

  const filteredPrices = prices.filter((p) =>
    `${p.id} ${p.title} ${p.planPrice} ${p.status}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPrices.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const currentPrices = filteredPrices.slice(indexOfLast - itemsPerPage, indexOfLast);

  const handleCheckboxChange = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDeleteClick = (id) => {
    const idsToDelete = selectedIds.includes(id) ? selectedIds : [id];
    setDeletePriceIds(idsToDelete);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await Promise.all(
        deletePriceIds.map(id =>
          api.put("/admin/price/deletePrice", { id, status: "terminated" })
        )
      );
      setPrices(prev => prev.filter(p => !deletePriceIds.includes(p.id)));
      setSelectedIds([]);
      setShowDeleteModal(false);
      toast.success("Price deleted successfully");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleStatusChange = async (id, status) => {
    const idsToUpdate = selectedIds.includes(id) ? selectedIds : [id];
    try {
      await Promise.all(
        idsToUpdate.map(id => api.put("/admin/price/updatePrice", { id, status }))
      );
      setPrices(prev =>
        prev.map(p => idsToUpdate.includes(p.id) ? { ...p, status } : p)
      );
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDownload = () => {
    const selected = prices.filter(p => selectedIds.includes(p.id));
    if (!selected.length) return toast.error("Select at least one price plan");

    const csv = [
      ["ID", "Title", "Plan Price", "Description", "Status"],
      ...selected.map(p => [
        p.id,
        p.title,
        p.planPrice,
        getDescriptions(p).join(" | "),
        p.status,
      ])
    ].map(e => e.join(",")).join("\n");

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "Prices.csv";
    a.click();
  };

  //Print
const handlePrint = () => {
  if (!tableRef.current) return;

  const table = tableRef.current.cloneNode(true);

  // ✅ Remove checkbox + action columns
  table.querySelectorAll("tr").forEach((row) => {
    if (row.children.length > 0) row.children[0].remove();
    if (row.children.length > 0) row.lastElementChild.remove();
  });

  // ✅ Convert Status dropdown → plain text
  // After removal:
  // ID(0) | Title(1) | PlanPrice(2) | Descriptions(3) | Status(4)
  table.querySelectorAll("tbody tr").forEach((row, index) => {
    const statusCell = row.children[4];
    if (statusCell && currentPrices[index]) {
      statusCell.textContent =
        currentPrices[index].status === "inactive"
          ? "Inactive"
          : "Active";
    }
  });

  // ✅ Format price column nicely
  table.querySelectorAll("tbody tr").forEach((row, index) => {
    const priceCell = row.children[2];
    if (priceCell && currentPrices[index]?.planPrice) {
      priceCell.textContent = `₹${currentPrices[index].planPrice}`;
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
        <title>Price List</title>
        <style>
          @page { size: A4; margin: 18mm; }

          body {
            font-family: Arial, Helvetica, sans-serif;
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
            padding: 9px;
            text-align: left;
          }

          td {
            padding: 7px;
            border-bottom: 1px solid #ddd;
            vertical-align: top;
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
        <h1>Price Plans</h1>
        ${table.outerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = () => {
    // 🎯 Apply status colors
    const rows = printWindow.document.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      const cell = row.children[4];
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
            <div className="flex justify-between mb-6">
              <button onClick={() => navigate("/")}
                className="px-4 py-2 rounded-lg text-sm bg-black text-white border border-black hover:bg-white hover:text-black transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md">
                ← Back to Dashboard
              </button>
              <button onClick={() => navigate("/create-price")}
                className="px-4 py-2 rounded-lg text-sm bg-gray-200 hover:bg-black hover:text-white transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md">
                + Create Price
              </button>
            </div>

            {/* Search + Actions */}
            <div className="flex flex-col lg:flex-row justify-between items-center mb-4 gap-4">
              <h2 className="text-xl font-semibold">Prices</h2>

              <div className="flex gap-3 flex-wrap">
                <input
                  className="px-4 py-2 border rounded-lg text-sm"
                  placeholder="Search prices..."
                  value={search} onChange={e => setSearch(e.target.value)}
                />
                <button onClick={handleDownload} className="px-3 py-2 border rounded-lg text-sm flex items-center gap-2 hover:bg-gray-100 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md">
                  <Download size={16} /> Download
                </button>
                <button onClick={handlePrint} className="px-3 py-2 border rounded-lg text-sm flex items-center gap-2 hover:bg-gray-100 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md">
                  <Printer size={16} /> Print
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border rounded-lg" ref={tableRef}>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 font-semibold">
                  <tr>
                    <th className="p-4 text-left"><input type="checkbox"
                      checked={prices.length && selectedIds.length === prices.length}
                      onChange={e => setSelectedIds(e.target.checked ? prices.map(p => p.id) : [])}
                    /></th>
                    <th className="p-4 text-left">ID</th>
                    <th className="p-4 text-left">Title</th>
                    <th className="p-4 text-left">Plan Price</th>
                    <th className="p-4 text-left">Descriptions</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentPrices.length ? currentPrices.map(p => (
                    <tr key={p.id} className={`border-t hover:bg-gray-50 ${selectedIds.includes(p.id) && "bg-gray-100"}`}>
                      <td className="p-4"><input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => handleCheckboxChange(p.id)} /></td>
                      <td className="p-4">{p.id}</td>
                      <td className="p-4 font-medium">{p.title}</td>
                      <td className="p-4">₹{p.planPrice}</td>

                      <td className="p-4">
                        {getDescriptions(p).map((d, i) => (
  <div key={i}>• {d}</div>
))}

                      </td>

                      <td className="p-4">
                        <select value={p.status} onChange={e => handleStatusChange(p.id, e.target.value)}
                          className={`px-3 py-1 rounded-lg text-sm border 
                          ${p.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => setViewPrice(p)} className="w-9 h-9 border hover:bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-100">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => navigate(`/edit-price/${p.id}`)} className="w-9 h-9 border hover:bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-100">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDeleteClick(p.id)} className="w-9 h-9 border text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center hover:bg-gray-100">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="7" className="p-6 text-center text-gray-500">No prices found</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center py-10">
                <div className="w-full flex justify-between border-t pt-3">
                  <div onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    className={`flex items-center cursor-pointer ${currentPage === 1 && "text-gray-400 pointer-events-none"}`}>
                    <ChevronLeft size={18} /> <span className="ml-2">Previous</span>
                  </div>

                  <div className="hidden sm:flex">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                      <span key={n} onClick={() => setCurrentPage(n)}
                        className={`px-4 py-2 mx-1 rounded-lg border cursor-pointer 
                        ${currentPage === n ? "bg-black text-white" : "hover:bg-black hover:text-white"}`}>
                        {n}
                      </span>
                    ))}
                  </div>

                  <div onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    className={`flex items-center cursor-pointer ${currentPage === totalPages && "text-gray-400 pointer-events-none"}`}>
                    <span className="mr-2">Next</span> <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* View Modal */}
      {viewPrice && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 relative">
            <button onClick={() => setViewPrice(null)} className="absolute top-3 right-3 text-lg font-bold">✕</button>
            <h3 className="text-xl font-semibold mb-4 text-center">{viewPrice.title}</h3>
            <p className="text-lg font-medium mb-2">Price: ₹{viewPrice.planPrice}</p>
            <p className="text-lg font-medium mb-2">Description :</p>
            <div className="border rounded-lg p-3 max-h-[70vh] overflow-auto">
              {getDescriptions(viewPrice).map((d, i) => (
  <p key={i} className="mb-1">• {d}</p>
))}

            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80 text-center">
            <h3 className="font-semibold mb-4">Delete {deletePriceIds.length > 1 ? "selected items" : "this plan"}?</h3>
            <div className="flex justify-center gap-4">
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Confirm</button>
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
