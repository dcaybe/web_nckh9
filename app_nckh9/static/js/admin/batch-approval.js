import { fetchAPI, showLoading, hideLoading, handleError, retryOperation } from './api.js';

// State management
let selectedRows = new Set();
let pendingRequests = new Map(); // Track pending approval requests

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadPendingApprovals();
});

// Load pending approvals from API
async function loadPendingApprovals() {
    try {
        showLoading('approvalTable');
        const response = await retryOperation(async () => {
            return await fetchAPI('/approvals/pending/');
        });
        renderApprovals(response.data);
    } catch (error) {
        handleError(error);
    } finally {
        hideLoading('approvalTable');
    }
}

// Render approvals data
function renderApprovals(approvals) {
    const tbody = document.querySelector('.batch-table tbody');
    tbody.innerHTML = approvals.map(item => `
        <tr data-id="${item.id}">
            <td>
                <input type="checkbox" class="row-select" 
                       ${pendingRequests.has(item.id) ? 'disabled' : ''}>
            </td>
            <td>${item.student_id}</td>
            <td>${item.student_name}</td>
            <td>${item.faculty}</td>
            <td>${item.class_name}</td>
            <td>${item.semester}</td>
            <td>
                <span class="status-badge ${item.status}">
                    ${getStatusText(item.status)}
                </span>
            </td>
            <td class="actions">
                <button class="btn btn-view" onclick="viewDetails('${item.id}')" 
                        ${pendingRequests.has(item.id) ? 'disabled' : ''}>
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-approve" onclick="approveOne('${item.id}')"
                        ${pendingRequests.has(item.id) ? 'disabled' : ''}>
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-reject" onclick="rejectOne('${item.id}')"
                        ${pendingRequests.has(item.id) ? 'disabled' : ''}>
                    <i class="fas fa-times"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    setupRowListeners();
}

// Event listeners setup
function setupEventListeners() {
    document.getElementById('selectAll')?.addEventListener('change', toggleSelectAll);
    
    const filters = document.querySelectorAll('.filter-select');
    filters.forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });
}

function setupRowListeners() {
    document.querySelectorAll('.row-select').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const row = this.closest('tr');
            const rowId = row.dataset.id;
            
            if (this.checked) {
                selectedRows.add(rowId);
            } else {
                selectedRows.delete(rowId);
                document.getElementById('selectAll').checked = false;
            }
            updateActionButtonsState();
        });
    });
}

// Selection handling
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const rowCheckboxes = document.querySelectorAll('.row-select:not(:disabled)');
    
    rowCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
        const row = checkbox.closest('tr');
        const rowId = row.dataset.id;
        
        if (selectAllCheckbox.checked) {
            selectedRows.add(rowId);
        } else {
            selectedRows.delete(rowId);
        }
    });
    
    updateActionButtonsState();
}

function updateActionButtonsState() {
    const actionButtons = document.querySelectorAll('.action-group .btn');
    actionButtons.forEach(button => {
        button.disabled = selectedRows.size === 0;
    });
}

// Batch approval functions
async function approveSelected() {
    if (selectedRows.size === 0) return;
    
    if (confirm(`Bạn có chắc chắn muốn phê duyệt ${selectedRows.size} mục đã chọn?`)) {
        try {
            const selectedIds = Array.from(selectedRows);
            showLoading('approvalTable');
            
            await retryOperation(async () => {
                return await fetchAPI('/approvals/batch-approve/', {
                    method: 'POST',
                    body: JSON.stringify({ ids: selectedIds })
                });
            });
            
            showNotification('success', 'Đã phê duyệt thành công các mục đã chọn');
            await loadPendingApprovals();
            clearSelection();
        } catch (error) {
            handleError(error);
        } finally {
            hideLoading('approvalTable');
        }
    }
}

async function rejectSelected() {
    if (selectedRows.size === 0) return;
    
    const reason = prompt('Vui lòng nhập lý do từ chối:');
    if (reason) {
        try {
            const selectedIds = Array.from(selectedRows);
            showLoading('approvalTable');
            
            await retryOperation(async () => {
                return await fetchAPI('/approvals/batch-reject/', {
                    method: 'POST',
                    body: JSON.stringify({
                        ids: selectedIds,
                        reason: reason
                    })
                });
            });
            
            showNotification('success', 'Đã từ chối các mục đã chọn');
            await loadPendingApprovals();
            clearSelection();
        } catch (error) {
            handleError(error);
        } finally {
            hideLoading('approvalTable');
        }
    }
}

// Individual approval functions
async function approveOne(id) {
    if (confirm('Bạn có chắc chắn muốn phê duyệt mục này?')) {
        try {
            pendingRequests.set(id, 'pending');
            disableRowActions(id);
            
            await fetchAPI(`/approvals/${id}/approve/`, {
                method: 'POST'
            });
            
            showNotification('success', 'Đã phê duyệt thành công');
            await loadPendingApprovals();
        } catch (error) {
            handleError(error);
        } finally {
            pendingRequests.delete(id);
            enableRowActions(id);
        }
    }
}

async function rejectOne(id) {
    const reason = prompt('Vui lòng nhập lý do từ chối:');
    if (reason) {
        try {
            pendingRequests.set(id, 'pending');
            disableRowActions(id);
            
            await fetchAPI(`/approvals/${id}/reject/`, {
                method: 'POST',
                body: JSON.stringify({ reason })
            });
            
            showNotification('success', 'Đã từ chối thành công');
            await loadPendingApprovals();
        } catch (error) {
            handleError(error);
        } finally {
            pendingRequests.delete(id);
            enableRowActions(id);
        }
    }
}

async function viewDetails(id) {
    try {
        showLoading('approvalDetails');
        const response = await fetchAPI(`/approvals/${id}/details/`);
        
        // Render details modal
        const detailsContent = `
            <div class="details-content">
                <h3>Chi tiết phê duyệt</h3>
                <div class="details-body">
                    ${renderApprovalDetails(response.data)}
                </div>
            </div>
        `;
        
        document.getElementById('detailsModal').innerHTML = detailsContent;
        document.getElementById('detailsModal').style.display = 'flex';
    } catch (error) {
        handleError(error);
    } finally {
        hideLoading('approvalDetails');
    }
}

// Filter handling
async function applyFilters() {
    const faculty = document.getElementById('facultyFilter').value;
    const className = document.getElementById('classFilter').value;
    const semester = document.getElementById('semesterFilter').value;
    const status = document.getElementById('statusFilter').value;
    
    try {
        showLoading('approvalTable');
        const response = await fetchAPI('/approvals/filter/', {
            method: 'POST',
            body: JSON.stringify({
                faculty,
                class_name: className,
                semester,
                status
            })
        });
        
        renderApprovals(response.data);
    } catch (error) {
        handleError(error);
    } finally {
        hideLoading('approvalTable');
    }
}

// Helper functions
function disableRowActions(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) {
        row.querySelectorAll('button, input[type="checkbox"]').forEach(el => {
            el.disabled = true;
        });
    }
}

function enableRowActions(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) {
        row.querySelectorAll('button, input[type="checkbox"]').forEach(el => {
            el.disabled = false;
        });
    }
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Chờ duyệt',
        'approved': 'Đã duyệt',
        'rejected': 'Đã từ chối'
    };
    return statusMap[status] || status;
}

function clearSelection() {
    selectedRows.clear();
    document.getElementById('selectAll').checked = false;
    document.querySelectorAll('.row-select').forEach(checkbox => {
        checkbox.checked = false;
    });
    updateActionButtonsState();
}

function renderApprovalDetails(details) {
    return `
        <div class="details-grid">
            <div class="detail-item">
                <span class="label">MSSV:</span>
                <span class="value">${details.student_id}</span>
            </div>
            <div class="detail-item">
                <span class="label">Họ tên:</span>
                <span class="value">${details.student_name}</span>
            </div>
            <div class="detail-item">
                <span class="label">Lớp:</span>
                <span class="value">${details.class_name}</span>
            </div>
            <div class="detail-item">
                <span class="label">Khoa:</span>
                <span class="value">${details.faculty}</span>
            </div>
            <div class="detail-item">
                <span class="label">Học kỳ:</span>
                <span class="value">${details.semester}</span>
            </div>
            <div class="detail-item">
                <span class="label">Trạng thái:</span>
                <span class="value status-badge ${details.status}">
                    ${getStatusText(details.status)}
                </span>
            </div>
            ${details.reason ? `
                <div class="detail-item full-width">
                    <span class="label">Lý do từ chối:</span>
                    <span class="value">${details.reason}</span>
                </div>
            ` : ''}
        </div>
    `;
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
