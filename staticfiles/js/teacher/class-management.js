document.addEventListener('DOMContentLoaded', function() {
    initializeClassManagement();
    setupSearchAndFilters();
    setupFABMenu();
    initializeViewSwitcher();
    loadStatistics();
    setupAdvancedSearch();
    setupSemesterSelector();
    initializeClassList();
    setupEventListeners();
    initializeCharts();
    initializeClassCards();
    categorizeClasses();

    // Add filter chip functionality
    const filterChips = document.querySelectorAll('.filter-chip');
    
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            // Remove active class from all chips
            filterChips.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked chip
            chip.classList.add('active');
            
            // Get filter value from data-filter attribute
            const filterValue = chip.getAttribute('data-filter');
            
            // Filter the class cards
            filterClasses(filterValue);
        });
    });

    // Xử lý khi click vào tab
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to selected tab
            button.classList.add('active');
            document.getElementById(`${tabId}Tab`).classList.add('active');
        });
    });
});

// Initialization
function initializeClassManagement() {
    setupSearchFunction();
    setupFilters();
    setupTabs();
    initializeCharts();
}

// Event Listeners
function setupEventListeners() {
    setupTableListeners();
    setupModalListeners();
    setupPaginationListeners();
    setupBatchOperations();
}

// FAB Menu Functionality
function setupFABMenu() {
    const fabButton = document.querySelector('.fab-button');
    const fabMenu = document.querySelector('.fab-menu');
    
    fabButton?.addEventListener('click', () => {
        fabMenu.classList.toggle('active');
        fabButton.classList.toggle('rotate');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.quick-actions-panel')) {
            fabMenu.classList.remove('active');
            fabButton.classList.remove('rotate');
        }
    });

    // Setup FAB actions
    const fabItems = document.querySelectorAll('.fab-item');
    fabItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const action = e.currentTarget.getAttribute('title');
            handleFabAction(action);
        });
    });
}

function handleFabAction(action) {
    switch (action) {
        case 'Chấm điểm nhanh':
            window.location.href = 'quick-score.html';
            break;
        case 'Xuất báo cáo':
            exportReport();
            break;
        case 'Nhập danh sách':
            document.getElementById('importFileInput')?.click();
            break;
    }
}

// Search and Filters
function setupSearchAndFilters() {
    const searchInput = document.querySelector('.search-box input');
    const filterChips = document.querySelectorAll('.filter-chip');
    
    searchInput?.addEventListener('input', debounce((e) => {
        searchClasses(e.target.value.toLowerCase());
    }, 300));

    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            filterClassesByStatus(chip.textContent.trim());
        });
    });
}

function searchClasses(query) {
    const classCards = document.querySelectorAll('.class-card');
    
    classCards.forEach(card => {
        const className = card.querySelector('h3').textContent.toLowerCase();
        const classCode = card.querySelector('.class-code').textContent.toLowerCase();
        const teacher = card.querySelector('.info-item:nth-child(2)').textContent.toLowerCase();
        
        const matchesSearch = className.includes(query) || 
                            classCode.includes(query) || 
                            teacher.includes(query);
        
        card.style.display = matchesSearch ? 'block' : 'none';
        if (matchesSearch) {
            card.classList.add('animate-fade-in');
        }
    });
}

function filterClassesByStatus(status) {
    const classCards = document.querySelectorAll('.class-card');
    
    classCards.forEach(card => {
        const className = card.querySelector('h3').textContent;
        const classData = classesData[className];
        const progress = (classData.scoredStudents / classData.totalStudents) * 100;
        
        if (status === 'all' || 
            (status === 'completed' && progress === 100) ||
            (status === 'in-progress' && progress > 0 && progress < 100) ||
            (status === 'not-started' && progress === 0)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// View Switcher
function initializeViewSwitcher() {
    const viewButtons = document.querySelectorAll('.view-switcher .btn-icon');
    const classContainer = document.querySelector('.class-grid');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const view = button.dataset.view;
            viewButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            classContainer.className = view === 'grid' ? 'class-grid' : 'class-list';
            if (view === 'list') {
                classContainer.classList.add('list-view');
            }
        });
    });
}

// Class Card Actions
function setupClassCardActions() {
    const actionButtons = document.querySelectorAll('.card-actions .btn');
    
    actionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const action = e.target.textContent.trim();
            const classCard = e.target.closest('.class-card');
            const classId = classCard.querySelector('.class-code').textContent;
            
            handleClassAction(action, classId);
        });
    });
}

function handleClassAction(action, classId) {
    switch (action) {
        case 'Chấm điểm':
        case 'Bắt đầu chấm':
            window.location.href = `score-entry.html?class=${classId}`;
            break;
        case 'Chi tiết':
            window.location.href = `class-details.html?class=${classId}`;
            break;
        case 'Xuất PDF':
            exportPDF(classId);
            break;
        case 'Xuất Excel':
            exportExcel(classId);
            break;
    }
}

// Export Functions
function exportPDF(classId) {
    showToast('Đang xuất PDF...', 'info');
    // Implement PDF export logic
    setTimeout(() => {
        showToast('Đã xuất PDF thành công!', 'success');
    }, 1500);
}

function exportExcel(classId) {
    showToast('Đang xuất Excel...', 'info');
    // Implement Excel export logic
    setTimeout(() => {
        showToast('Đã xuất Excel thành công!', 'success');
    }, 1500);
}

// UI Feedback
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }, 100);
}

// Progress Updates
function updateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar .progress');
    progressBars.forEach(bar => {
        const targetWidth = bar.parentElement.dataset.progress;
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = targetWidth;
        }, 100);
    });
}

// Utility Functions
function calculateProgress(classData) {
    return Math.round((classData.scoredStudents / classData.totalStudents) * 100);
}

