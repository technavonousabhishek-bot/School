import { useState } from "react";
import { useParams } from "react-router-dom";
import { students } from "./data";
import AttendanceDetailsModal from "./AttendanceDetailsModal";

export default function StudentList() {
  const { className } = useParams();
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<typeof students[number] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredStudents = students.filter(
    (stu) =>
      stu.class === className &&
      (stu.name.toLowerCase().includes(search.toLowerCase()) ||
        stu.enrollmentNo.toLowerCase().includes(search.toLowerCase()))
  );

// Load jsPDF from CDN if not already available. Returns the jsPDF class.
async function loadJsPDF(): Promise<any> {
  if (typeof window === "undefined") return null;
  const win = window as any;
  if (win.jspdf && win.jspdf.jsPDF) return win.jspdf.jsPDF;
  if (win.jsPDF) return win.jsPDF;

  return new Promise((resolve, reject) => {
    const src = "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js";
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      const pdfCtor = (window as any).jspdf?.jsPDF || (window as any).jsPDF;
      if (pdfCtor) resolve(pdfCtor);
      else reject(new Error("jsPDF failed to load from CDN"));
    };
    script.onerror = () => reject(new Error("Failed to load jsPDF script"));
    document.head.appendChild(script);
  });
}

  return (
    <main className="flex-1 p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        {className} — Attendance
      </h1>

      {/* Search and Export Controls */}
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search by name or enrollment no."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-md w-1/2 shadow-sm focus:ring-2 focus:ring-blue-500"
        />
          <div className="flex gap-2">
            <button
              onClick={async () => {
                // Build headers and rows
                const headers = ["#","Name","Father's Name","Class","Section","Enrollment No","Attendance %"];
                const rows = filteredStudents.map((s, i) => [
                  String(i + 1),
                  s.name,
                  s.fatherName,
                  s.class,
                  s.section,
                  s.enrollmentNo,
                  String(s.attendance) + "%",
                ]);

                try {
                  const jsPDFCtor = (window as any).jspdf?.jsPDF || (window as any).jsPDF || await loadJsPDF();
                  const doc = new jsPDFCtor({ unit: 'pt', format: 'a4' });
                  const margin = 40;
                  const pageWidth = doc.internal.pageSize.getWidth();
                  const pageHeight = doc.internal.pageSize.getHeight();
                  const usableWidth = pageWidth - margin * 2;
                  const colWidth = usableWidth / headers.length;
                  let y = margin + 20;

                  // Title
                  doc.setFontSize(14);
                  doc.text(`${className || 'Students'} - Attendance`, margin, y);
                  y += 24;

                  doc.setFontSize(10);
                  // Header row
                  headers.forEach((h, i) => {
                    const x = margin + i * colWidth + 2;
                    doc.text(String(h), x, y);
                  });
                  y += 18;

                  // Rows
                  for (let r = 0; r < rows.length; r++) {
                    const row = rows[r];
                    // page break
                    if (y > pageHeight - margin - 20) {
                      doc.addPage();
                      y = margin;
                    }
                    row.forEach((cell, i) => {
                      const x = margin + i * colWidth + 2;
                      doc.text(String(cell), x, y);
                    });
                    y += 16;
                  }

                  const fileName = `${(className || 'students').replace(/\s+/g, '_')}_attendance.pdf`;
                  doc.save(fileName);
                } catch (err) {
                  // Fallback: open print view if jsPDF isn't available
                  const tableHtml = `\n                <html>\n                  <head>\n                    <title>${className || "Students"} - Attendance</title>\n                    <style>table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:8px;text-align:left}</style>\n                  </head>\n                  <body>\n                    <h2>${className || "Students"} - Attendance</h2>\n                    <table>\n                      <thead>\n                        <tr>\n                          <th>#</th>\n                          <th>Name</th>\n                          <th>Father's Name</th>\n                          <th>Class</th>\n                          <th>Section</th>\n                          <th>Enrollment No</th>\n                          <th>Attendance %</th>\n                        </tr>\n                      </thead>\n                      <tbody>\n                        ${filteredStudents.map((s,i)=>`<tr><td>${i+1}</td><td>${s.name}</td><td>${s.fatherName}</td><td>${s.class}</td><td>${s.section}</td><td>${s.enrollmentNo}</td><td>${s.attendance}%</td></tr>`).join('')}\n                      </tbody>\n                    </table>\n                  </body>\n                </html>\n              `;
                  const newWindow = window.open("", "_blank", "noopener,noreferrer");
                  if (newWindow) {
                    newWindow.document.open();
                    newWindow.document.write(tableHtml);
                    newWindow.document.close();
                    setTimeout(() => newWindow.print(), 300);
                  }
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Export PDF
            </button>

            <button
              onClick={() => {
                // CSV export (works with Excel)
                const headers = ["#","Name","Father's Name","Class","Section","Enrollment No","Attendance %"];
                const rows = filteredStudents.map((s, i) => [
                  String(i + 1),
                  s.name,
                  s.fatherName,
                  s.class,
                  s.section,
                  s.enrollmentNo,
                  String(s.attendance),
                ]);
                const csvContent = [headers, ...rows]
                  .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
                  .join("\n");

                const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${(className || "students").replace(/\s+/g, "_")}_attendance.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Export Excel
            </button>
          </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md border">
        <table className="w-full text-left border-collapse">
          <thead className="bg-blue-100">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">Father’s Name</th>
              <th className="p-3">Class</th>
              <th className="p-3">Section</th>
              <th className="p-3">Enrollment No</th>
              <th className="p-3 text-center">Attendance %</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map((stu, index) => (
              <tr key={stu.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{stu.name}</td>
                <td className="p-3">{stu.fatherName}</td>
                <td className="p-3">{stu.class}</td>
                <td className="p-3">{stu.section}</td>
                <td className="p-3">{stu.enrollmentNo}</td>

                {/* Color coded attendance */}
                <td
                  className={`p-3 text-center font-semibold ${
                    stu.attendance >= 75
                      ? "text-green-600"
                      : stu.attendance >= 50
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {stu.attendance}%
                </td>

                <td className="p-3 text-center">
                  <button
                    onClick={() => {
                      setSelectedStudent(stu);
                      setModalOpen(true);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}

            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center p-6 text-gray-500">
                  No students found for this class.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      <AttendanceDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        student={selectedStudent}
      />
    </main>
  );
}
