import { Templates } from "./spa.js";

/**
 * ROTEADOR SPA ACESSÍVEL - WCAG 2.1 AA
 * Navegação por single-page application com acessibilidade completa
 */

// Estado global do router para gerenciamento de foco
let currentPage = '';
let previousPage = '';

/**
 * ROTEADOR PRINCIPAL
 * Gerencia navegação entre páginas com acessibilidade
 */
function router() {
    // Normalizar hash para nome da página (sem #)
    const rawHash = location.hash || "#inicio";
    const pageName = rawHash.startsWith('#') ? rawHash.slice(1) : rawHash;
    
    // Salvar página anterior para gerenciamento de foco
    previousPage = currentPage;
    currentPage = pageName || 'inicio';
    
    try {
        // Renderizar template
        Templates.render(currentPage);
        
        // Atualizar título da página para acessibilidade
        updatePageTitle(currentPage);
        
        // Gerenciar foco após navegação
        manageFocusAfterNavigation();
        
        // Anunciar navegação para screen readers
        announceNavigation(currentPage);
        
    } catch (error) {
        // Fallback em caso de erro
        console.error('Erro ao renderizar template:', error);
        handleRouterError(error);
    }
    
    // Atualizar navegação ativa
    setActiveNav();
}

/**
 * ATUALIZAR TÍTULO DA PÁGINA
 * Para screen readers e usabilidade
 */
function updatePageTitle(pageName) {
    const pageTitles = {
        'inicio': 'Página Inicial - Nexus Ong',
        'projetos': 'Nossos Projetos - Nexus Ong', 
        'cadastro': 'Formulário de Cadastro - Nexus Ong',
        'sobre': 'Sobre Nós - Nexus Ong'
    };
    
    const title = pageTitles[pageName] || 'Nexus Ong';
    document.title = title;
    
    // Atualizar role e label do main content
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.setAttribute('aria-label', title);
    }
}

/**
 * GERENCIAMENTO DE FOCO APÓS NAVEGAÇÃO
 * WCAG 2.4.3 - Focus Order
 */
function manageFocusAfterNavigation() {
    setTimeout(() => {
        const mainContent = document.querySelector('main');
        const pageTitle = document.querySelector('h1, h2, [role="heading"]');
        const skipLink = document.querySelector('.skip-link');
        
        // Prioridade de foco:
        if (skipLink && previousPage !== currentPage) {
            // Nova página - oferecer skip link
            skipLink.focus();
        } else if (pageTitle) {
            // Focar no título principal da página
            pageTitle.setAttribute('tabindex', '-1');
            pageTitle.focus();
            setTimeout(() => pageTitle.removeAttribute('tabindex'), 1000);
        } else if (mainContent) {
            // Focar no conteúdo principal como fallback
            mainContent.setAttribute('tabindex', '-1');
            mainContent.focus();
            setTimeout(() => mainContent.removeAttribute('tabindex'), 1000);
        }
    }, 100);
}

/**
 * ANUNCIAR NAVEGAÇÃO PARA SCREEN READERS
 */
function announceNavigation(pageName) {
    const pageAnnouncements = {
        'inicio': 'Navegado para página inicial',
        'projetos': 'Navegado para página de projetos', 
        'cadastro': 'Navegado para formulário de cadastro',
        'sobre': 'Navegado para página sobre nós'
    };
    
    const announcement = pageAnnouncements[pageName] || 'Nova página carregada';
    announceToScreenReader(announcement);
}

/**
 * UTILITÁRIO DE ANÚNCIO PARA SCREEN READERS
 */
function announceToScreenReader(message) {
    let liveRegion = document.getElementById('router-live-region');
    
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'router-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
    }
    
    liveRegion.textContent = message;
}

/**
 * TRATAMENTO DE ERRO DO ROTEADOR
 */
function handleRouterError(error) {
    // Fallback: renderizar página inicial
    Templates.render('inicio');
    location.hash = '#inicio';
    
    // Anunciar erro para screen readers
    announceToScreenReader('Erro ao carregar página. Redirecionando para página inicial.');
    
    // Log para desenvolvimento
    console.warn('Router error handled, fallback to inicio:', error);
}

