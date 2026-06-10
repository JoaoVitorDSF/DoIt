// Common utility functions

// Toggle password visibility
function togglePassword(inputId: string): void {
    const input = document.getElementById(inputId) as HTMLInputElement;
    const button = input.nextElementSibling as HTMLButtonElement;
    const eyeIcon = button.querySelector('.eye-icon') as SVGElement;
    
    if (input.type === 'password') {
        input.type = 'text';
        // Change to eye-off icon
        eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
    } else {
        input.type = 'password';
        // Change to eye icon
        eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    }
}

// Add event listeners for toggle password buttons
document.addEventListener('DOMContentLoaded', () => {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const inputId = button.getAttribute('data-password-input');
            if (inputId) {
                togglePassword(inputId);
            }
        });
    });
});

// Common message handling functions
export function showError(formId: string, message: string): void {
    const form = document.getElementById(formId) as HTMLFormElement;
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    form.insertBefore(errorDiv, form.firstChild);
}

export function showSuccess(formId: string, message: string): void {
    const form = document.getElementById(formId) as HTMLFormElement;
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    form.insertBefore(successDiv, form.firstChild);
}

export function removeMessages(formId: string): void {
    const form = document.getElementById(formId) as HTMLFormElement;
    const errorMessages = form.querySelectorAll('.error-message');
    const successMessages = form.querySelectorAll('.success-message');
    
    errorMessages.forEach(msg => msg.remove());
    successMessages.forEach(msg => msg.remove());
}
