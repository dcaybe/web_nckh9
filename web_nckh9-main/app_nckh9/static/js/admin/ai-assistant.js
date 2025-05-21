
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

async function runAnalysis(type) {
    const analysisTypes = {
        'comparison': 'So sánh điểm số',
        'prediction': 'Dự đoán kết quả',
        'anomaly': 'Phát hiện bất thường'
    };

    showModal('resultsModal');
    const resultsContainer = document.querySelector('.results-container');
    resultsContainer.innerHTML = `<div class="loading">Đang thực hiện ${analysisTypes[type]}...</div>`;

    try {
        // Gọi API chatbot để phân tích
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: type,
                timestamp: new Date().toISOString()
            })
        });

        if (!response.ok) {
            throw new Error('Lỗi khi phân tích');
        }

        const data = await response.json();
        
        // Cache kết quả
        localStorage.setItem(`analysis_${type}`, JSON.stringify({
            timestamp: new Date().toISOString(),
            results: data
        }));

        resultsContainer.innerHTML = generateAnalysisResults(type, data);

    } catch (error) {
        resultsContainer.innerHTML = `
            <div class="error-message">
                Có lỗi xảy ra: ${error.message}
            </div>
        `;
    }
}

function generateAnalysisResults(type, data) {
    const cachedData = localStorage.getItem(`analysis_${type}`);
    if (cachedData) {
        const cached = JSON.parse(cachedData);
        const cacheAge = Date.now() - new Date(cached.timestamp).getTime();
        
        // Sử dụng cache nếu chưa quá 1 giờ
        if (cacheAge < 3600000) {
            data = cached.results;
        }
    }

    switch(type) {
        case 'comparison':
            return `
                <div class="analysis-result">
                    <h3>Kết quả so sánh điểm số</h3>
                    <div class="chart-container">
                        <canvas id="comparisonChart"></canvas>
                    </div>
                    <div class="summary">
                        ${data.summary.map(item => `<p>${item}</p>`).join('')}
                    </div>
                </div>`;
        case 'prediction':
            return `
                <div class="analysis-result">
                    <h3>Dự đoán xu hướng</h3>
                    <div class="prediction-stats">
                        <p>Dự kiến điểm trung bình: ${data.predicted_average}</p>
                        <p>Độ tin cậy: ${data.confidence}%</p>
                        <p>Xu hướng: ${data.trend}</p>
                    </div>
                </div>`;
        case 'anomaly':
            return `
                <div class="analysis-result">
                    <h3>Các trường hợp bất thường</h3>
                    <div class="anomaly-list">
                        ${data.anomalies.map(anomaly => `
                            <div class="anomaly-item">
                                <p>${anomaly.description}</p>
                                <p>Mức độ: ${anomaly.severity}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>`;
        default:
            return '<div>Loại phân tích không hợp lệ</div>';
    }
}

async function viewDetails(insightId) {
    showModal('resultsModal');
    const resultsContainer = document.querySelector('.results-container');
    resultsContainer.innerHTML = `
        <div class="insight-details">
            <h3>Chi tiết phát hiện ${insightId}</h3>
            <div class="detail-content">
                <p>Đang tải chi tiết...</p>
            </div>
        </div>
    `;

    try {
        const cachedDetails = localStorage.getItem(`insight_${insightId}`);
        if (cachedDetails) {
            const cached = JSON.parse(cachedDetails);
            const cacheAge = Date.now() - new Date(cached.timestamp).getTime();
            
            // Sử dụng cache nếu chưa quá 30 phút
            if (cacheAge < 1800000) {
                loadInsightDetails(cached.data, resultsContainer);
                return;
            }
        }

        // Gọi API chatbot để lấy chi tiết phân tích
        const response = await fetch(`/api/insights/${insightId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Không thể tải chi tiết');
        }

        const data = await response.json();
        
        // Cache kết quả
        localStorage.setItem(`insight_${insightId}`, JSON.stringify({
            timestamp: new Date().toISOString(),
            data: data
        }));

        loadInsightDetails(data, resultsContainer);

    } catch (error) {
        resultsContainer.innerHTML = `
            <div class="error-message">
                Có lỗi xảy ra: ${error.message}
            </div>
        `;
    }
}

function loadInsightDetails(data, container) {
    container.innerHTML = `
        <div class="insight-details">
            <h3>${data.title}</h3>
            <div class="detail-content">
                <div class="detail-summary">
                    <p>${data.summary}</p>
                </div>
                <div class="detail-stats">
                    ${Object.entries(data.stats).map(([key, value]) => `
                        <div class="stat-item">
                            <label>${key}:</label>
                            <span>${value}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="detail-recommendations">
                    <h4>Đề xuất cải thiện:</h4>
                    <ul>
                        ${data.recommendations.map(rec => `
                            <li>${rec}</li>
                        `).join('')}
                    </ul>
                </div>
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

async function exportResults() {
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_');
    const filename = `analysis_results_${timestamp}.pdf`;
    
    try {
        // Thu thập dữ liệu phân tích từ cache
        const analysisTypes = ['comparison', 'prediction', 'anomaly'];
        const exportData = {
            timestamp: timestamp,
            analyses: {}
        };
        
        for (const type of analysisTypes) {
            const cachedData = localStorage.getItem(`analysis_${type}`);
            if (cachedData) {
                exportData.analyses[type] = JSON.parse(cachedData).results;
            }
        }

        // Gọi API để tạo PDF với kết quả phân tích từ chatbot
        const response = await fetch('/api/export', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(exportData)
        });

        if (!response.ok) {
            throw new Error('Không thể tạo file PDF');
        }

        // Tải file PDF
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        alert(`Lỗi khi xuất kết quả: ${error.message}`);
    }
}

// Add event listener for when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Close modal when clicking outside
    window.onclick = function(event) {
        const modals = document.getElementsByClassName('modal');
        for (let modal of modals) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        }
    }
});
