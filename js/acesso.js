(function () {
    "use strict";

    const USERS_KEY = "hitboxUsuarios";
    const SESSION_KEY = "hitboxSessao";

    const PLANOS = {
        "Plano Round": 99.90,
        "Plano Nocaute": 149.90,
        "Plano Campeão": 199.90
    };

    let pixConfirmado = false;
    let pixTimer = null;

    function getUsers() {
        try {
            const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
            return Array.isArray(users) ? users : [];
        } catch (e) {
            return [];
        }
    }

    function setUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function setMessage(id, text, type) {
        const element = document.getElementById(id);

        if (!element) {
            return;
        }

        element.textContent = text;
        element.className = "auth-message show " + type;
    }

    function clearMessages() {
        document.querySelectorAll(".auth-message").forEach(function (element) {
            element.textContent = "";
            element.className = "auth-message";
        });

        document.querySelectorAll(".auth-field input, .auth-field select").forEach(function (element) {
            element.classList.remove("valid", "invalid");
        });
    }

    function openModal(tab) {
        const modal = document.getElementById("authModal");

        if (!modal) {
            return;
        }

        modal.classList.add("show");
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";

        if (tab === "cadastro") {
            showCadastro();
        } else {
            showLogin();
        }
    }

    function closeModal() {
        const modal = document.getElementById("authModal");

        if (!modal) {
            return;
        }

        modal.classList.remove("show");
        modal.classList.remove("active");
        modal.style.display = "none";
        document.body.style.overflow = "";

        clearMessages();

        if (pixTimer) {
            clearInterval(pixTimer);
            pixTimer = null;
        }
    }

    function showLogin() {
        const tabLogin = document.getElementById("tabLogin");
        const tabCadastro = document.getElementById("tabCadastro");
        const loginPanel = document.getElementById("loginPanel");
        const cadastroPanel = document.getElementById("cadastroPanel");

        if (!tabLogin || !tabCadastro || !loginPanel || !cadastroPanel) {
            return;
        }

        tabLogin.classList.add("active");
        tabCadastro.classList.remove("active");

        loginPanel.classList.add("active");
        cadastroPanel.classList.remove("active");

        loginPanel.style.display = "block";
        cadastroPanel.style.display = "none";

        clearMessages();
    }

    function showCadastro() {
        const tabLogin = document.getElementById("tabLogin");
        const tabCadastro = document.getElementById("tabCadastro");
        const loginPanel = document.getElementById("loginPanel");
        const cadastroPanel = document.getElementById("cadastroPanel");

        if (!tabLogin || !tabCadastro || !loginPanel || !cadastroPanel) {
            return;
        }

        tabLogin.classList.remove("active");
        tabCadastro.classList.add("active");

        loginPanel.classList.remove("active");
        cadastroPanel.classList.add("active");

        loginPanel.style.display = "none";
        cadastroPanel.style.display = "block";

        clearMessages();
    }

    function mask(id, formatter) {
        const element = document.getElementById(id);

        if (!element) {
            return;
        }

        element.addEventListener("input", function () {
            element.value = formatter(element.value);
        });
    }

   function setupPasswordToggle(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);

    if (!input || !button) return;

    button.type = "button";

    button.onclick = function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (input.type === "password") {
            input.type = "text";
            button.innerHTML = '<i class="fa fa-eye-slash"></i>';
            button.setAttribute("aria-label", "Ocultar senha");
            button.setAttribute("title", "Ocultar senha");
        } else {
            input.type = "password";
            button.innerHTML = '<i class="fa fa-eye"></i>';
            button.setAttribute("aria-label", "Mostrar senha");
            button.setAttribute("title", "Mostrar senha");
        }

        input.focus();
    };
}

    function getPlanoValor() {
        const plano = document.getElementById("cadPlano");

        if (!plano) {
            return 0;
        }

        return PLANOS[plano.value] || 0;
    }

    function formatMoney(value) {
        return value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function gerarCodigoPix() {
        const nome = document.getElementById("cadNome")?.value.trim() || "ALUNO";
        const plano = document.getElementById("cadPlano")?.value || "HITBOX";

        const codigo =
            "00020126580014BR.GOV.BCB.PIX" +
            "0136hitbox.academia.pagamento" +
            "52040000" +
            "5303986" +
            "5802BR" +
            "59" + String(nome.length).padStart(2, "0") + nome.toUpperCase().slice(0, 20) +
            "60" + String(plano.length).padStart(2, "0") + plano.slice(0, 20) +
            "62070503***" +
            "6304ABCD";

        return codigo;
    }

    function criarQRCode(codigo) {
        const container = document.getElementById("qrcode");

        if (!container) {
            return;
        }

        container.innerHTML = "";

        if (typeof QRCode === "undefined") {
            container.innerHTML = `
                <div style="
                    width:166px;
                    height:166px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    color:#111;
                    background:#fff;
                    font-size:11px;
                    text-align:center;
                    padding:15px;
                ">
                    QR Code indisponível
                </div>
            `;
            return;
        }

        new QRCode(container, {
            text: codigo,
            width: 166,
            height: 166,
            colorDark: "#111111",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    function iniciarContador() {
        if (pixTimer) {
            clearInterval(pixTimer);
        }

        let segundos = 10 * 60;

        const timer = document.getElementById("pixTimer");

        function atualizar() {
            if (!timer) {
                return;
            }

            const minutos = Math.floor(segundos / 60);
            const segundosRestantes = segundos % 60;

            timer.textContent =
                String(minutos).padStart(2, "0") +
                ":" +
                String(segundosRestantes).padStart(2, "0");

            if (segundos <= 0) {
                clearInterval(pixTimer);

                const status = document.getElementById("paymentStatus");

                if (status && !pixConfirmado) {
                    status.innerHTML = `
                        <span class="status-dot"></span>
                        QR Code expirado. Gere um novo código.
                    `;
                }

                const confirmButton = document.getElementById("confirmPix");

                if (confirmButton) {
                    confirmButton.disabled = true;
                }

                return;
            }

            segundos--;
        }

        atualizar();

        pixTimer = setInterval(atualizar, 1000);
    }

    function copiarPix(codigo) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(codigo).then(function () {
                showTemporaryMessage("Código PIX copiado!");
            }).catch(function () {
                fallbackCopy(codigo);
            });
        } else {
            fallbackCopy(codigo);
        }
    }

    function fallbackCopy(codigo) {
        const textarea = document.createElement("textarea");

        textarea.value = codigo;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);

        textarea.select();

        try {
            document.execCommand("copy");
            showTemporaryMessage("Código PIX copiado!");
        } catch (e) {
            showTemporaryMessage("Não foi possível copiar automaticamente.");
        }

        textarea.remove();
    }

    function showTemporaryMessage(text) {
        const old = document.getElementById("paymentToast");

        if (old) {
            old.remove();
        }

        const toast = document.createElement("div");

        toast.id = "paymentToast";
        toast.textContent = text;

        toast.style.cssText = `
            position:fixed;
            right:25px;
            bottom:25px;
            z-index:100000;
            background:#28a745;
            color:#fff;
            padding:13px 18px;
            font-size:11px;
            font-weight:800;
            box-shadow:0 10px 35px rgba(0,0,0,.5);
        `;

        document.body.appendChild(toast);

        setTimeout(function () {
            toast.style.opacity = "0";

            setTimeout(function () {
                toast.remove();
            }, 300);
        }, 1800);
    }

    function atualizarResumoPagamento() {
        const resumo = document.getElementById("paymentSummary");
        const valor = document.getElementById("paymentValue");
        const planoNome = document.getElementById("paymentPlanName");

        const plano = document.getElementById("cadPlano");

        if (!plano || !resumo || !valor || !planoNome) {
            return;
        }

        if (!plano.value) {
            resumo.style.display = "none";
            return;
        }

        const preco = getPlanoValor();

        resumo.style.display = "flex";
        valor.textContent = formatMoney(preco);
        planoNome.textContent = plano.value;
    }

    function showPayment(method) {
        const area = document.getElementById("paymentDetails");

        if (!area) {
            return;
        }

        area.innerHTML = "";

        pixConfirmado = false;

        if (pixTimer) {
            clearInterval(pixTimer);
            pixTimer = null;
        }

        if (!method) {
            area.style.display = "none";
            atualizarResumoPagamento();
            return;
        }

        area.style.display = "block";

        const valor = getPlanoValor();
        const plano = document.getElementById("cadPlano")?.value || "Plano Hitbox";

        if (method === "PIX") {
            const codigoPix = gerarCodigoPix();

            area.innerHTML = `
                <div class="payment-box">

                    <div class="payment-title">
                        <i class="fa fa-qrcode"></i>
                        PAGAMENTO VIA PIX
                    </div>

                    <div class="pix-payment">

                        <div class="qr-wrap">
                            <div id="qrcode"></div>
                        </div>

                        <div class="payment-info">

                            <strong>${plano}</strong>

                            <p>
                                Escaneie o QR Code usando o aplicativo do seu banco
                                para realizar o pagamento.
                            </p>

                            <div class="payment-meta">

                                <div class="payment-chip">
                                    VALOR:
                                    <strong>${formatMoney(valor)}</strong>
                                </div>

                                <div class="payment-chip">
                                    EXPIRA EM:
                                    <strong id="pixTimer">10:00</strong>
                                </div>

                            </div>

                            <div class="payment-actions">

                                <button
                                    type="button"
                                    class="payment-btn"
                                    id="copyPix">

                                    <i class="fa fa-copy"></i>
                                    COPIAR CÓDIGO PIX

                                </button>

                                <button
                                    type="button"
                                    class="payment-btn primary"
                                    id="confirmPix">

                                    <i class="fa fa-check"></i>
                                    JÁ REALIZEI O PAGAMENTO

                                </button>

                            </div>

                            <div
                                id="pixCode"
                                class="pix-code">

                                ${codigoPix}

                            </div>

                            <div
                                id="paymentStatus"
                                class="payment-status">

                                <span class="status-dot"></span>

                                Aguardando confirmação do pagamento...

                            </div>

                            <div
                                id="paymentConfirmed"
                                class="payment-confirmed">

                                <i class="fa fa-check-circle"></i>

                                Pagamento confirmado. Agora você pode finalizar seu cadastro.

                            </div>

                        </div>

                    </div>

                    <div class="payment-summary" id="paymentSummary">

                        <span id="paymentPlanName">${plano}</span>

                        <strong id="paymentValue">${formatMoney(valor)}</strong>

                    </div>

                </div>
            `;

            criarQRCode(codigoPix);
            iniciarContador();
            atualizarResumoPagamento();

            const copyButton = document.getElementById("copyPix");
            const confirmButton = document.getElementById("confirmPix");
            const pixCode = document.getElementById("pixCode");

            if (copyButton) {
                copyButton.addEventListener("click", function () {
                    copiarPix(codigoPix);

                    if (pixCode) {
                        pixCode.style.display = "block";
                    }
                });
            }

            if (confirmButton) {
                confirmButton.addEventListener("click", function () {
                    pixConfirmado = true;

                    const status = document.getElementById("paymentStatus");
                    const confirmed = document.getElementById("paymentConfirmed");

                    if (status) {
                        status.classList.add("confirmed");

                        status.innerHTML = `
                            <span class="status-dot"></span>
                            Pagamento confirmado
                        `;
                    }

                    if (confirmed) {
                        confirmed.classList.add("show");
                    }

                    confirmButton.disabled = true;

                    if (pixTimer) {
                        clearInterval(pixTimer);
                        pixTimer = null;
                    }

                    setMessage(
                        "cadastroMessage",
                        "Pagamento confirmado. Finalize seu cadastro.",
                        "success"
                    );
                });
            }

            return;
        }

        if (method === "Boleto") {
            area.innerHTML = `
                <div class="payment-box">

                    <div class="payment-title">
                        <i class="fa fa-barcode"></i>
                        PAGAMENTO VIA BOLETO
                    </div>

                    <div class="boleto-content">

                        <p>
                            Boleto gerado para simulação.
                        </p>

                        <div class="payment-summary">

                            <span>${plano}</span>

                            <strong>${formatMoney(valor)}</strong>

                        </div>

                        <div class="barcode">
                            ${Array.from({ length: 42 }).map(function () {
                                return "<span></span>";
                            }).join("")}
                        </div>

                        <strong>
                            34191.79001 01043.510047 91020.150008 1 00000000000000
                        </strong>

                    </div>

                </div>
            `;

            atualizarResumoPagamento();

            return;
        }

        if (
            method === "Cartão de crédito" ||
            method === "Cartão de débito"
        ) {
            area.innerHTML = `
                <div class="payment-box">

                    <div class="payment-title">
                        <i class="fa fa-credit-card"></i>
                        ${method.toUpperCase()}
                    </div>

                    <div class="card-payment-grid">

                        <div class="payment-input full">

                            <label>Número do cartão</label>

                            <input
                                id="cardNumber"
                                type="text"
                                maxlength="19"
                                placeholder="0000 0000 0000 0000">

                        </div>

                        <div class="payment-input">

                            <label>Nome no cartão</label>

                            <input
                                id="cardName"
                                type="text"
                                placeholder="Nome completo">

                        </div>

                        <div class="payment-input">

                            <label>CVV</label>

                            <input
                                id="cardCvv"
                                type="password"
                                maxlength="4"
                                placeholder="123">

                        </div>

                        <div class="payment-input">

                            <label>Validade</label>

                            <input
                                id="cardDate"
                                type="text"
                                maxlength="5"
                                placeholder="MM/AA">

                        </div>

                    </div>

                    <div class="payment-summary">

                        <span>${plano}</span>

                        <strong>${formatMoney(valor)}</strong>

                    </div>

                </div>
            `;

            setupCardMasks();
            atualizarResumoPagamento();
        }
    }

    function setupCardMasks() {
        const cardNumber = document.getElementById("cardNumber");
        const cardDate = document.getElementById("cardDate");
        const cardCvv = document.getElementById("cardCvv");

        if (cardNumber) {
            cardNumber.addEventListener("input", function () {
                let value = this.value
                    .replace(/\D/g, "")
                    .slice(0, 16);

                value = value.replace(
                    /(\d{4})(?=\d)/g,
                    "$1 "
                );

                this.value = value;
            });
        }

        if (cardDate) {
            cardDate.addEventListener("input", function () {
                let value = this.value
                    .replace(/\D/g, "")
                    .slice(0, 4);

                if (value.length > 2) {
                    value =
                        value.slice(0, 2) +
                        "/" +
                        value.slice(2);
                }

                this.value = value;
            });
        }

        if (cardCvv) {
            cardCvv.addEventListener("input", function () {
                this.value = this.value
                    .replace(/\D/g, "")
                    .slice(0, 4);
            });
        }
    }

    function showSuccess() {
        const box = document.querySelector("#authModal .auth-box");

        if (!box) {
            return;
        }

        box.innerHTML = `
            <button
                type="button"
                class="auth-close"
                id="successClose">

                <i class="fa fa-close"></i>

            </button>

            <div class="auth-success">

                <div class="auth-success-logo">

                    <img
                        src="img/logo.png"
                        alt="Hitbox">

                </div>

                <div class="auth-success-icon">

                    <i class="fa fa-check"></i>

                </div>

                <h2>
                    Pagamento realizado com sucesso
                </h2>

                <p>
                    Cadastro realizado com sucesso.
                </p>

                <button
                    type="button"
                    class="auth-submit"
                    id="backToLogin">

                    VOLTAR PARA FAZER LOGIN

                </button>

            </div>
        `;

        const successClose = document.getElementById("successClose");
        const backToLogin = document.getElementById("backToLogin");

        if (successClose) {
            successClose.addEventListener("click", function () {
                closeModal();
                window.location.reload();
            });
        }

        if (backToLogin) {
            backToLogin.addEventListener("click", function () {
                window.location.reload();
            });
        }
    }

    function login(event) {
        event.preventDefault();

        const emailElement = document.getElementById("loginEmail");
        const senhaElement = document.getElementById("loginSenha");

        if (!emailElement || !senhaElement) {
            return;
        }

        const email = emailElement.value.trim().toLowerCase();
        const senha = senhaElement.value;

        if (!email || !senha) {
            setMessage(
                "loginMessage",
                "Preencha o e-mail e a senha.",
                "error"
            );

            return;
        }

        const users = getUsers();

        let user = users.find(function (usuario) {
            return (
                usuario.email &&
                usuario.email.toLowerCase() === email &&
                usuario.senha === senha
            );
        });

        if (
            !user &&
            email === "admin@hitbox.com" &&
            senha === "Hitbox@123"
        ) {
            user = {
                id: "ADMIN",
                nome: "Administrador",
                sobrenome: "Hitbox",
                email: "admin@hitbox.com",
                senha: "Hitbox@123",
                tipo: "admin",
                plano: "Administrador",
                pagamento: ""
            };

            const adminExists = users.some(function (usuario) {
                return (
                    usuario.email &&
                    usuario.email.toLowerCase() === "admin@hitbox.com"
                );
            });

            if (!adminExists) {
                users.push(user);
                setUsers(users);
            }
        }

        if (!user) {
            setMessage(
                "loginMessage",
                "E-mail ou senha incorretos.",
                "error"
            );

            return;
        }

        localStorage.setItem(
            SESSION_KEY,
            JSON.stringify({
                id: user.id,
                nome: user.nome,
                sobrenome: user.sobrenome,
                email: user.email,
                tipo: user.tipo,
                plano: user.plano
            })
        );

        setMessage(
            "loginMessage",
            "Login realizado. Abrindo seu perfil...",
            "success"
        );

        setTimeout(function () {
            window.location.href = "perfil.html";
        }, 600);
    }

    function register(event) {
        event.preventDefault();

        const get = function (id) {
            const element = document.getElementById(id);

            return element
                ? element.value.trim()
                : "";
        };

        const nome = get("cadNome");
        const sobrenome = get("cadSobrenome");

        const cpf = get("cadCpf")
            .replace(/\D/g, "");

        const nascimento =
            document.getElementById("cadNascimento")?.value || "";

        const telefone = get("cadTelefone");

        const email = get("cadEmail")
            .toLowerCase();

        const senha =
            document.getElementById("cadSenha")?.value || "";

        const confirmarSenha =
            document.getElementById("cadConfirmarSenha")?.value || "";

        const cep = get("cadCep")
            .replace(/\D/g, "");

        const rua = get("cadRua");
        const numero = get("cadNumero");
        const cidade = get("cadCidade");

        const estado =
            document.getElementById("cadEstado")?.value || "";

        const plano =
            document.getElementById("cadPlano")?.value || "";

        const pagamento =
            document.getElementById("cadPagamento")?.value || "";

        let valid = true;

        const checks = [
            ["cadNome", nome.length >= 2, "Informe o nome."],
            ["cadSobrenome", sobrenome.length >= 2, "Informe o sobrenome."],
            ["cadCpf", cpf.length === 11, "CPF deve ter 11 números."],
            ["cadNascimento", !!nascimento, "Informe a data de nascimento."],
            [
                "cadTelefone",
                telefone.replace(/\D/g, "").length >= 10,
                "Informe um telefone válido."
            ],
            [
                "cadEmail",
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
                "Informe um e-mail válido."
            ],
            [
                "cadSenha",
                senha.length >= 6,
                "A senha deve ter pelo menos 6 caracteres."
            ],
            [
                "cadConfirmarSenha",
                senha === confirmarSenha,
                "As senhas não conferem."
            ],
            [
                "cadCep",
                cep.length === 8,
                "CEP deve ter 8 números."
            ],
            [
                "cadRua",
                rua.length >= 3,
                "Informe a rua."
            ],
            [
                "cadNumero",
                numero.length > 0,
                "Informe o número."
            ],
            [
                "cadCidade",
                cidade.length >= 2,
                "Informe a cidade."
            ],
            [
                "cadEstado",
                !!estado,
                "Selecione o estado."
            ],
            [
                "cadPlano",
                !!plano,
                "Selecione o plano."
            ],
            [
                "cadPagamento",
                !!pagamento,
                "Selecione a forma de pagamento."
            ]
        ];

        checks.forEach(function (check) {
            const element =
                document.getElementById(check[0]);

            if (!element) {
                valid = false;
                return;
            }

            const small =
                element.parentElement.querySelector("small");

            element.classList.remove(
                "valid",
                "invalid"
            );

            element.classList.add(
                check[1]
                    ? "valid"
                    : "invalid"
            );

            if (small) {
                small.textContent =
                    check[1]
                        ? ""
                        : check[2];
            }

            if (!check[1]) {
                valid = false;
            }
        });

        const users = getUsers();

        const emailExists = users.some(function (usuario) {
            return (
                usuario.email &&
                usuario.email.toLowerCase() === email
            );
        });

        if (emailExists) {
            const element =
                document.getElementById("cadEmail");

            element.classList.add("invalid");

            const small =
                element.parentElement.querySelector("small");

            if (small) {
                small.textContent =
                    "Este e-mail já está cadastrado.";
            }

            valid = false;
        }

        const cpfExists = users.some(function (usuario) {
            return (
                usuario.cpf &&
                usuario.cpf.replace(/\D/g, "") === cpf
            );
        });

        if (cpfExists) {
            const element =
                document.getElementById("cadCpf");

            element.classList.add("invalid");

            const small =
                element.parentElement.querySelector("small");

            if (small) {
                small.textContent =
                    "Este CPF já está cadastrado.";
            }

            valid = false;
        }

        if (!valid) {
            setMessage(
                "cadastroMessage",
                "Corrija os campos destacados.",
                "error"
            );

            return;
        }

        if (pagamento === "PIX" && !pixConfirmado) {
            setMessage(
                "cadastroMessage",
                "Confirme o pagamento via PIX antes de finalizar.",
                "error"
            );

            const paymentDetails =
                document.getElementById("paymentDetails");

            if (paymentDetails) {
                paymentDetails.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }

            return;
        }

        if (
            pagamento === "Cartão de crédito" ||
            pagamento === "Cartão de débito"
        ) {
            const cardNumber =
                document.getElementById("cardNumber");

            const cardName =
                document.getElementById("cardName");

            const cardCvv =
                document.getElementById("cardCvv");

            const cardDate =
                document.getElementById("cardDate");

            if (
                !cardNumber ||
                cardNumber.value.replace(/\D/g, "").length < 16 ||
                !cardName ||
                !cardName.value.trim() ||
                !cardCvv ||
                cardCvv.value.length < 3 ||
                !cardDate ||
                cardDate.value.length < 5
            ) {
                setMessage(
                    "cadastroMessage",
                    "Preencha os dados do cartão.",
                    "error"
                );

                return;
            }
        }

        const novoUsuario = {
            id: "USR" + Date.now(),
            tipo: "aluno",
            nome: nome,
            sobrenome: sobrenome,
            cpf: cpf,
            nascimento: nascimento,
            telefone: telefone,
            email: email,
            senha: senha,
            cep: cep,
            rua: rua,
            numero: numero,
            cidade: cidade,
            estado: estado,
            plano: plano,
            pagamento: pagamento,
            modalidade: "Boxe",
            progresso: 35,
            meta: "Melhorar condicionamento",
            dataCadastro: new Date().toISOString()
        };

        users.push(novoUsuario);

        setUsers(users);

        showSuccess();
    }

    function updateHeader() {
        const session =
            localStorage.getItem(SESSION_KEY);

        const loginArea =
            document.getElementById("loginArea");

        const profileArea =
            document.getElementById("profileArea");

        if (!loginArea || !profileArea) {
            return;
        }

        if (session) {
            loginArea.style.display = "none";
            profileArea.style.display = "flex";
        } else {
            loginArea.style.display = "flex";
            profileArea.style.display = "none";
        }
    }

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            const loginOpen =
                document.getElementById("loginOpen");

            const footerLogin =
                document.getElementById("footerLogin");

            const footerCadastro =
                document.getElementById("footerCadastro");

            const authClose =
                document.getElementById("authClose");

            const authModal =
                document.getElementById("authModal");

            const tabLogin =
                document.getElementById("tabLogin");

            const tabCadastro =
                document.getElementById("tabCadastro");

            const loginForm =
                document.getElementById("loginForm");

            const cadastroForm =
                document.getElementById("cadastroForm");

            const pagamento =
                document.getElementById("cadPagamento");

            const plano =
                document.getElementById("cadPlano");

            if (loginOpen) {
                loginOpen.addEventListener(
                    "click",
                    function (event) {
                        event.preventDefault();
                        openModal("login");
                    }
                );
            }

            if (footerLogin) {
                footerLogin.addEventListener(
                    "click",
                    function (event) {
                        event.preventDefault();
                        openModal("login");
                    }
                );
            }

            if (footerCadastro) {
                footerCadastro.addEventListener(
                    "click",
                    function (event) {
                        event.preventDefault();
                        openModal("cadastro");
                    }
                );
            }

            if (authClose) {
                authClose.addEventListener(
                    "click",
                    closeModal
                );
            }

            if (authModal) {
                authModal.addEventListener(
                    "click",
                    function (event) {
                        if (event.target === authModal) {
                            closeModal();
                        }
                    }
                );
            }

            if (tabLogin) {
                tabLogin.addEventListener(
                    "click",
                    showLogin
                );
            }

            if (tabCadastro) {
                tabCadastro.addEventListener(
                    "click",
                    showCadastro
                );
            }

            if (loginForm) {
                loginForm.addEventListener(
                    "submit",
                    login
                );
            }

            if (cadastroForm) {
                cadastroForm.addEventListener(
                    "submit",
                    register
                );
            }

            if (pagamento) {
                pagamento.addEventListener(
                    "change",
                    function () {
                        showPayment(this.value);
                    }
                );
            }

            if (plano) {
                plano.addEventListener(
                    "change",
                    function () {
                        atualizarResumoPagamento();

                        const pagamentoAtual =
                            document.getElementById("cadPagamento");

                        if (
                            pagamentoAtual &&
                            pagamentoAtual.value
                        ) {
                            showPayment(
                                pagamentoAtual.value
                            );
                        }
                    }
                );
            }

            setupPasswordToggle(
                "loginSenha",
                "toggleLoginSenha"
            );

            mask("cadCpf", function (value) {
                return value
                    .replace(/\D/g, "")
                    .slice(0, 11)
                    .replace(
                        /(\d{3})(\d)/,
                        "$1.$2"
                    )
                    .replace(
                        /(\d{3})(\d)/,
                        "$1.$2"
                    )
                    .replace(
                        /(\d{3})(\d{1,2})$/,
                        "$1-$2"
                    );
            });

            mask("cadTelefone", function (value) {
                let x = value
                    .replace(/\D/g, "")
                    .slice(0, 11);

                if (x.length <= 10) {
                    return x
                        .replace(
                            /(\d{2})(\d)/,
                            "($1) $2"
                        )
                        .replace(
                            /(\d{4})(\d)/,
                            "$1-$2"
                        );
                }

                return x
                    .replace(
                        /(\d{2})(\d)/,
                        "($1) $2"
                    )
                    .replace(
                        /(\d{5})(\d)/,
                        "$1-$2"
                    );
            });

            mask("cadCep", function (value) {
                return value
                    .replace(/\D/g, "")
                    .slice(0, 8)
                    .replace(
                        /(\d{5})(\d)/,
                        "$1-$2"
                    );
            });

            updateHeader();
        }
    );
})();