function getStatusText(status) {
    const statusMap = {
        PENDING: 'Chưa chấm',
        SCORED: 'Đã chấm',
        APPROVED: 'Đã duyệt',
        REJECTED: 'Đã từ chối'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleString('vi-VN', options);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Animation Helpers
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Initialize Statistics
function initializeStatistics() {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        const numberElement = card.querySelector('.stat-number');
        const targetNumber = parseInt(numberElement.textContent);
        numberElement.textContent = '0';
        animateValue(numberElement, 0, targetNumber, 1500);
    });
}

// UI Feedback
function showLoader() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    document.body.appendChild(loader);
}

function hideLoader() {
    const loader = document.querySelector('.loader');
    if (loader) loader.remove();
}

function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Mock API Calls
async function fetchClassData() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                classes: [
                    {
                        id: 'CNTT2021',
                        totalStudents: 35,
                        scoredStudents: 28,
                        lastUpdate: '2024-02-15T10:00:00'
                    },
                    // More class data...
                ],
                statistics: {
                    totalClasses: 8,
                    totalStudents: 320,
                    scoredStudents: 285
                }
            });
        }, 500);
    });
}

// Enhanced Class Data Structure
const classStatuses = {
    COMPLETED: 'Hoàn thành',
    IN_PROGRESS: 'Đang chấm',
    NOT_STARTED: 'Chưa chấm',
    OVERDUE: 'Quá hạn'
};

// Semester Management
function setupSemesterSelector() {
    const semesterButton = document.querySelector('.semester-selector button');
    const currentDate = new Date();
    const semesters = generateSemesterOptions(currentDate);
    
    semesterButton.addEventListener('click', () => {
        showSemesterModal(semesters);
    });
}

function generateSemesterOptions(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const academicYear = month >= 8 ? year : year - 1;
    
    return [
        { id: 1, name: `Học kỳ 1`, year: `${academicYear}-${academicYear + 1}` },
        { id: 2, name: `Học kỳ 2`, year: `${academicYear}-${academicYear + 1}` },
        { id: 3, name: `Học kỳ hè`, year: `${academicYear}-${academicYear + 1}` }
    ];
}

// Enhanced Search and Filter
function setupAdvancedSearch() {
    const searchInput = document.querySelector('.search-box input');
    const filterOptions = {
        status: 'all',
        department: 'all',
        yearLevel: 'all',
        sortBy: 'name'
    };

    searchInput.addEventListener('input', debounce(() => {
        applyFilters(filterOptions);
    }, 300));

    setupFilterListeners(filterOptions);
}

function setupFilterListeners(filterOptions) {
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const filterType = chip.dataset.filter;
            filterOptions.status = filterType;
            applyFilters(filterOptions);
            updateActiveFilter(chip);
        });
    });

    // Sort options
    document.querySelector('.sort-dropdown')?.addEventListener('change', (e) => {
        filterOptions.sortBy = e.target.value;
        applyFilters(filterOptions);
    });
}

function applyFilters(options) {
    const searchQuery = document.querySelector('.search-box input').value.toLowerCase();
    const classes = document.querySelectorAll('.class-card');
    
    classes.forEach(classCard => {
        const matchesSearch = searchInClass(classCard, searchQuery);
        const matchesStatus = filterByStatus(classCard, options.status);
        const matchesDepartment = filterByDepartment(classCard, options.department);
        const shouldShow = matchesSearch && matchesStatus && matchesDepartment;
        
        classCard.style.display = shouldShow ? 'block' : 'none';
        if (shouldShow) {
            classCard.classList.add('animate-fade-in');
        }
    });

    updateClassCount();
    sortClasses(options.sortBy);
}

// Class Management Functions
function addNewClass() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Thêm lớp mới</h2>
                <button class="btn-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <form id="newClassForm">
                    <div class="form-group">
                        <label>Mã lớp</label>
                        <input type="text" name="classCode" required placeholder="VD: CNTT2024">
                    </div>
                    <div class="form-group">
                        <label>Tên lớp</label>
                        <input type="text" name="className" required placeholder="VD: Công nghệ thông tin K49">
                    </div>
                    <div class="form-group">
                        <label>Khoa</label>
                        <select name="department" required>
                            <option value="CNTT">Công nghệ thông tin</option>
                            <option value="KTPM">Kỹ thuật phần mềm</option>
                            <option value="ATTT">An toàn thông tin</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Giáo viên chủ nhiệm</label>
                        <input type="text" name="teacher" required>
                    </div>
                    <div class="form-group">
                        <label>Niên khóa</label>
                        <input type="text" name="academicYear" required placeholder="VD: 2024-2025">
                    </div>
                    <div class="form-group">
                        <label>Thời hạn chấm điểm</label>
                        <input type="date" name="deadline" required>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Thêm lớp</button>
                        <button type="button" class="btn btn-outline" onclick="closeModal()">Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setupNewClassForm(modal);
}

function setupNewClassForm(modal) {
    const form = modal.querySelector('#newClassForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const classData = Object.fromEntries(formData);
        
        try {
            showLoader();
            await saveNewClass(classData);
            showToast('Thêm lớp thành công!', 'success');
            closeModal(modal);
            refreshClassList();
        } catch (error) {
            showToast('Không thể thêm lớp. Vui lòng thử lại!', 'error');
        } finally {
            hideLoader();
        }
    });
}

async function saveNewClass(classData) {
    // Mock API call
    return new Promise((resolve) => {
        setTimeout(() => {
            const classes = JSON.parse(localStorage.getItem('classes') || '[]');
            classes.push({
                id: Date.now(),
                ...classData,
                status: 'NOT_STARTED',
                studentCount: 0,
                scoredCount: 0
            });
            localStorage.setItem('classes', JSON.stringify(classes));
            resolve();
        }, 1000);
    });
}

