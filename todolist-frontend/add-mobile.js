const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'html');

const mobileCSS = `
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
        justify-content: space-between;
    }
    
    .nav-item {
        flex: 1 1 calc(50% - 10px);
        justify-content: center;
        padding: 10px;
        font-size: 14px;
    }
    
    /* Hide some text if too tight, or keep it */
    .sidebar-header {
        margin-bottom: 15px;
        text-align: center;
    }
    
    .sidebar-footer {
        padding-top: 15px;
        flex-direction: row;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .user-info {
        margin-bottom: 0;
    }
    
    .sidebar-footer .logout-btn {
        width: auto;
        padding: 8px 15px;
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
        display: flex !important; /* Override if it was hidden in index */
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

function injectCSS(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            injectCSS(fullPath);
        } else if (file.endsWith('.css')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            // Prevent multiple injections
            if (!content.includes('/* --- MOBILE RESPONSIVENESS INJECTED --- */')) {
                fs.writeFileSync(fullPath, content + '\n' + mobileCSS, 'utf8');
                console.log('Injected mobile CSS into:', fullPath);
            } else {
                console.log('Skipping (already injected):', fullPath);
            }
        }
    }
}

injectCSS(baseDir);
console.log('Mobile CSS injection completed.');
