// ================================================
// app.js — Funções que TODAS as páginas usam
// ================================================

document.getElementById("ano-atual").textContent = new Date().getFullYear();

// Adicione autocomplete="off" e readonly no HTML:
// <input type="text" id="meuCampo" autocomplete="off" readonly />

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("search-input");

  // Remove o readonly quando o usuário foca no campo
  input.addEventListener("focus", () => {
    input.removeAttribute("readonly");
  });
});

// ── 1. MONTAR A PÁGINA DE DETALHES ─────────────
// detalhes.js chama essa função depois de buscar os dados do item clicado.
// Ela lê o id e tipo da URL, busca os dados completos na API e monta a página.
const API_KEY = "308c17fc9c0da36438f0c0271839afcd";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

// ── BUSCAR DADOS DA API ─────────────────────────
// "async" existe porque buscar dados na internet é demorado.
// O "await" dentro dela faz o JS pausar e esperar a resposta.
async function buscarDados(endpoint) {
  const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=pt-BR`;
  const resposta = await fetch(url);
  const dados = await resposta.json();
  return dados;
}

// ── MONTAR UM CARD ──────────────────────────────
// Recebe os dados de um filme/série e devolve o HTML do card.
// "tipo" é 'movie' ou 'tv' — muda os nomes dos campos da API.
// Você pode mudar o HTML dentro do return à vontade.
// NÃO mude as variáveis (titulo, poster, link) — elas vêm da API.
function montarCard(item, tipo) {
  const titulo = tipo === "movie" ? item.title : item.name;
  const data = tipo === "movie" ? item.release_date : item.first_air_date;
  const ano = data ? data.slice(0, 4) : "S/D";
  const nota = item.vote_average ? item.vote_average.toFixed(1) : "—";
  const poster = item.poster_path
    ? IMG_URL + item.poster_path
    : "https://via.placeholder.com/200x300/1a1a2e/aaa?text=Sem+Imagem";
  const link = `detalhes.html?id=${item.id}&tipo=${tipo}`;

  return `
    <a href="${link}" class="card">
      <img src="${poster}" alt="${titulo}">
      <div class="card-info">
        <p class="card-titulo">${titulo}</p>
        <p class="card-ano">${ano} · ⭐ ${nota}</p>
      </div>
    </a>
  `;
}

// ── PREENCHER UMA SEÇÃO COM CARDS ──────────────
// elementoId = id da div no HTML onde os cards vão aparecer.
// Esse id TEM que existir no HTML, senão nada aparece.
function preencherSecao(elementoId, lista, tipo) {
  const elemento = document.getElementById(elementoId);
  if (!elemento) return;
  elemento.innerHTML = lista.map((item) => montarCard(item, tipo)).join("");
}

// ── BUSCA EM TEMPO REAL ─────────────────────────
// Observa o id="search-input" e escreve dentro de id="search-results".
// Esses dois ids PRECISAM existir no HTML de cada página.
const inputBusca = document.getElementById("search-input");
const resultadosBusca = document.getElementById("search-results");

if (inputBusca) {
  let timer;

  inputBusca.addEventListener("input", function () {
    const texto = inputBusca.value.trim();
    clearTimeout(timer);

    if (texto.length < 2) {
      resultadosBusca.innerHTML = "";
      resultadosBusca.style.display = "none";
      return;
    }

    // Debounce: espera 400ms após o usuário parar de digitar
    // Evita fazer uma requisição por cada letra
    timer = setTimeout(function () {
      fazerBusca(texto);
    }, 400);
  });

  document.addEventListener("click", function (e) {
    if (
      !e.target.closest(".search-box") &&
      !e.target.closest(".search-results")
    ) {
      resultadosBusca.style.display = "none";
    }
  });
}

// ── FAZER A BUSCA ───────────────────────────────
// CORREÇÃO DO BUG: antes passávamos a query pelo endpoint (/search/multi&query=...)
// o que gerava uma URL inválida. Agora montamos a URL completa manualmente.
// encodeURIComponent transforma espaços e acentos em código válido pra URL.
async function fazerBusca(texto) {
  resultadosBusca.innerHTML = '<p class="busca-msg">Buscando...</p>';
  resultadosBusca.style.display = "block";

  const url = `${BASE_URL}/search/multi?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(texto)}`;
  const resposta = await fetch(url);
  const dados = await resposta.json();

  const resultados = dados.results
    ? dados.results.filter((r) => r.media_type !== "person").slice(0, 6)
    : [];

  if (resultados.length === 0) {
    resultadosBusca.innerHTML = '<p class="busca-msg">Nenhum resultado.</p>';
    return;
  }

  // Você pode mudar o HTML aqui dentro.
  // Só não mude r.id, r.media_type, r.title/r.name — vêm da API.
  resultadosBusca.innerHTML = resultados
    .map(function (r) {
      const titulo = r.media_type === "movie" ? r.title : r.name;
      const tipo = r.media_type === "movie" ? "Filme" : "Série";
      const thumb = r.poster_path
        ? "https://image.tmdb.org/t/p/w92" + r.poster_path
        : "https://via.placeholder.com/40x60/1a1a2e/aaa";
      return `
      <a href="detalhes.html?id=${r.id}&tipo=${r.media_type}" class="resultado-item">
        <img src="${thumb}" alt="${titulo}">
        <div>
          <p class="resultado-titulo">${titulo}</p>
          <p class="resultado-tipo">${tipo}</p>
        </div>
      </a>
    `;
    })
    .join("");
}