function deleteClass(classId) {
    showConfirmModal({
        title: 'Xóa lớp học',
        message: 'Bạn có chắc chắn muốn xóa lớp học này không?',
        onConfirm: async () => {
            try {
                showLoader();
                await deleteClassById(classId);
                showToast('Xóa lớp thành công!', 'success');
                document.querySelector(`[data-class-id="${classId}"]`).remove();
                updateClassCount();
            } catch (error) {
                showToast('Không thể xóa lớp. Vui lòng thử lại!', 'error');
            } finally {
                hideLoader();
            }
        }
    });
}

// Class Details Management
function showClassDetails(classId) {
    loadClassDetails(classId).then(classData => {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h2>${classData.className}</h2>
                    <button class="btn-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="class-info-grid">
                        <div class="info-section">
                            <h3>Thông tin chung</h3>
                            <p><strong>Mã lớp:</strong> ${classData.classCode}</p>
                            <p><strong>Khoa:</strong> ${classData.department}</p>
                            <p><strong>GVCN:</strong> ${classData.teacher}</p>
                            <p><strong>Niên khóa:</strong> ${classData.academicYear}</p>
                            <p><strong>Thời hạn:</strong> ${formatDate(classData.deadline)}</p>
                        </div>
                        <div class="info-section">
                            <h3>Thống kê điểm</h3>
                            <div class="stats-grid">
                                <!-- Add statistics visualization -->
                            </div>
                        </div>
                    </div>
                    <div class="student-list-section">
                        <!-- Add student list table -->
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setupClassDetailsListeners(modal, classId);
    });
}

// Utility Functions
function searchInClass(classCard, query) {
    const searchableElements = [
        '.class-code',
        'h3',
        '.info-item span'
    ];
    
    return searchableElements.some(selector => {
        const element = classCard.querySelector(selector);
        return element?.textContent.toLowerCase().includes(query);
    });
}

function filterByStatus(classCard, status) {
    if (status === 'all') return true;
    const cardStatus = classCard.querySelector('.status-badge').textContent.trim();
    return status === cardStatus;
}

function filterByDepartment(classCard, department) {
    if (department === 'all') return true;
    const cardDepartment = classCard.querySelector('.department').textContent;
    return department === cardDepartment;
}

function sortClasses(sortBy) {
    const container = document.querySelector('.class-grid');
    const cards = Array.from(container.children);
    
    cards.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.querySelector('h3').textContent
                    .localeCompare(b.querySelector('h3').textContent);
            case 'progress':
                return getProgress(b) - getProgress(a);
            case 'deadline':
                return getDeadline(a) - getDeadline(b);
            default:
                return 0;
        }
    });
    
    container.innerHTML = '';
    cards.forEach(card => container.appendChild(card));
}

function getProgress(card) {
    const progressText = card.querySelector('.progress-percent').textContent;
    return parseInt(progressText);
}

function getDeadline(card) {
    const deadlineText = card.querySelector('.deadline').textContent;
    return new Date(deadlineText);
}

// Tab switching functionality
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all tabs
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab
        button.classList.add('active');
        const tabId = button.getAttribute('data-tab');
        document.getElementById(tabId + 'Tab').classList.add('active');
    });
});

// FAB Menu Toggle
const fabButton = document.querySelector('.fab-button');
const fabMenu = document.querySelector('.fab-menu');

fabButton.addEventListener('click', () => {
    fabMenu.classList.toggle('active');
});

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Close modals when clicking outside
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
});

// Initialize Charts
function initializeCharts() {
    const ctx = document.getElementById('scoreDistributionChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Xuất sắc', 'Giỏi', 'Khá', 'Trung bình', 'Yếu'],
            datasets: [{
                label: 'Phân bố điểm',
                data: [15, 42, 55, 10, 3],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(255, 99, 132, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
});

// Filter students based on button clicks
function filterStudents(status) {
    const rows = document.querySelectorAll('.student-table tbody tr');
    
    rows.forEach(row => {
        const statusBadge = row.querySelector('.status-badge');
        const statusText = statusBadge.textContent.toLowerCase();
        
        switch(status) {
            case 'all':
                row.style.display = '';
                break;
            case 'pending':
                row.style.display = statusText.includes('chưa chấm') ? '' : 'none';
                break;
            case 'completed':
                row.style.display = statusText.includes('đã chấm') ? '' : 'none';
                break;
        }
    });
    
    updateSelectedCount();
}

// Update selected count
function updateSelectedCount() {
    const selectedCount = document.querySelectorAll('.student-select:checked').length;
    const totalVisible = Array.from(document.querySelectorAll('.student-table tbody tr'))
        .filter(row => row.style.display !== 'none').length;
    
    const countDisplay = document.querySelector('.selected-count');
    if (countDisplay) {
        countDisplay.innerHTML = `Đã chọn <span>${selectedCount}</span> / ${totalVisible} sinh viên`;
    }
}

// Select all functionality
document.getElementById('selectAll')?.addEventListener('change', (e) => {
    const checkboxes = document.querySelectorAll('.student-select');
    checkboxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        if (row.style.display !== 'none') {
            checkbox.checked = e.target.checked;
        }
    });
    updateSelectedCount();
});

// Individual checkbox change event
document.querySelectorAll('.student-select').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        updateSelectedCount();
        const allChecked = Array.from(document.querySelectorAll('.student-select'))
            .filter(cb => cb.closest('tr').style.display !== 'none')
            .every(cb => cb.checked);
        document.getElementById('selectAll').checked = allChecked;
    });
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateSelectedCount();
});

let selectedClass = null;

