// Constants
const API_BASE_URL = '/api';
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

// Utility functions
const getToken = () => localStorage.getItem(TOKEN_KEY);
const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

// Logger
const logger = {
    info: (message, data) => {
        console.log(`[INFO] ${message}`, data);
    },
    error: (message, error) => {
        console.error(`[ERROR] ${message}`, error);
    },
    warn: (message, data) => {
        console.warn(`[WARN] ${message}`, data);
    }
};

// Timeout wrapper
const timeoutPromise = (promise, timeout) => {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout)
        )
    ]);
};

// Retry mechanism
const retryRequest = async (requestFn, retries = MAX_RETRIES) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await requestFn();
        } catch (error) {
            if (i === retries - 1) throw error;
            const delay = Math.pow(2, i) * 1000; // Exponential backoff
            logger.warn(`Request failed, retrying in ${delay}ms...`, { attempt: i + 1, error });
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

const handleResponse = async (response) => {
    try {
        if (response.ok) {
            const data = await response.json();
            logger.info('API call successful', { url: response.url, status: response.status });
            return data;
        }

        if (response.status === 401) {
            logger.warn('Token expired, attempting refresh');
            const refreshed = await refreshToken();
            if (refreshed) {
                logger.info('Token refreshed successfully, retrying request');
                const newResponse = await fetch(response.url, {
                    ...response,
                    headers: {
                        ...response.headers,
                        'Authorization': `Bearer ${getToken()}`
                    }
                });
                return handleResponse(newResponse);
            }
            logger.error('Token refresh failed, redirecting to login');
            window.location.href = '/login';
            return;
        }

        const errorText = await response.text();
        throw new Error(errorText || 'Unknown error occurred');
    } catch (error) {
        logger.error('Response handling failed', error);
        throw error;
    }
};

// Token management
const refreshToken = async () => {
    try {
        logger.info('Attempting token refresh');
        const response = await timeoutPromise(
            fetch(`${API_BASE_URL}/auth/token/refresh/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refresh: getRefreshToken()
                })
            }),
            API_TIMEOUT
        );

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem(TOKEN_KEY, data.access);
            logger.info('Token refreshed successfully');
            return true;
        }
        logger.error('Token refresh failed', { status: response.status });
        return false;
    } catch (error) {
        logger.error('Token refresh error', error);
        return false;
    }
};

// API request wrapper
const apiRequest = async (url, options = {}) => {
    const requestFn = async () => {
        const response = await timeoutPromise(
            fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    'Authorization': `Bearer ${getToken()}`
                }
            }),
            API_TIMEOUT
        );
        return handleResponse(response);
    };

    return retryRequest(requestFn);
};

// Class Management APIs 
export const getClassStats = async () => {
    return apiRequest(`${API_BASE_URL}/teacher/classes/class-stats/`);
};

export const getClassList = async () => {
    return apiRequest(`${API_BASE_URL}/teacher/classes/`);
};

// Score Management APIs
export const getClassScores = async (classId) => {
    return apiRequest(`${API_BASE_URL}/teacher/scores/class-scores/?class_id=${classId}`);
};

export const updateStudentScore = async (scoreId, scoreData) => {
    return apiRequest(`${API_BASE_URL}/teacher/scores/${scoreId}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(scoreData)
    });
};

export const submitBatchScores = async (scores) => {
    return apiRequest(`${API_BASE_URL}/teacher/scores/batch/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ scores })
    });
};

// Analytics APIs
export const getAnalyticsOverview = async () => {
    return apiRequest(`${API_BASE_URL}/teacher/analytics/overview/`);
};

export const getDetailedAnalytics = async (classId) => {
    return apiRequest(`${API_BASE_URL}/teacher/analytics/detailed/?class_id=${classId}`);
};

// Error handling
export const handleApiError = (error) => {
    logger.error('API Error occurred', error);
    
    // Phân loại lỗi
    let message;
    if (error.name === 'TimeoutError' || error.message === 'Request timeout') {
        message = 'Yêu cầu mất quá nhiều thời gian, vui lòng thử lại';
    } else if (error.message.includes('Failed to fetch')) {
        message = 'Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối mạng';
    } else {
        message = error.message || 'Có lỗi xảy ra, vui lòng thử lại sau';
    }

    // Hiển thị thông báo lỗi
    showNotification({
        type: 'error',
        message: message,
        duration: 5000
    });

    // Log chi tiết lỗi
    logger.error('Error details', {
        name: error.name,
        message: error.message,
        stack: error.stack
    });
};