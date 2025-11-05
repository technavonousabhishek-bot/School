import { useState } from "react";
import { useParams } from "react-router-dom";
import { teachers } from "./data";
import AttendanceDetailsModal from "./AttendanceDetailsModal";

export default function TeacherList() {
  const { className } = useParams();
  const [search, setSearch] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<typeof teachers[number] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredTeachers = teachers.filter(
    (t) =>
      // If className is provided, filter by class; otherwise show all teachers
      (className ? t.class === className : true) &&
      (t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.cno.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <main className="flex-1 p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        {className} — Teachers Attendance
      </h1>

      {/* Search and Export Controls */}
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search by name or code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-md w-1/2 shadow-sm focus:ring-2 focus:ring-green-500"
        />
        <div className="flex gap-2">
          <button
            onClick={async () => {
              const headers = ["#","Name","Designation","Subject","Class","Code","Attendance %"];
              const rows = filteredTeachers.map((t, i) => [
                String(i + 1),
                t.name,
                t.designation,
                t.subject,
                t.class,
                t.cno,
                String(t.attendance) + "%",
              ]);

              try {
                const jsPDFCtor = (window as any).jspdf?.jsPDF || (window as any).jsPDF || await (async function loadJsPDF(){
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
                })();

                const doc = new jsPDFCtor({ unit: 'pt', format: 'a4' });
                const margin = 40;
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                const usableWidth = pageWidth - margin * 2;
                const colWidth = usableWidth / headers.length;
                let y = margin + 20;

                doc.setFontSize(14);
                doc.text(`${className || 'Teachers'} - Attendance`, margin, y);
                y += 24;

                doc.setFontSize(10);
                headers.forEach((h, i) => {
                  const x = margin + i * colWidth + 2;
                  doc.text(String(h), x, y);
                });
                y += 18;

                for (let r = 0; r < rows.length; r++) {
                  const row = rows[r];
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

                const fileName = `${(className || 'teachers').replace(/\s+/g, '_')}_attendance.pdf`;
                doc.save(fileName);
              } catch (err) {
                const tableHtml = `\n                <html>\n                  <head>\n                    <title>${className || "Teachers"} - Attendance</title>\n                    <style>table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:8px;text-align:left}</style>\n                  </head>\n                  <body>\n                    <h2>${className || "Teachers"} - Attendance</h2>\n                    <table>\n                      <thead>\n                        <tr>\n                          <th>#</th>\n                          <th>Name</th>\n                          <th>Designation</th>\n                          <th>Subject</th>\n                          <th>Class</th>\n                          <th>Code</th>\n                          <th>Attendance %</th>\n                        </tr>\n                      </thead>\n                      <tbody>\n                        ${filteredTeachers.map((t,i)=>`<tr><td>${i+1}</td><td>${t.name}</td><td>${t.designation}</td><td>${t.subject}</td><td>${t.class}</td><td>${t.cno}</td><td>${t.attendance}%</td></tr>`).join('')}\n                      </tbody>\n                    </table>\n                  </body>\n                </html>\n              `;
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
              const headers = ["#","Name","Designation","Subject","Class","Code","Attendance %"];
              const rows = filteredTeachers.map((t, i) => [
                String(i + 1),
                t.name,
                t.designation,
                t.subject,
                t.class,
                t.cno,
                String(t.attendance),
              ]);
              const csvContent = [headers, ...rows]
                .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
                .join("\n");

              const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${(className || "teachers").replace(/\s+/g, "_")}_attendance.csv`;
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

      {/* Teachers Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md border">
        <table className="w-full text-left border-collapse">
          <thead className="bg-green-100">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">Designation</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Class</th>
              <th className="p-3">Code</th>
              <th className="p-3 text-center">Attendance %</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredTeachers.map((t, index) => (
              <tr key={t.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{t.name}</td>
                <td className="p-3">{t.designation}</td>
                <td className="p-3">{t.subject}</td>
                <td className="p-3">{t.class}</td>
                <td className="p-3">{t.cno}</td>

                <td
                  className={`p-3 text-center font-semibold ${
                    t.attendance >= 75
                      ? "text-green-600"
                      : t.attendance >= 50
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {t.attendance}%
                </td>

                <td className="p-3 text-center">
                  <button
                    onClick={() => {
                      setSelectedTeacher(t);
                      setModalOpen(true);
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}

            {filteredTeachers.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center p-6 text-gray-500">
                  No teachers found for this class.
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
        student={selectedTeacher}
      />
    </main>
  );
}
