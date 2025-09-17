// Main Window JavaScript
const { ipcRenderer } = require('electron');

class SmartPasteUI {
    constructor() {
        this.currentPage = 'dashboard';
        this.sessionStartTime = Date.now();
        this.clipboardHistory = [];
        this.settings = {};
        this.handlerStatus = {};
        this.isMonitoring = true;
        
        this.initializeUI();
        this.setupEventListeners();
        this.startUpdating();
    }

    async initializeUI() {
        try {
            // Get initial monitoring status from backend
            this.isMonitoring = await ipcRenderer.invoke('get-monitoring-status');
            console.log('Frontend: Initial monitoring status:', this.isMonitoring);
        } catch (error) {
            console.error('Frontend: Error getting initial monitoring status:', error);
            // Fallback if IPC fails
            this.isMonitoring = true;
        }
        
        // Load initial data
        this.loadSettings();
        this.loadClipboardHistory();
        this.updateDashboard();
        this.updateMonitoringStatus();
        
        // Setup navigation
        this.setupNavigation();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.showPage(page);
            });
        });

        // Header buttons
        document.getElementById('processClipboard').addEventListener('click', () => {
            this.processCurrentClipboard();
        });

        document.getElementById('toggleMonitoring').addEventListener('click', () => {
            this.toggleMonitoring();
        });

        // Search functionality
        const searchInput = document.getElementById('historySearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterHistory(e.target.value);
            });
        }

        // IPC listeners
        ipcRenderer.on('clipboard-history', (event, history) => {
            this.clipboardHistory = history;
            this.updateHistoryDisplay();
            this.updateDashboard();
        });

        ipcRenderer.on('clipboard-processed', (event, result) => {
            this.addProcessedItem(result);
        });

        ipcRenderer.on('settings-updated', (event, settings) => {
            this.settings = settings;
            this.updateSettingsDisplay();
        });

        // New listener for monitoring status changes
        ipcRenderer.on('monitoring-status-changed', (event, isMonitoring) => {
            this.isMonitoring = isMonitoring;
            this.updateMonitoringStatus();
            this.updateDashboard();
        });
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove active class from all items
                navItems.forEach(nav => nav.classList.remove('active'));
                // Add active class to clicked item
                item.classList.add('active');
                
                // Update page title
                const pageName = item.querySelector('span').textContent;
                document.getElementById('pageTitle').textContent = pageName;
            });
        });
    }

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;
            
            // Load page-specific data
            this.loadPageData(pageId);
        }
    }

    loadPageData(pageId) {
        switch (pageId) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'history':
                this.updateHistoryDisplay();
                break;
            case 'handlers':
                this.updateHandlersDisplay();
                break;
            case 'sync':
                this.updateSyncDisplay();
                break;
            case 'settings':
                this.updateSettingsDisplay();
                break;
            case 'statistics':
                this.updateStatisticsDisplay();
                break;
        }
    }

    async loadSettings() {
        try {
            this.settings = await ipcRenderer.invoke('get-settings');
            this.isMonitoring = this.settings.monitoring || false;
            this.updateMonitoringStatus();
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async loadClipboardHistory() {
        try {
            this.clipboardHistory = await ipcRenderer.invoke('get-clipboard-history');
            this.updateHistoryDisplay();
        } catch (error) {
            console.error('Error loading clipboard history:', error);
        }
    }

    updateDashboard() {
        // Update stats
        document.getElementById('totalItems').textContent = this.clipboardHistory.length;
        
        const processedCount = this.clipboardHistory.filter(item => item.processed).length;
        document.getElementById('processedItems').textContent = processedCount;
        
        // Update session time
        this.updateSessionTime();
        
        // Update sync status
        document.getElementById('syncStatus').textContent = this.settings.syncEnabled ? 'Connected' : 'Offline';
        
        // Update recent activity
        this.updateRecentActivity();
        
        // Update handler status
        this.updateHandlerStatusDisplay();
    }

    updateSessionTime() {
        const now = Date.now();
        const sessionDuration = now - this.sessionStartTime;
        const hours = Math.floor(sessionDuration / (1000 * 60 * 60));
        const minutes = Math.floor((sessionDuration % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((sessionDuration % (1000 * 60)) / 1000);
        
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('sessionTime').textContent = timeString;
    }

    updateRecentActivity() {
        const recentContainer = document.getElementById('recentActivity');
        const recentItems = this.clipboardHistory.slice(0, 5);
        
        if (recentItems.length === 0) {
            recentContainer.innerHTML = '<div class="loading">No recent activity</div>';
            return;
        }
        
        recentContainer.innerHTML = recentItems.map(item => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-${this.getContentIcon(item.content)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-text">${this.truncateText(item.content, 50)}</div>
                    <div class="activity-time">${this.formatTime(item.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    updateHandlerStatusDisplay() {
        const handlerContainer = document.getElementById('handlerStatus');
        const handlers = [
            { name: 'URL Handler', enabled: this.settings['handlers.url.enabled'] !== false },
            { name: 'Text Handler', enabled: this.settings['handlers.text.enabled'] !== false },
            { name: 'Image Handler', enabled: this.settings['handlers.image.enabled'] !== false },
            { name: 'Number Handler', enabled: this.settings['handlers.number.enabled'] !== false }
        ];
        
        handlerContainer.innerHTML = handlers.map(handler => `
            <div class="handler-item">
                <span class="handler-name">${handler.name}</span>
                <div class="handler-status">
                    <span class="status-badge ${handler.enabled ? 'enabled' : 'disabled'}">
                        ${handler.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                </div>
            </div>
        `).join('');
    }

    updateHistoryDisplay() {
        const historyContainer = document.getElementById('historyList');
        if (!historyContainer) return;
        
        if (this.clipboardHistory.length === 0) {
            historyContainer.innerHTML = '<div class="loading">No clipboard history available</div>';
            return;
        }
        
        historyContainer.innerHTML = this.clipboardHistory.map((item, index) => `
            <div class="history-item" data-index="${index}">
                <div class="history-content">${this.escapeHtml(item.content)}</div>
                <div class="history-meta">
                    <span>${this.formatTime(item.timestamp)}</span>
                    <div class="history-actions">
                        <button onclick="smartPasteUI.copyToClipboard('${this.escapeHtml(item.content)}')">Copy</button>
                        <button onclick="smartPasteUI.deleteHistoryItem(${index})">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateHandlersDisplay() {
        const handlersContainer = document.getElementById('handlersList');
        if (!handlersContainer) return;
        
        const handlers = [
            {
                name: 'URL Handler',
                description: 'Processes web URLs and extracts metadata',
                enabled: this.settings['handlers.url.enabled'] !== false,
                key: 'handlers.url.enabled'
            },
            {
                name: 'Text Handler',
                description: 'Analyzes text content and extracts insights',
                enabled: this.settings['handlers.text.enabled'] !== false,
                key: 'handlers.text.enabled'
            },
            {
                name: 'Image Handler',
                description: 'Extracts text from images using OCR',
                enabled: this.settings['handlers.image.enabled'] !== false,
                key: 'handlers.image.enabled'
            },
            {
                name: 'Number Handler',
                description: 'Converts numbers and units automatically',
                enabled: this.settings['handlers.number.enabled'] !== false,
                key: 'handlers.number.enabled'
            }
        ];
        
        handlersContainer.innerHTML = `
            <div class="handlers-grid">
                ${handlers.map(handler => `
                    <div class="handler-card">
                        <div class="handler-header">
                            <h4>${handler.name}</h4>
                            <label class="toggle-switch">
                                <input type="checkbox" ${handler.enabled ? 'checked' : ''} 
                                       onchange="smartPasteUI.toggleHandler('${handler.key}', this.checked)">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <p class="handler-description">${handler.description}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    updateSyncDisplay() {
        const syncContainer = document.getElementById('syncConfiguration');
        if (!syncContainer) return;
        
        syncContainer.innerHTML = `
            <div class="sync-settings">
                <div class="setting-group">
                    <label class="setting-label">
                        <input type="checkbox" ${this.settings.syncEnabled ? 'checked' : ''} 
                               onchange="smartPasteUI.toggleSync(this.checked)">
                        Enable Synchronization
                    </label>
                    <p class="setting-description">Sync clipboard history across all your devices</p>
                </div>
                
                <div class="setting-group">
                    <label for="syncProvider">Sync Provider:</label>
                    <select id="syncProvider" onchange="smartPasteUI.updateSyncProvider(this.value)">
                        <option value="local" ${this.settings.syncProvider === 'local' ? 'selected' : ''}>Local Network</option>
                        <option value="firebase" ${this.settings.syncProvider === 'firebase' ? 'selected' : ''}>Firebase</option>
                        <option value="aws" ${this.settings.syncProvider === 'aws' ? 'selected' : ''}>AWS</option>
                    </select>
                </div>
                
                <div class="sync-status">
                    <h4>Sync Status</h4>
                    <div class="status-info">
                        <span class="status-dot ${this.settings.syncEnabled ? 'active' : ''}"></span>
                        <span>${this.settings.syncEnabled ? 'Connected and syncing' : 'Sync disabled'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    updateSettingsDisplay() {
        const settingsContainer = document.getElementById('settingsForm');
        if (!settingsContainer) return;
        
        settingsContainer.innerHTML = `
            <div class="settings-grid">
                <div class="setting-section">
                    <h4>General Settings</h4>
                    
                    <div class="setting-group">
                        <label class="setting-label">
                            <input type="checkbox" ${this.settings.monitoring ? 'checked' : ''} 
                                   onchange="smartPasteUI.updateSetting('monitoring', this.checked)">
                            Enable Clipboard Monitoring
                        </label>
                    </div>
                    
                    <div class="setting-group">
                        <label class="setting-label">
                            <input type="checkbox" ${this.settings.notifications ? 'checked' : ''} 
                                   onchange="smartPasteUI.updateSetting('notifications', this.checked)">
                            Show Notifications
                        </label>
                    </div>
                    
                    <div class="setting-group">
                        <label class="setting-label">
                            <input type="checkbox" ${this.settings.autoStart ? 'checked' : ''} 
                                   onchange="smartPasteUI.updateSetting('autoStart', this.checked)">
                            Start with Windows
                        </label>
                    </div>
                </div>
                
                <div class="setting-section">
                    <h4>Hotkeys</h4>
                    
                    <div class="setting-group">
                        <label for="historyHotkey">Clipboard History:</label>
                        <input type="text" id="historyHotkey" value="${this.settings.hotkeys?.history || 'CommandOrControl+Shift+V'}" 
                               onchange="smartPasteUI.updateHotkey('history', this.value)">
                    </div>
                    
                    <div class="setting-group">
                        <label for="settingsHotkey">Settings:</label>
                        <input type="text" id="settingsHotkey" value="${this.settings.hotkeys?.settings || 'CommandOrControl+Shift+S'}" 
                               onchange="smartPasteUI.updateHotkey('settings', this.value)">
                    </div>
                    
                    <div class="setting-group">
                        <label for="processHotkey">Process Current:</label>
                        <input type="text" id="processHotkey" value="${this.settings.hotkeys?.process || 'CommandOrControl+Shift+P'}" 
                               onchange="smartPasteUI.updateHotkey('process', this.value)">
                    </div>
                </div>
            </div>
        `;
    }

    updateStatisticsDisplay() {
        const statsContainer = document.getElementById('statisticsCharts');
        if (!statsContainer) return;
        
        // Simple statistics for now
        const totalItems = this.clipboardHistory.length;
        const processedItems = this.clipboardHistory.filter(item => item.processed).length;
        const urlItems = this.clipboardHistory.filter(item => this.isUrl(item.content)).length;
        const textItems = this.clipboardHistory.filter(item => !this.isUrl(item.content)).length;
        
        statsContainer.innerHTML = `
            <div class="statistics-grid">
                <div class="stat-chart">
                    <h4>Content Types</h4>
                    <div class="chart-bar">
                        <div class="bar-item">
                            <span>URLs</span>
                            <div class="bar">
                                <div class="bar-fill" style="width: ${totalItems ? (urlItems / totalItems) * 100 : 0}%"></div>
                            </div>
                            <span>${urlItems}</span>
                        </div>
                        <div class="bar-item">
                            <span>Text</span>
                            <div class="bar">
                                <div class="bar-fill" style="width: ${totalItems ? (textItems / totalItems) * 100 : 0}%"></div>
                            </div>
                            <span>${textItems}</span>
                        </div>
                    </div>
                </div>
                
                <div class="stat-chart">
                    <h4>Processing Rate</h4>
                    <div class="chart-number">
                        <span class="big-number">${totalItems ? Math.round((processedItems / totalItems) * 100) : 0}%</span>
                        <span class="chart-label">Items Processed</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Event Handlers
    async processCurrentClipboard() {
        try {
            await ipcRenderer.invoke('process-current-clipboard');
            this.showNotification('Processing current clipboard content...');
        } catch (error) {
            console.error('Error processing clipboard:', error);
        }
    }

    async toggleMonitoring() {
        try {
            console.log('Frontend: Requesting monitoring toggle...');
            const newStatus = await ipcRenderer.invoke('toggle-monitoring');
            this.isMonitoring = newStatus;
            console.log('Frontend: Monitoring status changed to:', newStatus);
            this.updateMonitoringStatus();
            this.updateDashboard();
        } catch (error) {
            console.error('Frontend: Error toggling monitoring:', error);
        }
    }

    updateMonitoringStatus() {
        const statusDot = document.getElementById('monitoringStatus');
        const statusText = document.getElementById('statusText');
        const toggleBtn = document.getElementById('toggleMonitoring');
        
        if (this.isMonitoring) {
            statusDot.classList.add('active');
            statusText.textContent = 'Monitoring Active';
            toggleBtn.innerHTML = '<i class="fas fa-pause"></i> Pause Monitoring';
        } else {
            statusDot.classList.remove('active');
            statusText.textContent = 'Monitoring Paused';
            toggleBtn.innerHTML = '<i class="fas fa-play"></i> Start Monitoring';
        }
    }

    async updateSetting(key, value) {
        try {
            const newSettings = { ...this.settings, [key]: value };
            await ipcRenderer.invoke('save-settings', newSettings);
            this.settings = newSettings;
        } catch (error) {
            console.error('Error updating setting:', error);
        }
    }

    async toggleHandler(handlerKey, enabled) {
        await this.updateSetting(handlerKey, enabled);
        this.updateHandlerStatusDisplay();
    }

    async toggleSync(enabled) {
        await this.updateSetting('syncEnabled', enabled);
        this.updateSyncDisplay();
        this.updateDashboard();
    }

    async updateSyncProvider(provider) {
        await this.updateSetting('syncProvider', provider);
    }

    async updateHotkey(action, hotkey) {
        const hotkeys = { ...this.settings.hotkeys, [action]: hotkey };
        await this.updateSetting('hotkeys', hotkeys);
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Copied to clipboard');
        });
    }

    deleteHistoryItem(index) {
        if (confirm('Delete this clipboard item?')) {
            this.clipboardHistory.splice(index, 1);
            this.updateHistoryDisplay();
            this.updateDashboard();
        }
    }

    filterHistory(searchTerm) {
        const items = document.querySelectorAll('.history-item');
        items.forEach(item => {
            const content = item.querySelector('.history-content').textContent.toLowerCase();
            if (content.includes(searchTerm.toLowerCase())) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Utility functions
    getContentIcon(content) {
        if (this.isUrl(content)) return 'link';
        if (content.length > 100) return 'file-text';
        if (/^\d+$/.test(content)) return 'calculator';
        return 'clipboard';
    }

    isUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    formatTime(timestamp) {
        return new Date(timestamp).toLocaleString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message) {
        // Simple notification - could be enhanced
        console.log('Notification:', message);
    }

    startUpdating() {
        // Update session time every second
        setInterval(() => {
            if (this.currentPage === 'dashboard') {
                this.updateSessionTime();
            }
        }, 1000);
        
        // Refresh data every 30 seconds
        setInterval(() => {
            this.loadClipboardHistory();
        }, 30000);
    }
}

// Global functions for onclick handlers
window.showPage = function(pageId) {
    if (window.smartPasteUI) {
        window.smartPasteUI.showPage(pageId);
    }
};

window.clearHistory = function() {
    if (confirm('Clear all clipboard history?')) {
        window.smartPasteUI.clipboardHistory = [];
        window.smartPasteUI.updateHistoryDisplay();
        window.smartPasteUI.updateDashboard();
    }
};

window.exportData = function() {
    const data = {
        history: window.smartPasteUI.clipboardHistory,
        settings: window.smartPasteUI.settings,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartpaste-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

window.restartApp = function() {
    if (confirm('Restart SmartPaste?')) {
        ipcRenderer.send('restart-app');
    }
};

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.smartPasteUI = new SmartPasteUI();
});
