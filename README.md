# Portfólio LA - Luis Andrade

Portfólio de arquitetura e urbanismo: https://portifoliola.netlify.app

## Estrutura

```
index.html           a página (textos, projetos, contato)
css/tailwind.css     estilos gerados pelo Tailwind (não editar à mão)
css/tailwind.src.css ponto de partida do Tailwind
tailwind.config.js   configuração do Tailwind
imagens/             imagens dos projetos, logo e capa da dissertação
cv/                  CV, portfólio, dissertação e cadernos em PDF
admin/               painel do Decap CMS
```

## Estilos (Tailwind)

O site usa classes do Tailwind no `index.html`. O CSS final está em `css/tailwind.css`.
Depois de acrescentar ou mudar classes no `index.html`, gerar de novo o CSS:

```
npx tailwindcss@3 -i css/tailwind.src.css -o css/tailwind.css --minify
```

Se só mudar textos, não é preciso.

## Publicação

Netlify, ligado a este repositório: cada push para `main` publica a nova versão.
