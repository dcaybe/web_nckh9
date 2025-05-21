document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const allNotifications = document.querySelectorAll('.notification-item');

    // Đếm số lượng thông báo cần xử lý (status-badge warning)
    const warningCount = document.querySelectorAll('.status-badge.warning').length;
    document.querySelector('.tab-btn[data-tab="unread"] .badge').textContent = warningCount;

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterType = button.getAttribute('data-tab');
            filterNotifications(filterType);
        });
    });

    function filterNotifications(filterType) {
        allNotifications.forEach(notification => {
            const statusBadge = notification.querySelector('.status-badge');
            
            notification.style.display = 'none';
            notification.style.animation = '';

            switch(filterType) {
                case 'all':
                    notification.style.display = 'flex';
                    break;
                case 'unread': // Thay đổi logic cho unread để hiển thị thông báo warning
                    if (statusBadge && statusBadge.classList.contains('warning')) {
                        notification.style.display = 'flex';
                    }
                    break;
                case 'important':
                    if (statusBadge && statusBadge.classList.contains('important')) {
                        notification.style.display = 'flex';
                    }
                    break;
                case 'scheduled':
                    if (statusBadge && statusBadge.classList.contains('scheduled')) {
                        notification.style.display = 'flex';
                    }
                    break;
            }

            if (notification.style.display === 'flex') {
                notification.style.animation = 'fadeIn 0.3s ease-out forwards';
            }
        });

        updateNotificationCount();
    }

    function updateNotificationCount() {
        const visibleCount = document.querySelectorAll('.notification-item[style="display: flex;"]').length;
        const totalCount = allNotifications.length;
        
        const pageInfo = document.querySelector('.page-info');
        if (pageInfo) {
            pageInfo.textContent = `Hiển thị ${visibleCount} trong tổng số ${totalCount} thông báo`;
        }
    }

    // Set default view to 'all' notifications
    document.querySelector('.tab-btn[data-tab="all"]').click();
});

// Add animation styles
const styles = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Khởi tạo các thành phần
function initializeNotifications() {
    setupFilters();
    setupModal();
    setupPagination();
}

// Thiết lập bộ lọc
function setupFilters() {
    const filters = {
        type: document.getElementById('notificationTypeFilter'),
        status: document.getElementById('statusFilter'),
        startDate: document.getElementById('startDate'),
        endDate: document.getElementById('endDate')
    };

    // Set default dates
    const today = new Date();
    filters.endDate.value = today.toISOString().split('T')[0];
    filters.startDate.value = new Date(today.setMonth(today.getMonth() - 1)).toISOString().split('T')[0];

    // Add event listeners for real-time filtering
    Object.values(filters).forEach(filter => {
        filter.addEventListener('change', debounce(applyFilters, 300));
    });
}

// Áp dụng bộ lọc
function applyFilters() {
    const filters = {
        type: document.getElementById('notificationTypeFilter').value,
        status: document.getElementById('statusFilter').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value
    };

    loadNotifications(filters);
}

// Đặt lại bộ lọc
function resetFilters() {
    document.getElementById('notificationTypeFilter').value = '';
    document.getElementById('statusFilter').value = '';
    const today = new Date();
    document.getElementById('endDate').value = today.toISOString().split('T')[0];
    document.getElementById('startDate').value = new Date(today.setMonth(today.getMonth() - 1)).toISOString().split('T')[0];
    
    applyFilters();
}

// Tải danh sách thông báo
async function loadNotifications(filters = {}) {
    try {
        showLoader();
        const notifications = await fetchNotifications(filters);
        displayNotifications(notifications);
        updatePagination(notifications.totalPages);
    } catch (error) {
        showError('Không thể tải thông báo');
    } finally {
        hideLoader();
    }
}

// Enhanced notification display
function displayNotifications(data) {
    const container = document.getElementById('notificationsList');
    const template = document.getElementById('notification-template');
    
    if (!data.notifications || data.notifications.length === 0) {
        container.innerHTML = '<div class="empty-state">Không có thông báo nào</div>';
        return;
    }

    container.innerHTML = '';
    data.notifications.forEach(notification => {
        const element = template.content.cloneNode(true);
        const item = element.querySelector('.notification-item');
        
        // Set notification type class
        item.classList.add(notification.type);
        
        // Set icon
        item.querySelector('.notification-icon i').className = getNotificationIconClass(notification.type);
        
        // Set header content
        item.querySelector('h4').textContent = notification.title;
        item.querySelector('.status-badge').textContent = getStatusText(notification.status);
        item.querySelector('.status-badge').classList.add(notification.status);
        item.querySelector('.date').innerHTML = `<i class="far fa-clock"></i> ${formatDate(notification.date)}`;
        
        // Set body content
        item.querySelector('.content').textContent = notification.content;
        
        // Set targets
        const targetList = item.querySelector('.target-list');
        notification.targets.forEach(target => {
            const badge = document.createElement('span');
            badge.className = 'target-badge';
            badge.textContent = target;
            targetList.appendChild(badge);
        });
        
        // Set stats
        item.querySelector('.views .count').textContent = notification.views || 0;
        item.querySelector('.responses .count').textContent = notification.responses || 0;
        
        // Set up action buttons
        item.querySelector('.edit').onclick = () => editNotification(notification);
        item.querySelector('.delete').onclick = () => deleteNotification(notification.id);
        
        container.appendChild(element);
    });
}

