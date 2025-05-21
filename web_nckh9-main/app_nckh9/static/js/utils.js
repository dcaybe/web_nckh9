// UI Helpers
const UI = {
    showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    },

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    },

    showNotification(type, message, duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, duration);
    },

    showLoader() {
        const loader = document.createElement('div');
        loader.className = 'loader';
        loader.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(loader);
    },

    hideLoader() {
        const loader = document.querySelector('.loader');
        if (loader) {
            loader.remove();
        }
    },

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    }
};

// Format Helpers 
const Format = {
    date(dateStr, options = {}) {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            ...options
        }).format(date);
    },

    status(status) {
        const statusMap = {
            active: 'Hoạt động',
            inactive: 'Vô hiệu',
            pending: 'Chờ duyệt',
            approved: 'Đã duyệt',
            rejected: 'Từ chối'
        };
        return statusMap[status] || status;
    },

    role(role) {
        const roleMap = {
            admin: 'Quản trị viên',
            teacher: 'Giáo viên',
            student: 'Sinh viên'
        };
        return roleMap[role] || role;
    },

    target(target) {
        const targetMap = {
            all: 'Tất cả',
            faculty: 'Khoa',
            class: 'Lớp',
            student: 'Sinh viên'
        };
        return targetMap[target] || target;
    },

    points(points) {
        return parseFloat(points).toFixed(1);
    }
};

// Function Helpers
const Helpers = {
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle(func, limit = 300) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    validateForm(formData, rules) {
        const errors = [];
        for (const [field, value] of formData.entries()) {
            if (rules[field]) {
                const fieldRules = rules[field];
                if (fieldRules.required && !value) {
                    errors.push(`${fieldRules.label || field} là bắt buộc`);
                }
                if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
                    errors.push(`${fieldRules.label || field} không hợp lệ`);
                }
            }
        }
        return errors;
    }
};

// API Helpers
const API = {
    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Có lỗi xảy ra');
        }
        return response.json();
    },

    async fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem('access_token');
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
        const response = await fetch(url, {...defaultOptions, ...options});
        return this.handleResponse(response);
    }
};

export { UI, Format, Helpers, API };