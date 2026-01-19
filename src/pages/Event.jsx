import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  Pencil,
  Trash2,
  Download,
  Printer,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";

export default function Event() {
  const navigate = useNavigate();
  const tableRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewEvent, setViewEvent] = useState(null);

  // delete modal
  const [deleteEventIds, setDeleteEventIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchEvents();
  }, []);

  // 🔹 fetch events
  const fetchEvents = async () => {
    try {
      const res = await api.get("/admin/event/getEvents");
      setEvents(res.data.data);
    } catch {
      toast.error("Failed to fetch events");
    }
  };

  // 🔹 search
  const filteredEvents = events.filter((e) =>
    `${e.id} ${e.name} ${e.description} ${e.status} ${e.categoryId}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // 🔹 pagination logic
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEvents = filteredEvents.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // 🔹 checkbox toggle
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // 🔹 status change (single / bulk)
  const handleStatusChange = async (id, status) => {
    const idsToUpdate = selectedIds.includes(id) ? selectedIds : [id];

    try {
      await Promise.all(
        idsToUpdate.map((id) =>
          api.put("/admin/event/updateEvent", { id, status })
        )
      );

      setEvents((prev) =>
        prev.map((e) =>
          idsToUpdate.includes(e.id) ? { ...e, status } : e
        )
      );

      toast.success(`Updated ${idsToUpdate.length} event`);
    } catch {
      toast.error("Status update failed");
    }
  };

  // 🔹 delete click
  const handleDeleteClick = (id) => {
    const ids = selectedIds.includes(id) ? selectedIds : [id];
    setDeleteEventIds(ids);
    setShowDeleteModal(true);
  };

  // 🔹 confirm delete
  const confirmDelete = async () => {
    try {
      await Promise.all(
        deleteEventIds.map((id) =>
          api.put("/admin/event/deleteEvent", {
            id,
            status: "terminated",
          })
        )
      );

      setEvents((prev) => prev.filter((e) => !deleteEventIds.includes(e.id)));
      setSelectedIds((prev) =>
        prev.filter((id) => !deleteEventIds.includes(id))
      );

      setDeleteEventIds([]);
      setShowDeleteModal(false);
      toast.success("Event deleted successfully");
    } catch {
      toast.error("Delete failed");
    }
  };

  // 🔹 download CSV
  const handleDownload = () => {
    const selected = events.filter((e) => selectedIds.includes(e.id));
    if (!selected.length) return toast.error("Select at least one event");

    const csv = [
      ["ID", "Image", "Name", "Description", "Status", "CategoryId"],
      ...selected.map((e) => [
        e.id,
        e.image,
        e.name,
        e.description,
        e.status,
        e.categoryId,
      ]),
    ]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "events.csv";
    a.click();
  };

  // Print
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
    if (statusCell && currentEvents[index]) {
      statusCell.textContent =
        currentEvents[index].status === "inactive"
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
        <h1>Event Report</h1>
        ${table.outerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = () => {
    // 🎯 Highlight status
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
                onClick={() => navigate("/create-event")}
                className="px-4 py-2 rounded-lg text-sm font-medium
              bg-gray-200 text-gray-800 border border-gray-300
              hover:bg-black hover:text-white hover:border-black
              transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                + Create Event
              </button>
            </div>

            {/* Title + Search + Actions */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Events</h2>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Search events..."
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
            <div className="border rounded-lg overflow-x-auto" ref={tableRef}>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 font-semibold">
                  <tr>
                    <th className="p-4 text-left">
                      <input
                        type="checkbox"
                        checked={
                          events.length &&
                          selectedIds.length === events.length
                        }
                        onChange={(e) =>
                          setSelectedIds(
                            e.target.checked ? events.map((e) => e.id) : []
                          )
                        }
                      />
                    </th>
                    <th className="p-4 text-left">ID</th>
                    <th className="p-4 text-left">Image</th>
                    <th className="p-4 text-left">Name</th>
                    <th className="p-4 text-left">Description</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-center">CategoryId</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentEvents.length ? (
                    currentEvents.map((e) => (
                      <tr
                        key={e.id}
                        className={`border-t hover:bg-gray-50 ${selectedIds.includes(e.id) ? "bg-gray-100" : ""
                          }`}
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(e.id)}
                            onChange={() => handleCheckboxChange(e.id)}
                          />
                        </td>
                        <td className="p-4">{e.id}</td>
                        <td className="p-4">
                          <img
                            src={
                              e.image
                                ? `${import.meta.env.VITE_API_BASE_URL}${e.image}`
                                : "/placeholder.png"
                            }
                            className="w-28 h-14 object-cover rounded-md"
                          />
                        </td>
                        <td className="p-4 font-medium">{e.name}</td>
                        <td className="p-4 truncate max-w-xs text-gray-500">
                          {e.description}
                        </td>
                        <td className="p-4">
                          <select
                            value={e.status}
                            onChange={(ev) =>
                              handleStatusChange(e.id, ev.target.value)
                            }
                            className={`px-3 py-1 rounded-lg border text-sm
                              ${e.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                              }`}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </td>
                        <td className="p-4 text-center">{e.categoryId}</td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => setViewEvent(e)} className="w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-100"><Eye size={16} /></button>
                            <button onClick={() => navigate(`/edit-event/${e.id}`)} className="w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-100"><Pencil size={16} /></button>
                            <button onClick={() => handleDeleteClick(e.id)} className="w-9 h-9 border rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-6 text-center text-gray-500">
                        No events found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center py-10 w-full">
                <div className="w-full flex items-center justify-between border-t border-gray-200">

                  <div
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={`flex items-center pt-3 cursor-pointer ${currentPage === 1
                      ? "text-gray-400 pointer-events-none"
                      : "text-gray-800 hover:text-black"
                      }`}
                  >
                    <ChevronLeft size={18} />
                    <p className="text-sm ml-2 font-medium leading-none">Previous</p>
                  </div>

                  <div className="sm:flex hidden">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
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
                    ))}
                  </div>

                  <div
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={`flex items-center pt-3 cursor-pointer ${currentPage === totalPages
                      ? "text-gray-400 pointer-events-none"
                      : "text-gray-800 hover:text-black"
                      }`}
                  >
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
      {viewEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-xl p-6 relative">
            <button
              onClick={() => setViewEvent(null)}
              className="absolute top-3 right-3 text-lg font-bold"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-6 text-center">{viewEvent.name}</h3>
            <div
              className="w-full max-h-[80vh] overflow-auto border rounded-lg p-2"
              style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}
            >
              <img
                src={viewEvent.image ? `${import.meta.env.VITE_API_BASE_URL}${viewEvent.image}` : "/placeholder.png"}
                alt={viewEvent.name}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}


      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg text-center w-80">
            <h3 className="font-semibold mb-4">
              Delete{" "}
              {deleteEventIds.length > 1 ? "selected events" : "this event"}?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
