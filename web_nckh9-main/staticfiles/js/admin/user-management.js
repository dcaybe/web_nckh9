let currentPage = 1;
const itemsPerPage = 10;
let users = [];

document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    setupEventListeners();
});

function loadUsers() {
    // Mock data - replace with actual API call
    users = Array.from({ length: 50 }, (_, index) => ({
        id: (index + 1).toString().padStart(3, '0'),
        name: `Nguyễn Văn ${String.fromCharCode(65 + (index % 26))}`,
        email: `nguyen.van.${String.fromCharCode(97 + (index % 26))}@example.com`,
        role: ['teacher', 'advisor', 'student'][index % 3],
        department: ['Công nghệ thông tin', 'Điện - Điện tử', 'Cơ khí'][index % 3],
        status: index % 5 === 0 ? 'inactive' : 'active'
    }));
    
    renderUsers();
    renderPagination();
}

function renderUsers() {
    const tbody = document.querySelector('.users-table tbody');
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const filteredUsers = filterUsers();
    
    const html = filteredUsers.slice(start, end).map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="role-badge ${user.role}">${getRoleName(user.role)}</span></td>
            <td>${user.department}</td>
            <td><span class="status-badge ${user.status}">${getStatusName(user.status)}</span></td>
            <td class="actions">
                <button class="btn-icon" onclick="editUser('${user.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="openPermissions('${user.id}')">
                    <i class="fas fa-key"></i>
                </button>
                <button class="btn-icon ${user.status === 'active' ? 'warning' : 'success'}" 
                        onclick="toggleUserStatus('${user.id}')">
                    <i class="fas fa-${user.status === 'active' ? 'ban' : 'check'}"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    tbody.innerHTML = html;
}

function filterUsers() {
    const roleFilter = document.getElementById('roleFilter').value;
    const departmentFilter = document.getElementById('departmentFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    return users.filter(user => {
        const roleMatch = !roleFilter || user.role === roleFilter;
        const deptMatch = !departmentFilter || user.department.toLowerCase().includes(departmentFilter);
        const searchMatch = !searchTerm || 
            user.name.toLowerCase().includes(searchTerm) || 
            user.email.toLowerCase().includes(searchTerm);
        
        return roleMatch && deptMatch && searchMatch;
    });
}

function renderPagination() {
    const totalPages = Math.ceil(users.length / itemsPerPage);
    const pagination = document.querySelector('.pagination');
    
    let html = `
        <button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Hiển thị tối đa 5 trang
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Điều chỉnh startPage nếu đang ở gần trang cuối
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `
            <button class="page-btn ${currentPage === i ? 'active' : ''}" onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }
    
    html += `
        <button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    pagination.innerHTML = html;
}

function changePage(page) {
    if (page < 1 || page > Math.ceil(users.length / itemsPerPage)) return;
    currentPage = page;
    renderUsers();
    renderPagination();
}

function openAddUserModal() {
    document.getElementById('modalTitle').textContent = 'Thêm người dùng mới';
    document.getElementById('userForm').reset();
    document.getElementById('userModal').style.display = 'flex';
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
}

function handleUserSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const userData = Object.fromEntries(formData.entries());
    
    // Mock API call
    console.log('Saving user data:', userData);
    
    showNotification('success', 'Đã lưu thông tin người dùng thành công!');
    closeUserModal();
    loadUsers(); // Reload the table
}

function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    document.getElementById('modalTitle').textContent = 'Chỉnh sửa người dùng';
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userRole').value = user.role;
    document.getElementById('userDepartment').value = user.department;
    
    document.getElementById('userModal').style.display = 'flex';
}

function openPermissions(userId) {
    const permissionsModal = document.getElementById('permissionsModal');
    const permissionsList = permissionsModal.querySelector('.permissions-list');
    
    // Mock permissions data
    const permissions = [
        { id: 'view_scores', name: 'Xem điểm rèn luyện', granted: true },
        { id: 'edit_scores', name: 'Chỉnh sửa điểm rèn luyện', granted: false },
        { id: 'approve_scores', name: 'Phê duyệt điểm rèn luyện', granted: true }
    ];
    
    permissionsList.innerHTML = permissions.map(perm => `
        <div class="permission-item">
            <label class="checkbox-container">
                <input type="checkbox" value="${perm.id}" ${perm.granted ? 'checked' : ''}>
                <span class="checkmark"></span>
                ${perm.name}
            </label>
        </div>
    `).join('');
    
    permissionsModal.style.display = 'flex';
}

function closePermissionsModal() {
    document.getElementById('permissionsModal').style.display = 'none';
}

function savePermissions() {
    // Mock API call
    console.log('Saving permissions...');
    showNotification('success', 'Đã cập nhật phân quyền thành công!');
    closePermissionsModal();
}

function toggleUserStatus(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa';
    
    if (confirm(`Bạn có chắc chắn muốn ${action} người dùng này?`)) {
        // Mock API call
        user.status = newStatus;
        showNotification('success', `Đã ${action} người dùng thành công!`);
        renderUsers();
    }
}

function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', debounce(() => {
        currentPage = 1;
        renderUsers();
        renderPagination();
    }, 300));
    
    document.querySelectorAll('.filter-select').forEach(select => {
        select.addEventListener('change', () => {
            currentPage = 1;
            renderUsers();
            renderPagination();
        });
    });
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

function getRoleName(role) {
    const roleMap = {
        'admin': 'Quản trị viên',
        'teacher': 'Giáo vụ khoa',
        'advisor': 'Cố vấn học tập',
        'student': 'Sinh viên'
    };
    return roleMap[role] || role;
}

function getStatusName(status) {
    return status === 'active' ? 'Hoạt động' : 'Vô hiệu';
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

document.addEventListener('DOMContentLoaded', function() {
    // Initialize user management table
    const userTable = document.getElementById('userTable');
    if (userTable) {
        initializeDataTable(userTable);
    }

    // Add event listeners for user actions
    const userActions = document.querySelectorAll('.user-action');
    userActions.forEach(action => {
        action.addEventListener('click', handleUserAction);
    });

    // Add event listener for user form
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', handleUserSubmit);
    }
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

async function handleUserAction(event) {
    const action = event.target.dataset.action;
    const userId = event.target.dataset.userId;
    
    try {
        const response = await fetch(`/api/users/${userId}/${action}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        
        if (response.ok) {
            showAlert(`User ${action} completed successfully!`, 'success');
            refreshTable();
        } else {
            const error = await response.json();
            showAlert(error.message || `Error performing user ${action}`, 'danger');
        }
    } catch (error) {
        showAlert(`An error occurred while performing user ${action}`, 'danger');
    }
}

async function handleUserSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch('/api/users/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showAlert('User saved successfully!', 'success');
            event.target.reset();
            refreshTable();
        } else {
            const error = await response.json();
            showAlert(error.message || 'Error saving user', 'danger');
        }
    } catch (error) {
        showAlert('An error occurred while saving the user', 'danger');
    }
}

function refreshTable() {
    const table = document.getElementById('userTable');
    if (table) {
        // Reload the table data
        fetch('/api/users/data/')
            .then(response => response.json())
            .then(data => {
                updateTableContent(table, data);
            })
            .catch(error => {
                showAlert('Error refreshing table data', 'danger');
            });
    }
}

function updateTableContent(table, data) {
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    
    data.forEach(user => {
        const row = document.createElement('tr');
        // Add row content based on user data structure
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
