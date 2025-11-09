const API_KEY = "823cf7814b84832fbf2d3703535ef5d0"; // 🔑 Replace with your GNews API key
const BASE_URL = "https://gnews.io/api/v4";
const newsContainer = document.getElementById("news-container");
const categoryButtons = document.querySelectorAll(".category");
const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-input");
const loadMoreBtn = document.getElementById("load-more-btn");

let currentCategory = "general";
let currentPage = 1;

// ===== Initial Load =====
fetchLatestNews("general");

// ===== Category Switching =====
categoryButtons.forEach(button => {
  button.addEventListener("click", () => {
    categoryButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    currentCategory = button.dataset.category;
    currentPage = 1;
    fetchLatestNews(currentCategory);
  });
});

// ===== Fetch Latest News =====
export async function handler(event, context) {
  const { category = "general", q = "" } = event.queryStringParameters;

  const API_KEY = process.env.GNEWS_API_KEY;
  const BASE_URL = "https://gnews.io/api/v4";

  const url = q
    ? `${BASE_URL}/search?q=${encodeURIComponent(q)}&lang=en&sortby=publishedAt&apikey=${API_KEY}`
    : `${BASE_URL}/top-headlines?category=${category}&lang=en&country=us&sortby=publishedAt&apikey=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to fetch news" }) };
  }
}

// ===== Display News =====
function displayNews(articles) {
  if (!articles || articles.length === 0) {
    newsContainer.innerHTML = "<p>No articles found.</p>";
    return;
  }
  newsContainer.innerHTML = articles.map(article => `
    <div class="article">
      <img src="${article.image || 'https://via.placeholder.com/400x200'}" alt="news" />
      <div class="article-content">
        <h3>${article.title}</h3>
        <p>${article.description || ""}</p>
        <small>🕒 ${new Date(article.publishedAt).toLocaleString()}</small><br/>
        <a href="${article.url}" target="_blank">Read More →</a>
      </div>
    </div>
  `).join("");
}

// ===== Load More Button =====
loadMoreBtn.addEventListener("click", async () => {
  currentPage++;
  const response = await fetch(
    `${BASE_URL}/top-headlines?category=${currentCategory}&lang=en&country=us&sortby=publishedAt&page=${currentPage}&apikey=${API_KEY}`
  );
  const data = await response.json();
  if (data.articles && data.articles.length > 0) {
    const newArticles = data.articles.map(article => `
      <div class="article">
        <img src="${article.image || 'https://via.placeholder.com/400x200'}" alt="news" />
        <div class="article-content">
          <h3>${article.title}</h3>
          <p>${article.description || ""}</p>
          <small>🕒 ${new Date(article.publishedAt).toLocaleString()}</small><br/>
          <a href="${article.url}" target="_blank">Read More →</a>
        </div>
      </div>
    `).join("");
    newsContainer.insertAdjacentHTML("beforeend", newArticles);
  } else {
    loadMoreBtn.style.display = "none";
  }
});

// ===== Search =====
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) searchNews(query);
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const query = searchInput.value.trim();
    if (query) searchNews(query);
  }
});

async function searchNews(query) {
  newsContainer.innerHTML = `<p>Searching latest for "${query}"...</p>`;
  try {
    const response = await fetch(
      `${BASE_URL}/search?q=${encodeURIComponent(query)}&lang=en&sortby=publishedAt&apikey=${API_KEY}`
    );
    const data = await response.json();
    displayNews(data.articles);
  } catch {
    newsContainer.innerHTML = "<p>❌ Search failed.</p>";
  }
}


// ===== Auto Refresh Every 5 Minutes =====
setInterval(() => fetchLatestNews(currentCategory), 5 * 60 * 1000);

