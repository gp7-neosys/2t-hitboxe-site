(function () {
    const SESSION_KEY = "hitboxSessao";
    const USERS_KEY = "hitboxUsuarios";
    const ADMIN_PHOTO_KEY = "hitboxAdminFoto";

    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");

    if (!session) {
        window.location.replace("Contato.html");
        return;
    }

    function getUsers() {
        try {
            return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
        } catch (e) {
            return [];
        }
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    const users = getUsers();

    let user = null;

    if (session.tipo === "aluno") {
        user = users.find(function (u) {
            return u.email &&
                u.email.toLowerCase() === session.email.toLowerCase();
        });
    }

    const profileName = document.getElementById("profileName");
    const profileRole = document.getElementById("profileRole");
    const profilePhoto = document.getElementById("profilePhoto");
    const profileFallback = document.getElementById("profileFallback");
    const photoInput = document.getElementById("photoInput");
    const logout = document.getElementById("logout");

    const studentDashboard = document.getElementById("studentDashboard");
    const adminDashboard = document.getElementById("adminDashboard");

    function setPhoto(src) {
        if (src) {
            profilePhoto.src = src;
            profilePhoto.style.display = "block";
            profileFallback.style.display = "none";
        } else {
            profilePhoto.removeAttribute("src");
            profilePhoto.style.display = "none";
            profileFallback.style.display = "flex";
        }
    }

    const name = session.tipo === "admin"
        ? "Administrador Hitbox"
        : ((user && user.nome ? user.nome : "") + " " +
           (user && user.sobrenome ? user.sobrenome : "")).trim();

    profileName.textContent = name || "Usuário";
    profileRole.textContent = session.tipo === "admin"
        ? "ADMINISTRADOR"
        : "ALUNO";

    if (session.tipo === "admin") {

        studentDashboard.style.display = "none";
        adminDashboard.style.display = "block";

        const adminPhoto = localStorage.getItem(ADMIN_PHOTO_KEY) || "";
        setPhoto(adminPhoto);

        const studentUsers = users.filter(function (u) {
            return u.tipo === "aluno";
        });

        const adminStudents = document.getElementById("adminStudents");
        const adminStudentList = document.getElementById("adminStudentList");

        if (adminStudents) {
            adminStudents.textContent = studentUsers.length;
        }

        if (adminStudentList) {
            if (studentUsers.length) {
                adminStudentList.innerHTML = studentUsers.map(function (u) {
                    const nomeCompleto =
                        ((u.nome || "") + " " + (u.sobrenome || "")).trim();

                    return `
                        <div>
                            <span>${nomeCompleto || "Aluno"}</span>
                            <span class="student-status">ATIVO</span>
                        </div>
                    `;
                }).join("");
            } else {
                adminStudentList.innerHTML =
                    '<div class="empty-state">Nenhum aluno cadastrado ainda.</div>';
            }
        }

        const chartElement = document.getElementById("performanceChart");

        if (chartElement && typeof Chart !== "undefined") {
            new Chart(chartElement, {
                type: "line",
                data: {
                    labels: [
                        "Jan",
                        "Fev",
                        "Mar",
                        "Abr",
                        "Mai",
                        "Jun",
                        "Jul",
                        "Ago",
                        "Set"
                    ],
                    datasets: [{
                        label: "Desempenho",
                        data: [62, 67, 65, 74, 71, 79, 76, 86, 91],
                        borderWidth: 3,
                        tension: 0.35,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: "#aaa"
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: "#777"
                            },
                            grid: {
                                color: "#292929"
                            }
                        },
                        y: {
                            ticks: {
                                color: "#777"
                            },
                            grid: {
                                color: "#292929"
                            },
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }

    } else {

        adminDashboard.style.display = "none";
        studentDashboard.style.display = "block";

        if (!user) {
            localStorage.removeItem(SESSION_KEY);
            window.location.replace("Contato.html");
            return;
        }

        setPhoto(user.foto || "");

        document.getElementById("studentFullName").textContent =
            ((user.nome || "") + " " + (user.sobrenome || "")).trim();

        document.getElementById("studentEmail").textContent =
            user.email || "Não informado";

        document.getElementById("studentPhone").textContent =
            user.telefone || "Não informado";

        document.getElementById("studentCpf").textContent =
            user.cpf || "Não informado";

        document.getElementById("studentPlan").textContent =
            user.plano || "Plano não informado";

        document.getElementById("studentPlanData").textContent =
            user.plano || "Não informado";

        document.getElementById("studentPayment").textContent =
            user.pagamento || "Não informado";

        document.getElementById("studentModalidade").textContent =
            user.modalidade || "Boxe";

        document.getElementById("studentGoal").value =
            user.meta || "Melhorar condicionamento";

        let progress = Number(
            user.progresso !== undefined ? user.progresso : 35
        );

        progress = Math.max(0, Math.min(100, progress));

        document.getElementById("studentProgress").value = progress;
        document.getElementById("studentProgressBar").style.width =
            progress + "%";

        document.getElementById("studentProgressValue").textContent =
            progress + "%";

        const end = new Date(
            user.vencimento || Date.now()
        );

        const days = Math.max(
            0,
            Math.ceil((end - new Date()) / 86400000)
        );

        document.getElementById("daysLeft").textContent = days;

        if (days === 0) {
            const status = document.getElementById("studentStatus");

            status.textContent = "VENCIDO";
            status.classList.remove("green");
            status.style.color = "#e30613";
        }

        document.getElementById("studentNext").textContent = "Hoje";

        if (photoInput) {
            photoInput.addEventListener("change", function (event) {

                const file = event.target.files[0];

                if (!file) {
                    return;
                }

                if (!file.type.startsWith("image/")) {
                    alert("Selecione uma imagem válida.");
                    return;
                }

                const reader = new FileReader();

                reader.onload = function () {

                    user.foto = reader.result;

                    const allUsers = getUsers();

                    const index = allUsers.findIndex(function (u) {
                        return u.id === user.id;
                    });

                    if (index !== -1) {
                        allUsers[index] = user;
                        saveUsers(allUsers);
                    }

                    setPhoto(reader.result);
                };

                reader.readAsDataURL(file);
            });
        }

        const progressInput =
            document.getElementById("studentProgress");

        if (progressInput) {
            progressInput.addEventListener("input", function () {

                const value = this.value;

                document.getElementById(
                    "studentProgressValue"
                ).textContent = value + "%";

                document.getElementById(
                    "studentProgressBar"
                ).style.width = value + "%";
            });
        }

        const saveGoal =
            document.getElementById("saveGoal");

        if (saveGoal) {
            saveGoal.addEventListener("click", function () {

                user.meta =
                    document.getElementById("studentGoal").value.trim() ||
                    "Melhorar condicionamento";

                user.progresso =
                    Number(document.getElementById("studentProgress").value);

                const allUsers = getUsers();

                const index = allUsers.findIndex(function (u) {
                    return u.id === user.id;
                });

                if (index !== -1) {
                    allUsers[index] = user;
                    saveUsers(allUsers);
                }

                this.textContent = "SALVO";

                setTimeout(function () {
                    saveGoal.textContent = "SALVAR";
                }, 1200);
            });
        }
    }

    if (photoInput) {
        photoInput.addEventListener("change", function (event) {

            if (session.tipo !== "admin") {
                return;
            }

            const file = event.target.files[0];

            if (!file) {
                return;
            }

            if (!file.type.startsWith("image/")) {
                alert("Selecione uma imagem válida.");
                return;
            }

            const reader = new FileReader();

            reader.onload = function () {

                localStorage.setItem(
                    ADMIN_PHOTO_KEY,
                    reader.result
                );

                session.foto = reader.result;

                localStorage.setItem(
                    SESSION_KEY,
                    JSON.stringify(session)
                );

                setPhoto(reader.result);
            };

            reader.readAsDataURL(file);
        });
    }

    if (logout) {
        logout.addEventListener("click", function (event) {

            event.preventDefault();

            localStorage.removeItem(SESSION_KEY);

            window.location.replace("index.html");
        });
    }

})();