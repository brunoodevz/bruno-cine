// ================================================
// detalhes.js — Lógica da página de Detalhes
// ================================================
// Essa página é diferente: ela não tem uma grade de cards.
// Ela lê o id e tipo da URL (?id=123&tipo=movie),
// busca os dados daquele item específico e monta a página.

// ── 1. LER A URL ────────────────────────────────
// Quando você clica em um card, o link vai pra:
// detalhes.html?id=123&tipo=movie
// URLSearchParams lê esses parâmetros da URL.
// NÃO mude os nomes 'id' e 'tipo' aqui — eles precisam bater com o que
// está nos links gerados por montarCard() no app.js
const params = new URLSearchParams(window.location.search);
const itemId = params.get("id"); // ex: "123"
const itemTipo = params.get("tipo"); // ex: "movie" ou "tv"

// ── 2. MONTAR O HTML DE DETALHES ────────────────
// Recebe o objeto completo do filme/série e monta todo o HTML.
// Você PODE mudar tudo aqui dentro — é só o HTML visual.
// NÃO mude as variáveis que vêm de "item" (titulo, poster, etc.)
function montarDetalhes(item) {
  const isMovie = itemTipo === "movie";

  const titulo = isMovie ? item.title : item.name;
  const ano = ((isMovie ? item.release_date : item.first_air_date) || "").slice(
    0,
    4,
  );
  const nota = item.vote_average ? item.vote_average.toFixed(1) : "—";
  const duracao = isMovie
    ? item.runtime
      ? `${item.runtime} min`
      : "S/D"
    : item.number_of_seasons
      ? `${item.number_of_seasons} temporada(s)`
      : "S/D";

  const poster = item.poster_path
    ? "https://image.tmdb.org/t/p/w500" + item.poster_path
    : "https://via.placeholder.com/300x450/1a1a2e/aaa?text=Sem+Imagem";

  const backdrop = item.backdrop_path
    ? "https://image.tmdb.org/t/p/w1280" + item.backdrop_path
    : "";

  // Gêneros vêm como array de objetos: [{id: 28, name: "Ação"}, ...]
  const generos = item.genres
    ? item.genres.map((g) => `<span class="genero">${g.name}</span>`).join("")
    : "";

  // Todo o HTML da página de detalhes.
  // PODE mudar a estrutura visual aqui.
  // NÃO mude as variáveis com ${...}
  return `
    <div class="detalhe-hero" style="background-image: url(${backdrop})">
      <div class="detalhe-hero-overlay"></div>
    </div>

    <div class="container detalhe-conteudo">

      <a href="index.html" class="btn-voltar">
        ← Voltar
      </a>

      <div class="detalhe-grid">

        <img class="detalhe-poster" src="${poster}" alt="${titulo}">

        <div class="detalhe-info">
          <h1 class="detalhe-titulo">${titulo}</h1>

          ${item.tagline ? `<p class="detalhe-tagline">"${item.tagline}"</p>` : ""}

          <div class="detalhe-meta">
            <span>⭐ ${nota}</span>
            <span>${ano}</span>
            <span>${duracao}</span>
          </div>

          <div class="detalhe-generos">${generos}</div>

          <p class="detalhe-overview">${item.overview || "Sem descrição disponível."}</p>
        </div>

      </div>

      <!-- Elenco — só aparece se tiver dados -->
      <!-- NÃO mude id="elenco-lista" -->
      <div class="detalhe-secao">
        <h2>Elenco</h2>
        <div class="elenco-lista" id="elenco-lista">
          <p class="carregando">Carregando elenco...</p>
        </div>
      </div>

      <!-- Similares — só aparece se tiver dados -->
      <!-- NÃO mude id="similares-lista" -->
      <div class="detalhe-secao">
        <h2>Títulos Similares</h2>
        <div class="cards-row" id="similares-lista">
          <p class="carregando">Carregando...</p>
        </div>
      </div>

    </div>
  `;
}

// ── 3. CARREGAR ELENCO ──────────────────────────
// Busca o elenco separadamente e coloca em id="elenco-lista"
async function carregarElenco() {
  const dados = await buscarDados(`/${itemTipo}/${itemId}/credits`);
  const elenco = dados.cast ? dados.cast.slice(0, 10) : [];

  if (elenco.length === 0) {
    document.getElementById("elenco-lista").innerHTML =
      "<p>Elenco não disponível.</p>";
    return;
  }

  // PODE mudar o HTML do card de ator aqui
  document.getElementById("elenco-lista").innerHTML = elenco
    .map(function (ator) {
      const foto = ator.profile_path
        ? "https://image.tmdb.org/t/p/w185" + ator.profile_path
        : "https://via.placeholder.com/80x80/1a1a2e/aaa?text=?";
      return `
      <div class="ator-card">
        <img src="${foto}" alt="${ator.name}">
        <p class="ator-nome">${ator.name}</p>
        <p class="ator-personagem">${ator.character || ""}</p>
      </div>
    `;
    })
    .join("");
}

// ── 4. CARREGAR SIMILARES ───────────────────────
// Busca títulos similares e reutiliza preencherSecao() do app.js
async function carregarSimilares() {
  const dados = await buscarDados(`/${itemTipo}/${itemId}/similar`);

  if (!dados.results || dados.results.length === 0) {
    document.getElementById("similares-lista").innerHTML =
      "<p>Nenhum título similar encontrado.</p>";
    return;
  }

  preencherSecao("similares-lista", dados.results.slice(0, 10), itemTipo);
}

// ── 5. INICIAR ──────────────────────────────────
async function iniciar() {
  // Se não tiver id na URL, volta pra home
  if (!itemId || !itemTipo) {
    window.location.href = "index.html";
    return;
  }

  // Busca os dados do item pelo id
  const item = await buscarDados(`/${itemTipo}/${itemId}`);

  // Coloca o HTML na div id="detalhes-wrap" do HTML
  document.getElementById("detalhes-wrap").innerHTML = montarDetalhes(item);

  // Atualiza o título da aba do navegador
  document.title = `BrunoCine — ${itemTipo === "movie" ? item.title : item.name}`;

  // Busca elenco e similares depois (paralelo)
  carregarElenco();
  carregarSimilares();
}

document.addEventListener("DOMContentLoaded", iniciar);