// Quản lý Modal
function setupModal() {
    const modal = document.getElementById('notificationModal');
    const createBtn = document.getElementById('createNotificationBtn');
    
    createBtn.addEventListener('click', () => {
        openModal();
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Setup target selection
    setupTargetSelection();
}

// Xử lý target selection
function setupTargetSelection() {
    setupSelectAllButtons();
    setupTargetDependencies();
}

function setupSelectAllButtons() {
    document.querySelector('.target-actions').innerHTML = `
        <button type="button" class="btn btn-outline" onclick="selectAllTargets()">
            <i class="fas fa-check-square"></i> Chọn tất cả
        </button>
        <button type="button" class="btn btn-outline" onclick="clearAllTargets()">
            <i class="fas fa-square"></i> Bỏ chọn tất cả
        </button>
    `;
}

// Xử lý thông báo
async function saveNotification(formData) {
    try {
        showLoader();
        const response = await sendNotification(formData);
        if (response.success) {
            showSuccess('Đã lưu thông báo thành công');
            closeModal();
            loadNotifications();
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        showError(error.message || 'Không thể lưu thông báo');
    } finally {
        hideLoader();
    }
}

// Hàm tiện ích
function getNotificationIcon(type) {
    const icons = {
        announcement: '<i class="fas fa-bullhorn"></i>',
        deadline: '<i class="fas fa-clock"></i>',
        reminder: '<i class="fas fa-bell"></i>',
        warning: '<i class="fas fa-exclamation-triangle"></i>'
    };
    return icons[type] || icons.announcement;
}

function getStatusText(status) {
    const statusMap = {
        active: 'Đang hoạt động',
        scheduled: 'Đã lên lịch',
        expired: 'Đã hết hạn'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleString('vi-VN', options);
}

function formatTargets(targets) {
    if (!targets || targets.length === 0) return 'Tất cả';
    if (targets.length > 2) return `${targets[0]}, ${targets[1]} +${targets.length - 2}`;
    return targets.join(', ');
}

// API calls mô phỏng
async function fetchNotifications(filters) {
    // Simulated API call
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                notifications: [
                    {
                        id: 1,
                        title: 'Thông báo chấm điểm đợt 1',
                        type: 'deadline',
                        content: 'Hạn chót nộp điểm rèn luyện đợt 1: 30/03/2024',
                        date: '2024-02-15T10:00:00',
                        status: 'active',
                        targets: ['IT001', 'IT002']
                    },
                    // More notifications...
                ],
                totalPages: 5,
                currentPage: 1
            });
        }, 500);
    });
}

async function sendNotification(data) {
    // Simulated API call
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ success: true, message: 'Notification saved successfully' });
        }, 1000);
    });
}

// UI Helpers
function showLoader() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    document.body.appendChild(loader);
}

function hideLoader() {
    const loader = document.querySelector('.loader');
    if (loader) loader.remove();
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimization: Add debounced search
const debouncedSearch = debounce((searchTerm) => {
    loadNotifications({ search: searchTerm });
}, 300);

// Optimization: Add intersection observer for lazy loading
const observeElements = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.notification-item').forEach(item => {
        observer.observe(item);
    });
};

// Optimization: Add virtual scrolling for large lists
class VirtualScroller {
    constructor(container, items, rowHeight) {
        this.container = container;
        this.items = items;
        this.rowHeight = rowHeight;
        this.visibleItems = 20;
        this.setupScroller();
    }

    setupScroller() {
        // Implementation details...
    }
}

// Optimization: Enhance form validation
function validateNotificationForm(formData) {
    const errors = [];
    if (!formData.title?.trim()) {
        errors.push('Tiêu đề không được để trống');
    }
    // More validation rules...
    return errors;
}

// Simplified notification deletion
function deleteNotification(id) {
    if (confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
        // Call API to delete notification
        showToast('Đã xóa thông báo thành công', 'success');
        loadNotifications();
    }
}

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toastNotification');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}