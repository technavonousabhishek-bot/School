import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export interface ExamSubject {
    id?: number;
    subject: number;
    subject_name?: string;
    subject_code?: string;
    max_marks: number;
    exam_date?: string;
    start_time?: string;
    end_time?: string;
}

export interface Exam {
    id?: number;
    name: string;
    exam_type: 'mid_term' | 'final' | 'quiz' | 'assignment' | 'unit_test';
    class_name: number;
    academic_year: string;
    term: string;
    total_marks?: number;
    exam_date: string;
    end_date?: string;
    status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    description?: string;
    instructions?: string;
    subjects?: ExamSubject[];
}

export interface Grade {
    id?: number;
    student: number;
    student_name?: string;
    exam: number;
    subject: number;
    subject_name?: string;
    marks_obtained: number;
    max_marks: number;
    percentage?: number;
    grade?: string;
    remarks?: string;
}

export interface ReportCard {
    id?: number;
    student: number;
    student_name?: string;
    exam: number;
    exam_details?: any;
    grades?: Grade[];
    total_marks: number;
    obtained_marks: number;
    overall_percentage: number;
    overall_grade: string;
    rank?: number;
    created_at?: string;
}

export interface ExamTimetable {
    id?: number;
    exam?: number;
    exam_name?: string;
    title: string;
    description?: string;
    file: File | string;
    file_type?: string;
    uploaded_by?: number;
    uploaded_by_name?: string;
    uploaded_on?: string;
}

// Exam APIs
export const examApi = {
    // Get all exams with optional filters
    getExams: async (params?: {
        class?: number;
        exam_type?: string;
        academic_year?: string;
        status?: string;
    }) => {
        const response = await axios.get(`${API_BASE_URL}/schoolApp/exams/`, { params });
        return response.data;
    },

    // Get single exam
    getExam: async (id: number) => {
        const response = await axios.get(`${API_BASE_URL}/schoolApp/exams/${id}/`);
        return response.data;
    },

    // Create exam
    createExam: async (data: Exam) => {
        const response = await axios.post(`${API_BASE_URL}/schoolApp/exams/`, data);
        return response.data;
    },

    // Update exam
    updateExam: async (id: number, data: Partial<Exam>) => {
        const response = await axios.put(`${API_BASE_URL}/schoolApp/exams/${id}/`, data);
        return response.data;
    },

    // Delete exam
    deleteExam: async (id: number) => {
        await axios.delete(`${API_BASE_URL}/schoolApp/exams/${id}/`);
    },

    // Get subjects for an exam
    getExamSubjects: async (examId: number) => {
        const response = await axios.get(`${API_BASE_URL}/schoolApp/exams/${examId}/subjects/`);
        return response.data;
    },
};

// Marks Entry APIs
export const marksApi = {
    // Bulk create/update marks
    bulkCreateMarks: async (data: {
        exam: number;
        class_name: number;
        marks: Array<{
            student: number;
            subject: number;
            marks_obtained: number;
            max_marks: number;
        }>;
    }) => {
        const response = await axios.post(`${API_BASE_URL}/schoolApp/marks-entry/bulk-create/`, data);
        return response.data;
    },

    // Get marks for exam and class
    getMarks: async (params: { exam: number; class?: number; student?: number }) => {
        const response = await axios.get(`${API_BASE_URL}/schoolApp/marks-entry/`, { params });
        return response.data;
    },

    // Get top performers
    getTopPerformers: async (params: { exam: number; class?: number; limit?: number }) => {
        const response = await axios.get(`${API_BASE_URL}/schoolApp/marks-entry/top-performers/`, {
            params,
        });
        return response.data;
    },
};

// Report Card APIs
export const reportCardApi = {
    // Get all report cards with filters
    getReportCards: async (params?: { student?: number; exam?: number; class?: number }) => {
        const response = await axios.get(`${API_BASE_URL}/schoolApp/report-cards/`, { params });
        return response.data;
    },

    // Get single report card
    getReportCard: async (id: number) => {
        const response = await axios.get(`${API_BASE_URL}/schoolApp/report-cards/${id}/`);
        return response.data;
    },

    // Get report cards by class
    getReportCardsByClass: async (params: { class: number; exam: number }) => {
        const response = await axios.get(`${API_BASE_URL}/schoolApp/report-cards/by-class/`, {
            params,
        });
        return response.data;
    },

    // Get report cards by student
    getReportCardsByStudent: async (studentId: number) => {
        const response = await axios.get(`${API_BASE_URL}/schoolApp/report-cards/by-student/`, {
            params: { student: studentId },
        });
        return response.data;
    },

    // Generate report card
    generateReportCard: async (data: { student: number; exam: number }) => {
        const response = await axios.post(`${API_BASE_URL}/schoolApp/report-cards/generate/`, data);
        return response.data;
    },
};

// Exam Timetable APIs
export const examTimetableApi = {
    // Get all timetables
    getTimetables: async (params?: { exam?: number }) => {
        const response = await axios.get(`${API_BASE_URL}/schoolApp/exam-timetables/`, { params });
        return response.data;
    },

    // Get single timetable
    getTimetable: async (id: number) => {
        const response = await axios.get(`${API_BASE_URL}/schoolApp/exam-timetables/${id}/`);
        return response.data;
    },

    // Upload timetable
    uploadTimetable: async (data: FormData) => {
        const response = await axios.post(`${API_BASE_URL}/schoolApp/exam-timetables/`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Delete timetable
    deleteTimetable: async (id: number) => {
        await axios.delete(`${API_BASE_URL}/schoolApp/exam-timetables/${id}/`);
    },
};
