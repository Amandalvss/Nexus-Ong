/**
 * MENU HAMBURGUER ACESSÍVEL - WCAG 2.1 AA
 * Menu mobile com navegação por teclado, trap de foco e screen readers
 */

// Estado global do menu
let menuState = {
    isOpen: false,
    previousFocus: null,
    firstMenuItem: null,
    lastMenuItem: null
};

/**
 * INICIALIZAÇÃO DO MENU HAMBURGUER
 */
function initHamburgerMenu() {
    const hamburger = document.querySelector(".hamburger");
    const header = document.querySelector("header");
    const nav = document.querySelector('nav');
    const navList = document.querySelector('.nav-list');

    // Verificar elementos necessários
    if (!hamburger || !header || !nav || !navList) {
        console.warn('Elementos do menu hamburguer não encontrados');
        return;
    }

    // Configurar atributos ARIA iniciais
    setupAriaAttributes(hamburger, nav, navList);

    /**
     * CONFIGURAR ATRIBUTOS ARIA
     */
    function setupAriaAttributes(button, navigation, list) {
        // Botão hamburguer
        button.setAttribute('aria-haspopup', 'true');
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-controls', 'main-navigation');
        button.setAttribute('aria-label', 'Abrir menu de navegação');

        // Navegação
        navigation.id = 'main-navigation';
        navigation.setAttribute('aria-label', 'Navegação principal');
        
        // Lista de itens
        list.setAttribute('role', 'menubar');
        
        // Itens do menu
        const menuItems = list.querySelectorAll('a[data-link]');
        menuItems.forEach((item, index) => {
            item.setAttribute('role', 'menuitem');
            item.setAttribute('tabindex', '-1'); // Inicialmente não focável
        });

        // Salvar primeiro e último item para trap de foco
        menuState.firstMenuItem = menuItems[0];
        menuState.lastMenuItem = menuItems[menuItems.length - 1];
    }

    /**
     * ABRIR MENU
     */
    function openMenu() {
        header.classList.add("open");
        nav.style.display = 'block';
        
        // Atualizar estado
        menuState.isOpen = true;
        menuState.previousFocus = document.activeElement;
        
        // Atualizar ARIA
        hamburger.setAttribute('aria-expanded', 'true');
        hamburger.setAttribute('aria-label', 'Fechar menu de navegação');
        nav.setAttribute('aria-hidden', 'false');
        
        // Tornar itens do menu focáveis
        const menuItems = navList.querySelectorAll('a[data-link]');
        menuItems.forEach(item => {
            item.setAttribute('tabindex', '0');
        });
        
        // Trap de foco no menu
        setupFocusTrap();
        
        // Anunciar para screen readers
        announceToScreenReader('Menu de navegação aberto. Use Tab para navegar e Escape para fechar.');
        
        // Focar no primeiro item do menu
        setTimeout(() => {
            if (menuState.firstMenuItem) {
                menuState.firstMenuItem.focus();
            }
        }, 100);
    }

    /**
     * FECHAR MENU
     */
    function closeMenu() {
        header.classList.remove("open");
        nav.style.display = '';
        
        // Atualizar estado
        menuState.isOpen = false;
        
        // Atualizar ARIA
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Abrir menu de navegação');
        nav.setAttribute('aria-hidden', 'true');
        
        // Remover focabilidade dos itens do menu
        const menuItems = navList.querySelectorAll('a[data-link]');
        menuItems.forEach(item => {
            item.setAttribute('tabindex', '-1');
        });
        
        // Remover trap de foco
        removeFocusTrap();
        
        // Anunciar para screen readers
        announceToScreenReader('Menu de navegação fechado');
        
        // Restaurar foco anterior
        if (menuState.previousFocus && typeof menuState.previousFocus.focus === 'function') {
            menuState.previousFocus.focus();
        }
    }

    /**
     * TOGGLE DO MENU
     */
    function toggleMenu() {
        if (menuState.isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    /**
     * TRAP DE FOCO NO MENU ABERTO
     * Impede que o foco escape do menu quando aberto
     */
    function setupFocusTrap() {
        function handleKeydown(e) {
            if (!menuState.isOpen) return;

            const menuItems = Array.from(navList.querySelectorAll('a[data-link]'));
            const currentFocus = document.activeElement;
            const firstItem = menuItems[0];
            const lastItem = menuItems[menuItems.length - 1];

            switch (e.key) {
                case 'Escape':
                    e.preventDefault();
                    closeMenu();
                    break;

                case 'Tab':
                    if (e.shiftKey) {
                        // Shift + Tab: voltando
                        if (currentFocus === firstItem) {
                            e.preventDefault();
                            lastItem.focus();
                        }
                    } else {
                        // Tab: avançando
                        if (currentFocus === lastItem) {
                            e.preventDefault();
                            firstItem.focus();
                        }
                    }
                    break;

                case 'ArrowDown':
                case 'ArrowRight':
                    e.preventDefault();
                    navigateMenu(1); // Próximo item
                    break;

                case 'ArrowUp':
                case 'ArrowLeft':
                    e.preventDefault();
                    navigateMenu(-1); // Item anterior
                    break;

                case 'Home':
                    e.preventDefault();
                    firstItem.focus();
                    break;

                case 'End':
                    e.preventDefault();
                    lastItem.focus();
                    break;
            }
        }

        function navigateMenu(direction) {
            const menuItems = Array.from(navList.querySelectorAll('a[data-link]'));
            const currentIndex = menuItems.indexOf(document.activeElement);
            let nextIndex = currentIndex + direction;

            if (nextIndex >= menuItems.length) nextIndex = 0;
            if (nextIndex < 0) nextIndex = menuItems.length - 1;

            menuItems[nextIndex].focus();
        }

        // Adicionar listeners
        document.addEventListener('keydown', handleKeydown);
        navList.addEventListener('keydown', handleKeydown);
        
        // Salvar referência para remoção
        menuState.keydownHandler = handleKeydown;
    }

    function removeFocusTrap() {
        if (menuState.keydownHandler) {
            document.removeEventListener('keydown', menuState.keydownHandler);
            navList.removeEventListener('keydown', menuState.keydownHandler);
            menuState.keydownHandler = null;
        }
    }

    /**
     * FECHAR MENU AO CLICAR FORA
     */
    function setupOutsideClickHandler() {
        function handleClickOutside(e) {
            if (!menuState.isOpen) return;
            
            const isClickInsideMenu = nav.contains(e.target);
            const isClickOnHamburger = hamburger.contains(e.target);
            
            if (!isClickInsideMenu && !isClickOnHamburger) {
                closeMenu();
            }
        }

        document.addEventListener('click', handleClickOutside);
        menuState.outsideClickHandler = handleClickOutside;
    }

    function removeOutsideClickHandler() {
        if (menuState.outsideClickHandler) {
            document.removeEventListener('click', menuState.outsideClickHandler);
            menuState.outsideClickHandler = null;
        }
    }

    /**
     * ANÚNCIO PARA SCREEN READERS
     */
    function announceToScreenReader(message) {
        let liveRegion = document.getElementById('menu-live-region');
        
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'menu-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            document.body.appendChild(liveRegion);
        }
        
        liveRegion.textContent = message;
    }

    /**
     * EVENT LISTENERS
     */
    
    // Click no hamburguer
    hamburger.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    // Teclado no hamburguer
    hamburger.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                toggleMenu();
                break;
            case 'Escape':
                if (menuState.isOpen) {
                    e.preventDefault();
                    closeMenu();
                }
                break;
        }
    });

    // Fechar menu ao redimensionar para desktop
    function handleResize() {
        if (window.innerWidth > 768 && menuState.isOpen) {
            closeMenu();
        }
    }

    window.addEventListener('resize', handleResize);
    
    // Setup inicial
    setupOutsideClickHandler();

    console.log('✅ Menu hamburguer acessível inicializado');
}

/**
 * INICIALIZAÇÃO QUANDO DOM ESTIVER PRONTO
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHamburgerMenu);
} else {
    initHamburgerMenu();
}

// Export para testes
export default {
    initHamburgerMenu,
    getMenuState: () => menuState
};