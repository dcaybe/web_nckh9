// Menu navigation handling
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});

// Quick action buttons handlers
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.action-buttons')?.addEventListener('click', (e) => {
        const button = e.target.closest('.btn');
        if (!button) return;

        const action = button.textContent.trim();
        switch (action) {
            case 'Phê duyệt hàng loạt':
                window.location.href = 'batch-approval.html';
                break;
            case 'Xuất báo cáo':
                exportReport();
                break;
            case 'Đồng bộ dữ liệu':
                syncData();
                break;
        }
    });

    // Initialize stats update
    updateStats();
});

// Utility functions
function exportReport() {
    alert('Đang xuất báo cáo...');
    // Implement report export logic here
}

function syncData() {
    alert('Đang đồng bộ dữ liệu...');
    // Implement data sync logic here
}

// Update stats periodically
function updateStats() {
    // Simulate real-time updates
    setInterval(() => {
        const randomChange = Math.floor(Math.random() * 5);
        const statsElements = document.querySelectorAll('.stat-item p');
        statsElements.forEach(stat => {
            const currentValue = parseInt(stat.textContent);
            if (!isNaN(currentValue)) {
                stat.textContent = currentValue + randomChange;
            }
        });
    }, 30000); // Update every 30 seconds
}
