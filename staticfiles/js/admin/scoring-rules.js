let isEditMode = false;
const originalValues = new Map();

function toggleEditMode() {
    isEditMode = !isEditMode;
    const editButton = document.querySelector('.btn-edit');
    const editActions = document.querySelector('.edit-actions');
    const rulesContent = document.querySelector('.rules-content');
    
    if (isEditMode) {
        // Enter edit mode
        editButton.style.display = 'none';
        editActions.style.display = 'flex';
        rulesContent.classList.add('editing-mode');
        
        // Make all editable elements editable
        makeElementsEditable([
            '.points',           // Điểm số
            '.rule-name',       // Tên quy tắc
            '.note',            // Ghi chú
            '.section-title-content', // Tiêu đề mục
            'h4',               // Tiêu đề phụ
            'h3'                // Tiêu đề phần
        ]);
        
        // Add content validation listeners
        addValidationListeners();

        // Add control buttons to each section
        document.querySelectorAll('.rule-section').forEach(section => {
            const controls = `
                <div class="section-controls">
                    <button class="btn btn-add" onclick="addSection('subsection', this.closest('.rule-section'))">
                        <i class="fas fa-plus"></i> Thêm mục
                    </button>
                    <button class="btn btn-add" onclick="addSection('rule', this.closest('.rule-section').querySelector('.score-list'))">
                        <i class="fas fa-plus"></i> Thêm quy tắc
                    </button>
                    <button class="btn btn-add" onclick="addSection('note', this.closest('.rule-section'))">
                        <i class="fas fa-plus"></i> Thêm ghi chú
                    </button>
                </div>`;
            section.insertAdjacentHTML('afterbegin', controls);
        });

        // Add global add section button
        const addSectionBtn = `
            <button class="btn btn-add-section" onclick="addSection('section', this.closest('.rules-content'))">
                <i class="fas fa-plus-circle"></i> Thêm mục đánh giá mới
            </button>`;
        rulesContent.insertAdjacentHTML('beforeend', addSectionBtn);
    } else {
        // Remove all control buttons
        document.querySelectorAll('.section-controls, .btn-add-section').forEach(el => el.remove());
    }
}

function makeElementsEditable(selectors) {
    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            // Store original value
            originalValues.set(element, element.innerHTML);
            element.contentEditable = true;
            element.dataset.original = element.innerHTML;
            element.classList.add('editing');
            
            // Add placeholder for empty content
            if (!element.textContent.trim()) {
                element.textContent = 'Nhập nội dung...';
            }
        });
    });
}

function addValidationListeners() {
    // Points validation
    document.querySelectorAll('.points').forEach(point => {
        point.addEventListener('input', validatePointInput);
        point.addEventListener('blur', formatPointValue);
        point.addEventListener('keypress', preventInvalidChars);
    });

    // Text content validation
    document.querySelectorAll('[contenteditable=true]').forEach(element => {
        if (!element.classList.contains('points')) {
            element.addEventListener('input', validateTextContent);
            element.addEventListener('blur', formatTextContent);
        }
    });
}

function validatePointInput(event) {
    const point = event.target;
    const value = point.textContent.replace(/[^0-9\-+]/g, '');
    
    // Ensure value is within reasonable range (-50 to +50)
    if (parseInt(value) > 50) point.textContent = '+50';
    if (parseInt(value) < -50) point.textContent = '-50';
}

function formatPointValue(event) {
    const point = event.target;
    let value = point.textContent.replace(/[^0-9\-+]/g, '');
    
    // Add + prefix if positive and missing prefix
    if (!value.startsWith('-') && !value.startsWith('+')) {
        value = '+' + value;
    }
    
    point.textContent = value + 'đ';
}

function preventInvalidChars(event) {
    // Allow only numbers, +, -, and navigation keys
    const allowed = ['0','1','2','3','4','5','6','7','8','9','+','-'];
    const navigationKeys = ['ArrowLeft','ArrowRight','Backspace','Delete'];
    
    if (!allowed.includes(event.key) && !navigationKeys.includes(event.key)) {
        event.preventDefault();
    }
}

function validateTextContent(event) {
    const element = event.target;
    
    // Remove HTML tags for security
    let text = element.innerHTML;
    text = text.replace(/<\/?[^>]+(>|$)/g, "");
    element.textContent = text;
    
    // Prevent empty content
    if (!text.trim()) {
        element.classList.add('empty');
    } else {
        element.classList.remove('empty');
    }
}

function formatTextContent(event) {
    const element = event.target;
    let text = element.textContent.trim();
    
    // Restore placeholder if empty
    if (!text) {
        element.textContent = 'Nhập nội dung...';
        element.classList.add('empty');
    }
}

function saveChanges() {
    const changes = [];
    const editableElements = document.querySelectorAll('[contenteditable=true]');
    
    editableElements.forEach(element => {
        const originalValue = element.dataset.original;
        const newValue = element.innerHTML;
        
        if (originalValue !== newValue) {
            changes.push({
                element: getElementDescription(element),
                from: originalValue,
                to: newValue
            });
        }
    });
    
    if (changes.length > 0) {
        if (confirm(createChangeConfirmMessage(changes))) {
            updateOriginalValues(editableElements);
            showSuccessMessage('Đã lưu thay đổi thành công!');
            exitEditMode();
        }
    } else {
        showInfoMessage('Không có thay đổi nào để lưu.');
        exitEditMode();
    }
}

function getElementDescription(element) {
    if (element.classList.contains('points')) return 'Điểm số';
    if (element.classList.contains('rule-name')) return 'Quy tắc';
    if (element.classList.contains('note')) return 'Ghi chú';
    if (element.classList.contains('section-title-content')) return 'Tiêu đề mục';
    if (element.tagName === 'H4') return 'Tiêu đề phụ';
    if (element.tagName === 'H3') return 'Tiêu đề phần';
    return 'Nội dung';
}

