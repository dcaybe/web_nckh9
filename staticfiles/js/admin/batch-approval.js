// State management
let selectedRows = new Set();

// Toggle select all functionality
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const rowCheckboxes = document.querySelectorAll('.row-select');
    
    rowCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
        const rowId = checkbox.closest('tr').querySelector('td:nth-child(2)').textContent;
        if (selectAllCheckbox.checked) {
            selectedRows.add(rowId);
        } else {
            selectedRows.delete(rowId);
        }
    });
    
    updateActionButtonsState();
}

// Individual row selection
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.row-select').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const rowId = this.closest('tr').querySelector('td:nth-child(2)').textContent;
            if (this.checked) {
                selectedRows.add(rowId);
            } else {
                selectedRows.delete(rowId);
                document.getElementById('selectAll').checked = false;
            }
            updateActionButtonsState();
        });
    });
});

// Update action buttons state based on selection
function updateActionButtonsState() {
    const actionButtons = document.querySelectorAll('.action-group .btn');
    actionButtons.forEach(button => {
        button.disabled = selectedRows.size === 0;
    });
}

// Batch approval functions
function approveSelected() {
    if (selectedRows.size === 0) return;
    
    if (confirm(`Bạn có chắc chắn muốn phê duyệt ${selectedRows.size} mục đã chọn?`)) {
        selectedRows.forEach(id => {
            const row = findRowById(id);
            if (row) {
                updateRowStatus(row, 'approved');
            }
        });
        
        showNotification('success', 'Đã phê duyệt thành công các mục đã chọn');
        clearSelection();
    }
}

function rejectSelected() {
    if (selectedRows.size === 0) return;
    
    const reason = prompt('Vui lòng nhập lý do từ chối:');
    if (reason) {
        selectedRows.forEach(id => {
            const row = findRowById(id);
            if (row) {
                updateRowStatus(row, 'rejected');
            }
        });
        
        showNotification('success', 'Đã từ chối các mục đã chọn');
        clearSelection();
    }
}

// Individual row actions
function approveOne(id) {
    if (confirm('Bạn có chắc chắn muốn phê duyệt mục này?')) {
        const row = findRowById(id);
        if (row) {
            updateRowStatus(row, 'approved');
            showNotification('success', 'Đã phê duyệt thành công');
        }
    }
}

function rejectOne(id) {
    const reason = prompt('Vui lòng nhập lý do từ chối:');
    if (reason) {
        const row = findRowById(id);
        if (row) {
            updateRowStatus(row, 'rejected');
            showNotification('success', 'Đã từ chối thành công');
        }
    }
}

function viewDetails(id) {
    // In thực tế sẽ mở modal hoặc chuyển trang để xem chi tiết
    alert(`Đang mở chi tiết cho sinh viên có MSSV: ${id}`);
}

// Filter handling
document.addEventListener('DOMContentLoaded', () => {
    const filters = document.querySelectorAll('.filter-select');
    filters.forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });
});

function applyFilters() {
    const faculty = document.getElementById('facultyFilter').value;
    const className = document.getElementById('classFilter').value;
    const semester = document.getElementById('semesterFilter').value;
    const status = document.getElementById('statusFilter').value;
    
    // Thực hiện lọc dữ liệu
    filterTable(faculty, className, semester, status);
}

// Helper functions
function findRowById(id) {
    return document.querySelector(`tr td:nth-child(2):contains(${id})`).closest('tr');
}

function updateRowStatus(row, status) {
    const statusCell = row.querySelector('td:nth-child(7)');
    const statusBadge = statusCell.querySelector('.status-badge');
    
    statusBadge.className = 'status-badge ' + status;
    statusBadge.textContent = getStatusText(status);
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

function filterTable(faculty, className, semester, status) {
    const rows = document.querySelectorAll('.batch-table tbody tr');
    
    rows.forEach(row => {
        let show = true;
        
        if (faculty && row.querySelector('td:nth-child(4)').textContent !== faculty) show = false;
        if (className && row.querySelector('td:nth-child(4)').textContent !== className) show = false;
        if (semester) {
            // Thêm logic lọc theo học kỳ
        }
        if (status) {
            const rowStatus = row.querySelector('.status-badge').classList.contains(status);
            if (!rowStatus) show = false;
        }
        
        row.style.display = show ? '' : 'none';
    });
}

// Notification system
function showNotification(type, message) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 4px;
        color: white;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    }
    
    .notification.success {
        background-color: #4CAF50;
    }
    
    .notification.error {
        background-color: #F44336;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', function() {
    // Initialize batch approval table
    const batchTable = document.getElementById('batchTable');
    if (batchTable) {
        initializeDataTable(batchTable);
    }

    // Add event listeners for batch actions
    const batchActions = document.querySelectorAll('.batch-action');
    batchActions.forEach(action => {
        action.addEventListener('click', handleBatchAction);
    });
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

async function handleBatchAction(event) {
    const action = event.target.dataset.action;
    const selectedItems = getSelectedItems();
    
    if (selectedItems.length === 0) {
        showAlert('Please select at least one item', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/api/batch-approval/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                action: action,
                items: selectedItems
            })
        });
        
        if (response.ok) {
            showAlert(`Batch ${action} completed successfully!`, 'success');
            refreshTable();
        } else {
            const error = await response.json();
            showAlert(error.message || `Error performing batch ${action}`, 'danger');
        }
    } catch (error) {
        showAlert(`An error occurred while performing batch ${action}`, 'danger');
    }
}

function getSelectedItems() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(checkbox => checkbox.value);
}

function refreshTable() {
    const table = document.getElementById('batchTable');
    if (table) {
        // Reload the table data
        fetch('/api/batch-approval/data/')
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
    
    data.forEach(item => {
        const row = document.createElement('tr');
        // Add row content based on data structure
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
