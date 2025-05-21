document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // Update active states
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Password visibility toggle
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }

    // Microsoft login button
    const msLoginBtn = document.querySelector('.microsoft-btn');
    if (msLoginBtn) {
        msLoginBtn.addEventListener('click', function() {
            // Redirect to Microsoft login
            window.location.href = '/accounts/microsoft/login/';
        });
    }

    // Form validation
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            const username = this.querySelector('input[name="username"]').value.trim();
            const password = this.querySelector('input[name="password"]').value.trim();
            
            if (!username || !password) {
                e.preventDefault();
                showError('Vui lòng điền đầy đủ thông tin đăng nhập');
            }
        });
    }

    // Remember me functionality
    const rememberMe = document.getElementById('remember-me');
    if (rememberMe) {
        // Check if there's a saved username
        const savedUsername = localStorage.getItem('rememberedUsername');
        if (savedUsername) {
            document.querySelector('input[name="username"]').value = savedUsername;
            rememberMe.checked = true;
        }

        rememberMe.addEventListener('change', function() {
            if (!this.checked) {
                localStorage.removeItem('rememberedUsername');
            }
        });

        loginForm.addEventListener('submit', function() {
            if (rememberMe.checked) {
                const username = document.querySelector('input[name="username"]').value;
                localStorage.setItem('rememberedUsername', username);
            }
        });
    }

    // Error message handling
    function showError(message) {
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            ${message}
        `;

        const form = document.querySelector('.login-form');
        form.insertBefore(errorDiv, form.firstChild);

        // Auto-hide error after 5 seconds
        setTimeout(() => {
            errorDiv.style.opacity = '0';
            setTimeout(() => errorDiv.remove(), 300);
        }, 5000);
    }

    // Add loading state to buttons
    const buttons = document.querySelectorAll('button[type="submit"]');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.classList.contains('loading')) {
                this.classList.add('loading');
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
                
                // Reset button after 2 seconds if form hasn't submitted
                setTimeout(() => {
                    if (this.classList.contains('loading')) {
                        this.classList.remove('loading');
                        this.innerHTML = originalText;
                    }
                }, 2000);
            }
        });
    });
});
