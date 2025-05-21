// Khởi tạo các biến theo dõi tiến trình
let activeExportTask = null;
let activeSyncTask = null;

// Export Operations UI
function initExportForm() {
    const form = document.getElementById('exportForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const options = {
            format: formData.get('format'),
            data_type: formData.get('data_type'),
            start_date: formData.get('start_date'),
            end_date: formData.get('end_date'),
            include_fields: formData.getAll('include_fields')
        };

        try {
            showLoading('exportSection');
            const result = await initiateExport(options);
            activeExportTask = result.task_id;
            updateExportProgress(0);
            startExportProgressCheck();
        } catch (error) {
            handleError(error);
        } finally {
            hideLoading('exportSection');
        }
    });
}

// Theo dõi tiến trình export
function startExportProgressCheck() {
    if (!activeExportTask) return;

    const progressInterval = setInterval(async () => {
        try {
            const progress = await checkExportProgress(activeExportTask);
            updateExportProgress(progress.progress);

            if (progress.status === 'completed') {
                clearInterval(progressInterval);
                showExportSuccess();
                await downloadExport(activeExportTask);
            } else if (progress.status === 'failed') {
                clearInterval(progressInterval);
                showExportError(progress.error_message);
            }
        } catch (error) {
            clearInterval(progressInterval);
            handleError(error);
        }
    }, 2000);
}

// Sync Operations UI
function initSyncForm() {
    const form = document.getElementById('syncForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const options = {
            sync_type: formData.get('sync_type'),
            source_system: formData.get('source_system'),
            data_type: formData.get('data_type')
        };

        try {
            showLoading('syncSection');
            const result = await initiateSync(options);
            activeSyncTask = result.task_id;
            updateSyncProgress(0);
            startSyncProgressCheck();
        } catch (error) {
            handleError(error);
        } finally {
            hideLoading('syncSection');
        }
    });
}

// Theo dõi tiến trình sync
function startSyncProgressCheck() {
    if (!activeSyncTask) return;

    const progressInterval = setInterval(async () => {
        try {
            const progress = await checkSyncProgress(activeSyncTask);
            updateSyncProgress(progress.progress);

            if (progress.status === 'completed') {
                clearInterval(progressInterval);
                showSyncSuccess();
            } else if (progress.status === 'failed') {
                clearInterval(progressInterval);
                const errors = await getSyncErrors(activeSyncTask);
                showSyncErrors(errors);
            }
        } catch (error) {
            clearInterval(progressInterval);
            handleError(error);
        }
    }, 2000);
}

// UI Update Functions
function updateExportProgress(progress) {
    const progressBar = document.getElementById('exportProgress');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
    }
}

function updateSyncProgress(progress) {
    const progressBar = document.getElementById('syncProgress');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
    }
}

function showExportSuccess() {
    showNotification('success', 'Export hoàn thành thành công!');
}

function showExportError(message) {
    showNotification('error', `Export thất bại: ${message}`);
}

function showSyncSuccess() {
    showNotification('success', 'Sync hoàn thành thành công!');
}

function showSyncErrors(errors) {
    const errorMessages = errors.errors.join('\n');
    showNotification('error', `Sync thất bại với các lỗi sau:\n${errorMessages}`);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initExportForm();
    initSyncForm();
});