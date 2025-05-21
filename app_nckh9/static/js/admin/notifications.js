import { UI, Format, Helpers, API } from '../utils.js';

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadNotifications();
});

function setupEventListeners() {
    // Filter handlers
    document.getElementById('targetType').addEventListener('change', handleTargetChange);
    document.getElementById('statusFilter').addEventListener('change', filterNotifications); 
    document.getElementById('searchInput').addEventListener('input', Helpers.debounce(filterNotifications, 300));
}

function handleTargetChange(event) {
    const targetDetails = document.getElementById('targetDetails');
    const target = event.target.value;
    targetDetails.innerHTML = generateTargetSelectionFields(target);
}

function generateTargetSelectionFields(target) {
    const options = {
        faculty: [
            { value: 'cntt', label: 'Công nghệ thông tin' },
            { value: 'ddt', label: 'Điện - Điện tử' },
            { value: 'ck', label: 'Cơ khí' }
        ],
        class: [
            { value: 'cntt1', label: 'CNTT1' },
            { value: 'cntt2', label: 'CNTT2' },
            { value: 'ddt1', label: 'DDT1' }
        ]
    };

    if (options[target]) {
        const optionsHtml = options[target]
            .map(opt => `<option value="${opt.value}">${opt.label}</option>`)
            .join('');
            
        return `
            <div class="form-group">
                <label>Chọn ${Format.target(target)}:</label>
                <select class="form-control" multiple>
                    ${optionsHtml}
                </select>
            </div>
        `;
    }
    return '';
}

function openCreateNotification() {
    document.getElementById('modalTitle').textContent = 'Tạo thông báo mới';
    document.getElementById('notificationForm').reset();
    UI.showModal('notificationModal');
}

async function editNotification(id) {
    try {
        document.getElementById('modalTitle').textContent = 'Chỉnh sửa thông báo';
        
        const notification = await API.fetchWithAuth(`/api/notifications/${id}`);
        if (notification) {
            fillNotificationForm(notification);
        }
        
        UI.showModal('notificationModal');
    } catch (error) {
        UI.showNotification('error', error.message);
    }
}

function fillNotificationForm(notification) {
    const form = document.getElementById('notificationForm');
    Object.keys(notification).forEach(key => {
        const input = form.elements[key];
        if (input) {
            input.value = notification[key];
        }
    });
}

async function handleNotificationSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        UI.showLoader();
        await API.fetchWithAuth('/api/notifications', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        UI.showNotification('success', 'Thông báo đã được lưu thành công!');
        UI.closeModal('notificationModal');
        loadNotifications();
    } catch (error) {
        UI.showNotification('error', error.message);
    } finally {
        UI.hideLoader();
    }
}

async function saveAsDraft() {
    const form = document.getElementById('notificationForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.status = 'draft';
    
    try {
        UI.showLoader();
        await API.fetchWithAuth('/api/notifications/draft', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        UI.showNotification('success', 'Thông báo đã được lưu như bản nháp');
        UI.closeModal('notificationModal');
        loadNotifications();
    } catch (error) {
        UI.showNotification('error', error.message);
    } finally {
        UI.hideLoader();
    }
}

async function deleteNotification(id) {
    if (confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
        try {
            UI.showLoader();
            await API.fetchWithAuth(`/api/notifications/${id}`, {
                method: 'DELETE'
            });
            UI.showNotification('success', 'Thông báo đã được xóa');
            loadNotifications();
        } catch (error) {
            UI.showNotification('error', error.message);
        } finally {
            UI.hideLoader();
        }
    }
}

async function viewStats(id) {
    try {
        UI.showLoader();
        const stats = await API.fetchWithAuth(`/api/notifications/${id}/stats`);
        
        UI.showModal('statsModal');
        document.getElementById('statsContent').innerHTML = generateStatsHtml(stats);
        
        initializeStatsCharts(stats);
    } catch (error) {
        UI.showNotification('error', error.message);
    } finally {
        UI.hideLoader();
    }
}

function generateStatsHtml(stats) {
    return `
        <div class="stats-grid">
            <div class="stat-card">
                <h4>Tổng số người nhận</h4>
                <p class="stat-number">${stats.total}</p>
            </div>
            <div class="stat-card">
                <h4>Đã đọc</h4>
                <p class="stat-number">${stats.read} (${Math.round(stats.read/stats.total*100)}%)</p>
            </div>
            <div class="stat-card">
                <h4>Tương tác</h4>
                <p class="stat-number">
                    Clicks: ${stats.engagement.clicks}<br>
                    Phản hồi: ${stats.engagement.responses}
                </p>
            </div>
            <div class="stat-card">
                <h4>Thời gian trung bình</h4>
                <p class="stat-number">${stats.averageReadTime}s</p>
            </div>
        </div>
        <div class="chart-container">
            <canvas id="viewsChart"></canvas>
        </div>
    `;
}

function initializeStatsCharts(stats) {
    const ctx = document.getElementById('viewsChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: stats.timeline.map(t => Format.date(t.date, { 
                day: '2-digit',
                month: '2-digit'
            })),
            datasets: [{
                label: 'Lượt xem',
                data: stats.timeline.map(t => t.views),
                borderColor: '#2196F3',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Lượt xem theo thời gian'
                }
            }
        }
    });
}

async function filterNotifications() {
    const statusFilter = document.getElementById('statusFilter').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();

    try {
        UI.showLoader();
        const notifications = await API.fetchWithAuth('/api/notifications', {
            params: { status: statusFilter, search: searchQuery }
        });
        renderNotifications(notifications);
    } catch (error) {
        UI.showNotification('error', 'Không thể lọc thông báo');
    } finally {
        UI.hideLoader();
    }
}

async function loadNotifications() {
    try {
        UI.showLoader();
        const notifications = await API.fetchWithAuth('/api/notifications');
        renderNotifications(notifications);
    } catch (error) {
        UI.showNotification('error', 'Không thể tải thông báo');
    } finally {
        UI.hideLoader();
    }
}

function renderNotifications(notifications) {
    const grid = document.querySelector('.notifications-grid');
    grid.innerHTML = notifications.map(notification => `
        <div class="notification-card ${notification.status}">
            <div class="notification-header">
                <span class="badge ${notification.status}">${Format.status(notification.status)}</span>
                <div class="notification-actions">
                    <button onclick="editNotification(${notification.id})" class="btn-icon">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteNotification(${notification.id})" class="btn-icon">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button onclick="viewStats(${notification.id})" class="btn-icon">
                        <i class="fas fa-chart-bar"></i>
                    </button>
                </div>
            </div>
            <div class="notification-content">
                <h3>${notification.title}</h3>
                <p>${notification.content}</p>
            </div>
            <div class="notification-footer">
                <div class="notification-meta">
                    <span><i class="fas fa-users"></i> ${Format.target(notification.target)}</span>
                    <span><i class="fas fa-clock"></i> ${Format.date(notification.createdAt)}</span>
                    <span><i class="fas fa-eye"></i> ${notification.views || 0}</span>
                </div>
            </div>
        </div>
    `).join('');
}
