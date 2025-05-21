document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadNotifications();
});

function setupEventListeners() {
    // Filter handlers
    document.getElementById('statusFilter').addEventListener('change', filterNotifications);
    document.getElementById('targetFilter').addEventListener('change', filterNotifications);
    document.getElementById('searchInput').addEventListener('input', debounce(filterNotifications, 300));

    // Target selection handler
    document.getElementById('target').addEventListener('change', handleTargetChange);
}

function handleTargetChange(event) {
    const targetDetails = document.getElementById('targetDetails');
    const target = event.target.value;

    if (target === 'faculty' || target === 'class') {
        targetDetails.style.display = 'block';
        targetDetails.innerHTML = generateTargetSelectionFields(target);
    } else {
        targetDetails.style.display = 'none';
    }
}

function generateTargetSelectionFields(target) {
    if (target === 'faculty') {
        return `
            <select multiple class="target-select">
                <option value="cntt">Công nghệ thông tin</option>
                <option value="ddt">Điện - Điện tử</option>
                <option value="ck">Cơ khí</option>
            </select>
        `;
    } else if (target === 'class') {
        return `
            <select multiple class="target-select">
                <option value="cntt1">CNTT1</option>
                <option value="cntt2">CNTT2</option>
                <option value="ddt1">DDT1</option>
            </select>
        `;
    }
    return '';
}

function openCreateNotification() {
    document.getElementById('modalTitle').textContent = 'Tạo thông báo mới';
    document.getElementById('notificationForm').reset();
    document.getElementById('notificationModal').style.display = 'flex';
}

function editNotification(id) {
    document.getElementById('modalTitle').textContent = 'Chỉnh sửa thông báo';
    // Load notification data
    const notification = getNotificationById(id);
    if (notification) {
        fillNotificationForm(notification);
    }
    document.getElementById('notificationModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('notificationModal').style.display = 'none';
}

function handleNotificationSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    // Mock API call
    console.log('Publishing notification:', data);
    
    showNotification('success', 'Đã đăng thông báo thành công!');
    closeModal();
    loadNotifications();
}

function saveAsDraft() {
    const form = document.getElementById('notificationForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.status = 'draft';
    
    // Mock API call
    console.log('Saving draft:', data);
    
    showNotification('success', 'Đã lưu nháp thành công!');
    closeModal();
    loadNotifications();
}

function deleteNotification(id) {
    if (confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
        // Mock API call
        console.log('Deleting notification:', id);
        
        showNotification('success', 'Đã xóa thông báo thành công!');
        loadNotifications();
    }
}

function viewStats(id) {
    const statsModal = document.getElementById('statsModal');
    statsModal.style.display = 'flex';
    
    // Initialize chart
    const ctx = document.getElementById('viewsChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['1/2', '2/2', '3/2', '4/2', '5/2'],
            datasets: [{
                label: 'Lượt xem',
                data: [120, 250, 380, 450, 520],
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

function closeStatsModal() {
    document.getElementById('statsModal').style.display = 'none';
}

function filterNotifications() {
    const statusFilter = document.getElementById('statusFilter').value;
    const targetFilter = document.getElementById('targetFilter').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();

    const notifications = getMockNotifications();
    
    const filtered = notifications.filter(notification => {
        const matchesStatus = !statusFilter || notification.status === statusFilter;
        const matchesTarget = !targetFilter || notification.target === targetFilter;
        const matchesSearch = !searchQuery || 
            notification.title.toLowerCase().includes(searchQuery) ||
            notification.content.toLowerCase().includes(searchQuery);
        
        return matchesStatus && matchesTarget && matchesSearch;
    });

    renderNotifications(filtered);
}

function getMockNotifications() {
    return [
        {
            id: 1,
            title: 'Thông báo về việc chấm điểm rèn luyện HK1 2023-2024',
            content: 'Thông báo đến toàn thể sinh viên về việc thực hiện chấm điểm rèn luyện...',
            status: 'published',
            target: 'all',
            publishDate: '2024-02-20',
            views: 1234
        },
        {
            id: 2,
            title: 'Hướng dẫn đánh giá điểm rèn luyện trực tuyến',
            content: 'Sinh viên thực hiện đánh giá điểm rèn luyện theo các bước sau...',
            status: 'published',
            target: 'faculty',
            publishDate: '2024-02-18',
            views: 856
        },
        {
            id: 3,
            title: 'Thời hạn nộp minh chứng hoạt động',
            content: 'Deadline nộp các minh chứng hoạt động ngoại khóa...',
            status: 'draft',
            target: 'class',
            publishDate: '2024-02-22',
            views: 0
        }
    ];
}

function loadNotifications() {
    const notifications = getMockNotifications();
    renderNotifications(notifications);
}

function renderNotifications(notifications) {
    const grid = document.querySelector('.notifications-grid');
    grid.innerHTML = notifications.map(notification => `
        <div class="notification-card">
            <div class="notification-header">
                <span class="badge ${notification.status}">${getStatusText(notification.status)}</span>
                <div class="actions">
                    <button class="btn-icon" onclick="editNotification(${notification.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteNotification(${notification.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <h3>${notification.title}</h3>
            <p class="meta">
                <span><i class="fas fa-clock"></i> ${notification.publishDate}</span>
                <span><i class="fas fa-users"></i> ${getTargetText(notification.target)}</span>
            </p>
            <div class="notification-content">
                ${notification.content}
            </div>
            <div class="notification-footer">
                <button class="btn btn-sm" onclick="viewStats(${notification.id})">
                    <i class="fas fa-chart-bar"></i> Thống kê
                </button>
                <span class="views"><i class="fas fa-eye"></i> ${notification.views}</span>
            </div>
        </div>
    `).join('');
}

// Helper functions
function getStatusText(status) {
    const statusMap = {
        'draft': 'Nháp',
        'published': 'Đã đăng',
        'scheduled': 'Đã lên lịch'
    };
    return statusMap[status] || status;
}

function getTargetText(target) {
    const targetMap = {
        'all': 'Toàn trường',
        'faculty': 'Theo khoa',
        'class': 'Theo lớp'
    };
    return targetMap[target] || target;
}

function showNotification(type, message) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
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