// Thêm event listener cho class cards
function initializeClassCards() {
    const classCards = document.querySelectorAll('.class-card');
    classCards.forEach(card => {
        card.addEventListener('click', () => {
            // Hide grid and show details
            document.querySelector('.class-grid').style.display = 'none';
            const classDetails = document.querySelector('.class-details');
            classDetails.style.display = 'block';
            classDetails.scrollIntoView({ behavior: 'smooth' }); // Thêm dòng này để scroll đến phần chi tiết
            
            // Update class name
            const className = card.querySelector('h3').textContent;
            classDetails.querySelector('h2').textContent = className;

            // Activate students tab by default
            const studentsTab = document.getElementById('studentsTab');
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            document.querySelector('[data-tab="students"]').classList.add('active');
            studentsTab.classList.add('active');
            studentsTab.style.display = 'block'; // Thêm dòng này để đảm bảo tab content hiển thị

            // Show student table immediately
            showStudentList();
        });
    });
}

// Thêm hàm showStudentList để hiển thị bảng sinh viên
function showStudentList() {
    const studentsTab = document.getElementById('studentsTab');
    if (!studentsTab) return;

    // Clear existing content
    studentsTab.style.display = 'block';
    studentsTab.classList.add('active');

    // Force reflow
    void studentsTab.offsetWidth;

    // Ensure table is visible after content is loaded
    const tableContainer = studentsTab.querySelector('.table-container');
    if (tableContainer) {
        tableContainer.style.display = 'block';
        tableContainer.style.opacity = '1';
    }
    
    studentsTab.innerHTML = `
        <div class="table-actions">
            <div class="action-group">
                <button class="btn btn-outline" onclick="filterStudents('all')">Tất cả</button>
                <button class="btn btn-outline" onclick="filterStudents('pending')">Chưa chấm</button>
                <button class="btn btn-outline" onclick="filterStudents('completed')">Đã chấm</button>
            </div>
        </div>
        <div class="table-container">
            <table class="student-table">
                <thead>
                    <tr>
                <i class="fas fa-chevron-left"></i>
            </button>
            <span class="page-info">Trang <span id="currentPage">1</span> / <span id="totalPages">5</span></span>
            <button class="btn btn-page" onclick="changePage('next')">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;

    setupTableEventListeners();
}

// Add this helper function if not exists
function generateStudentRows(className) {
    const students = classStudentData[className] || [];
    if (!students.length) {
        return `<tr><td colspan="7" class="text-center">Không có dữ liệu sinh viên</td></tr>`;
    }

    return students.map(student => `
        <tr class="${student.status === 'pending' ? 'pending' : ''}">
            <td><input type="checkbox" class="student-select"></td>
            <td>${student.id || ''}</td>
            <td>${student.name || ''}</td>
            <td><span class="score-badge ${getScoreBadgeClass(student.score)}">${student.score || '-'}</span></td>
            <td><span class="status-badge ${student.status}">${student.status === 'completed' ? 'Đã chấm' : 'Chưa chấm'}</span></td>
            <td>${student.lastUpdate || '-'}</td>
            <td>
                <div class="action-buttons">
                    ${student.status === 'pending' ? `
                        <button class="btn btn-icon primary" title="Chấm điểm">
                            <i class="fas fa-plus"></i>
                        </button>
                    ` : `
                        <button class="btn btn-icon" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-icon" title="Xem lịch sử">
                            <i class="fas fa-history"></i>
                        </button>
                    `}
                </div>
            </td>
        </tr>
    `).join('');
}

// Cập nhật hàm setActiveTab
function setActiveTab(tabId) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });

    // Add active class to selected tab and content
    const selectedTab = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    const selectedContent = document.getElementById(`${tabId}Tab`);
    if (selectedContent) {
        selectedContent.classList.add('active');
        selectedContent.style.display = 'block';
    }
}

// Thêm event listeners cho tabs
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabId = e.currentTarget.getAttribute('data-tab');
            const className = document.querySelector('.class-details h2')?.textContent;
            
            setActiveTab(tabId);
            if (className) {
                loadTabContent(tabId, className);
            }
        });
    });
});

function loadTabContent(tab, className) {
    // Remove active class from all tab contents first
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    const targetTab = document.getElementById(`${tab}Tab`);
    if (!targetTab) return;
    
    // Show selected tab content
    targetTab.classList.add('active');
    targetTab.style.display = 'block';
    
    switch(tab) {
        case 'students':
            loadStudentList(className);
            break;
        case 'statistics':
            loadStatistics(className);
            break;
        case 'history':
            loadHistory(className);
            break;
    }
}

function loadStudentList(students) {
    const tbody = document.querySelector('.student-table tbody');
    tbody.innerHTML = students.map(student => `
        <tr class="${student.status === 'pending' ? 'pending' : ''}">
            <td><input type="checkbox" class="student-select"></td>
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td><span class="score-badge ${getScoreBadgeClass(student.score)}">${student.score || '-'}</span></td>
            <td><span class="status-badge ${student.status}">${getStatusText(student.status)}</span></td>
            <td>${student.lastUpdate || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-icon" title="${student.score ? 'Chỉnh sửa' : 'Chấm điểm'}">
                        <i class="fas fa-${student.score ? 'edit' : 'plus'}"></i>
                    </button>
                    ${student.score ? `
                        <button class="btn btn-icon" title="Xem lịch sử">
                            <i class="fas fa-history"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

function loadStatistics(stats) {
    // Update chart with class-specific data
    const ctx = document.getElementById('scoreDistributionChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Xuất sắc', 'Giỏi', 'Khá', 'Cần cải thiện'],
            datasets: [{
                data: [stats.excellent, stats.good, stats.average, stats.needImprovement],
                backgroundColor: ['#0284c7', '#059669', '#d97706', '#dc2626']
            }]
        }
        // ...chart options
    });
}

function loadHistory(history) {
    const timelineContainer = document.querySelector('.timeline');
    timelineContainer.innerHTML = history.map(item => `
        <div class="timeline-item">
            <div class="timeline-icon ${getActionClass(item.action)}">
                <i class="fas fa-${getActionIcon(item.action)}"></i>
            </div>
            <div class="timeline-content">
                <div class="activity-header">
                    <h4>${getActionTitle(item.action)}</h4>
                    <span class="time">${item.date}</span>
                </div>
                <p>${item.student}</p>
                <div class="activity-details">
                    <span class="score-change">Điểm số: ${item.score}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Utility functions
function getProgressClass(progress) {
    if (progress === 100) return 'success';
    if (progress > 0) return 'warning';
    return 'danger';
}

function getScoreBadgeClass(score) {
    if (!score) return '';
    if (score >= 85) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 65) return 'average';
    return 'below-average';
}

function getActionClass(action) {
    const classes = {
        score: 'success',
        edit: 'warning',
        approval: 'info',
        reminder: 'danger'
    };
    return classes[action] || 'info';
}

function getActionIcon(action) {
    const icons = {
        score: 'check',
        edit: 'edit',
        approval: 'stamp',
        reminder: 'bell'
    };
    return icons[action] || 'info';
}

function getActionTitle(action) {
    const titles = {
        score: 'Chấm điểm',
        edit: 'Chỉnh sửa điểm',
        approval: 'Phê duyệt',
        reminder: 'Nhắc nhở'
    };
    return titles[action] || 'Hoạt động';
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeClassCards();
    
    // Add tab switching listeners
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.getAttribute('data-tab');
            const className = document.querySelector('.class-details-header h2').textContent;
            
            // Update active tab
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Load tab content
            loadTabContent(tab, className);
        });
    });
});

