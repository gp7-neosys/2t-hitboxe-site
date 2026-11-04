fetch('/components/header.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('header-placeholder').innerHTML = html;
  });

fetch('/components/footer.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('footer-placeholder').innerHTML = html;
  });

// fetch('/components/header.html').then(res => res.text()).then(html => { document.getElementById('navbar-placeholder').innerHTML = html; });
// fetch('footer.html').then(res => res.text()).then(html => { document.getElementById('navbar-placeholder').innerHTML = html; });