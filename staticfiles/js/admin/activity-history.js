// Cấu hình
const CONFIG = {
    itemsPerPage: 10,
    dateFormat: 'DD/MM/YYYY HH:mm'
}

// Dữ liệu mẫu (sau này sẽ được thay thế bằng API)
let activityData = [
    {
        timestamp: '2024-02-20 15:30',
        user: 'Nguyễn Văn A',
        action: 'approval',
        details: 'Phê duyệt điểm rèn luyện lớp CNTT2',
        ip: '192.168.1.100',
        device: 'Chrome / Windows'
    },
    {
        timestamp: '2024-02-20 14:25',
        user: 'Trần Thị B',
        action: 'edit',
        details: 'Cập nhật quy tắc chấm điểm',
        ip: '192.168.1.101',
        device: 'Firefox / MacOS'
    },
    {
        timestamp: '2024-02-20 13:15',
        user: 'Lê Văn C',
        action: 'login',
        details: 'Đăng nhập hệ thống',
        ip: '192.168.1.102',
        device: 'Chrome / Android'
    },
    {
        timestamp: '2024-02-20 11:45',
        user: 'Phạm Thị D',
        action: 'export',
        details: 'Xuất báo cáo điểm rèn luyện HK1',
        ip: '192.168.1.103',
        device: 'Safari / MacOS'
    },
    {
        timestamp: '2024-02-20 10:30',
        user: 'Hoàng Văn E',
        action: 'approval',
        details: 'Từ chối phê duyệt ĐRL sinh viên Nguyễn Văn X',
        ip: '192.168.1.104',
        device: 'Edge / Windows'
    },
    {
        timestamp: '2024-02-20 09:15',
        user: 'Nguyễn Thị F',
        action: 'edit',
        details: 'Chỉnh sửa thông báo chung',
        ip: '192.168.1.105',
        device: 'Chrome / Windows'
    },
    {
        timestamp: '2024-02-19 16:45',
        user: 'Trần Văn G',
        action: 'export',
        details: 'Xuất danh sách sinh viên chưa nộp ĐRL',
        ip: '192.168.1.106',
        device: 'Firefox / Windows'
    },
    {
        timestamp: '2024-02-19 15:30',
        user: 'Lê Thị H',
        action: 'approval',
        details: 'Phê duyệt hàng loạt ĐRL lớp CNTT1',
        ip: '192.168.1.107',
        device: 'Chrome / Windows'
    },
    {
        timestamp: '2024-02-19 14:20',
        user: 'Phạm Văn I',
        action: 'login',
        details: 'Đăng nhập không thành công',
        ip: '192.168.1.108',
        device: 'Chrome / iOS'
    },
    {
        timestamp: '2024-02-19 13:10',
        user: 'Hoàng Thị K',
        action: 'edit',
        details: 'Cập nhật quy định mới',
        ip: '192.168.1.109',
        device: 'Safari / iOS'
    }
];

let currentPage = 1;
let filteredData = [...activityData];

// Hàm lọc hoạt động
function filterActivities() {
    const actionType = document.getElementById('actionType').value;
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;

    filteredData = activityData.filter(activity => {
        const matchesAction = actionType === 'all' || activity.action === actionType;
        const matchesDate = (!dateFrom || activity.timestamp >= dateFrom) && 
                           (!dateTo || activity.timestamp <= dateTo);
        return matchesAction && matchesDate;
    });

    currentPage = 1;
    renderActivities();
    updatePagination();
}

// Hàm render dữ liệu
function renderActivities() {
    const tbody = document.querySelector('.activity-table tbody');
    const start = (currentPage - 1) * CONFIG.itemsPerPage;
    const end = start + CONFIG.itemsPerPage;
    const pageData = filteredData.slice(start, end);

    tbody.innerHTML = pageData.map(activity => `
        <tr>
            <td>${formatDate(activity.timestamp)}</td>
            <td>${activity.user}</td>
            <td><span class="badge ${activity.action}">${getActionLabel(activity.action)}</span></td>
            <td>${activity.details}</td>
            <td>${activity.ip}</td>
            <td>${activity.device}</td>
        </tr>
    `).join('');
}

