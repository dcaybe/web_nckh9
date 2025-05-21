// Mock data for testing
const mockStudents = [
    { rank: 1, name: 'Nguyễn Văn A', class: 'DCCTCT66B1', score: 100, avatar: 'https://cdn.vosc.edu.vn/wp-content/uploads/2024/09/avatar-vo-tri-meo-1.jpg' },
    { rank: 2, name: 'Nguyễn Văn B', class: 'DCCTCT66B2', score: 95, avatar: 'https://cdn.vosc.edu.vn/wp-content/uploads/2024/09/avatar-vo-tri-meo-1.jpg' },
    { rank: 3, name: 'Nguyễn Văn C', class: 'DCCTCT66B1', score: 90, avatar: 'https://cdn.vosc.edu.vn/wp-content/uploads/2024/09/avatar-vo-tri-meo-1.jpg' },
    { rank: 4, name: 'Nguyễn Văn D', class: 'DCCTCT66B2', score: 88, avatar: 'https://cdn.vosc.edu.vn/wp-content/uploads/2024/09/avatar-vo-tri-meo-1.jpg' },
    { rank: 5, name: 'Trần Thị E', class: 'DCCTCT66B1', score: 87, avatar: 'https://cdn.vosc.edu.vn/wp-content/uploads/2024/09/avatar-vo-tri-meo-1.jpg' },
    { rank: 6, name: 'Lê Văn F', class: 'DCCTCT66B3', score: 85, avatar: 'https://cdn.vosc.edu.vn/wp-content/uploads/2024/09/avatar-vo-tri-meo-1.jpg' },
    { rank: 7, name: 'Phạm Thị G', class: 'DCCTCT66B2', score: 84, avatar: 'https://cdn.vosc.edu.vn/wp-content/uploads/2024/09/avatar-vo-tri-meo-1.jpg' },
    { rank: 8, name: 'Hoàng Văn H', class: 'DCCTCT66B1', score: 83, avatar: 'https://cdn.vosc.edu.vn/wp-content/uploads/2024/09/avatar-vo-tri-meo-1.jpg' },
    { rank: 9, name: 'Vũ Thị I', class: 'DCCTCT66B3', score: 82, avatar: 'https://cdn.vosc.edu.vn/wp-content/uploads/2024/09/avatar-vo-tri-meo-1.jpg' },
    { rank: 10, name: 'Đỗ Văn K', class: 'DCCTCT66B2', score: 81, avatar: 'https://cdn.vosc.edu.vn/wp-content/uploads/2024/09/avatar-vo-tri-meo-1.jpg' },
    { rank: 11, name: 'Lý Thị L', class: 'DCCTCT66B1', score: 80, avatar: 'https://cdn.vosc.edu.vn/wp-content/uploads/2024/09/avatar-vo-tri-meo-1.jpg' },
    { rank: 12, name: 'Trịnh Văn M', class: 'DCCTCT66B3', score: 79, avatar: 'https://cdn.vosc.edu.vn/wp-content/uploads/2024/09/avatar-vo-tri-meo-1.jpg' },
    { rank: 13, name: 'Mai Thị N', class: 'DCCTCT66B2', score: 78, avatar: 'https://cdn.vosc.edu.vn/wp-content/uploads/2024/09/avatar-vo-tri-meo-1.jpg' },
    { rank: 14, name: 'Phan Văn O', class: 'DCCTCT66B1', score: 77, avatar: 'https://cdn.vosc.edu.vn/wp-content/uploads/2024/09/avatar-vo-tri-meo-1.jpg' },
    { rank: 15, name: 'Bùi Thị P', class: 'DCCTCT66B3', score: 76, avatar: 'https://cdn.vosc.edu.vn/wp-content/uploads/2024/09/avatar-vo-tri-meo-1.jpg' }
];

let currentPage = 1;
const itemsPerPage = 10;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadRankings();
    setupEventListeners();
});

function setupEventListeners() {
    // Semester filter change
    document.querySelector('.semester-select').addEventListener('change', loadRankings);

    // Pagination clicks
    document.querySelector('.pagination').addEventListener('click', (e) => {
        if (e.target.classList.contains('page-btn')) {
            const newPage = parseInt(e.target.textContent);
            if (!isNaN(newPage)) {
                currentPage = newPage;
                loadRankings();
            } else if (e.target.classList.contains('fa-chevron-left')) {
                if (currentPage > 1) {
                    currentPage--;
                    loadRankings();
                }
            } else if (e.target.classList.contains('fa-chevron-right')) {
                if (currentPage < Math.ceil(mockStudents.length / itemsPerPage)) {
                    currentPage++;
                    loadRankings();
                }
            }
        }
    });
}

function loadRankings() {
    updateTopRankings();
    updateRankingTable();
    updatePagination();
}

function updateTopRankings() {
    const top3 = mockStudents.slice(0, 3);
    const positions = ['first', 'second', 'third'];
    
    positions.forEach((pos, index) => {
        if (top3[index]) {
            const card = document.querySelector(`.rank-card.${pos}`);
            card.querySelector('.rank-name').textContent = top3[index].name;
            card.querySelector('.rank-score').textContent = `${top3[index].score} điểm`;
            card.querySelector('.rank-avatar').src = top3[index].avatar;
        }
    });
}

function updateRankingTable() {
    const tbody = document.querySelector('.rank-list table tbody');
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = mockStudents.slice(start, end);

    // Clear existing content
    tbody.innerHTML = '';

    // Add new rows
    pageData.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.rank}</td>
            <td>
                <div class="student-info">
                    <img src="${student.avatar}" alt="${student.name}" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px;">
                    <span>${student.name}</span>
                </div>
            </td>
            <td>${student.class}</td>
            <td>${student.score}</td>
        `;
        tbody.appendChild(row);
    });
}

function updatePagination() {
    const totalPages = Math.ceil(mockStudents.length / itemsPerPage);
    const pagination = document.querySelector('.pagination');
    
    let paginationHTML = `
        <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <button class="page-btn ${currentPage === i ? 'active' : ''}">${i}</button>
        `;
    }

    paginationHTML += `
        <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    pagination.innerHTML = paginationHTML;
}
