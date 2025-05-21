document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.rules-content');
    const totalScoreElement = document.getElementById('total-score');
    
    // Calculate total when any checkbox/radio changes
    form.addEventListener('change', calculateTotal);
    
    function calculateTotal() {
        let total = 0;
        
        // Get all checked checkboxes
        const checkedBoxes = form.querySelectorAll('input[type="checkbox"]:checked');
        checkedBoxes.forEach(box => {
            total += parseInt(box.value) || 0;
        });
        
        // Get all selected radio buttons
        const checkedRadios = form.querySelectorAll('input[type="radio"]:checked');
        checkedRadios.forEach(radio => {
            total += parseInt(radio.value) || 0;
        });
        
        // Update total display
        totalScoreElement.textContent = Math.min(total, 100); // Cap at 100
        
        // Change color based on total
        if (total >= 90) {
            totalScoreElement.style.color = '#4CAF50';
        } else if (total >= 80) {
            totalScoreElement.style.color = '#2196F3';
        } else if (total >= 65) {
            totalScoreElement.style.color = '#FF9800';
        } else {
            totalScoreElement.style.color = '#f44336';
        }
    }
    
    // Handle form submission
    // document.querySelector('.btn-submit').addEventListener('click', function(e) {
    //     e.preventDefault();
    //     // Add your submission logic here
    //     alert('Đã lưu đánh giá của bạn!');
    // });
});
