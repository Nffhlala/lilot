// Initialize Icons
lucide.createIcons();

// Navigation Logic
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
}

// Search Logic
let searchTimer;
function handleSearch() {
    clearTimeout(searchTimer);
    const query = document.getElementById('manga-search').value;
    const source = document.getElementById('source-selector').value;

    if (query.length < 3) return;

    searchTimer = setTimeout(async () => {
        const grid = document.getElementById('manga-grid');
        grid.innerHTML = '<div class="loader">Searching...</div>';
        
        try {
            const results = await Extensions[source].search(query);
            renderManga(results);
        } catch (e) {
            grid.innerHTML = '<p>Error loading data.</p>';
        }
    }, 500);
}

function renderManga(list) {
    const grid = document.getElementById('manga-grid');
    grid.innerHTML = list.map(m => `
        <div class="manga-card">
            <img src="${m.cover}" referrerpolicy="no-referrer">
            <div class="manga-title">${m.title}</div>
            <div class="source-tag">${m.source}</div>
        </div>
    `).join('');
}
const ICON_BASE = "https://raw.githubusercontent.com/keiyoushi/extensions/repo/icons/";
async function fetchExternalRepo() {
    const url = document.getElementById('repo-url').value;
    const market = document.getElementById('ext-market-list');
    
    market.innerHTML = '<div class="loader">Unpacking Keiyoushi Repo...</div>';
    
    try {
        const res = await fetch(PROXY + encodeURIComponent(url));
        const data = await res.json();
        
        market.innerHTML = data.map(ext => {
            // Kita check kalau kita dah ada logic scraper untuk site ni
            const isSupported = Extensions[ext.name.toLowerCase().replace(/\s/g, '')] ? true : false;
            
            return `
            <div class="ext-card">
                <img src="${ext.icon}" class="ext-icon" onerror="this.src='https://placehold.co/50'">
                <div class="ext-details">
                    <div class="ext-name">${ext.name}</div>
                    <div class="ext-ver">v${ext.version} • ${ext.lang.toUpperCase()}</div>
                </div>
                ${isSupported ? 
                    `<button onclick="installExt('${ext.name}')" class="add-btn">Add</button>` : 
                    `<button class="disabled-btn" title="Scraper not yet written">N/A</button>`
                }
            </div>
        `}).join('');
    } catch (e) {
        market.innerHTML = '<p style="color:red">Failed to load repository. Check CORS extension.</p>';
    }
}

function installExt(name) {
    const key = name.toLowerCase().replace(/\s/g, '');
    if (!installedExtensions.includes(key)) {
        installedExtensions.push(key);
        updateSourceSelector();
        alert(`${name} added to your sources!`);
    } else {
        alert(`${name} is already installed.`);
    }
}

function updateSourceSelector() {
    const selector = document.getElementById('source-selector');
    selector.innerHTML = installedExtensions.map(key => {
        const name = Extensions[key] ? Extensions[key].name : key;
        return `<option value="${key}">${name}</option>`;
    }).join('');
}
// --- THEME ENGINE ---
function setTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('zhenya-theme', themeName);
}

// Load theme masa mula
const savedTheme = localStorage.getItem('zhenya-theme') || 'default';
setTheme(savedTheme);

// --- READING LIST LOGIC ---
let readingList = JSON.parse(localStorage.getItem('zhenya-reading-list')) || [];

function toggleReadingList(manga) {
    const index = readingList.findIndex(item => item.id === manga.id);
    if (index === -1) {
        readingList.push(manga);
        alert("Added to Reading List!");
    } else {
        readingList.splice(index, 1);
        alert("Removed from Reading List.");
    }
    localStorage.setItem('zhenya-reading-list', JSON.stringify(readingList));
    renderReadingList();
}

function renderReadingList() {
    const grid = document.getElementById('reading-list-grid');
    if (readingList.length === 0) {
        grid.innerHTML = '<p style="opacity:0.5; padding:20px;">List kosong. Tambah manga kegemaran kau!</p>';
        return;
    }
    // Guna fungsi render yang sama macam biasa
    grid.innerHTML = readingList.map(m => `
        <div class="manga-card">
            <img src="${m.cover}" referrerpolicy="no-referrer">
            <div class="manga-title">${m.title}</div>
            <button onclick="toggleReadingList({id:'${m.id}'})" class="remove-btn">×</button>
        </div>
    `).join('');
}

// Panggil masa mula
renderReadingList();
function renderLibrary(list) {
    const grid = document.getElementById('manga-grid');
    grid.innerHTML = list.map(m => `
        <div class="manga-card" onclick="openManga('${m.id}')">
            <img src="${m.cover}" alt="${m.title}" loading="lazy" onerror="this.src='https://placehold.co/150x220'">
            <div class="manga-title">${m.title}</div>
        </div>
    `).join('');
}