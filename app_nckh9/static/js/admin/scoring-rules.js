import { fetchAPI, showLoading, hideLoading, handleError, retryOperation } from './api.js';

let isEditMode = false;
let rules = [];

document.addEventListener('DOMContentLoaded', () => {
    loadRules();
});

// Load rules from API
async function loadRules() {
    try {
        showLoading('rulesContent');
        const response = await retryOperation(async () => {
            return await fetchAPI('/scoring-rules/');
        });
        rules = response.data;
        renderRules();
    } catch (error) {
        handleError(error);
    } finally {
        hideLoading('rulesContent');
    }
}

// Render rules to DOM
function renderRules() {
    const rulesContent = document.querySelector('.rules-content');
    rulesContent.innerHTML = rules.map(section => renderSection(section)).join('');
}

function renderSection(section) {
    return `
        <div class="card">
            <div class="card-header">
                <h2 class="section-title">
                    <i class="fas fa-list"></i>
                    <div class="section-title-content" data-id="${section.id}">${section.title}</div>
                    <span class="points">(Tổng điểm: ${section.min_points} - ${section.max_points} điểm)</span>
                </h2>
            </div>
            <div class="rule-section">
                ${renderSubsections(section.subsections)}
            </div>
        </div>`;
}

function renderSubsections(subsections) {
    return subsections.map(sub => `
        <div class="sub-section">
            <div class="sub-section-header">
                <h4 data-id="${sub.id}">${sub.title}</h4>
            </div>
            <ul class="score-list">
                ${renderRules(sub.rules)}
            </ul>
            ${sub.note ? `<div class="note-container"><p class="note" data-id="${sub.id}">${sub.note}</p></div>` : ''}
        </div>
    `).join('');
}

function renderRules(rules) {
    return rules.map(rule => `
        <li class="editable-rule">
            <span class="rule-name" data-id="${rule.id}">${rule.name}</span>
            <span class="points" data-id="${rule.id}" data-original="${rule.points}">${formatPoints(rule.points)}</span>
        </li>
    `).join('');
}

function toggleEditMode() {
    isEditMode = !isEditMode;
    const editButton = document.querySelector('.btn-edit');
    const editActions = document.querySelector('.edit-actions');
    const rulesContent = document.querySelector('.rules-content');
    
    if (isEditMode) {
        editButton.style.display = 'none';
        editActions.style.display = 'flex';
        rulesContent.classList.add('editing-mode');
        
        makeElementsEditable([
            '.points',
            '.rule-name',
            '.note',
            '.section-title-content',
            'h4'
        ]);
        
        addValidationListeners();
        addControlButtons();
    } else {
        exitEditMode();
    }
}

function makeElementsEditable(selectors) {
    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.contentEditable = true;
            element.classList.add('editing');
            
            if (!element.textContent.trim()) {
                element.textContent = 'Nhập nội dung...';
            }
        });
    });
}

function addControlButtons() {
    document.querySelectorAll('.rule-section').forEach(section => {
        const controls = `
            <div class="section-controls">
                <button class="btn btn-add" onclick="addNewSubsection(this)">
                    <i class="fas fa-plus"></i> Thêm mục
                </button>
                <button class="btn btn-add" onclick="addNewRule(this)">
                    <i class="fas fa-plus"></i> Thêm quy tắc
                </button>
                <button class="btn btn-add" onclick="addNewNote(this)">
                    <i class="fas fa-plus"></i> Thêm ghi chú
                </button>
            </div>`;
        section.insertAdjacentHTML('afterbegin', controls);
    });

    const addSectionBtn = `
        <button class="btn btn-add-section" onclick="addNewSection()">
            <i class="fas fa-plus-circle"></i> Thêm mục đánh giá mới
        </button>`;
    document.querySelector('.rules-content').insertAdjacentHTML('beforeend', addSectionBtn);
}

// Validation functions
function addValidationListeners() {
    document.querySelectorAll('.points').forEach(point => {
        point.addEventListener('input', validatePointInput);
        point.addEventListener('blur', formatPointValue);
        point.addEventListener('keypress', preventInvalidChars);
    });

    document.querySelectorAll('[contenteditable=true]').forEach(element => {
        if (!element.classList.contains('points')) {
            element.addEventListener('input', validateTextContent);
            element.addEventListener('blur', formatTextContent);
        }
    });
}

// API integration for saving changes
async function saveChanges() {
    const changes = collectChanges();
    
    if (changes.length === 0) {
        showNotification('info', 'Không có thay đổi nào để lưu.');
        exitEditMode();
        return;
    }

    if (confirm(createChangeConfirmMessage(changes))) {
        try {
            showLoading('rulesContent');
            await retryOperation(async () => {
                return await fetchAPI('/scoring-rules/batch-update/', {
                    method: 'POST',
                    body: JSON.stringify({ changes })
                });
            });
            
            showNotification('success', 'Đã lưu thay đổi thành công!');
            await loadRules(); // Reload to get latest state
            exitEditMode();
        } catch (error) {
            handleError(error);
        } finally {
            hideLoading('rulesContent');
        }
    }
}

function collectChanges() {
    const changes = [];
    document.querySelectorAll('[contenteditable=true]').forEach(element => {
        const id = element.dataset.id;
        const newValue = element.textContent.trim();
        const originalValue = element.dataset.original;
        
        if (id && newValue !== originalValue) {
            changes.push({
                id: id,
                type: getElementType(element),
                value: newValue
            });
        }
    });
    return changes;
}

