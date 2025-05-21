let distributionChart, facultyChart, trendChart, categoryChart;

document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    loadStatistics();
    setupEventListeners();
});

function initializeCharts() {
    // Biểu đồ phân bố điểm
    distributionChart = new Chart(document.getElementById('distributionChart'), {
        type: 'bar',
        data: {
            labels: ['Xuất sắc', 'Tốt', 'Khá', 'Trung bình', 'Yếu'],
            datasets: [{
                label: 'Số lượng sinh viên',
                data: [150, 300, 450, 200, 100],
                backgroundColor: [
                    '#4CAF50',
                    '#2196F3',
                    '#FFC107',
                    '#FF9800',
                    '#F44336'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Phân bố điểm rèn luyện'
                }
            }
        }
    });

    // Biểu đồ so sánh khoa
    facultyChart = new Chart(document.getElementById('facultyChart'), {
        type: 'radar',
        data: {
            labels: ['CNTT', 'Điện tử', 'Cơ khí', 'Kinh tế', 'Hóa'],
            datasets: [{
                label: 'Điểm trung bình',
                data: [85, 78, 82, 75, 80],
                fill: true,
                backgroundColor: 'rgba(33, 150, 243, 0.2)',
                borderColor: '#2196F3',
                pointBackgroundColor: '#2196F3'
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    min: 0,
                    max: 100
                }
            }
        }
    });

    // Biểu đồ xu hướng
    trendChart = new Chart(document.getElementById('trendChart'), {
        type: 'line',
        data: {
            labels: ['T9', 'T10', 'T11', 'T12', 'T1', 'T2'],
            datasets: [{
                label: 'Điểm trung bình',
                data: [75, 78, 80, 82, 85, 83],
                borderColor: '#2196F3',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Xu hướng điểm theo tháng'
                }
            }
        }
    });

    // Biểu đồ phân tích tiêu chí
    categoryChart = new Chart(document.getElementById('categoryChart'), {
        type: 'doughnut',
        data: {
            labels: [
                'Học tập',
                'Kỷ luật',
                'Hoạt động XH',
                'Phẩm chất',
                'Chức vụ'
            ],
            datasets: [{
                data: [30, 25, 20, 15, 10],
                backgroundColor: [
                    '#4CAF50',
                    '#2196F3',
                    '#FFC107',
                    '#FF9800',
                    '#F44336'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function loadStatistics() {
    // Giả lập tải dữ liệu từ server
    updateRankingList();
    updateDetailedStats();
}

function updateRankingList() {
    const rankingList = document.querySelector('.ranking-list');
    const mockData = [
        { class: 'CNTT1', score: 88.5 },
        { class: 'CNTT2', score: 87.2 },
        { class: 'DDT1', score: 86.8 },
        // ... thêm dữ liệu
    ];

    rankingList.innerHTML = mockData.map((item, index) => `
        <div class="ranking-item">
            <span class="rank">${index + 1}</span>
            <span class="class-name">${item.class}</span>
            <span class="score">${item.score}</span>
        </div>
    `).join('');
}

function updateDetailedStats() {
    const tbody = document.querySelector('.stats-table tbody');
    const mockData = [
        {
            class: 'CNTT1',
            total: 50,
            submitted: 48,
            excellent: 10,
            good: 20,
            average: 15,
            fair: 3,
            poor: 0,
            avgScore: 85.5
        },
        // ... thêm dữ liệu
    ];

    tbody.innerHTML = mockData.map(row => `
        <tr>
            <td>${row.class}</td>
            <td>${row.total}</td>
            <td>${row.submitted}</td>
            <td>${row.excellent}</td>
            <td>${row.good}</td>
            <td>${row.average}</td>
            <td>${row.fair}</td>
            <td>${row.poor}</td>
            <td>${row.avgScore}</td>
        </tr>
    `).join('');
}

function setupEventListeners() {
    document.getElementById('semesterSelect').addEventListener('change', filterStats);
    document.getElementById('facultyFilter').addEventListener('change', updateClassFilter);
}

function filterStats() {
    // Implement filtering logic
    const semester = document.getElementById('semesterSelect').value;
    const faculty = document.getElementById('facultyFilter').value;
    const classValue = document.getElementById('classFilter').value;

    // Refresh charts and tables with filtered data
    refreshCharts(semester, faculty, classValue);
}

function refreshCharts(semester, faculty, classValue) {
    // Update each chart with filtered data
    // This would typically involve API calls
    console.log('Refreshing charts with filters:', { semester, faculty, classValue });
}

function updateClassFilter() {
    const faculty = document.getElementById('facultyFilter').value;
    const classFilter = document.getElementById('classFilter');
    
    // Clear existing options
    classFilter.innerHTML = '<option value="">Tất cả lớp</option>';
    
    if (faculty) {
        // Add classes based on selected faculty
        const classes = getClassesForFaculty(faculty);
        classes.forEach(c => {
            const option = document.createElement('option');
            option.value = c.value;
            option.textContent = c.label;
            classFilter.appendChild(option);
        });
    }
}

function getClassesForFaculty(faculty) {
    // Mock data - replace with actual data
    const classMap = {
        'cntt': [
            { value: 'cntt1', label: 'CNTT1' },
            { value: 'cntt2', label: 'CNTT2' }
        ],
        'ddt': [
            { value: 'ddt1', label: 'DDT1' },
            { value: 'ddt2', label: 'DDT2' }
        ]
    };
    return classMap[faculty] || [];
}

function exportReport() {
    const modal = document.getElementById('exportModal');
    modal.style.display = 'flex';
}

function closeExportModal() {
    const modal = document.getElementById('exportModal');
    modal.style.display = 'none';
}

function downloadReport(format) {
    const selectedOptions = Array.from(document.querySelectorAll('.export-options input:checked'))
        .map(input => input.value);
    
    // Mock export functionality
    console.log(`Exporting report in ${format} format with sections:`, selectedOptions);
    
    // Show success message
    showNotification('success', `Đã xuất báo cáo định dạng ${format.toUpperCase()}`);
    closeExportModal();
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
