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
    const analysisTypes = {
        'comparison': 'So sánh điểm số',
        'prediction': 'Dự đoán kết quả',
        'anomaly': 'Phát hiện bất thường'
    };
    
    showModal('resultsModal');
    const resultsContainer = document.querySelector('.results-container');
    resultsContainer.innerHTML = `<div class="loading">Đang thực hiện ${analysisTypes[type]}...</div>`;
    
    // Simulate analysis process
    setTimeout(() => {
        const results = generateAnalysisResults(type);
        resultsContainer.innerHTML = results;
    }, 1500);
}

function generateAnalysisResults(type) {
    switch(type) {
        case 'comparison':
            return `
                <div class="analysis-result">
                    <h3>Kết quả so sánh điểm số</h3>
                    <div class="chart-container">
                        <canvas id="comparisonChart"></canvas>
                    </div>
                    <div class="summary">
                        <p>Khoa CNTT có điểm trung bình cao nhất (85.2)</p>
                        <p>Khoa Kinh tế cần cải thiện (70.8)</p>
                    </div>
                </div>`;
        case 'prediction':
            return `
                <div class="analysis-result">
                    <h3>Dự đoán xu hướng</h3>
                    <div class="prediction-stats">
                        <p>Dự kiến điểm trung bình kỳ tới: 80.5 (+2.3%)</p>
                        <p>Độ tin cậy: 85%</p>
                    </div>
                </div>`;
        case 'anomaly':
            return `
                <div class="analysis-result">
                    <h3>Các trường hợp bất thường</h3>
                    <div class="anomaly-list">
                        <div class="anomaly-item">
                            <p>15 sinh viên có điểm giảm >30%</p>
                            <p>5 lớp có điểm trung bình thấp bất thường</p>
                        </div>
                    </div>
                </div>`;
    }
}

function viewDetails(insightId) {
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
    
    // Simulate loading details
    setTimeout(() => {
        loadInsightDetails(insightId, resultsContainer);
    }, 1000);
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
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_');
    const filename = `analysis_results_${timestamp}.pdf`;
    
    // Simulate export
    const link = document.createElement('a');
    link.href = '#';
    link.download = filename;
    link.click();
    
    alert(`Đã xuất kết quả: ${filename}`);
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

    // Initialize chat interface
    const chatContainer = document.getElementById('chatContainer');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    if (chatContainer && messageInput && sendButton) {
        initializeChat(chatContainer, messageInput, sendButton);
    }

    // Initialize AI settings if available
    const settingsForm = document.getElementById('aiSettingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', handleSettingsSubmit);
    }
});

function initializeChat(container, input, button) {
    // Add event listeners for sending messages
    button.addEventListener('click', () => sendMessage(input, container));
    input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage(input, container);
        }
    });

    // Load chat history
    loadChatHistory(container);
}

async function sendMessage(input, container) {
    const message = input.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessageToChat(container, message, 'user');
    input.value = '';

    try {
        // Show typing indicator
        const typingIndicator = addTypingIndicator(container);

        // Send message to AI
        const response = await fetch('/api/ai-assistant/chat/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ message })
        });

        // Remove typing indicator
        typingIndicator.remove();

        if (response.ok) {
            const data = await response.json();
            addMessageToChat(container, data.response, 'assistant');
        } else {
            const error = await response.json();
            showAlert(error.message || 'Error getting AI response', 'danger');
        }
    } catch (error) {
        showAlert('An error occurred while getting AI response', 'danger');
    }
}

function addMessageToChat(container, message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="message-text">${message}</div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        </div>
    `;
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

function addTypingIndicator(container) {
    const indicator = document.createElement('div');
    indicator.className = 'chat-message assistant-message typing-indicator';
    indicator.innerHTML = `
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
    return indicator;
}

async function loadChatHistory(container) {
    try {
        const response = await fetch('/api/ai-assistant/history/');
        if (response.ok) {
            const data = await response.json();
            data.forEach(message => {
                addMessageToChat(container, message.content, message.sender);
            });
        }
    } catch (error) {
        showAlert('Error loading chat history', 'danger');
    }
}

async function handleSettingsSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const settings = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch('/api/ai-assistant/settings/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(settings)
        });
        
        if (response.ok) {
            showAlert('AI settings saved successfully!', 'success');
        } else {
            const error = await response.json();
            showAlert(error.message || 'Error saving AI settings', 'danger');
        }
    } catch (error) {
        showAlert('An error occurred while saving AI settings', 'danger');
    }
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => alertDiv.remove(), 5000);
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
