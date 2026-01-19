import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Pencil, Trash2, Download, Printer, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";

export default function Card() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [Cards, setCards] = useState([]);
  const [viewCard, setViewCard] = useState(null);

  // Delete modal
  const [deleteCardIds, setDeleteCardIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const tableRef = useRef(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await api.get("/admin/card/getCards");
      setCards(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch cards");
      console.error(error);
    }
  };

  const filteredCards = Cards.filter((card) =>
    `${card.id} ${card.title} ${card.description} ${card.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
  const currentCards = filteredCards.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Select checkbox
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Delete modal open
  const handleDeleteClick = (id) => {
    setDeleteCardIds(selectedIds.includes(id) ? selectedIds : [id]);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      await Promise.all(
        deleteCardIds.map((id) =>
          api.put("/admin/card/deleteCard", { id, status: "terminated" })
        )
      );

      setCards((prev) => prev.filter((c) => !deleteCardIds.includes(c.id)));
      setSelectedIds((prev) => prev.filter((id) => !deleteCardIds.includes(id)));
      setShowDeleteModal(false);
      toast.success("Card deleted successfully!");
    } catch {
      toast.error("Delete failed");
    }
  };

  // Status change
  const handleStatusChange = async (id, status) => {
    const ids = selectedIds.includes(id) ? selectedIds : [id];

    try {
      await Promise.all(
        ids.map((x) =>
          api.put("/admin/card/updateCard", { id: x, status })
        )
      );

      setCards((prev) =>
        prev.map((c) => (ids.includes(c.id) ? { ...c, status } : c))
      );

      toast.success("Status Updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  // CSV Download
  const handleDownload = () => {
    const selected = Cards.filter((c) => selectedIds.includes(c.id));
    if (!selected.length) return toast.error("Select at least one card");

    const csv = [
      ["ID", "Title", "Image", "Description", "Status"],
      ...selected.map((c) => [c.id, c.title, c.image, c.description, c.status]),
    ].map((r) => r.join(",")).join("\n");

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "Cards.csv";
    a.click();
  };

  // Print
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
    if (statusCell && currentCards[index]) {
      statusCell.textContent =
        currentCards[index].status === "inactive"
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
        <h1>Card Report</h1>
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

            {/* Header Buttons */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-black text-white border hover:bg-white hover:text-black  transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow"
              >
                ← Back to Dashboard
              </button>
              <button
                onClick={() => navigate("/create-card")}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-800 border hover:bg-black hover:text-white  transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow"
              >
                + Create Card
              </button>
            </div>

            {/* Title + Search + Actions */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Cards</h2>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search cards..."
                  className="px-4 py-2 border rounded-lg text-sm"
                />
                <button onClick={handleDownload} className="px-3 py-2 border rounded-lg text-sm flex items-center gap-2 hover:bg-gray-100  transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow"><Download size={16} /> Download</button>
                <button onClick={handlePrint} className="px-3 py-2 border rounded-lg text-sm flex items-center gap-2 hover:bg-gray-100  transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow"><Printer size={16} /> Print</button>
              </div>
            </div>

            {/* TABLE FULL CLONE */}
            <div ref={tableRef} className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 font-semibold">
                  <tr>
                    <th className="p-4 text-left"><input type="checkbox" checked={Cards.length && selectedIds.length === Cards.length} onChange={(e) => setSelectedIds(e.target.checked ? Cards.map(c => c.id) : [])} /></th>
                    <th className="p-4 text-left">ID</th>
                    <th className="p-4 text-left">Image</th>
                    <th className="p-4 text-left">Title</th>
                    <th className="p-4 text-left">Description</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentCards.length ? currentCards.map(card => (
                    <tr key={card.id} className={`border-t hover:bg-gray-50 ${selectedIds.includes(card.id) ? "bg-gray-100" : ""}`}>
                      <td className="p-4"><input type="checkbox" checked={selectedIds.includes(card.id)} onChange={() => handleCheckboxChange(card.id)} /></td>
                      <td className="p-4">{card.id}</td>
                      <td className="p-4"><img src={card.image ? `${import.meta.env.VITE_API_BASE_URL}${card.image}` : "/placeholder.png"} className="w-28 h-14 object-cover rounded-md" style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }} /></td>
                      <td className="p-4 font-medium">{card.title}</td>
                      <td className="p-4">{card.description}</td>

                      {/* Status Select */}
                      <td className="p-4">
                        <select value={card.status} onChange={(e) => handleStatusChange(card.id, e.target.value)}
                          className={`px-3 py-1 rounded-lg text-sm border cursor-pointer ${card.status === "active" ? "bg-green-100 text-green-800 border-green-300" : "bg-red-100 text-red-800 border-red-300"}`}>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => setViewCard(card)} className="w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-100"><Eye size={16} /></button>
                          <button onClick={() => navigate(`/edit-card/${card.id}`)} className="w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-100"><Pencil size={16} /></button>
                          <button onClick={() => handleDeleteClick(card.id)} className="w-9 h-9 border rounded-lg text-red-600 flex items-center justify-center hover:bg-red-50"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  )) : <tr><td colSpan="7" className="p-6 text-center text-gray-500">No cards found</td></tr>}
                </tbody>
              </table>
            </div>

            {/* Pagination EXACT */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center py-10">
                <div className="flex items-center justify-between w-full border-t pt-3">

                  <div onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} className={`cursor-pointer flex items-center ${currentPage === 1 ? "text-gray-400 pointer-events-none" : "hover:text-black"}`}><ChevronLeft size={18} /> Previous</div>

                  <div className="hidden sm:flex">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                      <p key={n} onClick={() => setCurrentPage(n)} className={`px-4 py-2 mr-3 rounded-lg border text-sm cursor-pointer ${n === currentPage ? "bg-black text-white border-black" : "hover:bg-black hover:text-white"}`}>{n}</p>
                    ))}
                  </div>

                  <div onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} className={`cursor-pointer flex items-center ${currentPage === totalPages ? "text-gray-400 pointer-events-none" : "hover:text-black"}`}>Next <ChevronRight size={18} /></div>

                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* VIEW MODAL SAME AS BANNER */}
      {viewCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-xl p-6 relative">
            <button onClick={() => setViewCard(null)} className="absolute top-3 right-3 text-lg font-bold">✕</button>
            <h3 className="text-xl font-semibold mb-6 text-center">{viewCard.title}</h3>
            <p className="mb-4"><b>Description:</b> {viewCard.description}</p>
            <div className="border rounded-lg p-2" style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>
              <img src={`${import.meta.env.VITE_API_BASE_URL}${viewCard.image}`} className="w-full h-auto object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center w-80">
            <h3 className="text-lg font-semibold mb-4">Delete {deleteCardIds.length > 1 ? "selected cards" : "this card"}?</h3>
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
