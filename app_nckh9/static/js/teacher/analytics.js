document.addEventListener('DOMContentLoaded', function() {
    initializeAnalytics();
    setupEventListeners();
});

function initializeAnalytics() {
    loadAllCharts();
    loadDetailedStats();
}

function setupEventListeners() {
    // Filter event listeners
    document.getElementById('semesterFilter').addEventListener('change', handleFilterChange);
    document.getElementById('classFilter').addEventListener('change', handleFilterChange);
    
    // Export buttons
    document.querySelectorAll('.format-options .btn').forEach(btn => {
        btn.addEventListener('click', () => handleExport(btn.dataset.format));
    });
}

// Thêm các hàm tạo biểu đồ mới
function createPerformanceLineChart() {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
            datasets: [{
                label: 'Điểm trung bình lớp',
                data: [75, 78, 82, 79, 85, 88],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: true,
                backgroundColor: 'rgba(75, 192, 192, 0.1)'
            },
            {
                label: 'Điểm trung bình khoa',
                data: [72, 75, 79, 80, 82, 85],
                borderColor: 'rgb(153, 102, 255)',
                tension: 0.1,
                fill: true,
                backgroundColor: 'rgba(153, 102, 255, 0.1)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Xu hướng điểm rèn luyện theo thời gian'
                }
            }
        }
    });
}

function createCriteriaRadarChart() {
    const ctx = document.getElementById('criteriaRadarChart').getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: [
                'Ý thức học tập',
                'Ý thức kỷ luật',
                'Hoạt động đoàn thể',
                'Quan hệ cộng đồng',
                'Phẩm chất đạo đức'
            ],
            datasets: [{
                label: 'Điểm trung bình',
                data: [8.5, 9.0, 7.5, 8.0, 8.8],
                fill: true,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgb(54, 162, 235)',
                pointBackgroundColor: 'rgb(54, 162, 235)',
                pointRadius: 4
            }]
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                        stepSize: 2
                    }
                }
            }
        }
    });
}

function createGradeDistributionDoughnut() {
    const ctx = document.getElementById('gradeDistributionChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Xuất sắc', 'Tốt', 'Khá', 'Trung bình', 'Yếu'],
            datasets: [{
                data: [30, 40, 20, 8, 2],
                backgroundColor: [
                    'rgba(76, 175, 80, 0.8)',  // Xanh lá - Xuất sắc
                    'rgba(33, 150, 243, 0.8)', // Xanh dương - Tốt
                    'rgba(255, 193, 7, 0.8)',  // Vàng - Khá
                    'rgba(255, 152, 0, 0.8)',  // Cam - Trung bình
                    'rgba(244, 67, 54, 0.8)'   // Đỏ - Yếu
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Phân bố xếp loại điểm rèn luyện'
                }
            }
        }
    });
}