/**
 * DESTACAR LINK DE NAVEGAÇÃO ATIVO
 * Feedback visual e semântico para navegação atual
 */
function setActiveNav() {
    const links = document.querySelectorAll('a[data-link]');
    const currentHash = location.hash || '#inicio';
    
    links.forEach(link => {
        const href = link.getAttribute('href') || '';
        
        // Normalizar para comparação (sempre com #)
        const normalizedHref = href.startsWith('#') ? href : '#' + href;
        const isActive = normalizedHref === currentHash;
        
        // Atualizar classes visuais
        if (isActive) {
            link.classList.add('menu-ativo');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('menu-ativo');
            link.removeAttribute('aria-current');
        }
        
        // Atualizar descrição para screen readers
        const linkText = link.textContent.trim();
        if (isActive) {
            link.setAttribute('aria-label', `${linkText} - Página atual`);
        } else {
            link.setAttribute('aria-label', `Navegar para ${linkText}`);
        }
    });
}

/**
 * MANIPULADOR DE CLIQUE EM LINKS - DELEGAÇÃO
 * Suporte completo a acessibilidade e diferentes tipos de navegação
 */
function handleLinkClick(e) {
    // Apenas clicks primários (botão esquerdo) sem teclas modificadoras
    if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    
    const link = e.target.closest('a[data-link]');
    if (!link) return;
    
    let href = (link.getAttribute('href') || '').trim();
    
    // Ignorar hrefs vazios
    if (!href) {
        e.preventDefault();
        return;
    }
    
    // Verificar se é link externo (URL absoluta ou começa com /)
    const isExternal = /^[a-zA-Z]+:\/\//.test(href) || href.startsWith('/');
    if (isExternal) return;
    
    e.preventDefault();
    
    // Garantir que href comece com #
    if (!href.startsWith('#')) href = '#' + href;
    
    // Navegação por teclado - anunciar ação
    if (e.detail === 0) { // Click gerado por teclado
        announceToScreenReader('Navegando...');
    }
    
    // Se já está na mesma hash, refresh do template
    if (location.hash === href) {
        router();
    } else {
        location.hash = href;
    }
}

/**
 * MANIPULADOR DE TECLADO PARA LINKS
 * Suporte a Enter e Espaço em links navegacionais
 */
function handleLinkKeydown(e) {
    const link = e.target.closest('a[data-link]');
    if (!link) return;
    
    // Suporte a Enter e Espaço (padrão de acessibilidade)
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        
        // Simular click para reutilizar a lógica existente
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        link.dispatchEvent(clickEvent);
    }
    
    // Atalhos de teclado para navegação rápida
    if (e.altKey) {
        switch (e.key) {
            case '1':
                e.preventDefault();
                navigateToPage('inicio');
                break;
            case '2':
                e.preventDefault();
                navigateToPage('projetos');
                break;
            case '3':
                e.preventDefault();
                navigateToPage('cadastro');
                break;
            case '0':
                e.preventDefault();
                document.querySelector('.skip-link')?.focus();
                break;
        }
    }
}

/**
 * NAVEGAÇÃO PROGRAMÁTICA
 * Para uso em outros módulos e atalhos de teclado
 */
function navigateToPage(pageName) {
    if (!pageName.startsWith('#')) {
        pageName = '#' + pageName;
    }
    
    location.hash = pageName;
    announceToScreenReader(`Navegando para ${pageName.replace('#', '')}`);
}

/**
 * INICIALIZAÇÃO DO ROTEADOR
 */
function initRouter() {
    try {
        // Configurar event listeners
        document.addEventListener('click', handleLinkClick);
        document.addEventListener('keydown', handleLinkKeydown);
        window.addEventListener('hashchange', router);
        window.addEventListener('load', router);
        
        // Inicialização no DOMContentLoaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                router();
                console.log('✅ Router SPA acessível inicializado');
            });
        } else {
            router();
            console.log('✅ Router SPA acessível inicializado');
        }
        
    } catch (error) {
        console.error('❌ Erro na inicialização do router:', error);
    }
}

// Inicializar router
initRouter();

// Export para uso em outros módulos
export default {
    router,
    navigateToPage,
    setActiveNav,
    getCurrentPage: () => currentPage
};