let isAutoSyncEnabled = false;
let currentSync = null;

document.addEventListener('DOMContentLoaded', () => {
    loadInitialData();
    setupEventListeners();
});

function loadInitialData() {
    // Load sync history
    updateSyncHistory();
    
    // Load auto-sync settings
    const savedSettings = localStorage.getItem('syncSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        document.getElementById('syncFrequency').value = settings.frequency;
        document.getElementById('syncTime').value = settings.time;
        document.getElementById('autoSync').checked = settings.enabled;
        isAutoSyncEnabled = settings.enabled;
    }
}

function setupEventListeners() {
    // Add any additional event listeners here
}

function startSync(type) {
    if (currentSync) {
        alert('Đang có quá trình đồng bộ đang chạy!');
        return;
    }

    const progressModal = document.getElementById('progressModal');
    progressModal.style.display = 'flex';
    
    currentSync = {
        type: type,
        progress: 0,
        status: 'running'
    };

    updateProgress(0, 'Đang khởi tạo...');

    // Simulate sync process
    simulateSyncProcess(type);
}

function simulateSyncProcess(type) {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            completeSyncProcess(type);
        }
        updateProgress(progress, `Đang đồng bộ dữ liệu ${type}...`);
    }, 500);
}

function updateProgress(progress, details) {
    const progressBar = document.getElementById('syncProgress');
    const progressText = document.getElementById('progressText');
    const progressDetails = document.getElementById('progressDetails');

    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${Math.round(progress)}%`;
    progressDetails.textContent = details;
}

function completeSyncProcess(type) {
    setTimeout(() => {
        const progressModal = document.getElementById('progressModal');
        progressModal.style.display = 'none';
        
        showNotification('success', `Đồng bộ ${type} thành công!`);
        currentSync = null;
        
        // Update sync history
        updateSyncHistory();
        updateLastSyncTime();
    }, 1000);
}

function updateSchedule() {
    const frequency = document.getElementById('syncFrequency').value;
    const time = document.getElementById('syncTime').value;
    
    const settings = {
        frequency: frequency,
        time: time,
        enabled: isAutoSyncEnabled
    };
    
    localStorage.setItem('syncSettings', JSON.stringify(settings));
    showNotification('success', 'Đã cập nhật lịch đồng bộ tự động');
}

function toggleAutoSync() {
    isAutoSyncEnabled = document.getElementById('autoSync').checked;
    updateSchedule();
    
    if (isAutoSyncEnabled) {
        showNotification('success', 'Đã bật đồng bộ tự động');
    } else {
        showNotification('info', 'Đã tắt đồng bộ tự động');
    }
}

function updateSyncHistory() {
    const mockData = [
        {
            time: '2024-02-20 15:30:00',
            type: 'Tất cả',
            status: 'success',
            count: 1234,
            details: 'Hoàn thành'
        },
        // Add more mock data
    ];

    const tbody = document.getElementById('logTableBody');
    tbody.innerHTML = mockData.map(log => `
        <tr>
            <td>${log.time}</td>
            <td>${log.type}</td>
            <td><span class="status-badge ${log.status}">${log.status === 'success' ? 'Thành công' : 'Lỗi'}</span></td>
            <td>${log.count}</td>
            <td>${log.details}</td>
        </tr>
    `).join('');
}

function updateLastSyncTime() {
    const now = new Date();
    const formattedDate = now.toLocaleString('vi-VN');
    document.getElementById('lastSync').textContent = formattedDate;
}

function filterLogs() {
    // Implement log filtering logic
    const type = document.getElementById('logType').value;
    const date = document.getElementById('logDate').value;
    console.log('Filtering logs:', { type, date });
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
