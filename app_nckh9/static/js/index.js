export { UI, Format, Helpers, API } from './utils.js';

// Re-export common constants
export const API_BASE_URL = '/api/v1';
export const DEFAULT_PAGE_SIZE = 10;

// Re-export common types
export const NotificationStatus = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    SCHEDULED: 'scheduled'
};

export const NotificationTarget = {
    ALL: 'all',
    FACULTY: 'faculty',
    CLASS: 'class',
    STUDENT: 'student'
};

// Re-export common configs
export const Config = {
    DATE_FORMAT: {
        FULL: {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        },
        DATE_ONLY: {
            year: 'numeric',
            month: '2-digit', 
            day: '2-digit'
        },
        TIME_ONLY: {
            hour: '2-digit',
            minute: '2-digit'
        }
    },
    DEBOUNCE_DELAY: 300,
    NOTIFICATION_DURATION: 3000,
    CHART_COLORS: {
        primary: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107',
        error: '#F44336'
    }
};