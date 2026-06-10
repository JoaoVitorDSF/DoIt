import { showSuccess, showError } from './common.js';
import './common.js';

// Declare Chart and Cropper if not recognized by TS
declare const Chart: any;
declare const Cropper: any;

document.addEventListener('DOMContentLoaded', () => {
    // --- AUTHENTICATION ---
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
        window.location.href = '/admin-login';
        return;
    }

    const user = JSON.parse(userStr);
    if (user.type !== 'admin') {
        alert('Acesso negado. Apenas administradores.');
        window.location.href = '/login';
        return;
    }

    let selectedProfileImage: string | null = null;

    // --- UI ELEMENTS ---
    document.getElementById('userName')!.textContent = user.nome;
    document.getElementById('userEmail')!.textContent = user.email;

    async function loadAdminProfile() {
        try {
            const res = await fetch('/api/admin/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const profile = await res.json();
                document.getElementById('userName')!.textContent = profile.nome;
                document.getElementById('userEmail')!.textContent = profile.email;
                if (profile.profileImage) {
                    const img = document.getElementById('profileImage') as HTMLImageElement;
                    img.src = profile.profileImage;
                    img.style.display = 'block';
                    document.getElementById('defaultAvatar')!.style.display = 'none';
                    localStorage.setItem('profileImage', profile.profileImage);
                } else {
                    document.getElementById('profileImage')!.style.display = 'none';
                    document.getElementById('defaultAvatar')!.style.display = 'block';
                }
                if (profile.theme) {
                    document.documentElement.setAttribute('data-theme', profile.theme);
                    localStorage.setItem('theme', profile.theme);
                    (document.getElementById('theme') as HTMLSelectElement).value = profile.theme;
                }
            }
        } catch (error) {
            console.error('Error loading admin profile', error);
        }
    }

    loadAdminProfile();

    // Tabs
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            item.classList.add('active');
            const tabId = item.getAttribute('data-tab');
            document.getElementById(`tab-${tabId}`)!.classList.add('active');

            if (tabId === 'reports') loadReports();
            if (tabId === 'users') loadUsers();
            if (tabId === 'tasks') loadTasks();
        });
    });

    // --- SETTINGS MODAL ---
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsModal = document.getElementById('closeSettingsModal');
    const saveSettingsBtn = document.getElementById('saveSettings');

    settingsBtn?.addEventListener('click', () => {
        settingsModal?.classList.add('active');
        const profileImage = localStorage.getItem('profileImage');
        if (profileImage) {
            (document.getElementById('previewImg') as HTMLImageElement).src = profileImage;
            document.getElementById('profileImagePreview')!.style.display = 'block';
        }
    });

    closeSettingsModal?.addEventListener('click', () => {
        settingsModal?.classList.remove('active');
    });

    const selectProfileImageBtn = document.getElementById('selectProfileImageBtn');
    const profileImageUpload = document.getElementById('profileImageUpload') as HTMLInputElement;
    const removeProfileImageBtn = document.getElementById('removeProfileImageBtn');

    selectProfileImageBtn?.addEventListener('click', () => {
        profileImageUpload?.click();
    });

    let cropper: any = null;
    const cropperContainer = document.getElementById('cropperContainer');
    const cropperImage = document.getElementById('cropperImage') as HTMLImageElement;
    const confirmCropBtn = document.getElementById('confirmCropBtn');
    const cancelCropBtn = document.getElementById('cancelCropBtn');

    profileImageUpload?.addEventListener('change', (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                
                // Show cropper container
                if (cropperContainer && cropperImage) {
                    cropperImage.src = base64;
                    cropperContainer.style.display = 'block';
                    document.getElementById('profileImagePreview')!.style.display = 'none';
                    
                    if (cropper) {
                        cropper.destroy();
                    }
                    
                    cropper = new Cropper(cropperImage, {
                        aspectRatio: 1,
                        viewMode: 1,
                    });
                }
            };
            reader.readAsDataURL(file);
        }
    });

    confirmCropBtn?.addEventListener('click', () => {
        if (cropper) {
            const canvas = cropper.getCroppedCanvas({
                width: 200,
                height: 200
            });
            selectedProfileImage = canvas.toDataURL('image/jpeg');
            
            (document.getElementById('previewImg') as HTMLImageElement).src = selectedProfileImage!;
            document.getElementById('profileImagePreview')!.style.display = 'block';
            cropperContainer!.style.display = 'none';
            
            cropper.destroy();
            cropper = null;
        }
    });

    cancelCropBtn?.addEventListener('click', () => {
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        cropperContainer!.style.display = 'none';
        profileImageUpload.value = '';
    });

    removeProfileImageBtn?.addEventListener('click', () => {
        selectedProfileImage = "";
        document.getElementById('profileImagePreview')!.style.display = 'none';
        profileImageUpload.value = "";
    });

    saveSettingsBtn?.addEventListener('click', async () => {
        const theme = (document.getElementById('theme') as HTMLSelectElement).value;
        const body: any = { theme };
        if (selectedProfileImage !== null) {
            body.profileImage = selectedProfileImage;
        }

        try {
            const res = await fetch('/api/admin/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                alert('Configurações salvas!');
                settingsModal?.classList.remove('active');
                loadAdminProfile();
            } else {
                alert('Erro ao salvar configurações');
            }
        } catch (error) {
            alert('Erro ao salvar configurações');
        }
    });

    // --- LOGOUT ---
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/admin-login';
    });

    // --- TAB: REPORTS ---
    async function loadReports() {
        try {
            const res = await fetch('/api/admin/statistics/dashboard', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            document.getElementById('stat-total-users')!.textContent = data.totalUsers;
            document.getElementById('stat-total-tasks')!.textContent = data.totalTasks;
            document.getElementById('stat-completed-tasks')!.textContent = data.completedTasks;
            document.getElementById('stat-completion-rate')!.textContent = data.completionRate;

            const tbody = document.getElementById('activeUsersTableBody')!;
            tbody.innerHTML = '';
            data.activeUsers.forEach((u: any) => {
                tbody.innerHTML += `<tr><td>${u.nome}</td><td>${u.taskCount}</td></tr>`;
            });

            loadCharts();
        } catch (error) {
            console.error('Error loading reports', error);
        }
    }

    let dailyChart: any = null;
    async function loadCharts() {
        try {
            const res = await fetch('/api/admin/statistics/charts', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            document.getElementById('stat-blocked-content')!.textContent = data.blockedContentTotal;

            const ctx = document.getElementById('dailyChart') as HTMLCanvasElement;
            if (dailyChart) dailyChart.destroy();

            dailyChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.dailyStats.map((d: any) => new Date(d.date).toLocaleDateString()),
                    datasets: [{
                        label: 'Tarefas Criadas',
                        data: data.dailyStats.map((d: any) => d.count),
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                }
            });
        } catch (error) {
            console.error('Error loading charts', error);
        }
    }

    // --- TAB: USERS ---
    let allUsers: any[] = [];
    async function loadUsers() {
        try {
            const res = await fetch('/api/admin/clients', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            allUsers = await res.json();
            renderUsersTable(allUsers);
        } catch (error) {
            console.error('Error loading users', error);
        }
    }

    function renderUsersTable(users: any[]) {
        const tbody = document.getElementById('usersTableBody')!;
        tbody.innerHTML = '';
        users.forEach(u => {
            const isBlocked = u.isBlocked ? '<span style="color:red">Bloqueado</span>' : '<span style="color:green">Ativo</span>';
            const lastLogin = u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Nunca';
            const created = new Date(u.createdAt).toLocaleDateString();

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${u.nome} ${u.sobrenome}</td>
                <td>${u.email}</td>
                <td>${created}</td>
                <td>${lastLogin}</td>
                <td>${isBlocked}</td>
                <td>
                    <button class="action-btn warning" onclick="window.toggleUserBlock(${u.id})">${u.isBlocked ? 'Desbloquear' : 'Bloquear'}</button>
                    <button class="action-btn warning" onclick="window.resetUserPassword(${u.id})">Reset Senha</button>
                    <button class="action-btn" onclick="window.promoteUser(${u.id})">Promover a Admin</button>
                    <button class="action-btn danger" onclick="window.deleteUser(${u.id})">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.getElementById('userSearch')?.addEventListener('input', (e) => {
        const val = (e.target as HTMLInputElement).value.toLowerCase();
        const filtered = allUsers.filter(u => `${u.nome} ${u.sobrenome} ${u.email}`.toLowerCase().includes(val));
        renderUsersTable(filtered);
    });

    (window as any).toggleUserBlock = async (id: number) => {
        if (!confirm('Tem certeza que deseja alterar o status deste usuário?')) return;
        await fetch(`/api/admin/clients/${id}/block`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }});
        loadUsers();
    };

    (window as any).resetUserPassword = async (id: number) => {
        if (!confirm('Isso mudará a senha do usuário para "Mudar@123". Confirmar?')) return;
        await fetch(`/api/admin/clients/${id}/reset-password`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }});
        alert('Senha resetada.');
    };

    (window as any).promoteUser = async (id: number) => {
        if (!confirm('Promover este usuário a Admin? Esta ação moverá os dados de tabela.')) return;
        await fetch(`/api/admin/clients/${id}/promote`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }});
        loadUsers();
    };

    (window as any).deleteUser = async (id: number) => {
        if (!confirm('Excluir este usuário permanentemente?')) return;
        await fetch(`/api/admin/clients/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
        loadUsers();
    };

    // --- TAB: TASKS ---
    let allTasks: any[] = [];
    async function loadTasks() {
        try {
            const res = await fetch('/api/admin/todos', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            allTasks = await res.json();
            filterAndRenderTasks();
        } catch (error) {
            console.error('Error loading tasks', error);
        }
    }

    function filterAndRenderTasks() {
        const filterVal = (document.getElementById('taskFilter') as HTMLSelectElement).value;
        let filtered = allTasks;

        if (filterVal === 'deleted') filtered = allTasks.filter(t => t.isDeleted);
        else if (filterVal === 'flagged') filtered = allTasks.filter(t => t.isFlagged && !t.isDeleted);
        else filtered = allTasks.filter(t => !t.isDeleted);

        const tbody = document.getElementById('adminTasksTableBody')!;
        tbody.innerHTML = '';

        filtered.forEach(t => {
            const owner = t.client ? `${t.client.nome} (Cliente)` : (t.admin ? `${t.admin.nome} (Admin)` : 'Sem Dono');
            let actions = '';

            if (t.isDeleted) {
                actions = `<button class="action-btn" onclick="window.restoreTask(${t.id})">Restaurar</button>`;
            } else {
                actions = `
                    <button class="action-btn danger" onclick="window.softDeleteTask(${t.id})">Apagar</button>
                    <button class="action-btn warning" onclick="window.flagTask(${t.id})">${t.isFlagged ? 'Desmarcar (+18)' : 'Marcar Inadequada'}</button>
                `;
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${owner}</td>
                <td>${t.titulo}</td>
                <td>${t.status}</td>
                <td>${t.tipo}</td>
                <td>${new Date(t.createdAt).toLocaleDateString()}</td>
                <td>${actions}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.getElementById('taskFilter')?.addEventListener('change', filterAndRenderTasks);

    (window as any).softDeleteTask = async (id: number) => {
        if (!confirm('Mover tarefa para a lixeira?')) return;
        await fetch(`/api/admin/todos/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
        loadTasks();
    };

    (window as any).restoreTask = async (id: number) => {
        await fetch(`/api/admin/todos/${id}/restore`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }});
        loadTasks();
    };

    (window as any).flagTask = async (id: number) => {
        await fetch(`/api/admin/todos/${id}/flag`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }});
        loadTasks();
    };

    // Initial Load
    loadReports();
});