// Add filter listeners
document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        const status = chip.getAttribute('data-filter');
        filterClasses(status);
    });
});

function initializeBackButton() {
    const backButton = document.querySelector('.back-to-classes');
    if (backButton) {
        backButton.addEventListener('click', () => {
            // Hide class details
            const classDetails = document.querySelector('.class-details');
            classDetails.style.display = 'none';

            // Show class grid
            const classGrid = document.querySelector('.class-grid');
            classGrid.style.display = 'grid';

            // Remove active state from selected class
            const activeCard = document.querySelector('.class-card.active');
            if (activeCard) {
                activeCard.classList.remove('active');
            }
        });
    }
}

// Add class data structure
const classesData = {
    'CNTT2021': {
        totalStudents: 35,
        scoredStudents: 31,
        status: 'in-progress', // completed, in-progress, not-started
        students: [
            { id: 'SV001', name: 'Nguyễn Văn A', score: 85, status: 'completed', lastUpdate: '15/02/2024' },
            // ...more students
        ],
        statistics: {
            excellent: 15,
            good: 42,
            average: 55,
            needImprovement: 13
        },
        history: [
            { date: '15/02/2024', action: 'score', student: 'Nguyễn Văn A', score: 85 },
            // ...more history items
        ]
    },
    // ...more classes
};

function filterClasses(filterValue) {
    const classCards = document.querySelectorAll('.class-card');
    
    classCards.forEach(card => {
        // Get completion percentage from badge
        const badge = card.querySelector('.badge');
        const percentText = badge.textContent;
        const percent = parseInt(percentText);
        
        let shouldShow = false;
        
        switch(filterValue) {
            case 'all':
                shouldShow = true;
                break;
            case 'completed':
                shouldShow = percent === 100;
                break;
            case 'in-progress':
                shouldShow = percent > 0 && percent < 100;
                break;
            case 'not-started':
                shouldShow = percent === 0;
                break;
        }
        
        // Show/hide card based on filter
        card.style.display = shouldShow ? 'block' : 'none';
        
        // Add animation when showing
        if (shouldShow) {
            card.classList.add('animate-fade-in');
        } else {
            card.classList.remove('animate-fade-in');
        }
    });
    
    // Update counts in filter chips
    updateFilterCounts();
}

function updateFilterCounts() {
    const counts = {
        all: 0,
        completed: 0,
        'in-progress': 0,
        'not-started': 0
    };
    
    // Count visible cards for each category
    const classCards = document.querySelectorAll('.class-card');
    classCards.forEach(card => {
        const badge = card.querySelector('.badge');
        const percent = parseInt(badge.textContent);
        
        counts.all++;
        if (percent === 100) counts.completed++;
        else if (percent > 0) counts['in-progress']++;
        else counts['not-started']++;
    });
    
    // Update the count spans in filter chips
    Object.entries(counts).forEach(([category, count]) => {
        const chip = document.querySelector(`.filter-chip[data-filter="${category}"]`);
        if (chip) {
            const countSpan = chip.querySelector('span');
            if (countSpan) countSpan.textContent = `(${count})`;
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const filterChips = document.querySelectorAll('.filter-chip');
    
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            // Remove active class from all chips
            filterChips.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked chip
            chip.classList.add('active');
            
            // Get filter value and apply filtering
            const filterValue = chip.getAttribute('data-filter');
            filterClasses(filterValue);
        });
    });
});

function loadClassStudents(classId) {
    const studentsTab = document.getElementById('studentsTab');
    studentsTab.style.display = 'block';
    
    // Mock data - replace with actual API call
    const students = classesData[classId]?.students || [];
    
    const tbody = studentsTab.querySelector('tbody');
    tbody.innerHTML = students.map(student => `
        <tr class="${student.status === 'pending' ? 'pending' : ''}">
            <td><input type="checkbox" class="student-select"></td>
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td><span class="score-badge ${getScoreBadgeClass(student.score)}">${student.score || '-'}</span></td>
            <td><span class="status-badge ${student.status}">${getStatusText(student.status)}</span></td>
            <td>${student.lastUpdate || '-'}</td>
            <td>
                <div class="action-buttons">
                    ${student.status === 'pending' ? `
                        <button class="btn btn-icon primary" title="Chấm điểm">
                            <i class="fas fa-plus"></i>
                        </button>
                    ` : `
                        <button class="btn btn-icon" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-icon" title="Xem lịch sử">
                            <i class="fas fa-history"></i>
                        </button>
                    `}
                </div>
            </td>
        </tr>
    `).join('');
    
    updateFilterCounts();
}

