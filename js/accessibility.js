// accessibility.js - Módulo completo de acessibilidade WCAG 2.1 AA
// Atividade 4: Controle de versão, Acessibilidade, Otimização

/**
 * UTILITÁRIOS DE ACESSIBILIDADE
 * Lista de elementos focáveis para trap de foco
 */
const FOCUSABLE_SELECTORS = 'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

/**
 * GERENCIAMENTO DE TEMAS E PREFERÊNCIAS
 * Suporte a tema claro/escuro + alto contraste + preferências do sistema
 */
function applySavedTheme() {
    try {
        // Verificar preferência do sistema
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('nexus_theme');
        const savedContrast = localStorage.getItem('nexus_high_contrast');
        
        // Aplicar tema com fallback para preferência do sistema
        let theme = savedTheme;
        if (!savedTheme) {
            theme = systemPrefersDark ? 'dark' : 'light';
            localStorage.setItem('nexus_theme', theme);
        }
        
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        
        // Aplicar alto contraste
        const highContrast = savedContrast === 'true';
        document.body.classList.toggle('high-contrast', highContrast);
        
        // Atualizar estado dos botões
        updateButtonStates(theme === 'dark', highContrast);
        
        // Anunciar mudança para screen readers
        announceToScreenReader(`Tema ${theme === 'dark' ? 'escuro' : 'claro'} ${highContrast ? 'com alto contraste' : ''} aplicado`);
        
    } catch (error) {
        console.warn('Erro ao aplicar tema salvo:', error);
        // Fallback: manter tema claro
        document.documentElement.removeAttribute('data-theme');
        document.body.classList.remove('high-contrast');
    }
}

function updateButtonStates(isDark, isHighContrast) {
    const themeBtn = document.querySelector('[data-theme-toggle]');
    const contrastBtn = document.querySelector('[data-contrast-toggle]');
    
    if (themeBtn) {
        themeBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        themeBtn.setAttribute('aria-label', `Alternar para tema ${isDark ? 'claro' : 'escuro'}`);
    }
    
    if (contrastBtn) {
        contrastBtn.setAttribute('aria-pressed', isHighContrast ? 'true' : 'false');
        contrastBtn.setAttribute('aria-label', `Alternar ${isHighContrast ? 'desativar' : 'ativar'} alto contraste`);
    }
}

function toggleTheme() {
    const current = document.documentElement.hasAttribute('data-theme');
    
    if (current) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('nexus_theme', 'light');
        announceToScreenReader('Tema claro ativado');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('nexus_theme', 'dark');
        announceToScreenReader('Tema escuro ativado');
    }
    
    updateButtonStates(!current, document.body.classList.contains('high-contrast'));
}

function toggleHighContrast() {
    const enabled = !document.body.classList.contains('high-contrast');
    
    document.body.classList.toggle('high-contrast', enabled);
    localStorage.setItem('nexus_high_contrast', enabled ? 'true' : 'false');
    
    announceToScreenReader(`Alto contraste ${enabled ? 'ativado' : 'desativado'}`);
    updateButtonStates(document.documentElement.hasAttribute('data-theme'), enabled);
}

/**
 * TRAP DE FOCO EM MODAIS - WCAG 2.1
 * Implementação completa de foco restrito em modais
 */
function trapFocus(modalOverlay) {
    if (!modalOverlay) return;
    
    const modal = modalOverlay.querySelector('.modal');
    if (!modal) return;
    
    // Salvar elemento anteriormente focado
    const previouslyFocused = document.activeElement;
    
    // Encontrar elementos focáveis dentro do modal
    const focusableElements = Array.from(modal.querySelectorAll(FOCUSABLE_SELECTORS))
        .filter(el => {
            // Verificar se elemento é visível e não está disabled
            const style = window.getComputedStyle(el);
            return style.visibility !== 'hidden' && 
                   style.display !== 'none' && 
                   el.offsetWidth > 0 && 
                   el.offsetHeight > 0;
        });
    
    // Focar primeiro elemento ou o próprio modal
    const firstFocusable = focusableElements.length > 0 ? focusableElements[0] : modal;
    firstFocusable.focus();

    function handleKeydown(event) {
        switch (event.key) {
            case 'Escape':
                event.preventDefault();
                closeModal();
                break;
                
            case 'Tab':
                event.preventDefault();
                if (focusableElements.length === 0) return;
                
                const currentIndex = focusableElements.indexOf(document.activeElement);
                let nextIndex;
                
                if (event.shiftKey) {
                    // Shift + Tab: mover para trás
                    nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
                } else {
                    // Tab: mover para frente
                    nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
                }
                
                focusableElements[nextIndex].focus();
                break;
                
            case 'Enter':
            case ' ':
                // Permitir comportamento padrão em botões dentro do modal
                if (event.target.tagName === 'BUTTON' || event.target.tagName === 'A') {
                    return;
                }
                event.preventDefault();
                break;
        }
    }

    function closeModal() {
        // Restaurar acessibilidade do conteúdo principal
        document.querySelectorAll('header, main, footer, nav').forEach(el => {
            el.removeAttribute('aria-hidden');
        });
        
        // Remover listeners
        document.removeEventListener('keydown', handleKeydown);
        modalOverlay.removeEventListener('click', handleOverlayClick);
        
        // Restaurar foco anterior
        if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
            previouslyFocused.focus();
        }
        
        // Remover modal
        modalOverlay.remove();
        
        announceToScreenReader('Modal fechado');
    }

    function handleOverlayClick(event) {
        if (event.target === modalOverlay || event.target.closest('[data-close-modal]')) {
            closeModal();
        }
    }

    // Ocultar conteúdo principal para screen readers
    document.querySelectorAll('header, main, footer, nav').forEach(el => {
        el.setAttribute('aria-hidden', 'true');
    });

    // Adicionar listeners
    document.addEventListener('keydown', handleKeydown);
    modalOverlay.addEventListener('click', handleOverlayClick);
    
    // Focar modal para screen readers
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', modal.id || 'modal-title');
}

