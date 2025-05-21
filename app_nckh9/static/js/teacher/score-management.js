document.addEventListener('DOMContentLoaded', () => {
    initializeScoreManagement();
});

function initializeScoreManagement() {
    setupFilters();
    loadStudentList();
    setupEventListeners();
}

function loadStudentList() {
    const students = [
        {
            id: 'SV001',
            name: 'Nguyễn Văn A',
            class: 'CNTT2021',
            score: 85,
            status: 'scored'
        }
    ];
    displayStudents(students);
}

function displayStudents(students) {
    const tbody = document.getElementById('studentTableBody');
    tbody.innerHTML = students.map(student => `
        <tr class="student-row">
            <td><input type="checkbox" class="student-select" data-id="${student.id}"></td>
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.class}</td>
            <td>${student.score || '-'}</td>
            <td><span class="status-badge ${student.status}">${getStatusText(student.status)}</span></td>
            <td>
                <button onclick="openScoringModal('${student.id}')">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function openScoringModal(studentId) {
    const modal = document.getElementById('scoringModal');
    openModal(modal);
    // Load student data and scoring criteria
    loadScoringCriteria(studentId);
}

function loadScoringCriteria(studentId) {
    // Load scoring criteria for the student
    const criteria = [
        {
            id: 1,
            name: 'Ý thức học tập',
            maxScore: 30
        },
        // More criteria...
    ];
    
    displayScoringCriteria(criteria);
}

function displayScoringCriteria(criteria) {
    const container = document.querySelector('.scoring-criteria');
    container.innerHTML = criteria.map(item => `
        <div class="criteria-item">
            <label>${item.name} (0-${item.maxScore})</label>
            <input type="number" min="0" max="${item.maxScore}" 
                   name="criteria_${item.id}" class="score-input">
        </div>
    `).join('');
}

function setupEventListeners() {
    // Setup form submission
    document.getElementById('scoringForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveScores();
    });

    // Setup bulk selection
    document.getElementById('selectAll').addEventListener('change', function(e) {
        const checkboxes = document.querySelectorAll('.student-select');
        checkboxes.forEach(cb => cb.checked = e.target.checked);
    });
}

function saveScores() {
    // Collect and save scoring data
    const formData = new FormData(document.getElementById('scoringForm'));
    // Process and save data
    closeModal(document.getElementById('scoringModal'));
}

function closeModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Chưa chấm',
        'scored': 'Đã chấm',
        'approved': 'Đã duyệt'
    };
    return statusMap[status] || status;
}

function bulkScore() {
    const selectedIds = Array.from(document.querySelectorAll('.student-select:checked'))
        .map(cb => cb.dataset.id);
    if (selectedIds.length === 0) {
        alert('Vui lòng chọn sinh viên để chấm điểm');
        return;
    }
    // Process bulk scoring
}

function getScoreClass(score) {
    if (!score) return '';
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'average';
    return 'below-average';
}

function updateSelectedCount() {
    const selectedCount = document.querySelectorAll('.student-select:checked').length;
    const countElement = document.querySelector('.selected-count span');
    countElement.textContent = selectedCount;
}

function openModal(modal) {
    modal.style.display = 'block';
    requestAnimationFrame(() => {
        modal.classList.add('show');
        modal.querySelector('.modal-content').style.transform = 'scale(1) translateY(0)';
        modal.querySelector('.modal-content').style.opacity = '1';
    });
}