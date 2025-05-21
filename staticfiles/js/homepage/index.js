document.addEventListener('DOMContentLoaded', function() {
    // Toggle password visibility
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.querySelector('#password');

    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });

    // Add input animation
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.parentElement.classList.remove('focused');
            }
        });
    });

    // Add smooth reveal animation for security info
    document.querySelector('.security-info').style.animation = 'slideIn 0.5s ease-out forwards';

    updateSystemTime();

    // Add tab switching functionality
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const contentId = tab.textContent.includes('Microsoft') ? 'microsoft-login' : 'student-login';
            document.getElementById(contentId).classList.add('active');
        });
    });
});

function validateForm() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessages = [];

    if (username.trim() === '') {
        errorMessages.push('Vui lòng nhập mã số sinh viên');
    }

    if (password.trim() === '') {
        errorMessages.push('Vui lòng nhập mật khẩu');
    } else if (password.length < 6) {
        errorMessages.push('Mật khẩu phải có ít nhất 6 ký tự');
    }

    if (errorMessages.length > 0) {
        showError(errorMessages.join('\n'));
        return false;
    }

    // Simulate loading
    const loginBtn = document.querySelector('.login-btn');
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đăng nhập...';
    loginBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Đăng nhập';
        loginBtn.disabled = false;
        showSuccess('Đăng nhập thành công!');
    }, 2000);

    return false;
}

function showError(message) {
    alert(message);
}

// Enhance password strength indicator
function checkPasswordStrength(password) {
    const strengthMeter = document.createElement('div');
    strengthMeter.className = 'strength-meter';
    const strength = {
        0: "Rất yếu",
        1: "Yếu",
        2: "Trung bình",
        3: "Mạnh",
        4: "Rất mạnh"
    };
    
    let score = 0;
    if (password.length > 6) score++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) score++;
    if (password.match(/\d/)) score++;
    if (password.match(/[^a-zA-Z\d]/)) score++;
    
    // Add visual feedback
    const strengthBar = document.createElement('div');
    strengthBar.className = 'strength-bar';
    strengthBar.style.width = `${(score / 4) * 100}%`;
    strengthBar.style.backgroundColor = ['#ff4444', '#ffbb33', '#00C851', '#33b5e5'][score - 1];
    
    return {
        score,
        text: strength[score],
        bar: strengthBar
    };
}

// Add input validation with visual feedback
function validateInput(input, type) {
    const value = input.value.trim();
    let isValid = false;
    
    switch(type) {
        case 'username':
            isValid = value.length >= 5;
            break;
        case 'password':
            isValid = value.length >= 6;
            const strength = checkPasswordStrength(value);
            input.parentElement.setAttribute('data-strength', strength.text);
            break;
    }
    
    input.classList.remove('valid', 'invalid');
    input.classList.add(isValid ? 'valid' : 'invalid');

    // Add visual feedback animation
    if (isValid) {
        input.classList.add('valid-animation');
        setTimeout(() => input.classList.remove('valid-animation'), 500);
    }
    
    return isValid;
}

// Add floating labels animation
document.querySelectorAll('.input-group input').forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', () => {
        if (!input.value) {
            input.parentElement.classList.remove('focused');
        }
    });
});

// Add success message with confetti effect
function showSuccess(message) {
    const successModal = document.createElement('div');
    successModal.className = 'success-modal';
    successModal.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <h3>${message}</h3>
        </div>
    `;
    document.body.appendChild(successModal);
    
    // Create confetti effect
    createConfetti();
    
    setTimeout(() => {
        successModal.remove();
    }, 3000);
}

function createConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3000);
    }
}

// Add loading animation with progress
function showLoading() {
    const btn = document.querySelector('.login-btn');
    const originalContent = btn.innerHTML;
    
    btn.innerHTML = `
        <div class="loader">
            <svg viewBox="0 0 24 24">
                <circle class="loader-circle" cx="12" cy="12" r="10"/>
            </svg>
            <span>Đang xử lý...</span>
        </div>
    `;
    
    return () => btn.innerHTML = originalContent;
}

// Add system time display
function updateSystemTime() {
    const timeElement = document.createElement('div');
    timeElement.className = 'system-time';
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    setInterval(() => {
        const now = new Date();
        timeElement.innerHTML = now.toLocaleDateString('vi-VN', options);
    }, 1000);

    document.querySelector('.system-info').prepend(timeElement);
}

// Add Microsoft login functionality
function loginWithMicrosoft() {
    const btn = document.querySelector('.microsoft-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang chuyển hướng...';

    // Simulate Microsoft login redirect
    setTimeout(() => {
        window.location.href = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize...';
    }, 1000);
}