function getScoreBadgeClass(score) {
    if (!score) return '';
    if (score >= 85) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 70) return 'fair';
    return 'below-average';
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Chưa chấm',
        'completed': 'Đã chấm'
    };
    return statusMap[status] || status;
}

// Filter students
function filterStudents(status) {
    const rows = document.querySelectorAll('#studentsTab tbody tr');
    rows.forEach(row => {
        const statusBadge = row.querySelector('.status-badge');
        const statusText = statusBadge.textContent;
        
        if (status === 'all' || 
            (status === 'pending' && statusText === 'Chưa chấm') ||
            (status === 'completed' && statusText === 'Đã chấm')) {
            row.style.display = '';
            row.classList.add('animate-fade-in');
        } else {
            row.style.display = 'none';
            row.classList.remove('animate-fade-in');
        }
    });
}

// Semester Selector Functions
function toggleSemesterDropdown() {
    const dropdown = document.getElementById('semesterDropdown');
    dropdown.classList.toggle('show');

    // Close dropdown when clicking outside
    if (dropdown.classList.contains('show')) {
        document.addEventListener('click', closeSemesterDropdown);
    } else {
        document.removeEventListener('click', closeSemesterDropdown);
    }
}

function closeSemesterDropdown(event) {
    const dropdown = document.getElementById('semesterDropdown');
    const selector = document.querySelector('.semester-selector');
    
    if (!selector.contains(event.target)) {
        dropdown.classList.remove('show');
        document.removeEventListener('click', closeSemesterDropdown);
    }
}

function selectSemester(element, semesterText) {
    // Remove active class from all options
    document.querySelectorAll('.semester-option').forEach(option => {
        option.classList.remove('active');
    });
    
    // Add active class to selected option
    element.classList.add('active');
    
    // Update the displayed semester
    document.getElementById('currentSemester').textContent = semesterText;
    
    // Close the dropdown
    document.getElementById('semesterDropdown').classList.remove('show');
    
    // Here you can add code to load data for the selected semester
    loadSemesterData(semesterText);
}

function loadSemesterData(semester) {
    // Add your code here to load data for the selected semester
    console.log(`Loading data for ${semester}`);
    // Example: refreshClassList(semester);
}

document.addEventListener('DOMContentLoaded', function() {
    // Setup tab functionality
    const tabButtons = document.querySelectorAll('.class-tabs .tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button
            button.classList.add('active');

            // Show corresponding content
            const tabId = button.getAttribute('data-tab') + 'Tab';
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Filter students functionality
    window.filterStudents = function(filter) {
        const rows = document.querySelectorAll('.student-table tbody tr');
        
        rows.forEach(row => {
            switch(filter) {
                case 'all':
                    row.style.display = '';
                    break;
                case 'pending':
                    row.style.display = row.classList.contains('pending') ? '' : 'none';
                    break;
                case 'completed':
                    row.style.display = !row.classList.contains('pending') ? '' : 'none';
                    break;
            }
        });
    }

    // Select all checkbox functionality
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.student-select');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }

    // Pagination functionality
    window.changePage = function(direction) {
        const currentPageSpan = document.getElementById('currentPage');
        const totalPagesSpan = document.getElementById('totalPages');
        let currentPage = parseInt(currentPageSpan.textContent);
        const totalPages = parseInt(totalPagesSpan.textContent);

        if (direction === 'prev' && currentPage > 1) {
            currentPage--;
        } else if (direction === 'next' && currentPage < totalPages) {
            currentPage++;
        }

        currentPageSpan.textContent = currentPage;
        // Here you would typically load the data for the new page
        // For now, we'll just update the page number
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Add click event to class cards
    const classCards = document.querySelectorAll('.class-card');
    classCards.forEach(card => {
        card.addEventListener('click', () => {
            // Get class data
            const className = card.querySelector('h3').textContent;
            
            // Hide class grid
            document.querySelector('.class-grid').style.display = 'none';
            
            // Show class details with student list
            const classDetails = document.querySelector('.class-details');
            classDetails.style.display = 'block';
            
            // Update class name in header
            const classHeader = classDetails.querySelector('h2');
            if (classHeader) {
                classHeader.textContent = className;
            }

            // Show students tab by default
            document.querySelector('[data-tab="students"]').click();
        });
    });

    // Back button functionality
    const backButton = document.querySelector('.back-to-classes');
    if (backButton) {
        backButton.addEventListener('click', () => {
            document.querySelector('.class-details').style.display = 'none';
            document.querySelector('.class-grid').style.display = 'grid';
        });
    }

    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Toggle active state on tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Get selected tab
            const selectedTab = button.getAttribute('data-tab');
            const tabContents = document.querySelectorAll('.tab-content');
            
            // Hide all tab contents
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Show selected tab content
            const selectedContent = document.getElementById(`${selectedTab}Tab`);
            if (selectedContent) {
                selectedContent.classList.add('active');
                
                // If students tab is selected, show student list
                if (selectedTab === 'students') {
                    loadStudentList();
                }
            }
        });
    });
});

