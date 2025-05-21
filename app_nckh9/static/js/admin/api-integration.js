// Constants
const API_BASE_URL = '/api';

// Security configuration
const TOKEN_STORAGE = {
    getToken: () => sessionStorage.getItem(TOKEN_KEY),
    setToken: (token) => sessionStorage.setItem(TOKEN_KEY, token),
    getRefreshToken: () => sessionStorage.getItem(REFRESH_TOKEN_KEY),
    setRefreshToken: (token) => sessionStorage.setItem(REFRESH_TOKEN_KEY, token),
    clearTokens: () => {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    }
};
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Utility functions
// Use secure token storage
const getToken = () => TOKEN_STORAGE.getToken();
const getRefreshToken = () => TOKEN_STORAGE.getRefreshToken();

const handleResponse = async (response) => {
    if (response.ok) {
        return response.json();
    }

    if (response.status === 401) {
        // Token hết hạn, thử refresh
        const refreshed = await refreshToken();
        if (refreshed) {
            // Thử lại request với token mới
            const newResponse = await fetch(response.url, {
                ...response,
                headers: {
                    ...response.headers,
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            return handleResponse(newResponse);
        }
        // Refresh token failed
        window.location.href = '/login';
        return;
    }

    throw new Error(await response.text());
};

// Token management
const refreshToken = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                refresh: getRefreshToken()
            })
        });

        if (response.ok) {
            const data = await response.json();
            TOKEN_STORAGE.setToken(data.access);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error refreshing token:', error);
        return false;
    }
};

// User Management APIs
export const getAllUsers = async () => {
    const response = await fetch(`${API_BASE_URL}/admin/users/`, {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    });
    return handleResponse(response);
};

export const createUser = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });
    return handleResponse(response);
};

export const updateUserRole = async (userId, role) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/change-role/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role })
    });
    return handleResponse(response);
};

// Scoring Rules Management APIs
export const getScoringRules = async () => {
    const response = await fetch(`${API_BASE_URL}/admin/rules/`, {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    });
    return handleResponse(response);
};

export const updateScoringRules = async (rules) => {
    const response = await fetch(`${API_BASE_URL}/admin/rules/update-rules/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rules })
    });
    return handleResponse(response);
};

// Batch Approval APIs
export const getPendingApprovals = async () => {
    const response = await fetch(`${API_BASE_URL}/admin/approvals/`, {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    });
    return handleResponse(response);
};

export const approveBatch = async (studentIds, action) => {
    const response = await fetch(`${API_BASE_URL}/admin/approvals/approve-batch/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            student_ids: studentIds,
            action: action // 'approve' or 'reject'
        })
    });
    return handleResponse(response);
};

// Error handling
// Notification system
const showNotification = (options) => {
    const toast = document.querySelector('#toast-container') || createToastContainer();
    const notification = document.createElement('div');
    notification.className = `toast toast-${options.type}`;
    notification.textContent = options.message;
    toast.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
};

const createToastContainer = () => {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    return container;
};

export const handleApiError = (error) => {
    console.error('API Error:', error);
    const message = error.message || 'Có lỗi xảy ra, vui lòng thử lại sau';
    
    // Implement retry logic for network errors
    if (error.name === 'NetworkError') {
        setTimeout(() => {
            return retryRequest(error.request);
        }, 1000);
    }
    
    showNotification({
        type: 'error',
        message: message
    });
};

// Retry failed requests
const retryRequest = async (request, retryCount = 3) => {
    try {
        const response = await fetch(request);
        return handleResponse(response);
    } catch (error) {
        if (retryCount > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return retryRequest(request, retryCount - 1);
        }
        throw error;
    }
};