/**
 * OBSERVADOR DE MODAIS DINÂMICOS
 * Detecta modais adicionados dinamicamente ao DOM
 */
function observeModals() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && node.classList && node.classList.contains('modal-overlay')) {
                    setTimeout(() => trapFocus(node), 10);
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

/**
 * SKIP LINK - NAVEGAÇÃO POR TECLADO
 * Permite pular para conteúdo principal
 */
function enhanceSkipLink() {
    const skipLink = document.querySelector('.skip-link');
    if (!skipLink) return;
    
    skipLink.addEventListener('click', (event) => {
        event.preventDefault();
        
        const mainContent = document.getElementById('main-content') || 
                           document.querySelector('main') || 
                           document.querySelector('#spa-root');
        
        if (mainContent) {
            // Tornar focável temporariamente
            mainContent.setAttribute('tabindex', '-1');
            mainContent.focus();
            
            // Remover tabindex após o foco
            setTimeout(() => {
                mainContent.removeAttribute('tabindex');
            }, 1000);
            
            announceToScreenReader('Navegado para conteúdo principal');
        }
    });
}

/**
 * NAVEGAÇÃO POR TECLADO GLOBAL
 * Suporte completo a teclado em toda aplicação
 */
function initKeyboardNavigation() {
    document.addEventListener('keydown', (event) => {
        // Atalhos globais de acessibilidade
        switch (event.key) {
            case '1':
                if (event.altKey) {
                    event.preventDefault();
                    document.querySelector('.skip-link')?.focus();
                }
                break;
                
            case 'T':
                if (event.altKey && event.shiftKey) {
                    event.preventDefault();
                    toggleTheme();
                }
                break;
                
            case 'C':
                if (event.altKey && event.shiftKey) {
                    event.preventDefault();
                    toggleHighContrast();
                }
                break;
        }
    });
}

/**
 * FEEDBACK PARA SCREEN READERS
 * Anúncios para usuários de leitores de tela
 */
function announceToScreenReader(message) {
    let liveRegion = document.getElementById('a11y-live-region');
    
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'a11y-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
    }
    
    liveRegion.textContent = message;
    
    // Limpar após alguns segundos
    setTimeout(() => {
        liveRegion.textContent = '';
    }, 3000);
}

/**
 * INICIALIZAÇÃO DOS CONTROLES
 * Configura botões e controles de acessibilidade
 */
function initHeaderControls() {
    const themeBtn = document.querySelector('[data-theme-toggle]');
    const contrastBtn = document.querySelector('[data-contrast-toggle]');
    
    // Configurar botão de tema
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
        themeBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleTheme();
            }
        });
    }
    
    // Configurar botão de alto contraste
    if (contrastBtn) {
        contrastBtn.addEventListener('click', toggleHighContrast);
        contrastBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleHighContrast();
            }
        });
    }
    
    // Verificar suporte a preferências do sistema
    const colorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    colorSchemeMedia.addEventListener('change', (e) => {
        if (!localStorage.getItem('nexus_theme')) {
            applySavedTheme();
        }
    });
}

/**
 * INICIALIZAÇÃO COMPLETA DO MÓDULO
 */
function initAccessibility() {
    try {
        // Aplicar tema salvo ou preferência do sistema
        applySavedTheme();
        
        // Inicializar controles
        initHeaderControls();
        
        // Configurar observador de modais
        observeModals();
        
        // Melhorar skip link
        enhanceSkipLink();
        
        // Inicializar navegação por teclado
        initKeyboardNavigation();
        
        // Aplicar trap de foco em modais existentes
        document.querySelectorAll('.modal-overlay').forEach(trapFocus);
        
        console.log('✅ Módulo de acessibilidade inicializado com sucesso');
        
    } catch (error) {
        console.error('❌ Erro na inicialização do módulo de acessibilidade:', error);
    }
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAccessibility);
} else {
    initAccessibility();
}

// Export para testes e uso em outros módulos
export default {
    initAccessibility,
    applySavedTheme,
    toggleTheme,
    toggleHighContrast,
    trapFocus,
    announceToScreenReader
};