function createComparisonBarChart() {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['IT001', 'IT002', 'IT003', 'IT004', 'IT005'],
            datasets: [{
                label: 'Điểm trung bình',
                data: [85, 82, 88, 79, 83],
                backgroundColor: 'rgba(54, 162, 235, 0.8)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'So sánh điểm trung bình giữa các lớp'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Thêm các biểu đồ mới
function createAdditionalCharts() {
    // Biểu đồ đường theo dõi tiến độ chấm điểm
    const progressCtx = document.getElementById('scoringProgressChart').getContext('2d');
    new Chart(progressCtx, {
        type: 'line',
        data: {
            labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
            datasets: [{
                label: 'Tiến độ chấm điểm',
                data: [20, 45, 60, 75, 90, 98],
                borderColor: 'rgb(54, 162, 235)',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(54, 162, 235, 0.1)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Tiến độ chấm điểm theo thời gian (%)'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });

    // Biểu đồ phân tích xu hướng theo tiêu chí
    const trendRadarCtx = document.getElementById('criteriaAnalysisTrend').getContext('2d');
    new Chart(trendRadarCtx, {
        type: 'radar',
        data: {
            labels: ['Ý thức học tập', 'Ý thức kỷ luật', 'Hoạt động đoàn thể', 
                    'Quan hệ cộng đồng', 'Phẩm chất đạo đức'],
            datasets: [{
                label: 'Kỳ trước',
                data: [7.5, 8.0, 7.0, 7.8, 8.2],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgb(255, 99, 132)'
            }, {
                label: 'Kỳ này',
                data: [8.5, 9.0, 7.5, 8.0, 8.8],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgb(54, 162, 235)'
            }]
        },
        options: {
            elements: {
                line: {
                    borderWidth: 3
                }
            }
        }
    });

    // Biểu đồ phân bố điểm theo khoảng
    const rangeDistCtx = document.getElementById('scoreRangeDistribution').getContext('2d');
    new Chart(rangeDistCtx, {
        type: 'bar',
        data: {
            labels: ['90-100', '80-89', '70-79', '60-69', '50-59', '<50'],
            datasets: [{
                label: 'Số lượng sinh viên',
                data: [25, 40, 30, 15, 8, 2],
                backgroundColor: [
                    'rgba(76, 175, 80, 0.8)',
                    'rgba(33, 150, 243, 0.8)',
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(255, 152, 0, 0.8)',
                    'rgba(244, 67, 54, 0.8)',
                    'rgba(158, 158, 158, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Phân bố điểm theo khoảng'
                }
            }
        }
    });

    // Biểu đồ so sánh giữa các khoa
    const facultyCompCtx = document.getElementById('facultyComparison').getContext('2d');
    new Chart(facultyCompCtx, {
        type: 'bar',
        data: {
            labels: ['CNTT', 'Kinh tế', 'Cơ khí', 'Điện tử', 'Xây dựng'],
            datasets: [{
                label: 'Điểm trung bình',
                data: [85, 82, 79, 83, 80],
                backgroundColor: 'rgba(75, 192, 192, 0.8)',
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'So sánh điểm trung bình giữa các khoa'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    // Biểu đồ xu hướng theo thời gian (nhiều năm)
    const yearlyTrendCtx = document.getElementById('yearlyTrendChart').getContext('2d');
    new Chart(yearlyTrendCtx, {
        type: 'line',
        data: {
            labels: ['2020', '2021', '2022', '2023', '2024'],
            datasets: [{
                label: 'Điểm trung bình',
                data: [78, 80, 82, 85, 87],
                borderColor: 'rgb(153, 102, 255)',
                tension: 0.1,
                fill: true,
                backgroundColor: 'rgba(153, 102, 255, 0.1)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Xu hướng điểm rèn luyện qua các năm'
                }
            }
        }
    });
}

async function loadAllCharts() {
    try {
        showLoader();
        initializeCharts(); // Thêm dòng này
        const data = await fetchAnalyticsData();
        createScoreDistributionChart(data.scoreDistribution);
        createTrendChart(data.trends);
        createCriteriaChart(data.criteriaAnalysis);
        createClassComparisonChart(data.classComparison);
        updateKPIs(data.kpis);
        createPerformanceLineChart();
        createCriteriaRadarChart();
        createGradeDistributionDoughnut();
        createComparisonBarChart();
        createAdditionalCharts();
        updateChartData(data);
    } catch (error) {
        showError('Không thể tải dữ liệu phân tích');
    } finally {
        hideLoader();
    }
}

// Chart Creation Functions
function createScoreDistributionChart(data) {
    const ctx = document.getElementById('scoreDistributionChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Xuất sắc', 'Tốt', 'Khá', 'Trung bình', 'Yếu'],
            datasets: [{
                label: 'Số lượng sinh viên',
                data: data,
                backgroundColor: [
                    'rgba(76, 175, 80, 0.7)',  // Xuất sắc - Green
                    'rgba(33, 150, 243, 0.7)',  // Tốt - Blue
                    'rgba(255, 193, 7, 0.7)',   // Khá - Yellow
                    'rgba(255, 152, 0, 0.7)',   // Trung bình - Orange
                    'rgba(244, 67, 54, 0.7)'    // Yếu - Red
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Phân bố điểm rèn luyện'
                },
                datalabels: {
                    color: '#fff',
                    font: {
                        weight: 'bold'
                    },
                    formatter: (value) => {
                        return value + ' SV';
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Số lượng sinh viên'
                    }
                }
            }
        }
    });
}

function createTrendChart(data) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Điểm trung bình',
                data: data.averages,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: true,
                backgroundColor: 'rgba(75, 192, 192, 0.1)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Xu hướng điểm theo thời gian'
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Điểm trung bình'
                    }
                }
            }
        }
    });
}

function createCriteriaChart(data) {
    const ctx = document.getElementById('criteriaChart').getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Điểm trung bình',
                data: data.averages,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgb(54, 162, 235)',
                pointBackgroundColor: 'rgb(54, 162, 235)',
                pointRadius: 4
            }]
        },
        options: {
            scales: {
                r: {
                    min: 0,
                    max: 10,
                    ticks: {
                        stepSize: 2
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Phân tích theo tiêu chí'
                }
            }
        }
    });
}

function createClassComparisonChart(data) {
    const ctx = document.getElementById('classComparisonChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.classes,
            datasets: [{
                label: 'Điểm trung bình',
                data: data.averages,
                backgroundColor: 'rgba(75, 192, 192, 0.7)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'So sánh điểm trung bình giữa các lớp'
                }
            }
        }
    });
}

// Update KPI displays
function updateKPIs(data) {
    document.querySelector('.stat-number').textContent = data.totalStudents;
    // Update other KPIs...
}

