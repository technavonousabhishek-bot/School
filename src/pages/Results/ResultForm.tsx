import { useState } from "react";

export interface ResultType {
  id?: number;
  className: string;
  examType: string;
  totalStudents: number;
  averageScore: number;
  date: string;
}

interface ResultFormProps {
  onSubmit: (result: ResultType) => void;
  onClose: () => void;
}

export default function ResultForm({ onSubmit, onClose }: ResultFormProps) {
  const [formData, setFormData] = useState<ResultType>({
    className: "",
    examType: "",
    totalStudents: 0,
    averageScore: 0,
    date: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Add New Result</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">Class Name</label>
        <input
          type="text"
          name="className"
          value={formData.className}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 mt-1"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Exam Type</label>
        <select
          name="examType"
          value={formData.examType}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 mt-1"
          required
        >
          <option value="">Select Exam</option>
          <option value="Mid Term">Mid Term</option>
          <option value="Final Term">Final Term</option>
          <option value="Annual Exam">Annual Exam</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Total Students</label>
          <input
            type="number"
            name="totalStudents"
            value={formData.totalStudents}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 mt-1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Average Score</label>
          <input
            type="number"
            name="averageScore"
            value={formData.averageScore}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 mt-1"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Exam Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 mt-1"
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </form>
  );
}