// Function to load student list
function loadStudentList() {
    const studentsTab = document.getElementById('studentsTab');
    
    // Lấy tên lớp từ header
    const className = document.querySelector('.class-details h2').textContent;
    
    studentsTab.innerHTML = `
        <div class="table-actions">
            <div class="action-group">
                <button class="btn btn-outline" onclick="filterStudents('all')">Tất cả</button>
                <button class="btn btn-outline" onclick="filterStudents('pending')">Chưa chấm</button>
                <button class="btn btn-outline" onclick="filterStudents('completed')">Đã chấm</button>
            </div>
        </div>

        <div class="table-container">
            <table class="student-table">
                <thead>
                    <tr>
                        <th><input type="checkbox" id="selectAll"></th>
                        <th>MSSV</th>
                        <th>Họ và tên</th>
                        <th>Điểm RL</th>
                        <th>Trạng thái</th>
                        <th>Cập nhật</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Sinh viên đã chấm điểm -->
                    <tr>
                        <td><input type="checkbox" class="student-select"></td>
                        <td>SV001</td>
                        <td>Nguyễn Văn A</td>
                        <td><span class="score-badge excellent">85</span></td>
                        <td><span class="status-badge completed">Đã chấm</span></td>
                        <td>15/02/2024</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-icon" title="Chỉnh sửa">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-icon" title="Xem lịch sử">
                                    <i class="fas fa-history"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td><input type="checkbox" class="student-select"></td>
                        <td>SV002</td>
                        <td>Trần Thị B</td>
                        <td><span class="score-badge good">78</span></td>
                        <td><span class="status-badge completed">Đã chấm</span></td>
                        <td>15/02/2024</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-icon" title="Chỉnh sửa">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-icon" title="Xem lịch sử">
                                    <i class="fas fa-history"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td><input type="checkbox" class="student-select"></td>
                        <td>SV003</td>
                        <td>Lê Văn C</td>
                        <td><span class="score-badge good">82</span></td>
                        <td><span class="status-badge completed">Đã chấm</span></td>
                        <td>14/02/2024</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-icon" title="Chỉnh sửa">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-icon" title="Xem lịch sử">
                                    <i class="fas fa-history"></i>
                                </button>
                            </div>
                        </td>
                    </tr>

                    <!-- Sinh viên chưa chấm điểm -->
                    <tr class="pending">
                        <td><input type="checkbox" class="student-select"></td>
                        <td>SV004</td>
                        <td>Phạm Thị D</td>
                        <td><span class="score-badge">-</span></td>
                        <td><span class="status-badge pending">Chưa chấm</span></td>
                        <td>-</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-icon primary" title="Chấm điểm">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr class="pending">
                        <td><input type="checkbox" class="student-select"></td>
                        <td>SV005</td>
                        <td>Hoàng Văn E</td>
                        <td><span class="score-badge">-</span></td>
                        <td><span class="status-badge pending">Chưa chấm</span></td>
                        <td>-</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-icon primary" title="Chấm điểm">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </td>
                    </tr>

                    <!-- Sinh viên cần cải thiện -->
                    <tr>
                        <td><input type="checkbox" class="student-select"></td>
                        <td>SV006</td>
                        <td>Lý Thị F</td>
                        <td><span class="score-badge below-average">65</span></td>
                        <td><span class="status-badge completed">Đã chấm</span></td>
                        <td>13/02/2024</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-icon" title="Chỉnh sửa">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-icon" title="Xem lịch sử">
                                    <i class="fas fa-history"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="pagination">
            <button class="btn btn-page" onclick="changePage('prev')">
                <i class="fas fa-chevron-left"></i>
            </button>
            <span class="page-info">Trang <span id="currentPage">1</span> / <span id="totalPages">5</span></span>
            <button class="btn btn-page" onclick="changePage('next')">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;

    // Setup event listeners
    setupTableEventListeners();
}

// Update hàm loadTabContent
function loadTabContent(tab, className) {
    // Remove active class from all tab contents first
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    const targetTab = document.getElementById(`${tab}Tab`);
    if (!targetTab) return;
    
    // Show selected tab content
    targetTab.classList.add('active');
    targetTab.style.display = 'block';
    
    switch(tab) {
        case 'students':
            // Get the student list for the selected class
            const students = classStudentData[className];
            const tbody = document.querySelector('.student-table tbody');
            
            if (students) {
                tbody.innerHTML = students.map(student => `
                    <tr class="${student.status === 'pending' ? 'pending' : ''}">
                        <td><input type="checkbox" class="student-select"></td>
                        <td>${student.id}</td>
                        <td>${student.name}</td>
                        <td><span class="score-badge ${getScoreBadgeClass(student.score)}">${student.score || '-'}</span></td>
                        <td><span class="status-badge ${student.status}">${student.status === 'completed' ? 'Đã chấm' : 'Chưa chấm'}</span></td>
                        <td>${student.lastUpdate}</td>
                        <td>
                            <div class="action-buttons">
                                ${student.status === 'pending' ? `
                                    <button class="btn btn-icon primary" title="Chấm điểm">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                ` : `
                                    <button class="btn btn-icon" title="Chỉnh sửa">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-icon" title="Xem lịch sử">
                                        <i class="fas fa-history"></i>
                                    </button>
                                `}
                            </div>
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="7">Không có dữ liệu sinh viên</td></tr>';
            }
            break;
            
        // ...rest of the cases...
    }
}

// Cập nhật event listener cho tab buttons
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabId = e.currentTarget.getAttribute('data-tab');
            const className = document.querySelector('.class-details h2')?.textContent;
            
            // Remove active class from all tabs and contents
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and its content
            e.currentTarget.classList.add('active');
            document.getElementById(`${tabId}Tab`).classList.add('active');
            
            // Load content for the selected tab
            loadTabContent(tabId, className);
        });
    });
});

