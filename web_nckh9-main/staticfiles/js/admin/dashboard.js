
// Menu navigation handling
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});

// User dropdown functionality
const userDropdown = document.querySelector('.user-info');
const dropdownContent = document.createElement('div');
dropdownContent.className = 'dropdown-content';
dropdownContent.innerHTML = `
    <a href="#"><i class="fas fa-user"></i> Thông tin cá nhân</a>
    <a href="#"><i class="fas fa-cog"></i> Cài đặt</a>
    <a href="#"><i class="fas fa-sign-out-alt"></i> Đăng xuất</a>
`;
dropdownContent.style.display = 'none';
userDropdown.appendChild(dropdownContent);

userDropdown.addEventListener('click', (e) => {
    dropdownContent.style.display = dropdownContent.style.display === 'none' ? 'block' : 'none';
    e.stopPropagation();
});

document.addEventListener('click', () => {
    dropdownContent.style.display = 'none';
});

// Quick action buttons handlers
document.querySelector('.action-buttons').addEventListener('click', (e) => {
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

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
});