// Data fetching
async function fetchAnalyticsData() {
    try {
        const response = await fetch('/api/analytics/dashboard', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching analytics data:', error);
        throw error;
    }
}

// Export functionality
async function handleExport(format) {
    try {
        showLoader();
        const filters = getActiveFilters();
        const response = await generateReport(format, filters);
        
        // Create and trigger download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        showError('Không thể xuất báo cáo');
    } finally {
        hideLoader();
    }
}

// Filter handling
function handleFilterChange() {
    const filters = getActiveFilters();
    updateChartsWithFilters(filters);
}

function getActiveFilters() {
    return {
        semester: document.getElementById('semesterFilter').value,
        class: document.getElementById('classFilter').value
    };
}

async function updateChartsWithFilters(filters) {
    try {
        showLoader();
        const data = await fetchFilteredData(filters);
        updateAllCharts(data);
    } catch (error) {
        showError('Không thể cập nhật dữ liệu');
    } finally {
        hideLoader();
    }
}

// UI Helpers
function showLoader() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    document.body.appendChild(loader);
}

function hideLoader() {
    const loader = document.querySelector('.loader');
    if (loader) loader.remove();
}

function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Thêm các hàm khởi tạo biểu đồ
function initializeCharts() {
    // Biểu đồ tròn phân bố điểm
    const pieCtx = document.getElementById('gradeDistributionPie').getContext('2d');
    new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: ['Xuất sắc', 'Tốt', 'Khá', 'Trung bình', 'Yếu'],
            datasets: [{
                data: [25, 35, 20, 15, 5],
                backgroundColor: [
                    'rgba(76, 175, 80, 0.8)',  // Xanh lá
                    'rgba(33, 150, 243, 0.8)', // Xanh dương
                    'rgba(255, 193, 7, 0.8)',  // Vàng
                    'rgba(255, 152, 0, 0.8)',  // Cam
                    'rgba(244, 67, 54, 0.8)'   // Đỏ
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Biểu đồ đường xu hướng điểm
    const lineCtx = document.getElementById('scoreTrendLine').getContext('2d');
    new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
            datasets: [{
                label: 'Điểm trung bình',
                data: [75, 78, 82, 79, 85, 88],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: true,
                backgroundColor: 'rgba(75, 192, 192, 0.1)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 60,
                    max: 100
                }
            }
        }
    });

    // Biểu đồ radar tiêu chí
    const radarCtx = document.getElementById('criteriaRadar').getContext('2d');
    new Chart(radarCtx, {
        type: 'radar',
        data: {
            labels: [
                'Ý thức học tập',
                'Ý thức kỷ luật',
                'Hoạt động đoàn thể',
                'Quan hệ cộng đồng',
                'Phẩm chất đạo đức'
            ],
            datasets: [{
                label: 'Điểm trung bình',
                data: [8.5, 9.0, 7.5, 8.0, 8.8],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgb(54, 162, 235)',
                pointBackgroundColor: 'rgb(54, 162, 235)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 10
                }
            }
        }
    });

    // Biểu đồ cột so sánh lớp
    const barCtx = document.getElementById('classComparisonBar').getContext('2d');
    new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ['IT001', 'IT002', 'IT003', 'IT004', 'IT005'],
            datasets: [{
                label: 'Điểm trung bình',
                data: [85, 82, 88, 79, 83],
                backgroundColor: 'rgba(54, 162, 235, 0.8)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 60,
                    max: 100
                }
            }
        }
    });

    // Biểu đồ cột chồng chi tiết
    const stackCtx = document.getElementById('detailedScoreStack').getContext('2d');
    new Chart(stackCtx, {
        type: 'bar',
        data: {
            labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
            datasets: [
                {
                    label: 'Xuất sắc',
                    data: [20, 22, 25, 23, 28, 30],
                    backgroundColor: 'rgba(76, 175, 80, 0.8)'
                },
                {
                    label: 'Tốt',
                    data: [35, 33, 32, 35, 35, 34],
                    backgroundColor: 'rgba(33, 150, 243, 0.8)'
                },
                {
                    label: 'Khá',
                    data: [25, 26, 24, 23, 20, 19],
                    backgroundColor: 'rgba(255, 193, 7, 0.8)'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    max: 100
                }
            }
        }
    });
}

// Hàm cập nhật dữ liệu cho tất cả các biểu đồ
function updateChartData(data) {
    updateScoreDistribution(data.scoreDistribution);
    updateTrends(data.trends);
    updateCriteriaAnalysis(data.criteriaAnalysis);
    updateComparisonData(data.comparison);
    updateYearlyTrends(data.yearlyTrends);
    updateFacultyComparison(data.facultyData);
}