function updateOriginalValues(elements) {
    elements.forEach(element => {
        element.dataset.original = element.innerHTML;
    });
}

function restoreDefaults() {
    if (confirm('Bạn có chắc chắn muốn khôi phục tất cả điểm về mặc định?')) {
        const allPoints = document.querySelectorAll('.points');
        
        allPoints.forEach(point => {
            const originalValue = point.dataset.original;
            point.textContent = originalValue;
        });
        
        showSuccessMessage('Đã khôi phục về giá trị mặc định.');
    }
}

function cancelEdit() {
    if (hasChanges()) {
        if (confirm('Bạn có chắc chắn muốn hủy các thay đổi?')) {
            revertChanges();
            exitEditMode();
        }
    } else {
        exitEditMode();
    }
}

function hasChanges() {
    const allPoints = document.querySelectorAll('.points');
    return Array.from(allPoints).some(point => 
        point.textContent !== point.dataset.original
    );
}

function revertChanges() {
    const allPoints = document.querySelectorAll('.points');
    allPoints.forEach(point => {
        point.textContent = point.dataset.original;
    });
}

function exitEditMode() {
    isEditMode = false;
    const editButton = document.querySelector('.btn-edit');
    const editActions = document.querySelector('.edit-actions');
    const rulesContent = document.querySelector('.rules-content');
    
    editButton.style.display = 'block';
    editActions.style.display = 'none';
    rulesContent.classList.remove('editing-mode');
    
    // Remove editability from all elements
    document.querySelectorAll('[contenteditable=true]').forEach(element => {
        element.contentEditable = false;
        element.classList.remove('editing', 'empty');
        
        // Remove event listeners
        element.removeEventListener('input', validateTextContent);
        element.removeEventListener('blur', formatTextContent);
        if (element.classList.contains('points')) {
            element.removeEventListener('input', validatePointInput);
            element.removeEventListener('blur', formatPointValue);
            element.removeEventListener('keypress', preventInvalidChars);
        }
    });

    // Remove all control buttons
    document.querySelectorAll('.section-controls, .btn-add-section').forEach(el => el.remove());
}

function createChangeConfirmMessage(changes) {
    let message = 'Xác nhận các thay đổi sau:\n\n';
    changes.forEach(change => {
        message += `${change.element}\n`;
        message += `Từ: ${change.from} → ${change.to}\n\n`;
    });
    message += 'Bạn có chắc chắn muốn lưu các thay đổi này?';
    return message;
}

function showSuccessMessage(message) {
    // You can enhance this with a better UI notification
    alert(message);
}

function showInfoMessage(message) {
    // You can enhance this with a better UI notification
    alert(message);
}

// Add new functions for section management
function addSection(type, targetElement) {
    const templates = {
        section: `
            <div class="card">
                <div class="card-header">
                    <h2 class="section-title">
                        <i class="fas fa-plus-circle"></i>
                        <div class="section-title-content" contenteditable="true">Mục mới</div>
                        <span class="points">(Tổng điểm: 0 - 0 điểm)</span>
                    </h2>
                    <button class="btn btn-delete" onclick="removeElement(this.closest('.card'))">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="rule-section">
                    <h3>1. Phần cộng điểm</h3>
                </div>
            </div>`,
        subsection: `
            <div class="sub-section">
                <div class="sub-section-header">
                    <h4 contenteditable="true">Tiêu đề phụ mới</h4>
                    <button class="btn btn-delete" onclick="removeElement(this.closest('.sub-section'))">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <ul class="score-list"></ul>
            </div>`,
        rule: `
            <li class="editable-rule">
                <span class="rule-name" contenteditable="true">Quy tắc mới</span>
                <span class="points" data-original="+0">+0đ</span>
                <button class="btn btn-delete" onclick="removeElement(this.closest('li'))">
                    <i class="fas fa-trash"></i>
                </button>
            </li>`,
        note: `
            <div class="note-container">
                <p class="note" contenteditable="true">Thêm ghi chú...</p>
                <button class="btn btn-delete" onclick="removeElement(this.closest('.note-container'))">
                    <i class="fas fa-trash"></i>
                </button>
            </div>`
    };

    const template = templates[type];
    if (template && targetElement) {
        targetElement.insertAdjacentHTML('beforeend', template);
    }
}

function removeElement(element) {
    if (confirm('Bạn có chắc chắn muốn xóa phần này?')) {
        element.remove();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize scoring rules table
    const scoringRulesTable = document.getElementById('scoringRulesTable');
    if (scoringRulesTable) {
        initializeDataTable(scoringRulesTable);
    }

    // Add event listeners for form submission
    const scoringRuleForm = document.getElementById('scoringRuleForm');
    if (scoringRuleForm) {
        scoringRuleForm.addEventListener('submit', handleScoringRuleSubmit);
    }
});

function initializeDataTable(table) {
    // Add sorting and filtering functionality
    const headers = table.querySelectorAll('th');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.column;
            sortTable(table, column);
        });
    });
}

function sortTable(table, column) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        const aValue = a.querySelector(`td[data-column="${column}"]`).textContent;
        const bValue = b.querySelector(`td[data-column="${column}"]`).textContent;
        return aValue.localeCompare(bValue);
    });
    
    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
}

async function handleScoringRuleSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch('/api/scoring-rules/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showAlert('Scoring rule saved successfully!', 'success');
            event.target.reset();
        } else {
            const error = await response.json();
            showAlert(error.message || 'Error saving scoring rule', 'danger');
        }
    } catch (error) {
        showAlert('An error occurred while saving the scoring rule', 'danger');
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
