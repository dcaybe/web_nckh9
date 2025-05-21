
class AIAssistant {
    constructor() {
        this.messageHistory = [];
        this.isProcessing = false;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const sendButton = document.getElementById('sendButton');
        const chatInput = document.getElementById('chatInput');
        const suggestedPrompts = document.querySelectorAll('.prompt-card');

        sendButton.addEventListener('click', () => this.handleSendMessage());
        chatInput.addEventListener('keypress', (e) => this.handleKeyPress(e));
        chatInput.addEventListener('input', () => this.handleInputChange());

        suggestedPrompts.forEach(prompt => {
            prompt.addEventListener('click', () => this.usePrompt(prompt.textContent.trim()));
        });
    }

    async handleSendMessage() {
        if (this.isProcessing) return;

        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;

        // Clear welcome screen if it exists
        const welcomeScreen = document.querySelector('.welcome-screen');
        if (welcomeScreen) {
            welcomeScreen.remove();
        }

        // Add user message
        this.addMessage(message, true);
        this.messageHistory.push({ role: 'user', content: message });

        // Clear input
        input.value = '';
        input.style.height = 'auto';
        document.getElementById('sendButton').disabled = true;

        // Show typing indicator
        this.isProcessing = true;
        this.addTypingIndicator();

        try {
            const response = await this.getAIResponse(message);
            this.removeTypingIndicator();
            this.addMessage(response, false);
            this.messageHistory.push({ role: 'assistant', content: response });
        } catch (error) {
            this.removeTypingIndicator();
            this.addMessage('Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.', false);
        } finally {
            this.isProcessing = false;
        }
    }

    async getAIResponse(message) {
        // Simulate API call - Replace with actual API integration
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Example responses based on keywords
        const responses = {
            'cải thiện': 'Để cải thiện điểm rèn luyện, bạn có thể:\n1. Tham gia các hoạt động đoàn thể\n2. Duy trì kết quả học tập tốt\n3. Tích cực tham gia các hoạt động tình nguyện\n4. Tuân thủ nội quy và quy định của trường',
            'tiêu chí': 'Các tiêu chí chấm điểm rèn luyện bao gồm:\n1. Ý thức học tập (20 điểm)\n2. Ý thức và kết quả chấp hành quy chế (25 điểm)\n3. Ý thức tham gia các hoạt động (20 điểm)\n4. Ý thức công dân (25 điểm)\n5. Ý thức và kết quả tham gia công tác (10 điểm)',
            'khiếu nại': 'Quy trình khiếu nại điểm rèn luyện:\n1. Gửi đơn khiếu nại cho cố vấn học tập\n2. Cố vấn học tập xem xét và chuyển lên khoa\n3. Khoa họp xét và phản hồi\n4. Nếu cần thiết, chuyển lên phòng Công tác Sinh viên',
            'quy định': 'Một số quy định quan trọng về điểm rèn luyện:\n1. Thang điểm: 0-100\n2. Xếp loại: Xuất sắc (90-100), Tốt (80-89), Khá (65-79), Trung bình (50-64), Yếu (35-49), Kém (<35)\n3. Đánh giá định kỳ: cuối mỗi học kỳ'
        };

        // Find matching response based on keywords
        const matchingKeyword = Object.keys(responses).find(keyword => 
            message.toLowerCase().includes(keyword)
        );

        return matchingKeyword ? 
            responses[matchingKeyword] : 
            'Xin lỗi, tôi không hiểu câu hỏi của bạn. Vui lòng thử lại với các từ khóa khác hoặc chọn một trong các gợi ý có sẵn.';
    }

    addMessage(content, isUser) {
        const messagesDiv = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar-container';
        avatarDiv.innerHTML = isUser ? 
            '<i class="fas fa-user"></i>' : 
            '<i class="fas fa-robot"></i>';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        messagesDiv.appendChild(messageDiv);
        
        // Smooth scroll to bottom
        messagesDiv.scrollTo({
            top: messagesDiv.scrollHeight,
            behavior: 'smooth'
        });
    }

    addTypingIndicator() {
        const messagesDiv = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing-indicator';
        typingDiv.innerHTML = `
            <div class="avatar-container">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        messagesDiv.appendChild(typingDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    removeTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleSendMessage();
        }
    }

    handleInputChange() {
        const input = document.getElementById('chatInput');
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px';
        document.getElementById('sendButton').disabled = !input.value.trim();
    }

    usePrompt(prompt) {
        const input = document.getElementById('chatInput');
        input.value = prompt;
        this.handleInputChange();
        input.focus();
    }
}

// Initialize the AI Assistant when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.aiAssistant = new AIAssistant();
});