function initializeBackButton() {
    const backButton = document.querySelector('.back-to-classes');
    if (backButton) {
        backButton.addEventListener('click', () => {
            // Hide class details
            const classDetails = document.querySelector('.class-details');
            classDetails.style.display = 'none';

            // Show class grid
            const classGrid = document.querySelector('.class-grid');
            classGrid.style.display = 'grid';

            // Remove active state from selected class
            const activeCard = document.querySelector('.class-card.active');
            if (activeCard) {
                activeCard.classList.remove('active');
            }
        });
    }
}

function initializeTabSystem() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button
            button.classList.add('active');

            // Show corresponding content
            const tabId = button.getAttribute('data-tab');
            const content = document.getElementById(`${tabId}Tab`);
            if (content) {
                content.classList.add('active');
                loadTabContent(tabId);
            }
        });
    });
}

function loadTabContent(tabId) {
    switch(tabId) {
        case 'students':
            loadStudentList();
            break;
        case 'statistics':
            loadStatistics();
            break;
        case 'history':
            loadHistory();
            break;
    }
}

function loadStatistics() {
    const statisticsTab = document.getElementById('statisticsTab');
    statisticsTab.innerHTML = `
        <div class="stats-container">
            <div class="chart-container">
                <canvas id="scoreDistributionChart"></canvas>
            </div>
            <div class="stats-summary">
                <!-- Stats content -->
            </div>
        </div>
    `;

    // Initialize chart
    const ctx = document.getElementById('scoreDistributionChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Xuất sắc', 'Giỏi', 'Khá', 'Trung bình', 'Yếu'],
            datasets: [{
                data: [15, 42, 55, 10, 3],
                backgroundColor: [
                    '#0284c7',
                    '#059669',
                    '#d97706',
                    '#dc2626',
                    '#6b7280'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function loadHistory() {
    const historyTab = document.getElementById('historyTab');
    historyTab.innerHTML = `
        <div class="history-container">
            <div class="history-filters">
                <div class="filter-group">
                    <select class="form-select">
                        <option value="all">Tất cả hoạt động</option>
                        <option value="scoring">Chấm điểm</option>
                        <option value="edit">Chỉnh sửa điểm</option>
                        <option value="approval">Phê duyệt</option>
                    </select>
                </div>
                <div class="date-range">
                    <input type="date" class="form-control" />
                    <span>đến</span>
                    <input type="date" class="form-control" />
                </div>
            </div>

            <div class="timeline">
                <!-- Ngày hiện tại -->
                <div class="timeline-date">
                    <span>Hôm nay, 15/02/2024</span>
                </div>
                <div class="timeline-item">
                    <div class="timeline-icon success">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="timeline-content">
                        <div class="activity-header">
                            <h4>Chấm điểm rèn luyện</h4>
                            <span class="time">10:30</span>
                        </div>
                        <p>Đã chấm điểm cho sinh viên Nguyễn Văn A (SV001)</p>
                        <div class="activity-details">
                            <span class="score-change">Điểm số: 85</span>
                            <span class="badge completed">Đã chấm</span>
                        </div>
                    </div>
                </div>

                <!-- Ngày hôm qua -->
                <div class="timeline-date">
                    <span>14/02/2024</span>
                </div>
                <div class="timeline-item">
                    <div class="timeline-icon warning">
                        <i class="fas fa-edit"></i>
                    </div>
                    <div class="timeline-content">
                        <div class="activity-header">
                            <h4>Chỉnh sửa điểm</h4>
                            <span class="time">15:45</span>
                        </div>
                        <p>Điều chỉnh điểm cho sinh viên Trần Thị B (SV002)</p>
                        <div class="activity-details">
                            <span class="score-change">75 → 78 điểm</span>
                            <span class="change-reason">Lý do: Cập nhật minh chứng hoạt động</span>
                        </div>
                    </div>
                </div>

                <!-- Các ngày trước -->
                <div class="timeline-date">
                    <span>13/02/2024</span>
                </div>
                <div class="timeline-item">
                    <div class="timeline-icon info">
                        <i class="fas fa-file-import"></i>
                    </div>
                    <div class="timeline-content">
                        <div class="activity-header">
                            <h4>Nhập điểm hàng loạt</h4>
                            <span class="time">09:15</span>
                        </div>
                        <p>Nhập điểm cho 15 sinh viên từ file Excel</p>
                        <div class="activity-details">
                            <span class="batch-info">15 sinh viên</span>
                            <button class="btn btn-outline-info btn-sm">
                                <i class="fas fa-download"></i> Xem file gốc
                            </button>
                        </div>
                    </div>
                </div>

                <div class="timeline-item">
                    <div class="timeline-icon danger">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <div class="timeline-content">
                        <div class="activity-header">
                            <h4>Yêu cầu chỉnh sửa</h4>
                            <span class="time">08:30</span>
                        </div>
                        <p>Phản hồi từ CVHT về điểm của sinh viên Lý Thị F (SV006)</p>
                        <div class="activity-details">
                            <span class="feedback">Cần xem xét lại minh chứng hoạt động tình nguyện</span>
                            <span class="badge pending">Đang xử lý</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Phân trang -->
            <div class="history-pagination">
                <button class="btn btn-outline">
                    <i class="fas fa-chevron-left"></i> Trang trước
                </button>
                <span class="page-info">Trang 1 / 3</span>
                <button class="btn btn-outline">
                    Trang sau <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `;

    // Add event listeners for filters
    setupHistoryFilters();
}

function setupHistoryFilters() {
    const filterSelect = document.querySelector('.history-filters select');
    const dateInputs = document.querySelectorAll('.date-range input');
    
    filterSelect?.addEventListener('change', filterHistoryByType);
    dateInputs.forEach(input => {
        input.addEventListener('change', filterHistoryByDate);
    });
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeTabSystem();
    // Show student list by default
    document.querySelector('[data-tab="students"]').click();
});
