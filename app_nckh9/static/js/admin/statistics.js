import { fetchAPI, showLoading, hideLoading, handleError, retryOperation } from './api.js';

let distributionChart, facultyChart, trendChart, categoryChart;
let currentFilters = {
    semester: '',
    faculty: '',
    class: ''
};

document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    setupEventListeners();
    loadStatistics();
});

async function loadStatistics() {
    try {
        showLoading('statsContent');
        const [overview, ranking, detailed] = await Promise.all([
            fetchAPI('/statistics/overview/'),
            fetchAPI('/statistics/ranking/'),
            fetchAPI('/statistics/detailed/')
        ]);
        
        updateCharts(overview.data);
        updateRankingList(ranking.data);
        updateDetailedStats(detailed.data);
    } catch (error) {
        handleError(error);
    } finally {
        hideLoading('statsContent');
    }
}

function initializeCharts() {
    // Biểu đồ phân bố điểm
    distributionChart = new Chart(document.getElementById('distributionChart'), {
        type: 'bar',
        data: {
            labels: ['Xuất sắc', 'Tốt', 'Khá', 'Trung bình', 'Yếu'],
            datasets: [{
                label: 'Số lượng sinh viên',
                data: [0, 0, 0, 0, 0],
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
            labels: [],
            datasets: [{
                label: 'Điểm trung bình',
                data: [],
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
            labels: [],
            datasets: [{
                label: 'Điểm trung bình',
                data: [],
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
            labels: [],
            datasets: [{
                data: [],
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

function updateCharts(data) {
    // Cập nhật biểu đồ phân bố
    distributionChart.data.datasets[0].data = [
        data.excellent_count,
        data.good_count,
        data.average_count,
        data.fair_count,
        data.poor_count
    ];
    distributionChart.update();

    // Cập nhật biểu đồ khoa
    facultyChart.data.labels = data.faculties.map(f => f.name);
    facultyChart.data.datasets[0].data = data.faculties.map(f => f.average_score);
    facultyChart.update();

    // Cập nhật biểu đồ xu hướng
    trendChart.data.labels = data.trend.map(t => t.month);
    trendChart.data.datasets[0].data = data.trend.map(t => t.average_score);
    trendChart.update();

    // Cập nhật biểu đồ tiêu chí
    categoryChart.data.labels = data.categories.map(c => c.name);
    categoryChart.data.datasets[0].data = data.categories.map(c => c.average_score);
    categoryChart.update();
}

function updateRankingList(data) {
    const rankingList = document.querySelector('.ranking-list');
    rankingList.innerHTML = data.map((item, index) => `
        <div class="ranking-item">
            <span class="rank">${index + 1}</span>
            <span class="class-name">${item.class_name}</span>
            <span class="score">${item.average_score.toFixed(1)}</span>
        </div>
    `).join('');
}

function updateDetailedStats(data) {
    const tbody = document.querySelector('.stats-table tbody');
    tbody.innerHTML = data.map(row => `
        <tr>
            <td>${row.class_name}</td>
            <td>${row.total_students}</td>
            <td>${row.submitted_count}</td>
            <td>${row.excellent_count}</td>
            <td>${row.good_count}</td>
            <td>${row.average_count}</td>
            <td>${row.fair_count}</td>
            <td>${row.poor_count}</td>
            <td>${row.average_score.toFixed(1)}</td>
        </tr>
    `).join('');
}

function setupEventListeners() {
    document.getElementById('semesterSelect').addEventListener('change', filterStats);
    document.getElementById('facultyFilter').addEventListener('change', async (e) => {
        await updateClassFilter(e.target.value);
        filterStats();
    });
    document.getElementById('classFilter').addEventListener('change', filterStats);
}

async function filterStats() {
    const newFilters = {
        semester: document.getElementById('semesterSelect').value,
        faculty: document.getElementById('facultyFilter').value,
        class: document.getElementById('classFilter').value
    };

    // Chỉ gọi API nếu filter thay đổi
    if (JSON.stringify(newFilters) !== JSON.stringify(currentFilters)) {
        currentFilters = newFilters;
        try {
            showLoading('statsContent');
            const response = await fetchAPI('/statistics/filter/', {
                method: 'POST',
                body: JSON.stringify(currentFilters)
            });
            
            updateCharts(response.data.overview);
            updateRankingList(response.data.ranking);
            updateDetailedStats(response.data.detailed);
        } catch (error) {
            handleError(error);
        } finally {
            hideLoading('statsContent');
        }
    }
}

async function updateClassFilter(faculty) {
    const classFilter = document.getElementById('classFilter');
    classFilter.innerHTML = '<option value="">Tất cả lớp</option>';
    
    if (faculty) {
        try {
            const response = await fetchAPI(`/faculties/${faculty}/classes/`);
            response.data.forEach(c => {
                const option = document.createElement('option');
                option.value = c.id;
                option.textContent = c.name;
                classFilter.appendChild(option);
            });
        } catch (error) {
            handleError(error);
        }
    }
}

async function exportReport() {
    const modal = document.getElementById('exportModal');
    modal.style.display = 'flex';
}

function closeExportModal() {
    const modal = document.getElementById('exportModal');
    modal.style.display = 'none';
}

async function downloadReport(format) {
    const selectedOptions = Array.from(document.querySelectorAll('.export-options input:checked'))
        .map(input => input.value);
    
    if (selectedOptions.length === 0) {
        showNotification('error', 'Vui lòng chọn ít nhất một mục để xuất báo cáo');
        return;
    }

    try {
        showLoading('exportModal');
        const response = await fetchAPI('/statistics/export/', {
            method: 'POST',
            body: JSON.stringify({
                format,
                sections: selectedOptions,
                filters: currentFilters
            })
        });

        // Tải file xuống
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `statistics_report.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showNotification('success', `Đã xuất báo cáo định dạng ${format.toUpperCase()}`);
        closeExportModal();
    } catch (error) {
        handleError(error);
    } finally {
        hideLoading('exportModal');
    }
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
