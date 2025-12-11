/**
 * Centralized API Configuration
 * 
 * This module provides a single source of truth for all backend API endpoints.
 * The base URL is configured via the VITE_API_BASE_URL environment variable.
 */

// Get the base URL from environment variable, with fallback to production
const getBaseUrl = (): string => {
    const envUrl = import.meta.env.VITE_API_BASE_URL;

    // Fallback to production URL if environment variable is not set
    const baseUrl = envUrl || 'https://school-bos-backend.onrender.com';

    // Ensure no trailing slash
    return baseUrl.replace(/\/$/, '');
};

export const API_BASE_URL = getBaseUrl();

/**
 * API endpoint paths organized by feature area
 */
export const API_ENDPOINTS = {
    // Authentication & Account Management
    account: {
        login: `${API_BASE_URL}/Account/login/`,
        register: `${API_BASE_URL}/Account/register/`,
        students: `${API_BASE_URL}/Account/students/`,
        teachers: `${API_BASE_URL}/Account/teachers/`,
    },

    // School App Features
    school: {
        classes: `${API_BASE_URL}/schoolApp/classes/`,
        notices: `${API_BASE_URL}/schoolApp/notices/`,
        books: `${API_BASE_URL}/schoolApp/books/`,
        issued: `${API_BASE_URL}/schoolApp/issued/`,
        issue: `${API_BASE_URL}/schoolApp/issue/`,
        return: `${API_BASE_URL}/schoolApp/return/`,
        homeworks: `${API_BASE_URL}/schoolApp/homeworks/`,
        fee: `${API_BASE_URL}/schoolApp/fee/`,
        buses: `${API_BASE_URL}/schoolApp/buses/`,
        teacherAttendance: `${API_BASE_URL}/schoolApp/teacher-attendance/`,
        markTeacher: `${API_BASE_URL}/schoolApp/mark/teacher/`,
    },
} as const;

/**
 * Helper function to build API URLs with dynamic segments
 * @param baseUrl - The base URL or endpoint
 * @param segments - Additional path segments or query parameters
 * @returns Complete URL string
 */
export const buildApiUrl = (baseUrl: string, ...segments: (string | number)[]): string => {
    const path = segments.map(s => String(s)).join('/');
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return path ? `${cleanBaseUrl}/${path}` : cleanBaseUrl;
};

/**
 * Helper function to get full URL for media files
 * @param relativePath - Relative path from backend (e.g., /media/...)
 * @returns Complete URL string
 */
export const getMediaUrl = (relativePath: string): string => {
    if (!relativePath) return '';

    // If it's already a full URL, return as-is
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
        return relativePath;
    }

    // Ensure the path starts with /
    const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    return `${API_BASE_URL}${path}`;
};

// Export individual base URLs for backward compatibility
export const ACCOUNT_API_BASE = `${API_BASE_URL}/Account`;
export const SCHOOL_API_BASE = `${API_BASE_URL}/schoolApp`;

// Legacy export for files that use API_BASE directly
export const API_BASE = SCHOOL_API_BASE;
