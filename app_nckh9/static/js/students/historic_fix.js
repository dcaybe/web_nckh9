document.addEventListener('DOMContentLoaded', function() {
    // Initialize date inputs with default values
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    document.getElementById('dateFrom').valueAsDate = lastMonth;
    document.getElementById('dateTo').valueAsDate = today;

    // Sample data for demonstration
    const sampleActivities = [
        {
            time: '2024-01-20 15:30',
            user: 'Nguyễn Văn A',
            action: 'approval',
            details: 'Phê duyệt điểm rèn luyện lớp CNTT2',
            ip: '192.168.1.100',
            device: 'Chrome / Windows'
        },
        {
            time: '2024-01-20 14:25',
            user: 'Trần Thị B',
            action: 'edit',
            details: 'Cập nhật quy tắc chấm điểm',
            ip: '192.168.1.101',
            device: 'Firefox / MacOS'
        }
        // Add more sample data as needed
    ];

    function filterActivities() {
        const actionType = document.getElementById('actionType').value;
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;

        // Filter logic here
        const filteredActivities = sampleActivities.filter(activity => {
            const activityDate = new Date(activity.time);
            const fromDate = new Date(dateFrom);
            const toDate = new Date(dateTo);

            return (actionType === 'all' || activity.action === actionType) &&
                   activityDate >= fromDate &&
                   activityDate <= toDate;
        });

        updateTable(filteredActivities);
    }

    function updateTable(activities) {
        const tbody = document.querySelector('.activity-table tbody');
        tbody.innerHTML = '';

        activities.forEach(activity => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${activity.time}</td>
                <td>${activity.user}</td>
                <td><span class="badge ${activity.action}">${getBadgeText(activity.action)}</span></td>
                <td>${activity.details}</td>
                <td>${activity.ip}</td>
                <td>${activity.device}</td>
            `;
            tbody.appendChild(row);
        });
    }

    function getBadgeText(action) {
        const actionTexts = {
            'approval': 'Phê duyệt',
            'edit': 'Chỉnh sửa',
            'login': 'Đăng nhập',
            'export': 'Xuất dữ liệu'
        };
        return actionTexts[action] || action;
    }

    // Add event listeners
    document.querySelector('.filter-btn').addEventListener('click', filterActivities);

    // Initialize table with sample data
    updateTable(sampleActivities);
});
