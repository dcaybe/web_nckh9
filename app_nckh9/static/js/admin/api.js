// API Base URL
const API_BASE_URL = '/main/api';

// Token management
function getAccessToken() {
    return localStorage.getItem('access_token');
}

function getRefreshToken() {
    return localStorage.getItem('refresh_token');
}

function setTokens(access, refresh) {
    localStorage.setItem('access_token', access);
    if (refresh) {
        localStorage.setItem('refresh_token', refresh);
    }
}

function clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
}

// Refresh token handler
async function refreshAccessToken() {
    const refresh = getRefreshToken();
    if (!refresh) {
        throw new Error('No refresh token available');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refresh })
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        if (data.access) {
            setTokens(data.access, data.refresh);
            return data.access;
        } else {
            throw new Error('Invalid token response');
        }
    } catch (error) {
        console.error('Token refresh failed:', error);
        clearTokens();
        window.location.href = '/main/login/';
        throw error;
    }
}

// API request handler with JWT
async function fetchAPI(endpoint, options = {}) {
    const defaultHeaders = {
        'Content-Type': 'application/json'
    };

    // First attempt with access token
    let token = getAccessToken();
    if (token) {
        defaultHeaders.Authorization = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        });

        // Handle token expiration
        if (response.status === 401) {
            try {
                const errorData = await response.json();
                
                // Check specific error code for token expiration
                if (errorData.code === 'token_not_valid' && getRefreshToken()) {
                    // Try to refresh the token
                    token = await refreshAccessToken();
                    
                    // Retry the original request with new token
                    const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
                        ...options,
                        headers: {
                            ...defaultHeaders,
                            Authorization: `Bearer ${token}`,
                            ...options.headers
                        }
                    });

                    if (!retryResponse.ok) {
                        const retryErrorData = await retryResponse.json();
                        throw new Error(retryErrorData.detail || 'Request failed after token refresh');
                    }

                    return await retryResponse.json();
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                clearTokens();
                window.location.href = '/main/login/';
                throw refreshError;
            }

            // If we get here, it's an authentication error other than token expiration
            clearTokens();
            window.location.href = '/main/login/';
            return;
        }

        // Handle other error responses
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'API request failed');
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        if (error.message === 'Failed to refresh token') {
            clearTokens();
            window.location.href = '/main/login/';
        }
        throw error;
    }
}

// Loading state handler
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('loading');
        // Disable any interactive elements
        const interactiveElements = element.querySelectorAll('button, input, select');
        interactiveElements.forEach(el => el.disabled = true);
    }
}

function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('loading');
        // Re-enable interactive elements
        const interactiveElements = element.querySelectorAll('button, input, select');
        interactiveElements.forEach(el => el.disabled = false);
    }
}

// Error handling with retry support
async function handleError(error, retryCallback = null) {
    console.error('Error occurred:', error);

    if (retryCallback) {
        const shouldRetry = confirm('Có lỗi xảy ra. Bạn có muốn thử lại không?');
        if (shouldRetry) {
            return await retryCallback();
        }
    }

    showNotification('error', error.message || 'Có lỗi xảy ra, vui lòng thử lại');
}

// Retry logic with exponential backoff
async function retryOperation(operation, maxRetries = 3, initialDelay = 1000) {
    let delay = initialDelay;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            
            // Exponential backoff with jitter
            await new Promise(resolve => setTimeout(resolve, delay + Math.random() * 1000));
            delay *= 2;
        }
    }
}

// Export & Sync Operations
async function initiateExport(options) {
    try {
        return await fetchAPI('/export/initiate/', {
            method: 'POST',
            body: JSON.stringify(options)
        });
    } catch (error) {
        throw new Error('Không thể khởi tạo export: ' + error.message);
    }
}

async function checkExportProgress(taskId) {
    try {
        return await fetchAPI(`/export/${taskId}/progress/`);
    } catch (error) {
        throw new Error('Không thể kiểm tra tiến trình export: ' + error.message);
    }
}

async function downloadExport(taskId) {
    const token = getAccessToken();
    try {
        const response = await fetch(`${API_BASE_URL}/export/${taskId}/download/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            const newToken = await refreshAccessToken();
            return await downloadExportWithToken(taskId, newToken);
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Lỗi khi tải xuống file');
        }

        await handleFileDownload(response, taskId);
    } catch (error) {
        throw new Error('Không thể tải xuống file: ' + error.message);
    }
}

async function downloadExportWithToken(taskId, token) {
    const response = await fetch(`${API_BASE_URL}/export/${taskId}/download/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Lỗi khi tải xuống file');
    }

    await handleFileDownload(response, taskId);
}

async function handleFileDownload(response, taskId) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `export_${taskId}.${getFileExtension(response.headers.get('Content-Type'))}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Helper function for file extension
function getFileExtension(contentType) {
    const mimeTypes = {
        'application/pdf': 'pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        'text/csv': 'csv',
        'application/json': 'json'
    };
    return mimeTypes[contentType] || 'txt';
}

// Export functions
export {
    fetchAPI,
    showLoading,
    hideLoading,
    handleError,
    retryOperation,
    initiateExport,
    checkExportProgress,
    downloadExport
};