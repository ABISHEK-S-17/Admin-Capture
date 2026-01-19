import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Pencil, Trash2, Download, Printer, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";

export default function Contact() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewContact, setViewContact] = useState(null);

  // delete modal
  const [deleteIds, setDeleteIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const tableRef = useRef(null);

  // pagination copy from banner
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    try {
      const res = await api.get("/admin/contact/getContacts");
      setContacts(res.data.data);
    } catch {
      toast.error("Failed to fetch contacts");
    }
  };

  // search filter
  const filtered = contacts.filter(c =>
    `${c.id} ${c.name} ${c.email} ${c.phone} ${c.subject} ${c.description} ${c.status}`
      .toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const last = currentPage * itemsPerPage;
  const first = last - itemsPerPage;
  const currentContacts = filtered.slice(first, last);

  // checkbox
  const toggleCheckbox = (id) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  // delete
  const deleteClick = (id) => {
    const ids = selectedIds.includes(id) ? selectedIds : [id];
    setDeleteIds(ids);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await Promise.all(deleteIds.map(id =>
        api.put("/admin/contact/updateContact", { id, status: "terminated" })
      ));

      setContacts(prev => prev.filter(c => !deleteIds.includes(c.id)));
      setSelectedIds([]);
      setShowDeleteModal(false);
      setDeleteIds([]);
      toast.success("Contact deleted successfully!");
    } catch { toast.error("Delete failed"); }
  };

  // status change
  const changeStatus = async (id, status) => {
    const ids = selectedIds.includes(id) ? selectedIds : [id];

    try {
      await Promise.all(ids.map(id =>
        api.put("/admin/contact/updateContact", { id, status })
      ));

      setContacts(prev =>
        prev.map(c => ids.includes(c.id) ? { ...c, status } : c)
      );

      toast.success(`Updated ${ids.length} contact(s) to "${status}"`);
    } catch { toast.error("Status update failed"); }
  };

  // CSV
  const downloadCSV = () => {
    const selected = contacts.filter(c => selectedIds.includes(c.id));
    if (!selected.length) return toast.error("Select at least one");

    const csv = [
      ["ID", "Name", "Email", "Phone", "Subject", "Description", "Status"],
      ...selected.map(c => [c.id, c.name, c.email, c.phone, c.subject, c.description, c.status])
    ].map(r => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Contacts.csv";
    a.click();
  };

  // print
const handlePrint = () => {
  if (!tableRef.current) return;

  const table = tableRef.current.cloneNode(true);

  // ✅ Remove checkbox + action columns
  table.querySelectorAll("tr").forEach((row) => {
    if (row.children.length > 0) row.children[0].remove();         // checkbox
    if (row.children.length > 0) row.lastElementChild.remove();   // action
  });

  // ✅ Convert Status dropdown → plain text
  // After removal:
  // ID(0) | Name(1) | Email(2) | Phone(3) | Subject(4) | Description(5) | Status(6)
  table.querySelectorAll("tbody tr").forEach((row, index) => {
    const statusCell = row.children[6];
    if (statusCell && currentContacts[index]) {
      statusCell.textContent =
        currentContacts[index].status === "inactive"
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
        <title>Contact Report</title>
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
        </style>
      </head>

      <body>
        <h1>Contact List</h1>
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
      <Toaster position="top-center" /> <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">

            {/* Top Buttons (exact as banner) */}
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => navigate("/")}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-black text-white border border-black 
                           hover:bg-white hover:text-black transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md">
                ← Back to Dashboard
              </button>

              <button onClick={() => navigate("/create-contact")}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-800 
                           border border-gray-300 hover:bg-black hover:text-white hover:border-black 
                           transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg">
                + Create Contact
              </button>
            </div>

            {/* Title + Search + Actions */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Contacts</h2>

              <div className="flex flex-wrap items-center gap-3">
                <input placeholder="Search contacts..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="px-4 py-2 border rounded-lg text-sm" />

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
            <div className="overflow-x-auto border rounded-lg" ref={tableRef}>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 font-semibold">
                  <tr>
                    <th className="p-4 text-left">
                      <input type="checkbox"
                        checked={contacts.length && selectedIds.length === contacts.length}
                        onChange={(e) => setSelectedIds(e.target.checked ? contacts.map(c => c.id) : [])} />
                    </th>
                    <th className="p-4 text-left">ID</th>
                    <th className="p-4 text-left">Name</th>
                    <th className="p-4 text-left">Email</th>
                    <th className="p-4 text-left">Phone</th>
                    <th className="p-4 text-left">Subject</th>
                    <th className="p-4 text-left">Description</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentContacts.length ? currentContacts.map(c => (
                    <tr key={c.id}
                      className={`border-t hover:bg-gray-50 ${selectedIds.includes(c.id) ? "bg-gray-100" : ""}`}>

                      <td className="p-4"><input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggleCheckbox(c.id)} /></td>
                      <td className="p-4">{c.id}</td>
                      <td className="p-4 font-medium">{c.name}</td>
                      <td className="p-4">{c.email}</td>
                      <td className="p-4">{c.phone || "-"}</td>
                      <td className="p-4">{c.subject}</td>
                      <td className="p-4 max-w-xs truncate">{c.description || "-"}</td>

                      <td className="p-4">
                        <select value={c.status} onChange={e => changeStatus(c.id, e.target.value)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium border cursor-pointer transition
                          ${c.status === "active" ? "bg-green-100 text-green-800 border-green-300"
                              : "bg-red-100 text-red-800 border-red-300"} hover:brightness-95`}>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => setViewContact(c)} className="w-9 h-9 border rounded-lg flex justify-center items-center hover:bg-gray-100"><Eye size={16} /></button>
                          <button onClick={() => navigate(`/edit-contact/${c.id}`)} className="w-9 h-9 border rounded-lg flex justify-center items-center hover:bg-gray-100"><Pencil size={16} /></button>
                          <button onClick={() => deleteClick(c.id)} className="w-9 h-9 border rounded-lg flex justify-center items-center text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="9" className="p-6 text-center text-gray-500">No Contacts Found</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination EXACT as banner */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center py-10 w-full">
                <div className="w-full flex items-center justify-between border-t border-gray-200">

                  <div onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    className={`flex items-center pt-3 cursor-pointer 
                                ${currentPage === 1 ? "text-gray-400 pointer-events-none" : "text-gray-800 hover:text-black"}`}>
                    <ChevronLeft size={18} /><span className="ml-1">Previous</span>
                  </div>

                  <div className="sm:flex hidden">
                    {Array.from({ length: totalPages }, (_, n) => n + 1).map(num => (
                      <p key={num} onClick={() => setCurrentPage(num)}
                        className={`text-sm font-medium cursor-pointer rounded-lg px-4 py-2 mx-1 border 
                                  ${currentPage === num ? "bg-black text-white border-black" : "text-gray-600 hover:bg-black hover:text-white"}`}>
                        {num}
                      </p>
                    ))}
                  </div>

                  <div onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    className={`flex items-center pt-3 cursor-pointer
                                ${currentPage === totalPages ? "text-gray-400 pointer-events-none" : "text-gray-800 hover:text-black"}`}>
                    <span className="mr-1">Next</span><ChevronRight size={18} />
                  </div>

                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      {/* View Modal (Improved UI - proper spacing & alignment) */}
      {viewContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-xl p-6 relative shadow-lg animate-fadeIn">

            {/* Close button */}
            <button
              onClick={() => setViewContact(null)}
              className="absolute top-3 right-3 text-xl font-bold hover:text-red-500 transition"
            >
              ✕
            </button>

            {/* Title */}
            <h3 className="text-2xl font-semibold text-center mb-6">{viewContact.name}</h3>

            {/* Content Section */}
            <div className="space-y-3 text-[15px]">

              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-700">Email:</span>
                <span className="text-gray-900">{viewContact.email}</span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-700">Phone:</span>
                <span className="text-gray-900">{viewContact.phone || "-"}</span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-700">Subject:</span>
                <span className="text-gray-900">{viewContact.subject}</span>
              </div>

              <div>
                <span className="font-semibold text-gray-700 block mb-1">Description:</span>
                <p className="text-gray-900 leading-relaxed border p-3 rounded-md bg-gray-50">
                  {viewContact.description || "-"}
                </p>
              </div>

            </div>
          </div>
        </div>
      )}


      {/* Delete Modal identical UI */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-80 text-center">
            <h3 className="font-semibold mb-4">
              Are you sure you want to delete {deleteIds.length > 1 ? "selected contacts" : "this contact"}?
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
