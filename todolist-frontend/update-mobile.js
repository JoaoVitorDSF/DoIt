const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'html');

const newMobileCSS = `
/* --- MOBILE RESPONSIVENESS INJECTED --- */
@media (max-width: 768px) {
    /* Login & Register Boxes */
    .login-box, .register-box {
        padding: 20px;
        margin: 15px;
        width: 100%;
        max-width: calc(100% - 30px);
    }
    
    /* Dashboard Layout */
    .dashboard-container {
        flex-direction: column;
    }
    
    .sidebar {
        width: 100%;
        height: auto;
        position: relative;
        padding: 15px;
        border-right: none;
        border-bottom: 1px solid var(--border);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        z-index: 100;
        display: flex;
        flex-direction: column;
    }
    
    .dashboard-main {
        margin-left: 0;
        max-width: 100%;
        padding: 15px;
    }
    
    /* Charts Grid & Stats Grid */
    .charts-container {
        grid-template-columns: 1fr !important;
    }
    
    .stats-grid {
        grid-template-columns: 1fr 1fr;
    }
    
    /* Modals */
    .modal-content {
        width: 95%;
        margin: 10% auto;
        padding: 20px;
        max-height: 90vh;
        overflow-y: auto;
    }
    
    /* Sidebar Navigation Horizontal */
    .sidebar-nav {
        flex-direction: row;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 10px;
        justify-content: center;
    }
    
    .nav-item {
        flex: 1 1 calc(50% - 10px);
        justify-content: center;
        padding: 10px;
        font-size: 14px;
    }

    /* Hide useless Dashboard button on Client Mobile */
    .sidebar-nav .nav-item:not([id="settingsBtn"]):not([data-tab]) {
        display: none;
    }
    
    /* Profile in Top Left, Settings in Top Right */
    .sidebar-header {
        margin-bottom: 15px;
        text-align: center;
        min-height: 45px; /* Ensure space for absolute items */
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .sidebar-footer .user-info {
        position: absolute;
        top: 15px;
        left: 15px;
        margin: 0;
        padding: 0;
    }
    
    .sidebar-footer .user-details {
        display: none; /* Hide text to save space */
    }
    
    .sidebar-footer .user-avatar {
        width: 50px;
        height: 50px;
        cursor: pointer;
    }
    
    /* Position Settings Button Top Right */
    #settingsBtn {
        position: absolute;
        top: 15px;
        right: 15px;
        left: auto;
        padding: 8px;
        background: transparent !important;
        color: var(--text-secondary);
        width: auto;
        flex: none;
    }
    
    #settingsBtn:hover {
        color: var(--primary);
    }
    
    #settingsBtn span {
        display: none; /* Hide text */
    }
    
    #settingsBtn svg {
        width: 28px;
        height: 28px;
    }
    
    /* Adjust Footer */
    .sidebar-footer {
        padding-top: 15px;
        display: flex;
        justify-content: center; /* Center the logout button */
        align-items: center;
        border-top: 1px solid var(--border);
    }
    
    .sidebar-footer .logout-btn {
        width: auto;
        padding: 8px 20px;
    }
    
    /* Tables */
    .admin-table th, .admin-table td {
        padding: 10px 5px;
        font-size: 13px;
        white-space: nowrap;
    }
    
    .admin-table-container {
        border-radius: 8px;
    }
    
    /* Filters */
    .filters {
        flex-direction: column;
        align-items: stretch;
    }
    
    .filters input, .filters select {
        width: 100%;
    }
    
    /* Fix header bar inside landing */
    .header-content {
        flex-direction: column;
        gap: 15px;
    }
    
    .nav-links {
        display: flex !important;
        flex-wrap: wrap;
        justify-content: center;
    }
}

/* Very small screens */
@media (max-width: 480px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }
    .nav-item {
        flex: 1 1 100%;
    }
}
`;

function replaceCSS(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceCSS(fullPath);
        } else if (file.endsWith('.css')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            const marker = '/* --- MOBILE RESPONSIVENESS INJECTED --- */';
            const index = content.indexOf(marker);
            
            if (index !== -1) {
                // Replace everything from the marker onwards
                content = content.substring(0, index) + newMobileCSS;
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated mobile CSS in:', fullPath);
            }
        }
    }
}

replaceCSS(baseDir);
console.log('Mobile CSS update completed.');
