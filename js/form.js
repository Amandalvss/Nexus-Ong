import { Validator } from "./validator.js";

/**
 * FORMULÁRIO ACESSÍVEL - WCAG 2.1 AA
 * Implementação completa de formulário acessível com validação
 */
export function initForm() {
    const form = document.getElementById("form-cadastro");
    const msg = document.getElementById("form-mensagem");

    if (!form) {
        console.warn('Formulário de cadastro não encontrado');
        return;
    }

    // Configurar atributos ARIA no formulário
    form.setAttribute('novalidate', 'true'); // Desativar validação nativa para controle customizado
    form.setAttribute('aria-label', 'Formulário de cadastro');

    /**
     * VALIDAÇÃO EM TEMPO REAL COM FEEDBACK ACESSÍVEL
     */
    function setupRealTimeValidation() {
        const fields = form.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            // Configurar atributos ARIA iniciais
            if (!field.id) {
                field.id = `field-${field.name}-${Math.random().toString(36).substr(2, 9)}`;
            }
            
            field.setAttribute('aria-invalid', 'false');
            
            // Validação on blur
            field.addEventListener('blur', () => {
                validateField(field);
            });
            
            // Limpar erro on input
            field.addEventListener('input', () => {
                if (field.getAttribute('aria-invalid') === 'true') {
                    clearFieldError(field);
                }
            });
            
            // Navegação por teclado
            field.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    field.blur();
                }
            });
        });
    }

    // Small confetti effect (DOM-based, no external libs)
    function createConfetti(root = document.body, count = 16) {
        const colors = ['#FF77A9','#FFC1E3','#FFD1F0','#FFA3DD','#FFB7D9','#FFD8E9'];
        const pieces = [];
        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.className = 'confetti-piece';
            el.style.left = (50 + (Math.random() - 0.5) * 40) + 'vw';
            el.style.top = (-10 - Math.random() * 10) + 'vh';
            el.style.background = colors[Math.floor(Math.random() * colors.length)];
            el.style.transform = `translateY(-10vh) rotate(${Math.random()*360}deg)`;
            root.appendChild(el);
            pieces.push(el);
            // remove after animation
            setTimeout(() => el.remove(), 1200);
        }
    }

    /**
     * VALIDAÇÃO INDIVIDUAL DE CAMPO
     */
    function validateField(field) {
        const isValid = Validator.validateField ? Validator.validateField(field) : field.checkValidity();
        
        if (!isValid) {
            showFieldError(field, getFieldErrorMessage(field));
        } else {
            clearFieldError(field);
        }
        
        return isValid;
    }

    /**
     * MENSAGEM DE ERRO ACESSÍVEL
     */
    function showFieldError(field, message) {
        // Remover erro anterior
        clearFieldError(field);
        
        // Configurar campo como inválido
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', `error-${field.id}`);
        
        // Criar elemento de erro
        const errorElement = document.createElement('div');
        errorElement.id = `error-${field.id}`;
        errorElement.className = 'field-error';
        errorElement.setAttribute('role', 'alert');
        errorElement.setAttribute('aria-live', 'polite');
        errorElement.textContent = message;
        
        // Inserir após o campo
        field.parentNode.appendChild(errorElement);
        
        // Adicionar classe de erro visual
        field.classList.add('error');
    }

    function clearFieldError(field) {
        field.setAttribute('aria-invalid', 'false');
        field.removeAttribute('aria-describedby');
        field.classList.remove('error');
        
        const existingError = document.getElementById(`error-${field.id}`);
        if (existingError) {
            existingError.remove();
        }
    }

    function getFieldErrorMessage(field) {
        if (field.validity) {
            if (field.validity.valueMissing) return 'Este campo é obrigatório';
            if (field.validity.typeMismatch) return 'Formato inválido';
            if (field.validity.patternMismatch) return field.title || 'Formato inválido';
            if (field.validity.tooShort) return `Mínimo ${field.minLength} caracteres`;
            if (field.validity.tooLong) return `Máximo ${field.maxLength} caracteres`;
        }
        return 'Campo inválido';
    }

    /**
     * VALIDAÇÃO COMPLETA DO FORMULÁRIO
     */
    function validateCompleteForm() {
        const fields = form.querySelectorAll('input, select, textarea');
        let isValid = true;
        let firstInvalidField = null;
        
        // Run shared validator (additional rules) if available
        if (Validator && typeof Validator.validateForm === 'function') {
            const vOk = Validator.validateForm(form);
            if (!vOk) {
                // Mark fields that validator flagged (it adds .invalid)
                form.querySelectorAll('.invalid').forEach(f => {
                    showFieldError(f, getFieldErrorMessage(f));
                    if (!firstInvalidField) firstInvalidField = f;
                    isValid = false;
                });
            }
        }

        // Validar todos os campos nativos
        fields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
            }
        });
        
        // Focar no primeiro campo inválido
        if (!isValid && firstInvalidField) {
            firstInvalidField.focus();
            announceToScreenReader('Formulário contém erros. Primeiro campo inválido focado.');
        }
        
        return isValid;
    }

    /**
     * FEEDBACK PARA SCREEN READERS
     */
    function announceToScreenReader(message) {
        let liveRegion = document.getElementById('form-live-region');
        
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'form-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            document.body.appendChild(liveRegion);
        }
        
        liveRegion.textContent = message;
    }

    /**
     * SUBMISSÃO DO FORMULÁRIO
     */
    function handleSubmit(e) {
        e.preventDefault();
        
        // Limpar mensagens anteriores
        msg.innerHTML = '';
        msg.setAttribute('aria-live', 'off');
        
        // Validar formulário
        if (!validateCompleteForm()) {
            msg.innerHTML = `
                <div class="validation-error" role="alert" tabindex="-1">
                    <span class="error-icon" aria-hidden="true">⚠️</span>
                    Corrija os campos destacados antes de enviar.
                </div>
            `;
            msg.setAttribute('aria-live', 'assertive');
            
            // Focar na mensagem de erro
            const errorMsg = msg.querySelector('.validation-error');
            if (errorMsg) {
                setTimeout(() => errorMsg.focus(), 100);
            }
            
            announceToScreenReader('Erro no formulário. Verifique os campos destacados.');
            return;
        }

        // Coletar dados
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        try {
            // Salvar no localStorage
            Validator.saveToLocalStorage("nexus_registros", data);
            
            // Mensagem de sucesso acessível
            msg.innerHTML = `
                <div class="success" role="status" tabindex="-1">
                    <span class="success-icon" aria-hidden="true">✅</span>
                    Cadastro enviado com sucesso!
                </div>
            `;
            msg.setAttribute('aria-live', 'polite');
            
            // Focar na mensagem de sucesso
            const successMsg = msg.querySelector('.success');
            if (successMsg) {
                setTimeout(() => successMsg.focus(), 100);
            }
            
            // Anunciar para screen readers
            announceToScreenReader('Cadastro enviado com sucesso! Formulário será reiniciado.');
            // small confetti celebration
            try { createConfetti(document.body, 18); } catch (e) { /* non-fatal */ }
            
            // Reiniciar formulário
            setTimeout(() => {
                form.reset();
                clearAllFieldErrors();
                
                // Focar no primeiro campo
                const firstField = form.querySelector('input, select, textarea');
                if (firstField) {
                    firstField.focus();
                }
            }, 1500);
            
        } catch (error) {
            // Tratamento de erro
            msg.innerHTML = `
                <div class="error" role="alert" tabindex="-1">
                    <span class="error-icon" aria-hidden="true">❌</span>
                    Erro ao salvar cadastro. Tente novamente.
                </div>
            `;
            msg.setAttribute('aria-live', 'assertive');
            
            console.error('Erro ao salvar formulário:', error);
            announceToScreenReader('Erro ao enviar formulário. Tente novamente.');
        }
    }

    function clearAllFieldErrors() {
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            clearFieldError(field);
        });
    }

    /**
     * NAVEGAÇÃO POR TECLADO NO FORMULÁRIO
     */
    function setupKeyboardNavigation() {
        form.addEventListener('keydown', (e) => {
            // Atalhos globais do formulário
            switch (e.key) {
                case 'Escape':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        form.reset();
                        clearAllFieldErrors();
                        announceToScreenReader('Formulário limpo');
                    }
                    break;
                    
                case 'Enter':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        form.dispatchEvent(new Event('submit'));
                    }
                    break;
            }
        });
    }

    // INICIALIZAÇÃO
    setupRealTimeValidation();
    setupKeyboardNavigation();
    
    form.addEventListener('submit', handleSubmit);
    
    console.log('✅ Formulário acessível inicializado');
}

// Export para testes
export default {
    initForm
};