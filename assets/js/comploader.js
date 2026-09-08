// Conta quantas pastas de profundidade a página atual está
const profundidade = window.location.pathname.split('/').length - 2;
const prefixo = '../'.repeat(Math.max(0, profundidade));

fetch(prefixo + 'components/header.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('header-placeholder').innerHTML = html;
  });

fetch(prefixo + 'components/footer.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('footer-placeholder').innerHTML = html;
  });

// fetch('/components/header.html').then(res => res.text()).then(html => { document.getElementById('navbar-placeholder').innerHTML = html; });
// fetch('footer.html').then(res => res.text()).then(html => { document.getElementById('navbar-placeholder').innerHTML = html; });