// Cập nhật phân trang
function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / CONFIG.itemsPerPage);
    const paginationEl = document.querySelector('.pagination');
    
    // Cập nhật nút prev/next
    const prevBtn = paginationEl.querySelector('button:first-child');
    const nextBtn = paginationEl.querySelector('button:last-child');
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    
    // Tạo các nút số trang
    const pageButtons = Array.from(paginationEl.querySelectorAll('.page-btn:not(:first-child):not(:last-child)'));
    pageButtons.forEach((btn, index) => {
        btn.textContent = index + 1;
        btn.classList.toggle('active', (index + 1) === currentPage);
    });
}

// Xử lý chuyển trang
function changePage(direction) {
    const totalPages = Math.ceil(filteredData.length / CONFIG.itemsPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderActivities();
        updatePagination();
    }
}

// Hàm hỗ trợ format
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN');
}

function getActionLabel(action) {
    const labels = {
        'login': 'Đăng nhập',
        'approval': 'Phê duyệt',
        'edit': 'Chỉnh sửa',
        'export': 'Xuất dữ liệu'
    };
    return labels[action] || action;
}

// Khởi tạo trang
document.addEventListener('DOMContentLoaded', function() {
    // Initialize activity history table
    const activityTable = document.getElementById('activityTable');
    if (activityTable) {
        initializeDataTable(activityTable);
    }

    // Add event listeners for filters
    const filterForm = document.getElementById('filterForm');
    if (filterForm) {
        filterForm.addEventListener('submit', handleFilterSubmit);
    }

    // Initialize date range picker if available
    const dateRangePicker = document.getElementById('dateRange');
    if (dateRangePicker) {
        initializeDateRangePicker(dateRangePicker);
    }

    const pagination = document.querySelector('.pagination');
    
    pagination.addEventListener('click', (e) => {
        const btn = e.target.closest('.page-btn');
        if (!btn) return;
        
        if (btn.classList.contains('fa-chevron-left')) {
            changePage(-1);
        } else if (btn.classList.contains('fa-chevron-right')) {
            changePage(1);
        } else {
            const pageNum = parseInt(btn.textContent);
            if (!isNaN(pageNum)) {
                currentPage = pageNum;
                renderActivities();
                updatePagination();
            }
        }
    });

    renderActivities();
    updatePagination();
    
    // Bind sự kiện
    document.querySelector('.btn-page:first-child').onclick = () => changePage(-1);
    document.querySelector('.btn-page:last-child').onclick = () => changePage(1);
});

function initializeDataTable(table) {
    // Add sorting and filtering functionality
    const headers = table.querySelectorAll('th');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.column;
            sortTable(table, column);
        });
    });
}

function sortTable(table, column) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        const aValue = a.querySelector(`td[data-column="${column}"]`).textContent;
        const bValue = b.querySelector(`td[data-column="${column}"]`).textContent;
        return aValue.localeCompare(bValue);
    });
    
    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
}

function initializeDateRangePicker(element) {
    // Initialize date range picker with default options
    const options = {
        format: 'YYYY-MM-DD',
        autoClose: true,
        showClearBtn: true
    };
    
    // You can use a library like flatpickr or daterangepicker here
    // For this example, we'll just add basic functionality
    element.addEventListener('change', () => {
        handleFilterSubmit();
    });
}

async function handleFilterSubmit(event) {
    if (event) {
        event.preventDefault();
    }
    
    const formData = new FormData(document.getElementById('filterForm'));
    const filters = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch('/api/activity-history/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(filters)
        });
        
        if (response.ok) {
            const data = await response.json();
            updateTableContent(document.getElementById('activityTable'), data);
        } else {
            const error = await response.json();
            showAlert(error.message || 'Error applying filters', 'danger');
        }
    } catch (error) {
        showAlert('An error occurred while applying filters', 'danger');
    }
}

function updateTableContent(table, data) {
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    
    data.forEach(activity => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-column="timestamp">${formatDate(activity.timestamp)}</td>
            <td data-column="user">${activity.user}</td>
            <td data-column="action">${activity.action}</td>
            <td data-column="details">${activity.details}</td>
        `;
        tbody.appendChild(row);
    });
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => alertDiv.remove(), 5000);
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
