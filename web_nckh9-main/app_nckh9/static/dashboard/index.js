document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            const tabId = this.dataset.tab;
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Password visibility toggle
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.querySelector('input[type="password"]');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle eye icon
            const eyeIcon = this.querySelector('i');
            eyeIcon.classList.toggle('fa-eye');
            eyeIcon.classList.toggle('fa-eye-slash');
        });
    }

    // Remember me functionality
    const rememberMe = document.querySelector('#remember-me');
    if (rememberMe) {
        // Check if there's a saved preference
        const remembered = localStorage.getItem('rememberMe') === 'true';
        rememberMe.checked = remembered;

        // Save preference when changed
        rememberMe.addEventListener('change', function() {
            localStorage.setItem('rememberMe', this.checked);
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
                alert('Vui lòng điền đầy đủ thông tin đăng nhập');
                return;
            }
        });
    }

    // Microsoft login button
    const msLoginBtn = document.querySelector('.microsoft-btn');
    if (msLoginBtn) {
        msLoginBtn.addEventListener('click', function() {
            // Add Microsoft login logic here
            console.log('Microsoft login clicked');
        });
    }

    // Clear error message after 5 seconds
    const errorMessage = document.querySelector('.error-message');
    if (errorMessage) {
        setTimeout(() => {
            errorMessage.style.opacity = '0';
            setTimeout(() => {
                errorMessage.remove();
            }, 300);
        }, 5000);
    }
});