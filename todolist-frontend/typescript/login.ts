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
                // Try client login first
                let response = await fetch('http://localhost:3000/api/auth/client/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, senha: password }),
                });
                
                let data = await response.json();
                
                if (!response.ok) {
                    // If client login fails, try admin login
                    response = await fetch('http://localhost:3000/api/auth/admin/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email, senha: password }),
                    });
                    
                    data = await response.json();
                    
                    if (!response.ok) {
                        showError('loginForm', data.error || 'Erro ao fazer login');
                        submitButton.disabled = false;
                        submitButton.textContent = 'Entrar';
                        return;
                    }
                }
                
                // Store token and user info
                localStorage.setItem('token', data.token);
                localStorage.setItem('userType', data.userType);
                localStorage.setItem('userId', data.userId.toString());
                localStorage.setItem('userName', data.nome || '');
                localStorage.setItem('userEmail', data.email || '');
                localStorage.setItem('profileImage', data.profileImage || '');
                localStorage.setItem('theme', data.theme || 'light');
                
                showSuccess('loginForm', 'Login realizado com sucesso!');
                
                // Redirect based on user type
                setTimeout(() => {
                    if (data.userType === 'admin') {
                        window.location.href = '/admin-dashboard';
                    } else {
                        window.location.href = '/dashboard';
                    }
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
