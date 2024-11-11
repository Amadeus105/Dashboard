// Fetch articles from JSON file
async function fetchArticles() {
    try {
        const response = await fetch('articles.json');
        const data = await response.json();
        return data.articles;
    } catch (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
}

fetch('articles.json')
  .then(response => response.json())
  .then(data => {
      // Loop through data and display articles dynamically
  });

// Function to calculate reading time
function calculateReadingTime(wordCount) {
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
}

// Function to render articles with images included
function renderArticles(sortedArticles, view = 'grid') {
    const articleList = document.getElementById('articleList');
    if (!articleList) return;

    articleList.innerHTML = '';
    articleList.className = view === 'grid' ? 'row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4' : 'row row-cols-1 g-4';

    sortedArticles.forEach((article, index) => {
        const articleElement = document.createElement('div');
        articleElement.className = 'col';

        articleElement.innerHTML = `
            <div class="card h-100 animate-text" style="animation-delay: ${index * 0.1}s">
                <img src="${article.image}" class="card-img-top" alt="${article.title}">
                <div class="card-body">
                    <h5 class="card-title">${article.title}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${article.category} | ${article.date}</h6>
                    <p class="card-text">${article.content.substring(0, 100)}...</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted views-count" data-article-id="${article.id}">${article.views} views</small>
                        <small class="text-muted">${calculateReadingTime(article.wordCount)}</small>
                    </div>
                    <button class="btn btn-primary mt-3 read-more" data-article-id="${article.id}">Read More</button>
                </div>
            </div>
        `;
        articleList.appendChild(articleElement);
    });

    // Add event listeners to "Read More" buttons
    document.querySelectorAll('.read-more').forEach(button => {
        button.addEventListener('click', () => openArticleModal(button.dataset.articleId));
    });
}



// Function to open article modal with image displayed and update view count
function openArticleModal(articleId) {
    const article = articles.find(a => a.id === parseInt(articleId));
    if (article) {
        // Increment view count
        article.views++;
        
        const modalTitle = document.querySelector('#articleModal .modal-title');
        const modalBody = document.querySelector('#articleModal .modal-body');
        
        modalTitle.textContent = article.title;
        modalBody.innerHTML = `
            <img src="${article.image}" class="img-fluid mb-3" alt="${article.title}">
            <h6 class="text-muted mb-3">${article.category} | ${article.date}</h6>
            <p>${article.content}</p>
            <div class="mt-3">
                <small class="text-muted views-count" data-article-id="${article.id}">${article.views} views</small>
                <small class="text-muted"> | ${calculateReadingTime(article.wordCount)}</small>
            </div>
        `;
        
        // Update view count in the article list
        const articleViewCount = document.querySelector(`.views-count[data-article-id="${article.id}"]`);
        if (articleViewCount) {
            articleViewCount.textContent = `${article.views} views`;
        }
        
        const modal = new bootstrap.Modal(document.getElementById('articleModal'));
        modal.show();
    }
}

// Function to render categories in the navbar dropdown
function renderCategories(articles) {
    const categoryDropdownMenu = document.getElementById('categoryDropdownMenu');
    if (!categoryDropdownMenu) return; // Ensure dropdown exists on the current page

    const categories = [...new Set(articles.map(article => article.category))];
    categoryDropdownMenu.innerHTML = '';

    categories.forEach((category) => {
        const categoryItem = document.createElement('li');
        categoryItem.className = 'dropdown-item';
        categoryItem.textContent = category;
        categoryItem.addEventListener('click', () => filterByCategory(category));
        categoryDropdownMenu.appendChild(categoryItem);
    });
}

// Function to filter articles by category
function filterByCategory(category) {
    const filteredArticles = articles.filter(article => article.category === category);
    renderArticles(filteredArticles);
}

// Function to handle live search as the user types
// Function to handle live search as the user types
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const filteredArticles = articles.filter(article => 
        article.title.toLowerCase().includes(searchTerm) || 
        article.content.toLowerCase().includes(searchTerm)
    );
    renderArticles(filteredArticles);

    // If no results, display a "No results found" message
    if (filteredArticles.length === 0) {
        document.getElementById('articleList').innerHTML = `<p class="text-center mt-3">No results found for "${searchTerm}".</p>`;
    }
}

// Add event listener to the search input
const searchInput = document.querySelector('input[type="search"]');
if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
}


// Dark mode toggle functionality
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    document.getElementById('sidebar').classList.toggle('sidebar-dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));

    const darkModeIcon = document.getElementById('darkModeIcon');
    darkModeIcon.classList.toggle('bi-moon');
    darkModeIcon.classList.toggle('bi-sun');
}

// Initialize the dashboard
let articles = [];
let currentView = 'grid';

async function initDashboard() {
    articles = await fetchArticles();
    const sortSelect = document.getElementById('sortSelect');
    const toggleViewBtn = document.getElementById('toggleViewBtn');
    const searchInput = document.querySelector('input[type="search"]');
    const darkModeToggle = document.getElementById('darkModeToggle');

    // Initialize categories dropdown if it exists
    if (document.getElementById('categoryDropdownMenu')) {
        renderCategories(articles);
    }
    
    renderArticles(articles);

    // Sorting functionality
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const sortedArticles = [...articles].sort((a, b) => {
                if (e.target.value === 'date') {
                    return new Date(b.date) - new Date(a.date);
                } else {
                    return b.views - a.views;
                }
            });
            renderArticles(sortedArticles);
        });
    }

    // View toggle functionality
    if (toggleViewBtn) {
        toggleViewBtn.addEventListener('click', () => {
            currentView = currentView === 'grid' ? 'list' : 'grid';
            renderArticles(articles, currentView);
        });
    }

    // Live search functionality
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Dark mode toggle
    if (darkModeToggle) {
        darkModeToggle.checked = localStorage.getItem('darkMode') === 'true';
        darkModeToggle.addEventListener('change', toggleDarkMode);
    }

    // Initialize with correct dark mode
    if (localStorage.getItem('darkMode') === 'true') {
        toggleDarkMode();
    }
}

// Sidebar toggle
function toggleSidebar() { 
    const sidebar = document.getElementById('sidebar'); 
    sidebar.classList.toggle('open');
}

// Attach event listener to sidebar toggle button
const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener('click', toggleSidebar);
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initDashboard);