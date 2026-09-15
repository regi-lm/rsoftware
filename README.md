# RSoftware Site

Site institucional estático da RSoftware, feito em HTML, CSS e JavaScript Vanilla.

## Recursos

- Preloader com a logo fornecida.
- Hero com vídeo local silencioso e responsivo.
- Header responsivo, menu acessível e anchors.
- Seções Sobre, Skills, Projetos, Processo, FAQ e Contato.
- Projetos data-driven em `js/projects.js`.
- Formulário com validação client-side e ponto de integração futuro.
- WhatsApp centralizado em `js/config.js`.
- SEO básico, Schema.org, `robots.txt` e `sitemap.xml`.

## Desenvolvimento Local

```bash
python -m http.server 4173
```

Abra `http://localhost:4173` no navegador. Também é possível servir a raiz do projeto com qualquer servidor estático.

## Configuração

Edite `js/config.js`:

- `canonicalUrl`: domínio final do site.
- `whatsappNumber`: número com DDI e DDD. Enquanto estiver vazio, os CTAs de WhatsApp não abrem link quebrado.
- `formEndpoint`: endpoint futuro para envio do formulário.
- `socialLinks`: redes sociais reais, quando existirem.

## Projetos

Os projetos ficam em `js/projects.js`. Substitua os placeholders por objetos reais com:

```js
{
  id: "identificador",
  title: "Nome do projeto",
  category: "Site",
  description: "Descrição real",
  image: "assets/images/projeto.jpg",
  technologies: ["HTML", "CSS", "JavaScript"],
  url: "https://exemplo.com",
  placeholder: false
}
```

## Imagens

A logo oficial está em `assets/images/rsoftware-logo.jpeg`. A imagem editorial da seção Sobre usa Unsplash por URL e pode ser substituída no HTML.

## Deploy

O site é estático. Publique o conteúdo da raiz do projeto na Vercel, Netlify, Cloudflare Pages ou outro host estático.
