import { showError, showSuccess, removeMessages } from './common.js';
import './common.js';

// Registration form handling
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm') as HTMLFormElement;
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e: Event) => {
            e.preventDefault();
            
            const firstName = (document.getElementById('firstName') as HTMLInputElement).value;
            const lastName = (document.getElementById('lastName') as HTMLInputElement).value;
            const celular = (document.getElementById('celular') as HTMLInputElement).value;
            const email = (document.getElementById('email') as HTMLInputElement).value;
            const password = (document.getElementById('password') as HTMLInputElement).value;
            const submitButton = registerForm.querySelector('button[type="submit"]') as HTMLButtonElement;

            // Remove existing error/success messages
            removeMessages('registerForm');

            // Validation
            if (password.length < 6) {
                showError('registerForm', 'A senha deve ter pelo menos 6 caracteres');
                return;
            }
            
            // Set loading state
            submitButton.disabled = true;
            submitButton.textContent = 'Cadastrando...';
            
            try {
                const response = await fetch('http://localhost:3000/api/auth/admin/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nome: firstName,
                        sobrenome: lastName,
                        senha: password,
                        email,
                        celular
                    }),
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    showError('registerForm', data.error || 'Erro ao fazer cadastro');
                    submitButton.disabled = false;
                    submitButton.textContent = 'Cadastrar';
                    return;
                }
                
                showSuccess('registerForm', 'Cadastro realizado com sucesso!');

                // Redirect to admin login after 2 seconds
                setTimeout(() => {
                    window.location.href = '/admin-login';
                }, 2000);
                
            } catch (error) {
                showError('registerForm', 'Erro de conexão com o servidor');
                console.error('Registration error:', error);
                submitButton.disabled = false;
                submitButton.textContent = 'Cadastrar';
            }
        });
    }
});
