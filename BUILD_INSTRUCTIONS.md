Build and production instructions

1) Instalar dependências (Node.js + npm)

```cmd
npm install
```

2) Gerar assets para produção

```cmd
npm run build
```

Isso irá limpar `dist/` e gerar:
- `dist/css/style.min.css`
- `dist/js/bundle.js`
- `dist/index.html` (minified)
- `dist/img/*.webp` e `dist/img/*.avif` (se houver imagens em `img/`)

3) Verificar acessibilidade

- Rode Lighthouse no Chrome (Panel > Lighthouse) ou use axe DevTools.
