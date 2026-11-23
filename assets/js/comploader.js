function carregar(url, idDestino) {
    return fetch(url)
        .then(function (res) {
            if (!res.ok) throw new Error(url + " -> " + res.status);
            return res.text();
        })
        .then(function (html) {
            var el = document.getElementById(idDestino);
            if (el) el.innerHTML = html;
        })
        .catch(function (err) {
            console.error("Erro ao carregar componente:", err);
        });
}

// O loader vem primeiro, sozinho
carregar("/components/loader.html", "hitboxe-loader").then(function () {
    document.dispatchEvent(new Event("loaderReady"));
});

// O resto carrega em paralelo
Promise.all([
    carregar("/components/header.html", "header-placeholder"),
    carregar("/components/footer.html", "footer-placeholder"),
    carregar("/components/acesso.html", "authModal"),
    carregar("/components/acessibilidade.html", "acessibilidade-placeholder")
]).then(function () {
    document.dispatchEvent(new Event("componentsLoaded"));
});

// Rede de segurança: se algo falhar, o loader não prende o site
setTimeout(function () {
    var l = document.getElementById("hitboxe-loader");
    if (l) l.classList.add("loader-hidden");
}, 8000);


// fetch('/components/loader.html')
//   .then(res => res.text())
//   .then(html => {
//     document.getElementById('hitboxe-loader').innerHTML = html;
//   });

// fetch('/components/header.html')
//   .then(res => res.text())
//   .then(html => {
//     document.getElementById('header-placeholder').innerHTML = html;
//   });

// fetch('/components/footer.html')
//   .then(res => res.text())
//   .then(html => {
//     document.getElementById('footer-placeholder').innerHTML = html;
//   });

// fetch('/components/acesso.html')
//   .then(res => res.text())
//   .then(html => {
//     document.getElementById('authModal').innerHTML = html;
//   });

// fetch('/components/header.html').then(res => res.text()).then(html => { document.getElementById('navbar-placeholder').innerHTML = html; });
// fetch('footer.html').then(res => res.text()).then(html => { document.getElementById('navbar-placeholder').innerHTML = html; });