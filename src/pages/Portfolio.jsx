import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import {
  Pencil,
  Trash2,
  Download,
  Printer,
  Eye,
  ChevronLeft,
  ChevronRight,
  Save,
  Link2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

export default function Portfolio() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [Portfolios, setPortfolios] = useState([]);
  const [viewPortfolio, setViewPortfolio] = useState(null);
  const [dragList, setDragList] = useState([]);

  const [deletePortfolioIds, setDeletePortfolioIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const tableRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPortfolios();
  }, []);

  // ✅ youtube embed converter
  const getEmbedUrl = (url) => {
    if (!url) return null;

    if (url.includes("youtu.be")) {
      const id = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }

    if (url.includes("watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }

    return url;
  };

  const fetchPortfolios = async () => {
    try {
      const res = await api.get("/admin/portfolio/getPortfolios");

      const mapped = res.data.data.map((p) => ({
        ...p,
        image: p.images?.length ? p.images[0] : null,
        images: Array.isArray(p.images) ? p.images : [],
        videoLink: Array.isArray(p.videoLink) ? p.videoLink : [],
      }));

      setPortfolios(mapped);
      setDragList(mapped);
    } catch (error) {
      toast.error("Failed to fetch portfolios");
      console.error(error);
    }
  };

  const filteredPortfolios = dragList.filter((p) =>
    `${p.id} ${p.title} ${p.category} ${p.description} ${p.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPortfolios.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPortfolios = filteredPortfolios.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDeleteClick = (id) => {
    const idsToDelete = selectedIds.includes(id) ? selectedIds : [id];
    setDeletePortfolioIds(idsToDelete);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await Promise.all(
        deletePortfolioIds.map((id) =>
          api.put("/admin/portfolio/deletePortfolio", {
            id,
            status: "terminated",
          })
        )
      );

      setDragList((prev) =>
        prev.filter((p) => !deletePortfolioIds.includes(p.id))
      );
      setSelectedIds((prev) =>
        prev.filter((id) => !deletePortfolioIds.includes(id))
      );
      setDeletePortfolioIds([]);
      setShowDeleteModal(false);
      toast.success("Portfolio deleted successfully!");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const idsToUpdate = selectedIds.includes(id) ? selectedIds : [id];

    try {
      await Promise.all(
        idsToUpdate.map((id) =>
          api.put("/admin/portfolio/updatePortfolio", { id, status: newStatus })
        )
      );

      setDragList((prev) =>
        prev.map((p) =>
          idsToUpdate.includes(p.id) ? { ...p, status: newStatus } : p
        )
      );

      toast.success(
        `Updated ${idsToUpdate.length} portfolio(s) to "${newStatus}"`
      );
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDownload = () => {
    const selected = dragList.filter((p) => selectedIds.includes(p.id));
    if (!selected.length)
      return toast.error("Please select at least one portfolio");

    const csv = [
      ["ID", "Title", "Category", "Image", "VideoLink", "Description", "Status"],
      ...selected.map((p) => [
        p.id,
        p.title,
        p.category,
        p.image,
        p.videoLink,
        p.description,
        p.status,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Portfolios.csv";
    a.click();
  };

  const handlePrint = () => {
  if (!tableRef.current) return;

  const table = tableRef.current.cloneNode(true);

  // ✅ Remove checkbox + action column
  table.querySelectorAll("tr").forEach((row) => {
    if (row.children.length > 0) row.children[0].remove();       // checkbox
    if (row.children.length > 0) row.lastElementChild.remove(); // action
  });

  // ✅ Convert dropdown → text (Status column index = 8 after removal)
  table.querySelectorAll("tbody tr").forEach((row, index) => {
    const statusCell = row.children[8];
    if (statusCell && currentPortfolios[index]) {
      statusCell.textContent =
        currentPortfolios[index].status === "inactive"
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
          @page { size: A4; margin: 18mm; }

          body {
            font-family: "Segoe UI", Arial, sans-serif;
            color: #111;
          }

          h1 {
            margin-bottom: 14px;
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
            vertical-align: middle;
          }

          tr:nth-child(even) {
            background: #f7f7f7;
          }

          img {
            max-height: 50px;
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
        <h1>Portfolio Report</h1>
        ${table.outerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = () => {
    // 🎯 Highlight status after render
    const rows = printWindow.document.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      const statusCell = row.children[8];
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


  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(dragList);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setDragList(items);
  };

  const saveOrder = async () => {
    try {
      const orderedIds = dragList.map((p) => p.id);

      await api.post("/admin/portfolio/updateOrder", {
        order: orderedIds,
      });

      toast.success("Order saved successfully");
      fetchPortfolios();
    } catch (error) {
      toast.error("Failed to save order");
    }
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
                onClick={() => navigate("/create-portfolio")}
                className="px-4 py-2 rounded-lg text-sm font-medium
                          bg-gray-200 text-gray-800 border border-gray-300
                          hover:bg-black hover:text-white hover:border-black
                          transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                + Create Portfolio
              </button>
            </div>

            {/* Title + Search + Actions */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Portfolios</h2>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Search portfolios..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-4 py-2 border rounded-lg text-sm"
                />

                <button
                  onClick={saveOrder}
                  className="px-3 py-2 rounded-lg text-sm font-medium
             bg-green-600 text-white border border-green-600
             hover:bg-white hover:text-green-600 transition-all duration-200
             transform hover:-translate-y-0.5 hover:shadow
             flex items-center gap-2"
                >
                  <Save size={16} />
                  Save Changes
                </button>

                <button
                  onClick={handleDownload}
                  className="px-3 py-2 border rounded-lg text-sm flex items-center gap-2
                             hover:bg-gray-100 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow"
                >
                  <Download size={16} /> Download
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3 py-2 border rounded-lg text-sm flex items-center gap-2
                             hover:bg-gray-100 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow"
                >
                  <Printer size={16} /> Print
                </button>
              </div>
            </div>

            {/* ================= TABLE ================= */}
            <div className="overflow-x-auto border rounded-lg" ref={tableRef}>
              <DragDropContext onDragEnd={handleDragEnd}>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 font-semibold">
                    <tr>
                      <th className="p-4 text-left">
                        <input
                          type="checkbox"
                          checked={
                            dragList.length &&
                            selectedIds.length === dragList.length
                          }
                          onChange={(e) =>
                            setSelectedIds(
                              e.target.checked ? dragList.map((p) => p.id) : []
                            )
                          }
                        />
                      </th>
                      <th className="p-4 text-left">ID</th>
                      <th className="p-4 text-left">Order</th>
                      <th className="p-4 text-left">Image</th>
                      <th className="p-4 text-left">VideoLink</th>
                      <th className="p-4 text-left">Title</th>
                      <th className="p-4 text-left">Category</th>
                      <th className="p-4 text-left">Description</th>
                      <th className="p-4 text-left">Status</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>

                  <Droppable droppableId="portfolio-table">
                    {(provided) => (
                      <tbody
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {currentPortfolios.map((portfolio, index) => (
                          <Draggable
                            key={portfolio.id}
                            draggableId={portfolio.id.toString()}
                            index={index}
                          >
                            {(provided) => (
                              <tr
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`border-t hover:bg-gray-50 ${selectedIds.includes(portfolio.id)
                                  ? "bg-gray-100"
                                  : ""
                                  }`}
                              >
                                <td className="p-4">
                                  <input
                                    type="checkbox"
                                    checked={selectedIds.includes(portfolio.id)}
                                    onChange={() => handleCheckboxChange(portfolio.id)}
                                  />
                                </td>
                                <td className="p-4 text-center">{portfolio.id}</td>
                                <td className="p-4  text-center">
                                  {portfolio.pinOrder}
                                </td>
                                <td className="p-4">
                                  <img
                                    src={
                                      portfolio.image
                                        ? `${import.meta.env.VITE_API_BASE_URL}${portfolio.image}`
                                        : "/placeholder.png"
                                    }
                                    className="w-28 h-14 object-cover rounded-md"
                                    style={{
                                      boxShadow:
                                        "0 4px 10px rgba(0,0,0,0.3)",
                                    }}
                                  />
                                </td>

                                <td className="p-4 text-center">
                                  {portfolio.videoLink.length > 0 ? (
                                    <a
                                      href={portfolio.videoLink[0]}   // ✅ first video
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center justify-center w-9 h-9 border rounded-lg
      hover:bg-gray-100 transition"
                                      title="Open Video"
                                    >
                                      <Link2 size={18} />
                                    </a>
                                  ) : (
                                    <span className="text-gray-400 text-sm">—</span>
                                  )}

                                </td>


                                <td className="p-4 font-medium">
                                  {portfolio.title}
                                </td>
                                <td className="p-4 font-medium">
                                  {portfolio.category}
                                </td>
                                <td className="p-4">
                                  {portfolio.description || "-"}
                                </td>
                                <td className="p-4">
                                  <select
                                    value={portfolio.status}
                                    onChange={(e) =>
                                      handleStatusChange(
                                        portfolio.id,
                                        e.target.value
                                      )
                                    }
                                    className={`px-3 py-1 rounded-lg text-sm font-medium border cursor-pointer transition ${portfolio.status === "active"
                                      ? "bg-green-100 text-green-800 border-green-300"
                                      : "bg-red-100 text-red-800 border-red-300"
                                      } hover:brightness-95`}
                                  >
                                    <option value="active">Active</option>
                                    <option value="inactive">
                                      Inactive
                                    </option>
                                  </select>
                                </td>
                                <td className="p-4">
                                  <div className="flex justify-center gap-2">
                                    <button
                                      onClick={() =>
                                        setViewPortfolio(portfolio)
                                      }
                                      className="w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-100"
                                    >
                                      <Eye size={16} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        navigate(
                                          `/edit-portfolio/${portfolio.id}`
                                        )
                                      }
                                      className="w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-100"
                                    >
                                      <Pencil size={16} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteClick(portfolio.id)
                                      }
                                      className="w-9 h-9 border rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </tbody>
                    )}
                  </Droppable>
                </table>
              </DragDropContext>
            </div>
            {/* ================= PAGINATION ================= */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center py-10 w-full">
                <div className="w-full flex items-center justify-between border-t border-gray-200">

                  {/* ◀ Previous */}
                  <div
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    className={`flex items-center pt-3 cursor-pointer ${currentPage === 1
                      ? "text-gray-400 pointer-events-none"
                      : "text-gray-800 hover:text-black"
                      }`}
                  >
                    <ChevronLeft size={18} />
                    <p className="text-sm ml-2 font-medium leading-none">
                      Previous
                    </p>
                  </div>

                  {/* Page Numbers */}
                  <div className="sm:flex hidden">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (number) => (
                        <p
                          key={number}
                          onClick={() => setCurrentPage(number)}
                          className={`text-sm font-medium leading-none cursor-pointer rounded-lg px-4 py-2 mr-3 border ${currentPage === number
                            ? "text-white bg-black border-black"
                            : "text-gray-600 border-transparent hover:text-white hover:bg-black"
                            }`}
                        >
                          {number}
                        </p>
                      )
                    )}
                  </div>

                  {/* ▶ Next */}
                  <div
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, totalPages)
                      )
                    }
                    className={`flex items-center pt-3 cursor-pointer ${currentPage === totalPages
                      ? "text-gray-400 pointer-events-none"
                      : "text-gray-800 hover:text-black"
                      }`}
                  >
                    <p className="text-sm font-medium leading-none mr-2">
                      Next
                    </p>
                    <ChevronRight size={18} />
                  </div>

                </div>
              </div>
            )}

            {/* ================= VIEW MODAL ================= */}
            {viewPortfolio && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl w-full max-w-5xl p-6 relative">

                  <button
                    onClick={() => setViewPortfolio(null)}
                    className="absolute top-3 right-3 text-xl font-bold"
                  >
                    ✕
                  </button>

                  <h3 className="text-xl font-semibold mb-2 text-center">
                    {viewPortfolio.title}
                  </h3>

                  <h4 className="text-lg font-medium mb-2 text-center">
                    {viewPortfolio.category}
                  </h4>

                  <p className="text-center text-gray-600 mb-4">
                    {viewPortfolio.description || "-"}
                  </p>



                  <div className="max-h-[70vh] overflow-y-auto px-2">
                    <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 1024: 3 }}>
                      <Masonry gutter="12px">

                        {viewPortfolio.videoLink?.map((url, index) => (
                          <div
                            key={`video-${index}`}
                            className="relative w-full aspect-video rounded-lg overflow-hidden"
                          >
                            <iframe
                              src={getEmbedUrl(url)}     // ✅ individual url
                              className="absolute inset-0 w-full h-full"
                              allowFullScreen
                            />
                          </div>
                        ))}


                        {viewPortfolio.images?.map((img, index) => (
                          <img
                            key={`image-${index}`}
                            src={`${import.meta.env.VITE_API_BASE_URL}${img}`}
                            className="w-full rounded-lg"
                            alt="portfolio"
                          />
                        ))}

                      </Masonry>
                    </ResponsiveMasonry>
                  </div>
                </div>
              </div>
            )}

            {/* ================= DELETE MODAL ================= */}
            {showDeleteModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl w-80 text-center">
                  <h3 className="text-lg font-semibold mb-4">
                    Are you sure you want to delete{" "}
                    {deletePortfolioIds.length > 1 ? "selected portfolios" : "this portfolio"}?
                  </h3>

                  <div className="flex justify-center gap-4 mt-4">
                    <button
                      onClick={confirmDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Confirm
                    </button>

                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
