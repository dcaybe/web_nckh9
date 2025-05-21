document.addEventListener('DOMContentLoaded', () => {
    loadBackupHistory();
    loadSettings();
});

function createBackup() {
    showProgress('Đang tạo bản sao lưu...');
    
    // Simulate backup process
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            hideProgress();
            showNotification('success', 'Đã tạo bản sao lưu thành công!');
            loadBackupHistory();
        }
        updateProgress(progress, 'Đang sao lưu dữ liệu...');
    }, 500);
}

function restoreBackup(backupId) {
    document.getElementById('restoreModal').style.display = 'flex';
    window.currentBackupId = backupId;
}

function confirmRestore() {
    closeModal('restoreModal');
    showProgress('Đang khôi phục dữ liệu...');
    
    // Simulate restore process
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            hideProgress();
            showNotification('success', 'Đã khôi phục dữ liệu thành công!');
        }
        updateProgress(progress, 'Đang khôi phục dữ liệu...');
    }, 500);
}

function downloadBackup(backupId) {
    showNotification('info', 'Đang tải xuống bản sao lưu...');
    // Implement actual download logic
}

function deleteBackup(backupId) {
    if (confirm('Bạn có chắc chắn muốn xóa bản sao lưu này?')) {
        showNotification('success', 'Đã xóa bản sao lưu thành công!');
        loadBackupHistory();
    }
}

function saveSettings() {
    const settings = {
        frequency: document.getElementById('backupFrequency').value,
        time: document.getElementById('backupTime').value,
        maxBackups: document.getElementById('maxBackups').value
    };
    
    // Mock API call to save settings
    console.log('Saving settings:', settings);
    showNotification('success', 'Đã lưu cài đặt thành công!');
}

function loadBackupHistory() {
    // Mock data - replace with actual API call
    const mockData = [
        {
            id: '20240220_153000',
            timestamp: '20/02/2024 15:30',
            type: 'auto',
            size: '500 MB',
            status: 'success'
        }
        // Add more mock data
    ];
    
    renderBackupHistory(mockData);
}

function renderBackupHistory(data) {
    const tbody = document.querySelector('.backup-table tbody');
    tbody.innerHTML = data.map(backup => `
        <tr>
            <td>${backup.timestamp}</td>
            <td><span class="badge ${backup.type}">${getTypeText(backup.type)}</span></td>
            <td>${backup.size}</td>
            <td><span class="status-badge ${backup.status}">${getStatusText(backup.status)}</span></td>
            <td>
                <button class="btn-icon" onclick="restoreBackup('${backup.id}')">
                    <i class="fas fa-undo-alt"></i>
                </button>
                <button class="btn-icon" onclick="downloadBackup('${backup.id}')">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn-icon" onclick="deleteBackup('${backup.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function loadSettings() {
    // Mock data - replace with actual API call
    const settings = {
        frequency: 'daily',
        time: '00:00',
        maxBackups: 30
    };
    
    document.getElementById('backupFrequency').value = settings.frequency;
    document.getElementById('backupTime').value = settings.time;
    document.getElementById('maxBackups').value = settings.maxBackups;
}

// UI Helper Functions
function showProgress(message) {
    document.getElementById('progressModal').style.display = 'flex';
    document.getElementById('progressDetails').textContent = message;
}

function hideProgress() {
    document.getElementById('progressModal').style.display = 'none';
}

function updateProgress(progress, details) {
    document.getElementById('operationProgress').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `${Math.round(progress)}%`;
    if (details) {
        document.getElementById('progressDetails').textContent = details;
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
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

function getTypeText(type) {
    return type === 'auto' ? 'Tự động' : 'Thủ công';
}

function getStatusText(status) {
    return status === 'success' ? 'Hoàn thành' : 'Lỗi';
}

function applyFilters() {
    const type = document.getElementById('typeFilter').value;
    const date = document.getElementById('dateFilter').value;
    
    // Implement filtering logic
    console.log('Filtering backups:', { type, date });
    loadBackupHistory(); // Reload with filters
}
