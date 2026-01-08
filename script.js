document.addEventListener("DOMContentLoaded", () => {

    /* ================= CONFIGURAÇÕES ================= */
    const DIAS_DESAFIO = 60;
    const DATA_INICIO = new Date("2026-01-08");

    let dados = JSON.parse(localStorage.getItem("sharkModeDados")) || {
        treinos: [],
        recorde: 0,
        exerciciosDoDia: []
    };

    /* ================= FRASES ================= */
    const frases = [
        "Sharks não param de nadar.",
        "Disciplina é sobreviver.",
        "O oceano respeita os fortes.",
        "Modo Shark ativado.",
        "Silencioso. Constante. Letal."
    ];

    /* ================= ELEMENTOS ================= */
    const contador = document.getElementById("contador");
    const fraseForja = document.getElementById("fraseForja");
    const btnTreino = document.getElementById("btnTreino");
    const statusTreino = document.getElementById("statusTreino");

    const listaHistorico = document.getElementById("listaHistorico");
    const calendarioEl = document.getElementById("calendario");

    const totalTreinos = document.getElementById("totalTreinos");
    const treinosAcademia = document.getElementById("treinosAcademia");
    const treinosCasa = document.getElementById("treinosCasa");
    const percentual = document.getElementById("percentual");

    const exercicioInput = document.getElementById("exercicio");
    const seriesInput = document.getElementById("series");
    const repsInput = document.getElementById("reps");
    const listaExercicios = document.getElementById("listaExercicios");
    const btnAddExercicio = document.getElementById("btnAddExercicio");

    const medalhasContainer = document.getElementById("medalhasContainer");

    let exerciciosDoDia = dados.exerciciosDoDia || [];

    /* ================= FUNÇÕES BASE ================= */
    function salvar() {
        dados.exerciciosDoDia = exerciciosDoDia;
        localStorage.setItem("sharkModeDados", JSON.stringify(dados));
    }

    function hojeISO() {
        return new Date().toISOString().split("T")[0];
    }

    function atualizarContador() {
        const hoje = new Date();
        const diff = Math.floor((hoje - DATA_INICIO) / (1000 * 60 * 60 * 24)) + 1;

        if (diff < 1) contador.innerText = "Desafio ainda não começou";
        else if (diff > DIAS_DESAFIO) contador.innerText = "Desafio concluído 🏆";
        else contador.innerText = `Dia ${diff} de ${DIAS_DESAFIO}`;
    }

    function fraseAleatoria() {
        fraseForja.innerText = frases[Math.floor(Math.random() * frases.length)];
    }

    /* ================= EXERCÍCIOS ================= */
    btnAddExercicio.addEventListener("click", () => {
        if (!exercicioInput.value || !seriesInput.value || !repsInput.value) return;

        exerciciosDoDia.push({
            nome: exercicioInput.value,
            series: seriesInput.value,
            reps: repsInput.value
        });

        renderizarExercicios();

        exercicioInput.value = "";
        seriesInput.value = "";
        repsInput.value = "";
        salvar();
    });

    function renderizarExercicios() {
        listaExercicios.innerHTML = "";
        exerciciosDoDia.forEach(e => {
            const li = document.createElement("li");
            li.innerText = `${e.nome} — ${e.series}x${e.reps}`;
            listaExercicios.appendChild(li);
        });
    }

    /* ================= TREINO ================= */
    btnTreino.addEventListener("click", () => {
        const hoje = hojeISO();

        if (dados.treinos.some(t => t.data === hoje)) {
            alert("Treino já registrado hoje.");
            return;
        }

        const tipo = document.querySelector("input[name='tipo']:checked").value;

        dados.treinos.push({
            data: hoje,
            tipo,
            exercicios: [...exerciciosDoDia]
        });

        exerciciosDoDia = [];
        renderizarExercicios();

        btnTreino.disabled = true;
        statusTreino.innerText = "MISSÃO CUMPRIDA 🦈";

        const card = btnTreino.closest(".card");
        card.classList.add("sucesso");
        setTimeout(() => card.classList.remove("sucesso"), 700);

        salvar();
        atualizar();
    });

    /* ================= CALENDÁRIO ================= */
    function renderizarCalendario() {
        calendarioEl.innerHTML = "";

        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = hoje.getMonth();

        const primeiroDia = new Date(ano, mes, 1).getDay();
        const totalDias = new Date(ano, mes + 1, 0).getDate();

        for (let i = 0; i < primeiroDia; i++) {
            calendarioEl.appendChild(document.createElement("div"));
        }

        for (let dia = 1; dia <= totalDias; dia++) {
            const data = new Date(ano, mes, dia);
            const iso = data.toISOString().split("T")[0];

            const div = document.createElement("div");
            div.classList.add("dia");

            if (dados.treinos.some(t => t.data === iso)) div.classList.add("treino");
            if (iso === hojeISO()) div.classList.add("hoje");

            div.innerText = dia;
            calendarioEl.appendChild(div);
        }
    }

    /* ================= HISTÓRICO & STATS ================= */
    function atualizar() {
        renderizarExercicios();
        listaHistorico.innerHTML = "";

        dados.treinos.slice().reverse().forEach(t => {
            const li = document.createElement("li");

            const badge = `<span class="badge ${t.tipo}">${t.tipo.toUpperCase()}</span>`;
            let html = `<strong>📅 ${t.data}</strong> ${badge}<br><br>`;

            t.exercicios.forEach(e => {
                html += `• ${e.nome} — <strong>${e.series}x${e.reps}</strong><br>`;
            });

            li.innerHTML = html;
            listaHistorico.appendChild(li);
        });

        totalTreinos.innerText = `Total: ${dados.treinos.length}`;
        treinosAcademia.innerText =
            `🏋️ Academia: ${dados.treinos.filter(t => t.tipo === "academia").length}`;
        treinosCasa.innerText =
            `💪 Casa: ${dados.treinos.filter(t => t.tipo === "casa").length}`;

        percentual.innerText =
            `Disciplina: ${Math.round((dados.treinos.length / DIAS_DESAFIO) * 100)}%`;

        dados.recorde = Math.max(dados.recorde, dados.treinos.length);
        document.getElementById("streak").innerText = `🔥 Streak: ${dados.treinos.length}`;
        document.getElementById("recorde").innerText = `🏆 Recorde: ${dados.recorde}`;

        renderizarCalendario();
        atualizarMedalhas();
    }

    /* ================= MEDALHAS ================= */
    function atualizarMedalhas() {
        medalhasContainer.innerHTML = "";

        const totalTreinos = dados.treinos.length;
        const medalhasCount = Math.floor(totalTreinos / 10);

        for (let i = 1; i <= medalhasCount; i++) {
            const div = document.createElement("div");
            div.classList.add("medalha");

            if (i === Math.ceil(DIAS_DESAFIO / 10)) {
                div.classList.add("ultima");
                div.title = "Medalha Épica!";
            } else {
                div.title = `Medalha ${i}`;
            }

            div.innerText = "🏅";
            medalhasContainer.appendChild(div);
        }
    }

    /* ================= NAV ================= */
    window.mostrarTela = function (id) {
        document.querySelectorAll(".tela").forEach(t => t.classList.remove("ativa"));
        document.getElementById(id).classList.add("ativa");
    };

    /* ================= INIT ================= */
    atualizarContador();
    fraseAleatoria();
    atualizar();

    if (dados.treinos.some(t => t.data === hojeISO())) {
        btnTreino.disabled = true;
        statusTreino.innerText = "Treino já registrado hoje.";
    }

});

