document.addEventListener('DOMContentLoaded', function() {
    // Set fixed score
    updateScoreDisplay(99);
    updateScoreClassification(99);
});

function updateScoreDisplay(score) {
    // Update the numeric display
    document.getElementById('current-score').textContent = score;
    
    // Update the circular progress
    const progressPath = document.getElementById('score-progress-path');
    const circumference = 2 * Math.PI * 15.9155; // Radius from SVG path
    const offset = circumference - (score / 100) * circumference;
    progressPath.style.strokeDasharray = circumference;
    progressPath.style.strokeDashoffset = offset;
    
    // Update progress color based on score
    if (score >= 90) {
        progressPath.style.stroke = '#4CAF50'; // Excellent - Green
    } else if (score >= 80) {
        progressPath.style.stroke = '#2196F3'; // Good - Blue
    } else if (score >= 65) {
        progressPath.style.stroke = '#FF9800'; // Average - Orange
    } else {
        progressPath.style.stroke = '#f44336'; // Poor - Red
    }
}

function updateScoreClassification(score) {
    const classification = document.getElementById('score-classification');
    let text = 'Xếp loại: ';
    let className = '';
    
    if (score >= 90) {
        text += 'Xuất sắc';
        className = 'excellent';
    } else if (score >= 80) {
        text += 'Tốt';
        className = 'good';
    } else if (score >= 65) {
        text += 'Khá';
        className = 'average';
    } else {
        text += 'Trung bình';
        className = 'poor';
    }
    
    classification.textContent = text;
    classification.className = 'score-status ' + className;
}

// Add event listener for user info dropdown
document.querySelector('.user-info').addEventListener('click', function() {
    // Add your dropdown menu logic here
});

// Function to fetch and update notifications
async function fetchNotifications() {
    // Add your notification fetching logic here
}

// Function to update semester data
function updateSemesterInfo(semester, year) {
    document.getElementById('semester').textContent = semester;
    document.getElementById('academic-year').textContent = year;
}
