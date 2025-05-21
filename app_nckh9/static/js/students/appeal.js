document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('complaintForm');
    const reasonTextarea = document.getElementById('complaintReason');
    const fileInput = document.getElementById('attachment');
    const fileList = document.getElementById('fileList');
    const maxLength = 1000;

    // Character count for textarea
    reasonTextarea.addEventListener('input', function() {
        const currentLength = this.value.length;
        document.getElementById('currentLength').textContent = currentLength;
        
        if (currentLength > maxLength) {
            this.value = this.value.substring(0, maxLength);
        }
    });

    // File upload handling
    fileInput.addEventListener('change', function(e) {
        fileList.innerHTML = '';
        const files = Array.from(e.target.files);
        const maxSize = 5 * 1024 * 1024; // 5MB

        files.forEach(file => {
            if (file.size > maxSize) {
                showToast(`File ${file.name} vượt quá kích thước cho phép (5MB)`);
                return;
            }

            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <i class="fas fa-file"></i>
                <span>${file.name}</span>
                <i class="fas fa-times remove-file"></i>
            `;

            fileItem.querySelector('.remove-file').addEventListener('click', function() {
                fileItem.remove();
                // Reset file input if all files are removed
                if (fileList.children.length === 0) {
                    fileInput.value = '';
                }
            });

            fileList.appendChild(fileItem);
        });
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(form);
        
        // Add validation here if needed
        if (!validateForm()) {
            return;
        }

        // Simulate API call
        setTimeout(() => {
            showToast('Đơn khiếu nại đã được gửi thành công!');
            resetForm();
        }, 1000);
    });
});

function validateForm() {
    const requiredFields = ['semesterSelect', 'complaintType', 'complaintReason'];
    let isValid = true;

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            showToast(`Vui lòng điền đầy đủ thông tin ${field.name}`);
            isValid = false;
        }
    });

    return isValid;
}

function resetForm() {
    document.getElementById('complaintForm').reset();
    document.getElementById('fileList').innerHTML = '';
    document.getElementById('currentLength').textContent = '0';
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
