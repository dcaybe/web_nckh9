import { fetchAPI, showLoading, hideLoading, handleError, retryOperation } from './api.js';

let currentPage = 1;
const itemsPerPage = 10;
let users = [];

document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    setupEventListeners();
});

async function loadUsers() {
    try {
        showLoading('usersTable');
        const response = await retryOperation(async () => {
            return await fetchAPI('/users/');
        });
        users = response.data;
        renderUsers();
        renderPagination();
    } catch (error) {
        handleError(error);
    } finally {
        hideLoading('usersTable');
    }
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

// Các hàm filter và pagination giữ nguyên...
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
    const totalPages = Math.ceil(filterUsers().length / itemsPerPage);
    const pagination = document.querySelector('.pagination');
    
    let html = `
        <button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
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

// Cập nhật các hàm CRUD với API calls
async function handleUserSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const userData = Object.fromEntries(formData.entries());
    
    try {
        showLoading('userForm');
        if (userData.id) {
            // Update existing user
            await fetchAPI(`/users/${userData.id}/`, {
                method: 'PUT',
                body: JSON.stringify(userData)
            });
        } else {
            // Create new user
            await fetchAPI('/users/', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
        }
        
        showNotification('success', 'Đã lưu thông tin người dùng thành công!');
        closeUserModal();
        await loadUsers();
    } catch (error) {
        handleError(error);
    } finally {
        hideLoading('userForm');
    }
}

async function editUser(userId) {
    try {
        showLoading('userModal');
        const user = await fetchAPI(`/users/${userId}/`);
        
        document.getElementById('modalTitle').textContent = 'Chỉnh sửa người dùng';
        document.getElementById('userId').value = user.id;
        document.getElementById('userName').value = user.name;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userRole').value = user.role;
        document.getElementById('userDepartment').value = user.department;
        
        document.getElementById('userModal').style.display = 'flex';
    } catch (error) {
        handleError(error);
    } finally {
        hideLoading('userModal');
    }
}

async function toggleUserStatus(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa';
    
    if (confirm(`Bạn có chắc chắn muốn ${action} người dùng này?`)) {
        try {
            showLoading('usersTable');
            await fetchAPI(`/users/${userId}/toggle-status/`, {
                method: 'POST',
                body: JSON.stringify({ status: newStatus })
            });
            
            showNotification('success', `Đã ${action} người dùng thành công!`);
            await loadUsers();
        } catch (error) {
            handleError(error);
        } finally {
            hideLoading('usersTable');
        }
    }
}

async function openPermissions(userId) {
    try {
        showLoading('permissionsModal');
        const permissions = await fetchAPI(`/users/${userId}/permissions/`);
        
        const permissionsModal = document.getElementById('permissionsModal');
        const permissionsList = permissionsModal.querySelector('.permissions-list');
        
        permissionsList.innerHTML = permissions.map(perm => `
            <div class="permission-item">
                <label class="checkbox-container">
                    <input type="checkbox" value="${perm.id}" ${perm.granted ? 'checked' : ''}>
                    <span class="checkmark"></span>
                    ${perm.name}
                </label>
            </div>
        `).join('');
        
        permissionsModal.dataset.userId = userId;
        permissionsModal.style.display = 'flex';
    } catch (error) {
        handleError(error);
    } finally {
        hideLoading('permissionsModal');
    }
}

async function savePermissions() {
    const modal = document.getElementById('permissionsModal');
    const userId = modal.dataset.userId;
    const permissions = Array.from(modal.querySelectorAll('input[type="checkbox"]'))
        .map(cb => ({
            id: cb.value,
            granted: cb.checked
        }));
    
    try {
        showLoading('permissionsModal');
        await fetchAPI(`/users/${userId}/permissions/`, {
            method: 'POST',
            body: JSON.stringify({ permissions })
        });
        
        showNotification('success', 'Đã cập nhật phân quyền thành công!');
        closePermissionsModal();
    } catch (error) {
        handleError(error);
    } finally {
        hideLoading('permissionsModal');
    }
}

// Các hàm utility
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

// Modal functions
function openAddUserModal() {
    document.getElementById('modalTitle').textContent = 'Thêm người dùng mới';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('userModal').style.display = 'flex';
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
}

function closePermissionsModal() {
    document.getElementById('permissionsModal').style.display = 'none';
}
