// Modal handling
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Analysis functions
function startNewAnalysis() {
    showModal('resultsModal');
    const resultsContainer = document.querySelector('.results-container');
    resultsContainer.innerHTML = '<div class="loading">Đang phân tích dữ liệu...</div>';
    
    // Simulate analysis
    setTimeout(() => {
        resultsContainer.innerHTML = `
            <div class="analysis-result">
                <h3>Kết quả phân tích</h3>
                <div class="result-stats">
                    <div class="stat-item">
                        <h4>Tổng số sinh viên</h4>
                        <p>1,234</p>
                    </div>
                    <div class="stat-item">
                        <h4>Điểm trung bình</h4>
                        <p>78.5</p>
                    </div>
                    <div class="stat-item">
                        <h4>Bất thường</h4>
                        <p>15</p>
                    </div>
                </div>
            </div>
        `;
    }, 2000);
}

function runAnalysis(type) {
    showModal('resultsModal');
    const resultsContainer = document.querySelector('.results-container');
    resultsContainer.innerHTML = '<div class="loading">Đang phân tích dữ liệu...</div>';
    
    // Simulate analysis based on type
    setTimeout(() => {
        switch(type) {
            case 'class-analysis':
                showClassAnalysis();
                break;
            case 'prediction':
                showPredictionResults();
                break;
            case 'student-advice':
                showStudentAdvice();
                break;
        }
    }, 1500);
}

function showClassAnalysis() {
    const resultsContainer = document.querySelector('.results-container');
    resultsContainer.innerHTML = `
        <div class="analysis-result">
            <h3>Phân tích tình hình lớp học</h3>
            <div class="result-stats">
                <div class="stat-item">
                    <p class="stat-label">Điểm trung bình lớp</p>
                    <p class="stat-value">85.5</p>
                    <p class="stat-trend positive">+2.3 điểm so với kỳ trước</p>
                </div>
                <div class="stat-item">
                    <p class="stat-label">Sinh viên cần hỗ trợ</p>
                    <p class="stat-value">5</p>
                    <p class="stat-trend negative">Tăng 2 sv so với tháng trước</p>
                </div>
            </div>
            <div class="chart-container">
                <canvas id="classChart"></canvas>
            </div>
        </div>
    `;
}

function showPredictionResults() {
    const resultsContainer = document.querySelector('.results-container');
    resultsContainer.innerHTML = `
        <div class="analysis-result">
            <h3>Dự đoán kết quả cuối kỳ</h3>
            <div class="prediction-stats">
                <div class="prediction-item">
                    <h4>Dự đoán điểm trung bình lớp</h4>
                    <p class="prediction-value">87.2</p>
                    <p class="prediction-trend positive">+1.7 điểm so với hiện tại</p>
                </div>
                <div class="prediction-details">
                    <ul>
                        <li>15 sinh viên có khả năng đạt điểm xuất sắc</li>
                        <li>3 sinh viên cần được quan tâm đặc biệt</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

function showStudentAdvice() {
    const resultsContainer = document.querySelector('.results-container');
    resultsContainer.innerHTML = `
        <div class="analysis-result">
            <h3>Gợi ý hoạt động cho sinh viên</h3>
            <div class="advice-list">
                <div class="advice-group">
                    <h4>Nhóm cần tăng cường hoạt động</h4>
                    <div class="student-cards">
                        <div class="student-card">
                            <img src="../assets/images/avatar.jpg" alt="Student" class="student-avatar">
                            <div class="student-info">
                                <h5>Nguyễn Văn A</h5>
                                <p>Điểm hiện tại: 75/100</p>
                                <div class="suggestions">
                                    <span class="suggestion-tag">Hoạt động tình nguyện</span>
                                    <span class="suggestion-tag">CLB học thuật</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function viewDetails(insightId) {
    showModal('resultsModal');
    const resultsContainer = document.querySelector('.results-container');
    resultsContainer.innerHTML = `<div class="loading">Đang tải chi tiết...</div>`;
    
    setTimeout(() => {
        switch(insightId) {
            case 'warning-001':
                showWarningDetails();
                break;
            case 'improvement-001':
                showImprovementDetails();
                break;
        }
    }, 1000);
}

function showWarningDetails() {
    const resultsContainer = document.querySelector('.results-container');
    resultsContainer.innerHTML = `
        <div class="warning-details">
            <h3>Danh sách sinh viên cần quan tâm</h3>
            <div class="student-list">
                <!-- Add student list items here -->
            </div>
            <div class="action-suggestions">
                <h4>Đề xuất hành động</h4>
                <ul class="action-list">
                    <li>Tổ chức gặp mặt tư vấn cá nhân</li>
                    <li>Phân công sinh viên giỏi hỗ trợ</li>
                    <li>Tăng cường hoạt động nhóm</li>
                </ul>
            </div>
        </div>
    `;
}

function loadInsightDetails(insightId, container) {
    const details = {
        'anomaly-001': {
            title: 'Điểm số bất thường',
            content: `
                <ul>
                    <li>15 sinh viên có điểm giảm >30%</li>
                    <li>Tập trung ở các lớp: K20-CT1, K20-CT2</li>
                    <li>Nguyên nhân có thể: Thiếu hoạt động ngoại khóa</li>
                </ul>`
        },
        'trend-001': {
            title: 'Xu hướng tích cực',
            content: `
                <ul>
                    <li>Tăng 5% so với kỳ trước</li>
                    <li>80% lớp có điểm trung bình tăng</li>
                    <li>Hoạt động đoàn hội tăng 25%</li>
                </ul>`
        }
    };

    container.innerHTML = `
        <div class="insight-details">
            <h3>${details[insightId].title}</h3>
            <div class="detail-content">
                ${details[insightId].content}
            </div>
        </div>
    `;
}

// Recommendation handling
function implementRecommendation(recId) {
    const item = document.querySelector(`[data-rec-id="${recId}"]`);
    if (item) {
        item.classList.add('implemented');
        item.innerHTML = '<p>Đã áp dụng đề xuất</p>';
    }
}

function dismissRecommendation(recId) {
    const item = document.querySelector(`[data-rec-id="${recId}"]`);
    if (item) {
        item.style.display = 'none';
    }
}

function exportResults() {
    // Add export functionality here
    alert('Đã xuất báo cáo thành công!');
}

// Add event listener for when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips, modals, etc.
    initializeUI();
});

function initializeUI() {
    // Modal close handlers
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    }
}
