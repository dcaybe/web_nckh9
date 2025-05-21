document.addEventListener('DOMContentLoaded', function() {
    // Initialize notifications list
    const notificationsList = document.getElementById('notificationsList');
    if (notificationsList) {
        initializeNotifications(notificationsList);
    }

    // Add event listeners for notification actions
    const notificationActions = document.querySelectorAll('.notification-action');
    notificationActions.forEach(action => {
        action.addEventListener('click', handleNotificationAction);
    });

    // Initialize notification settings if available
    const settingsForm = document.getElementById('notificationSettingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', handleSettingsSubmit);
    }

    // Set up WebSocket connection for real-time notifications
    initializeWebSocket();
});

function initializeNotifications(container) {
    // Load initial notifications
    loadNotifications(container);

    // Set up auto-refresh
    setInterval(() => {
        loadNotifications(container);
    }, 30000); // Refresh every 30 seconds
}

async function loadNotifications(container) {
    try {
        const response = await fetch('/api/notifications/');
        if (response.ok) {
            const data = await response.json();
            updateNotificationsList(container, data);
        }
    } catch (error) {
        showAlert('Error loading notifications', 'danger');
    }
}

function updateNotificationsList(container, notifications) {
    container.innerHTML = '';
    
    notifications.forEach(notification => {
        const notificationElement = createNotificationElement(notification);
        container.appendChild(notificationElement);
    });
}

function createNotificationElement(notification) {
    const div = document.createElement('div');
    div.className = `notification-item ${notification.read ? 'read' : 'unread'}`;
    div.innerHTML = `
        <div class="notification-content">
            <div class="notification-header">
                <span class="notification-title">${notification.title}</span>
                <span class="notification-time">${formatTime(notification.timestamp)}</span>
            </div>
            <div class="notification-message">${notification.message}</div>
            <div class="notification-actions">
                ${!notification.read ? `
                    <button class="btn btn-sm btn-primary mark-read" data-id="${notification.id}">
                        Mark as Read
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-danger delete-notification" data-id="${notification.id}">
                    Delete
                </button>
            </div>
        </div>
    `;
    return div;
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Less than 24 hours ago
    if (diff < 24 * 60 * 60 * 1000) {
        return date.toLocaleTimeString();
    }
    // Less than 7 days ago
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        return date.toLocaleDateString();
    }
    // More than 7 days ago
    return date.toLocaleDateString();
}

async function handleNotificationAction(event) {
    const action = event.target.dataset.action;
    const notificationId = event.target.dataset.id;
    
    try {
        const response = await fetch(`/api/notifications/${notificationId}/${action}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        
        if (response.ok) {
            if (action === 'delete') {
                event.target.closest('.notification-item').remove();
            } else if (action === 'mark-read') {
                event.target.closest('.notification-item').classList.add('read');
                event.target.remove();
            }
        } else {
            const error = await response.json();
            showAlert(error.message || `Error performing notification ${action}`, 'danger');
        }
    } catch (error) {
        showAlert(`An error occurred while performing notification ${action}`, 'danger');
    }
}

async function handleSettingsSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const settings = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch('/api/notifications/settings/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(settings)
        });
        
        if (response.ok) {
            showAlert('Notification settings saved successfully!', 'success');
        } else {
            const error = await response.json();
            showAlert(error.message || 'Error saving notification settings', 'danger');
        }
    } catch (error) {
        showAlert('An error occurred while saving notification settings', 'danger');
    }
}

function initializeWebSocket() {
    const ws = new WebSocket(`ws://${window.location.host}/ws/notifications/`);
    
    ws.onmessage = function(event) {
        const notification = JSON.parse(event.data);
        const container = document.getElementById('notificationsList');
        if (container) {
            const notificationElement = createNotificationElement(notification);
            container.insertBefore(notificationElement, container.firstChild);
        }
    };
    
    ws.onclose = function() {
        // Try to reconnect after 5 seconds
        setTimeout(initializeWebSocket, 5000);
    };
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
