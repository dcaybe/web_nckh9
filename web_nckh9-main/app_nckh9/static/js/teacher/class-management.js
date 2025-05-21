// State Management
const STATE = {
    classes: new Map(),
    students: new Map(),
    loading: false,
    error: null
};

// Cache Management
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = {
    classes: {
        data: null,
        timestamp: null
    },
    students: new Map() // classId -> {data, timestamp}
};

function isCacheValid(timestamp) {
    return timestamp && (Date.now() - timestamp < CACHE_DURATION);
}

// Initialization
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
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const filterValue = chip.getAttribute('data-filter');
            filterClasses(filterValue);
        });
    });

    // Tab handling
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(`${tabId}Tab`).classList.add('active');
        });
    });
});

// Initialization
async function initializeClassManagement() {
    try {
        STATE.loading = true;
        updateUIState();
        
        await Promise.all([
            setupSearchFunction(),
            setupFilters(),
            setupTabs(),
            initializeCharts()
        ]);
    } catch (error) {
        handleError(error);
    } finally {
        STATE.loading = false;
        updateUIState();
    }
}

// Data Fetching with Cache
async function fetchClassData(forceRefresh = false) {
    try {
        if (!forceRefresh && cache.classes.data && isCacheValid(cache.classes.timestamp)) {
            return cache.classes.data;
        }

        STATE.loading = true;
        updateUIState();

        const [classStats, classList] = await Promise.all([
            getClassStats(),
            getClassList()
        ]);
        
        const data = {
            classes: classList.map(cls => ({
                id: cls.classCode,
                totalStudents: cls.totalStudents,
                scoredStudents: cls.scoredStudents,
                lastUpdate: cls.lastUpdate
            })),
            statistics: {
                totalClasses: classStats.allClass,
                totalStudents: classStats.allStudent,
                scoredStudents: classStats.scoredStudents
            }
        };

        // Update cache
        cache.classes = {
            data,
            timestamp: Date.now()
        };

        return data;
    } catch (error) {
        handleError(error);
        throw error;
    } finally {
        STATE.loading = false;
        updateUIState();
    }
}

async function fetchStudentData(classId) {
    try {
        const cached = cache.students.get(classId);
        if (cached && isCacheValid(cached.timestamp)) {
            return cached.data;
        }

        STATE.loading = true;
        updateUIState();

        const response = await fetch(`${API_BASE_URL}/teacher/classes/${classId}/students/`);
        if (!response.ok) throw new Error('Failed to fetch student data');
        
        const data = await response.json();
        
        // Update cache
        cache.students.set(classId, {
            data,
            timestamp: Date.now()
        });

        return data;
    } catch (error) {
        handleError(error);
        throw error;
    } finally {
        STATE.loading = false;
        updateUIState();
    }
}

// Error Handling
function handleError(error) {
    STATE.error = error;
    logger.error('Operation failed:', error);
    showError(error.message || 'Có lỗi xảy ra, vui lòng thử lại sau');
}

// UI State Management
function updateUIState() {
    const loadingEl = document.querySelector('.loading-indicator');
    const errorEl = document.querySelector('.error-message');
    const contentEl = document.querySelector('.content-container');

    if (STATE.loading) {
        loadingEl?.classList.add('visible');
        contentEl?.classList.add('loading');
    } else {
        loadingEl?.classList.remove('visible');
        contentEl?.classList.remove('loading');
    }

    if (STATE.error) {
        errorEl.textContent = STATE.error.message;
        errorEl?.classList.add('visible');
    } else {
        errorEl?.classList.remove('visible');
    }
}

// Event Listeners
function setupEventListeners() {
    setupTableListeners();
    setupModalListeners();
    setupPaginationListeners();
    setupBatchOperations();
}

// Enhanced Search and Filters
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

// Class Operations
async function addNewClass(classData) {
    try {
        STATE.loading = true;
        updateUIState();

        const response = await fetch(`${API_BASE_URL}/teacher/classes/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(classData)
        });

        if (!response.ok) {
            throw new Error('Failed to create class');
        }

        // Invalidate cache
        cache.classes.timestamp = null;
        
        // Refresh class list
        await fetchClassData(true);
        
        showToast('Thêm lớp mới thành công', 'success');
    } catch (error) {
        handleError(error);
    } finally {
        STATE.loading = false;
        updateUIState();
    }
}

async function deleteClass(classId) {
    try {
        STATE.loading = true;
        updateUIState();

        const response = await fetch(`${API_BASE_URL}/teacher/classes/${classId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete class');
        }

        // Invalidate cache
        cache.classes.timestamp = null;
        cache.students.delete(classId);
        
        // Refresh class list
        await fetchClassData(true);
        
        showToast('Xóa lớp thành công', 'success');
    } catch (error) {
        handleError(error);
    } finally {
        STATE.loading = false;
        updateUIState();
    }
}

// Utility Functions
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

// Initialize Charts
function initializeCharts() {
    const ctx = document.getElementById('classChart')?.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Hoàn thành', 'Đang chấm', 'Chưa chấm'],
            datasets: [{
                data: [30, 50, 20],
                backgroundColor: [
                    '#4CAF50',
                    '#2196F3',
                    '#FFC107'
                ],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Export helper functions
const exportHelpers = {
    validateData: (data) => {
        // Add validation logic here
        return true;
    },
    
    prepareDataForExport: (data) => {
        // Add data preparation logic here
        return data;
    }
};
