import { showError, showSuccess, removeMessages } from './common.js';
import './common.js';

// Login form handling
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm') as HTMLFormElement;
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e: Event) => {
            e.preventDefault();
            
            const email = (document.getElementById('email') as HTMLInputElement).value;
            const password = (document.getElementById('password') as HTMLInputElement).value;
            const submitButton = loginForm.querySelector('button[type="submit"]') as HTMLButtonElement;
            
            // Remove existing error/success messages
            removeMessages('loginForm');
            
            // Set loading state
            submitButton.disabled = true;
            submitButton.textContent = 'Entrando...';
            
            try {
                // Try admin login
                let response = await fetch('/api/auth/admin/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, senha: password }),
                });

                const data = await response.json();

                if (!response.ok) {
                    showError('loginForm', data.error || 'Erro ao fazer login');
                    submitButton.disabled = false;
                    submitButton.textContent = 'Entrar';
                    return;
                }

                // Store user data and token
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({
                    id: data.userId,
                    type: data.userType,
                    nome: data.nome,
                    email: data.email,
                    profileImage: data.profileImage,
                    theme: data.theme
                }));

                // Apply theme if available
                if (data.theme) {
                    document.documentElement.setAttribute('data-theme', data.theme);
                    localStorage.setItem('theme', data.theme);
                }

                showSuccess('loginForm', 'Login realizado com sucesso!');

                // Redirect to admin dashboard
                setTimeout(() => {
                    window.location.href = '/admin-dashboard';
                }, 1000);
                
            } catch (error) {
                showError('loginForm', 'Erro de conexão com o servidor');
                console.error('Login error:', error);
                submitButton.disabled = false;
                submitButton.textContent = 'Entrar';
            }
        });
    }
});
