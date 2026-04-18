// ================================================
// index.js — Lógica específica da página HOME
// ================================================
// Esse arquivo só roda na index.html.
// Ele usa as funções do app.js (que é carregado antes).

// ── 1. HERO (DESTAQUE PRINCIPAL) ───────────────
// O hero é aquela área grande no topo com um destaque.
// Vamos pegar filmes em alta e mostrar o primeiro como destaque.



async function carregarHero() {
  // Busca os filmes em alta da semana
  const dados = await buscarDados("/trending/movie/week");
  const filmes = dados.results;

  // Pega o primeiro filme da lista pra usar no hero
  const destaque = filmes[0];

  // A imagem de fundo (backdrop) é maior e mais paisagem que o poster
  // Usamos w1280 pra ter boa qualidade no hero
  const backdrop = destaque.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${destaque.backdrop_path}`
    : "";

  // Pega o elemento hero e coloca a imagem como fundo via JavaScript
  const heroEl = document.getElementById("hero");
  heroEl.style.backgroundImage = `url(${backdrop})`;

  // Preenche o texto dentro do hero
  document.getElementById("hero-info").innerHTML = `
    <span class="hero-tag">Em Destaque</span>
    <h1>${destaque.title}</h1>
    <p>${destaque.overview}</p>
    <a href="detalhes.html?id=${destaque.id}&tipo=movie" class="btn-hero">Ver Detalhes</a>
  `;
}

// ── 2. CARREGAR SEÇÕES ─────────────────────────
// Cada função busca uma categoria e chama preencherSecao() do app.js

async function carregarFilmesPopulares() {
  const dados = await buscarDados("/movie/popular");
  // dados.results é a lista de filmes
  // Pegamos só os 10 primeiros com .slice(0, 10)
  preencherSecao("filmes-populares", dados.results.slice(0, 10), "movie");
}

async function carregarSeriesPopulares() {
  const dados = await buscarDados("/tv/popular");
  preencherSecao("series-populares", dados.results.slice(0, 10), "tv");
}

async function carregarTopAvaliados() {
  const dados = await buscarDados("/movie/top_rated");
  preencherSecao("top-avaliados", dados.results.slice(0, 10), "movie");
}

// ── 3. INICIAR TUDO ────────────────────────────
// Essa função chama todas as outras acima quando a página abre.

async function iniciar() {
  await carregarHero();
  await carregarFilmesPopulares();
  await carregarSeriesPopulares();
  await carregarTopAvaliados();
}

// Esse evento dispara quando o HTML terminou de carregar.
// É aqui que a gente começa a rodar o JavaScript com segurança,
// pois garante que todos os elementos (divs, sections) já existem na página.
document.addEventListener("DOMContentLoaded", iniciar);