// Helper functions
function formatPoints(points) {
    const value = parseInt(points);
    return (value >= 0 ? '+' : '') + value + 'đ';
}

function getElementType(element) {
    if (element.classList.contains('points')) return 'points';
    if (element.classList.contains('rule-name')) return 'rule';
    if (element.classList.contains('note')) return 'note';
    if (element.classList.contains('section-title-content')) return 'section';
    if (element.tagName === 'H4') return 'subsection';
    return 'unknown';
}

function showNotification(type, message) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Event handlers and validators
function validatePointInput(event) {
    const point = event.target;
    const value = point.textContent.replace(/[^0-9\-+]/g, '');
    
    if (parseInt(value) > 50) point.textContent = '+50';
    if (parseInt(value) < -50) point.textContent = '-50';
}

function formatPointValue(event) {
    const point = event.target;
    let value = point.textContent.replace(/[^0-9\-+]/g, '');
    
    if (!value.startsWith('-') && !value.startsWith('+')) {
        value = '+' + value;
    }
    
    point.textContent = value + 'đ';
}

function preventInvalidChars(event) {
    const allowed = ['0','1','2','3','4','5','6','7','8','9','+','-'];
    const navigationKeys = ['ArrowLeft','ArrowRight','Backspace','Delete'];
    
    if (!allowed.includes(event.key) && !navigationKeys.includes(event.key)) {
        event.preventDefault();
    }
}

function validateTextContent(event) {
    const element = event.target;
    let text = element.innerHTML;
    text = text.replace(/<\/?[^>]+(>|$)/g, "");
    element.textContent = text;
    
    if (!text.trim()) {
        element.classList.add('empty');
    } else {
        element.classList.remove('empty');
    }
}

function formatTextContent(event) {
    const element = event.target;
    let text = element.textContent.trim();
    
    if (!text) {
        element.textContent = 'Nhập nội dung...';
        element.classList.add('empty');
    }
}

// Management functions for new elements
async function addNewSection() {
    try {
        showLoading('rulesContent');
        const response = await fetchAPI('/scoring-rules/sections/', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Mục mới',
                min_points: 0,
                max_points: 0
            })
        });
        
        await loadRules(); // Reload to get latest state
    } catch (error) {
        handleError(error);
    } finally {
        hideLoading('rulesContent');
    }
}

async function addNewSubsection(button) {
    const sectionId = button.closest('.rule-section').querySelector('.section-title-content').dataset.id;
    
    try {
        showLoading('rulesContent');
        await fetchAPI(`/scoring-rules/sections/${sectionId}/subsections/`, {
            method: 'POST',
            body: JSON.stringify({
                title: 'Tiêu đề phụ mới'
            })
        });
        
        await loadRules();
    } catch (error) {
        handleError(error);
    } finally {
        hideLoading('rulesContent');
    }
}

async function addNewRule(button) {
    const subsectionElement = button.closest('.rule-section').querySelector('.sub-section');
    const subsectionId = subsectionElement.querySelector('h4').dataset.id;
    
    try {
        showLoading('rulesContent');
        await fetchAPI(`/scoring-rules/subsections/${subsectionId}/rules/`, {
            method: 'POST',
            body: JSON.stringify({
                name: 'Quy tắc mới',
                points: 0
            })
        });
        
        await loadRules();
    } catch (error) {
        handleError(error);
    } finally {
        hideLoading('rulesContent');
    }
}

async function addNewNote(button) {
    const subsectionElement = button.closest('.rule-section').querySelector('.sub-section');
    const subsectionId = subsectionElement.querySelector('h4').dataset.id;
    
    try {
        showLoading('rulesContent');
        await fetchAPI(`/scoring-rules/subsections/${subsectionId}/notes/`, {
            method: 'POST',
            body: JSON.stringify({
                content: 'Thêm ghi chú...'
            })
        });
        
        await loadRules();
    } catch (error) {
        handleError(error);
    } finally {
        hideLoading('rulesContent');
    }
}

async function removeElement(element) {
    if (!confirm('Bạn có chắc chắn muốn xóa phần này?')) {
        return;
    }

    const id = element.dataset.id;
    const type = getElementType(element);
    
    try {
        showLoading('rulesContent');
        await fetchAPI(`/scoring-rules/${type}s/${id}/`, {
            method: 'DELETE'
        });
        
        await loadRules();
    } catch (error) {
        handleError(error);
    } finally {
        hideLoading('rulesContent');
    }
}

function exitEditMode() {
    isEditMode = false;
    const editButton = document.querySelector('.btn-edit');
    const editActions = document.querySelector('.edit-actions');
    const rulesContent = document.querySelector('.rules-content');
    
    editButton.style.display = 'block';
    editActions.style.display = 'none';
    rulesContent.classList.remove('editing-mode');
    
    document.querySelectorAll('[contenteditable=true]').forEach(element => {
        element.contentEditable = false;
        element.classList.remove('editing', 'empty');
    });
    
    document.querySelectorAll('.section-controls, .btn-add-section').forEach(el => el.remove());
}

function createChangeConfirmMessage(changes) {
    let message = 'Xác nhận các thay đổi sau:\n\n';
    changes.forEach(change => {
        message += `${change.type}: ${change.value}\n`;
    });
    message += '\nBạn có chắc chắn muốn lưu các thay đổi này?';
    return message;
}
