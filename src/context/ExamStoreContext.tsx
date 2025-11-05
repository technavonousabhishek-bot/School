import React, { createContext, useContext, useEffect, useState } from "react";

export type ExamRecord = {
  id: number;
  exam_name: string;
  type: "mid-term" | "annual";
  subjects: { subject: string; exam_date: string; start_time: string; end_time: string; max_marks: number }[];
};

type StoreShape = {
  // map of classId -> exams
  exams: Record<number, ExamRecord[]>;
  addExam: (classId: number, exam: Omit<ExamRecord, "id">) => void;
  updateExam: (classId: number, examId: number, updates: Partial<Omit<ExamRecord, "id">>) => void;
  deleteExam: (classId: number, examId: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "school_exam_store_v1";

const ExamStoreContext = createContext<StoreShape | null>(null);

export const ExamStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [exams, setExams] = useState<Record<number, ExamRecord[]>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Local-only persistence: store and update exams in localStorage.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
    } catch {
      // ignore
    }
  }, [exams]);

  const addExam = (classId: number, exam: Omit<ExamRecord, "id">) => {
    setExams((prev) => {
      const list = prev[classId] ?? [];
      const newExam: ExamRecord = { id: Date.now(), ...exam };
      const updated = { ...prev, [classId]: [...list, newExam] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const updateExam = (classId: number, examId: number, updates: Partial<Omit<ExamRecord, "id">>) => {
    setExams((prev) => {
      const updated = {
        ...prev,
        [classId]: (prev[classId] || []).map((e) => (e.id === examId ? { ...e, ...updates } : e)),
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const deleteExam = (classId: number, examId: number) => {
    setExams((prev) => {
      const updated = { ...prev, [classId]: (prev[classId] || []).filter((e) => e.id !== examId) };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clear = () => setExams({});

  return (
    <ExamStoreContext.Provider value={{ exams, addExam, updateExam, deleteExam, clear }}>
      {children}
    </ExamStoreContext.Provider>
  );
};

export function useExamStore() {
  const ctx = useContext(ExamStoreContext);
  if (!ctx) throw new Error("useExamStore must be used within ExamStoreProvider");
  return ctx;
}
