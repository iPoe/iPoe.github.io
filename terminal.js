// Terminal Emulator for Personal Website
// Author: Abe Hou

// Content Data Structure (loaded from JSON)
let content = {};
let dataLoaded = false;

// Terminal State
let currentDirectory = '~';
let commandHistory = [];
let historyIndex = -1;

// Interactive list state
let interactiveMode = false;
let interactiveList = [];
let selectedIndex = 0;
let interactiveType = ''; // 'publications', 'experiences', 'blog'

// View State
let currentView = 'plain'; // 'terminal' or 'plain'
let currentTheme = 'light'; // 'dark' or 'light'
let currentLanguage = 'en'; // 'en' or 'es'
let currentPlainPage = 'me'; // current page in plain view

const translations = {
    en: {
        welcomeTitle: "Welcome to Leonardo's Personal Website",
        welcomeSubtitle: "Terminal Interface",
        helpPrompt: "Type 'help' for available commands, or 'ls' to list files.",
        updateTitle: "📢 UPDATE",
        updateText: "If you are interested in being part of a serious game study\nhit me up via email",
        commandNotFound: "Command not found",
        availableCommands: "Available commands:",
        helpFooter: "Type 'view <filename>' to open a file, or 'cd <directory>' to navigate.",
        filesAndDirs: "Available files and directories:",
        publications: "PUBLICATIONS",
        experiences: "EXPERIENCES",
        blog: "BLOG",
        availablePapers: "Available papers:",
        recentPosts: "Recent posts:",
        workExperience: "WORK EXPERIENCE:",
        education: "EDUCATION:",
        useViewToRead: "Use 'view <filename>' to read in detail.",
        useViewToReadPost: "Use 'view <filename>' to read a post.",
        interactiveHelp: "Use ↑/↓ or j/k to navigate, Enter to view, q to quit",
        authors: "Authors:",
        venue: "Venue:",
        organization: "Organization:",
        duration: "Duration:",
        date: "Date:",
        abstract: "ABSTRACT",
        description: "DESCRIPTION",
        links: "LINKS",
        home: "Home",
        changedDir: "Changed directory to",
        changedHome: "Changed to home directory",
        dirNotFound: "Directory not found",
        isNotDir: "is not a directory. Use 'view' to open it.",
        fileNotFound: "File not found",
        contentsOf: "Contents of",
        contactAndSocial: "Contact & Social",
        pressB: "Press b to go back, q to quit, ↑↓ or j/k to scroll",
        pressQ: "Press q to quit, ↑↓ or j/k to scroll",
        link: "Link",
        updateTitlePlain: "Update"
    },
    es: {
        welcomeTitle: "Bienvenido al sitio web personal de Leo",
        welcomeSubtitle: "Interfaz de Terminal",
        helpPrompt: "Escribe 'help' para ver comandos, o 'ls' para listar archivos.",
        updateTitle: "📢 ACTUALIZACIÓN",
        updateText: "Si estás interesado en participar en un estudio de juegos serios\ncontáctame por correo",
        commandNotFound: "Comando no encontrado",
        availableCommands: "Comandos disponibles:",
        helpFooter: "Escribe 'view <archivo>' para abrir, o 'cd <directorio>' para navegar.",
        filesAndDirs: "Archivos y directorios disponibles:",
        publications: "PUBLICACIONES",
        experiences: "EXPERIENCIAS",
        blog: "BLOG",
        availablePapers: "Artículos disponibles:",
        recentPosts: "Publicaciones recientes:",
        workExperience: "EXPERIENCIA LABORAL:",
        education: "EDUCACIÓN:",
        useViewToRead: "Usa 'view <archivo>' para leer en detalle.",
        useViewToReadPost: "Usa 'view <archivo>' para leer una publicación.",
        interactiveHelp: "Usa ↑/↓ o j/k para navegar, Enter para ver, q para salir",
        authors: "Autores:",
        venue: "Evento:",
        organization: "Organización:",
        duration: "Duración:",
        date: "Fecha:",
        abstract: "RESUMEN",
        description: "DESCRIPCIÓN",
        links: "ENLACES",
        home: "Inicio",
        changedDir: "Directorio cambiado a",
        changedHome: "Cambiado al directorio principal",
        dirNotFound: "Directorio no encontrado",
        isNotDir: "no es un directorio. Usa 'view' para abrirlo.",
        fileNotFound: "Archivo no encontrado",
        contentsOf: "Contenido de",
        contactAndSocial: "Contacto y Redes Sociales",
        pressB: "Presiona b para volver, q para salir, ↑↓ o j/k para desplazarse",
        pressQ: "Presiona q para salir, ↑↓ o j/k para desplazarse",
        link: "Enlace",
        updateTitlePlain: "Actualización"
    }
};

// DOM Elements
const terminalOutput = document.getElementById('terminal-output');
const terminalInput = document.getElementById('terminal-input');
const vimViewer = document.getElementById('vim-viewer');
const vimContent = document.getElementById('vim-content');
const terminalView = document.getElementById('terminal-view');
const plainView = document.getElementById('plain-view');
const plainContent = document.getElementById('plain-content');

// Detect mobile device
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
}

// Initialize view based on device and localStorage
function initializeView() {
    // Load preferences from localStorage
    const savedView = localStorage.getItem('preferredView');
    const savedTheme = localStorage.getItem('preferredTheme');
    const savedLanguage = localStorage.getItem('preferredLanguage');

    // Set language
    if (savedLanguage) {
        currentLanguage = savedLanguage;
    }
    updateLanguageToggleIcon();

    // Set theme - default is light
    if (savedTheme) {
        currentTheme = savedTheme;
    }
    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
        updateThemeToggleIcon();
    }

    // Set view - default to plain (web) view unless user has saved preference for terminal
    if (savedView) {
        currentView = savedView;
    }

    // Apply view
    if (currentView === 'plain') {
        switchToPlainView();
    } else {
        switchToTerminalView();
    }

    // Update toggle icon
    updateViewToggleIcon();
}

// Toggle theme
function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.classList.toggle('light-mode');

    updateThemeToggleIcon();

    localStorage.setItem('preferredTheme', currentTheme);
}

function updateThemeToggleIcon() {
    const themeBtn = document.getElementById('theme-toggle');
    const themeBtnTerminal = document.getElementById('theme-toggle-terminal');

    if (currentTheme === 'dark') {
        if (themeBtn) {
            themeBtn.querySelector('.icon').textContent = '☀️';
            themeBtn.querySelector('.label').textContent = 'Light';
        }
        if (themeBtnTerminal) {
            themeBtnTerminal.querySelector('.icon').textContent = '☀️';
            themeBtnTerminal.querySelector('.label').textContent = 'Light';
        }
    } else {
        if (themeBtn) {
            themeBtn.querySelector('.icon').textContent = '🌙';
            themeBtn.querySelector('.label').textContent = 'Dark';
        }
        if (themeBtnTerminal) {
            themeBtnTerminal.querySelector('.icon').textContent = '🌙';
            themeBtnTerminal.querySelector('.label').textContent = 'Dark';
        }
    }
}

// Toggle view
function toggleView() {
    currentView = currentView === 'terminal' ? 'plain' : 'terminal';

    if (currentView === 'plain') {
        switchToPlainView();
    } else {
        switchToTerminalView();
    }

    localStorage.setItem('preferredView', currentView);
    updateViewToggleIcon();
}

function updateViewToggleIcon() {
    // Update plain view button
    const viewBtn = document.getElementById('view-toggle');
    // Update terminal view button
    const viewBtnTerminal = document.getElementById('view-toggle-terminal');

    if (currentView === 'terminal') {
        if (viewBtn) {
            viewBtn.querySelector('.icon').textContent = '📄';
            viewBtn.querySelector('.label').textContent = 'Web';
        }
        if (viewBtnTerminal) {
            viewBtnTerminal.querySelector('.icon').textContent = '📄';
            viewBtnTerminal.querySelector('.label').textContent = 'Web';
        }
    } else {
        if (viewBtn) {
            viewBtn.querySelector('.icon').textContent = '💻';
            viewBtn.querySelector('.label').textContent = 'Terminal';
        }
        if (viewBtnTerminal) {
            viewBtnTerminal.querySelector('.icon').textContent = '💻';
            viewBtnTerminal.querySelector('.label').textContent = 'Terminal';
        }
    }
}

function updateLanguageToggleIcon() {
    const langBtns = [
        document.getElementById('lang-toggle'),
        document.getElementById('lang-toggle-terminal')
    ];

    langBtns.forEach(btn => {
        if (!btn) return;
        const label = btn.querySelector('.label');
        const icon = btn.querySelector('.icon');

        if (currentLanguage === 'en') {
            label.textContent = 'ES';
            icon.textContent = '🇪🇸';
            btn.title = "Switch to Spanish";
        } else {
            label.textContent = 'EN';
            icon.textContent = '🇺🇸';
            btn.title = "Switch to English";
        }
    });
}

function switchToPlainView() {
    terminalView.classList.add('hidden');
    plainView.classList.add('active');
    if (vimViewer) {
        vimViewer.classList.add('hidden');
    }
    loadPlainPage(currentPlainPage);
}

function switchToTerminalView() {
    terminalView.classList.remove('hidden');
    plainView.classList.remove('active');
    if (terminalInput) {
        terminalInput.focus();
    }
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'es' : 'en';
    localStorage.setItem('preferredLanguage', currentLanguage);

    updateLanguageToggleIcon();

    // Reload data and refresh view
    loadData().then(() => {
        if (currentView === 'terminal') {
            clearTerminal();
            displayWelcomeMessage();
        } else {
            loadPlainPage(currentPlainPage);
        }
    });

    // Update nav links text
    updateNavLinks();
}

function updateNavLinks() {
    const navLinks = document.querySelectorAll('.nav-link');
    const t = translations[currentLanguage];

    navLinks.forEach(link => {
        const page = link.dataset.page;
        if (page === 'me') link.textContent = t.home;
        else if (page === 'publications') link.textContent = t.publications.charAt(0) + t.publications.slice(1).toLowerCase();
        else if (page === 'experiences') link.textContent = currentLanguage === 'es' ? 'Experiencia' : 'Experience';
        else if (page === 'blog') link.textContent = t.blog.charAt(0) + t.blog.slice(1).toLowerCase();
    });
}
async function loadData() {
    try {
        const dataFiles = ['me', 'publications', 'experiences', 'blog'];
        const suffix = currentLanguage === 'es' ? '_es' : '';

        const promises = dataFiles.map(file =>
            fetch(`data/${file}${suffix}.json`)
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    return response.json();
                })
                .then(data => ({ name: file, data }))
        );

        const results = await Promise.all(promises);
        results.forEach(({ name, data }) => {
            content[name] = data;
        });

        // Generate dynamic summaries for directories
        generateSummaries();

        dataLoaded = true;
        return true;
    } catch (error) {
        console.error('Error loading data:', error);
        addOutput('Error loading content data. Please check console.', 'error');
        return false;
    }
}

// Generate dynamic summaries for directory views
// Generate dynamic summaries for directory views
function generateSummaries() {
    const t = translations[currentLanguage];
    // Generate publications summary
    if (content.publications && content.publications.files) {
        let summary = `
╔═══════════════════════════════════════════════════════════════╗
║                        ${t.publications.padEnd(31)}║
╚═══════════════════════════════════════════════════════════════╝

${t.availablePapers}
`;
        Object.entries(content.publications.files).forEach(([filename, fileData]) => {
            summary += `  • ${filename}\n\n ${fileData.authors}\n`;
        });
        summary += `\n${t.useViewToRead.replace('<filename>', Object.keys(content.publications.files)[0])}\n`;
        content.publications.summary = summary;
    }

    // Generate experiences summary
    if (content.experiences && content.experiences.files) {
        let summary = `
╔═══════════════════════════════════════════════════════════════╗
║                         ${t.experiences.padEnd(30)}║
╚═══════════════════════════════════════════════════════════════╝

`;
        const files = Object.entries(content.experiences.files);
        const positions = files.filter(([name]) => name.startsWith('position'));
        const education = files.filter(([name]) => name.startsWith('education'));

        if (positions.length > 0) {
            summary += `${t.workExperience}\n`;
            positions.forEach(([filename, fileData]) => {
                summary += `  • ${filename} - ${fileData.title}\n`;
            });
            summary += '\n';
        }

        if (education.length > 0) {
            summary += `${t.education}\n`;
            education.forEach(([filename, fileData]) => {
                const shortOrg = fileData.organization.split(' ').slice(0, 2).join(' ');
                summary += `  • ${filename} - ${fileData.title} (${shortOrg})\n`;
            });
        }

        summary += `\n${t.useViewToRead.replace('<filename>', Object.keys(content.experiences.files)[0])}\n`;
        content.experiences.summary = summary;
    }

    // Generate blog summary
    if (content.blog && content.blog.files) {
        let summary = `
╔═══════════════════════════════════════════════════════════════╗
║                            ${t.blog.padEnd(27)}║
╚═══════════════════════════════════════════════════════════════╝

${t.recentPosts}
`;
        Object.entries(content.blog.files).forEach(([filename, fileData]) => {
            summary += `  • ${filename} - ${fileData.title} (${fileData.date})\n`;
        });
        summary += `\n${t.useViewToReadPost.replace('<filename>', Object.keys(content.blog.files)[0])}\n`;
        content.blog.summary = summary;
    }
}

// Plain View Page Loader
function loadPlainPage(page) {
    currentPlainPage = page;

    // Render the specific content first
    let contentHtml = '';
    if (page === 'me') {
        contentHtml = getPlainMainContent();
    } else if (page === 'publications') {
        contentHtml = getPlainPublicationsContent();
    } else if (page === 'experiences') {
        contentHtml = getPlainExperiencesContent();
    } else if (page === 'blog') {
        contentHtml = getPlainBlogContent();
    }

    // Now wrap it in the industrial layout
    renderPlainLayout(contentHtml);
}

function renderPlainLayout(contentHtml) {
    const meData = content.me;
    const t = translations[currentLanguage];
    const plainView = document.getElementById('plain-view');

    if (!meData) return;

    let html = `
        <div class="blueprint-container">
            <div class="blueprint-grid">
                <div class="blueprint-masthead">
                    <div class="view-controls">
                        <button id="lang-toggle" class="control-btn" title="Toggle English/Spanish">
                            <span class="icon">${currentLanguage === 'en' ? '🇪🇸' : '🇺🇸'}</span>
                            <span class="label">${currentLanguage === 'en' ? 'ES' : 'EN'}</span>
                        </button>
                        <button id="theme-toggle" class="control-btn" title="Toggle Light/Dark Mode">
                            <span class="icon">${currentTheme === 'dark' ? '☀️' : '🌙'}</span>
                            <span class="label">${currentTheme === 'dark' ? 'Light' : 'Dark'}</span>
                        </button>
                        <button id="view-toggle" class="control-btn" title="Toggle Terminal/Plain View">
                            <span class="icon">🖥️</span>
                            <span class="label">Terminal</span>
                        </button>
                    </div>
                    
                    <nav class="plain-nav">
                        <a href="#" data-page="me" class="nav-link ${currentPlainPage === 'me' ? 'active' : ''}">${t.home}</a>
                        <a href="#" data-page="publications" class="nav-link ${currentPlainPage === 'publications' ? 'active' : ''}">${t.publications.charAt(0) + t.publications.slice(1).toLowerCase()}</a>
                        <a href="#" data-page="experiences" class="nav-link ${currentPlainPage === 'experiences' ? 'active' : ''}">${currentLanguage === 'es' ? 'Experiencia' : 'Experience'}</a>
                        <a href="#" data-page="blog" class="nav-link ${currentPlainPage === 'blog' ? 'active' : ''}">${t.blog.charAt(0) + t.blog.slice(1).toLowerCase()}</a>
                    </nav>

                    <div class="blueprint-label">IDENTITY_CORE</div>
                    <h1 class="name">${meData.name}</h1>
                    <div class="blueprint-title">${meData.title}</div>
                    ${currentPlainPage === 'me' ? `<div class="blueprint-bio">${meData.bio}</div>` : ''}
                </div>

                <div class="blueprint-content">
                    ${contentHtml}
                </div>
            </div>

            <div class="blueprint-footer">
                <div class="contact-node">
                    <div class="blueprint-label">CONTACT_PTR</div>
                    <a href="mailto:${meData.contact.email}">${meData.contact.email}</a>
                </div>
                <div class="social-links">
                    <a href="${meData.contact.github}" target="_blank">GITHUB_REPOSITORY</a>
                </div>
            </div>
        </div>
    `;

    plainView.innerHTML = html;
    setupPlainViewEventListeners();
}

function getPlainMainContent() {
    const meData = content.me;
    const t = translations[currentLanguage];
    if (!meData) return '';

    let html = `
        <div class="announcement">
            <div class="announcement-title">${t.updateTitlePlain}</div>
            <p>${t.updateText.replace('\n', ' ')}</p>
        </div>
    `;

    if (meData.blueprint) {
        meData.blueprint.forEach(section => {
            html += `
                <div class="blueprint-section">
                    <div class="section-tag">[${section.category}]</div>
                    <div class="blueprint-items">
            `;
            section.items.forEach(item => {
                html += `<div class="blueprint-item">${item}</div>`;
            });
            html += `</div></div>`;
        });
    } else {
        html += `<div class="main-content">${meData.content.split('\n').map(l => l.trim() ? `<p>${l}</p>` : '').join('')}</div>`;
    }
    return html;
}

function setupPlainViewEventListeners() {
    const langBtn = document.getElementById('lang-toggle');
    const themeBtn = document.getElementById('theme-toggle');
    const viewBtn = document.getElementById('view-toggle');

    if (langBtn) langBtn.addEventListener('click', toggleLanguage);
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    if (viewBtn) viewBtn.addEventListener('click', toggleView);

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.currentTarget.dataset.page;
            loadPlainPage(page);
        });
    });
}

function getPlainPublicationsContent() {
    const pubs = content.publications;
    if (!pubs || !pubs.files) return '';

    let html = `<div class="blueprint-section"><div class="section-tag">[SELECTED_PUBLICATIONS]</div><div class="blueprint-items">`;
    Object.entries(pubs.files).forEach(([filename, pub]) => {
        html += `
            <div class="blueprint-item">
                <div style="font-size: 1.25rem;">${pub.title}</div>
                <div style="font-size: 0.9rem; font-family: var(--font-mono); color: var(--industrial-muted);">${pub.venue}</div>
            </div>
        `;
    });
    html += `</div></div>`;
    return html;
}

function getPlainExperiencesContent() {
    const exps = content.experiences;
    if (!exps || !exps.files) return '';

    let html = `<div class="blueprint-section"><div class="section-tag">[PROFESSIONAL_JOURNEY]</div><div class="blueprint-items">`;
    Object.entries(exps.files).forEach(([filename, exp]) => {
        html += `
            <div class="blueprint-item">
                <div style="font-size: 1.25rem;">${exp.title}</div>
                <div style="font-size: 0.9rem; font-family: var(--font-mono); color: var(--industrial-muted);">${exp.organization} | ${exp.duration}</div>
                <div class="blueprint-item-description">${exp.description}</div>
            </div>
        `;
    });
    html += `</div></div>`;
    return html;
}

function getPlainBlogContent() {
    const blog = content.blog;
    if (!blog || !blog.files) return '';

    let html = `<div class="blueprint-section"><div class="section-tag">[FIELD_NOTES]</div><div class="blueprint-items">`;
    Object.entries(blog.files).forEach(([filename, post]) => {
        html += `
            <div class="blueprint-item">
                <div style="font-size: 1.25rem;">${post.title}</div>
                <div style="font-size: 0.9rem; font-family: var(--font-mono); color: var(--industrial-muted);">${post.date}</div>
                <div class="blueprint-post-content">${post.content}</div>
            </div>
        `;
    });
    html += `</div></div>`;
    return html;
}

// Initialize Terminal
async function init() {
    // Load data first
    if (terminalOutput) {
        addOutput('Loading content...', 'info');
    }
    const loaded = await loadData();

    if (!loaded) {
        if (terminalOutput) {
            addOutput('Failed to load content. Please refresh the page.', 'error');
        }
        return;
    }

    // Initialize view (must be after data is loaded)
    initializeView();

    // Terminal-specific initialization
    if (terminalOutput) {
        clearTerminal();
        displayWelcomeMessage();
        if (currentView === 'terminal') {
            terminalInput.focus();
        }
    }

    // Event listeners for toggles (both terminal and plain view buttons)
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('view-toggle').addEventListener('click', toggleView);
    document.getElementById('theme-toggle-terminal').addEventListener('click', toggleTheme);
    document.getElementById('view-toggle-terminal').addEventListener('click', toggleView);

    // Terminal event listeners
    if (terminalInput) {
        terminalInput.addEventListener('keydown', handleInput);
    }
    document.addEventListener('keydown', handleVimKeypress);

    // Plain view nav listeners
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            loadPlainPage(link.dataset.page);
        });
    });

    // Language toggle listeners
    document.getElementById('lang-toggle').addEventListener('click', toggleLanguage);
    document.getElementById('lang-toggle-terminal').addEventListener('click', toggleLanguage);

    // Keep terminal input focused when in terminal view
    document.addEventListener('click', () => {
        if (currentView !== 'terminal') return;
        if (!vimViewer.classList.contains('hidden')) return;
        if (terminalInput) {
            terminalInput.focus();
        }
    });
}

function displayWelcomeMessage() {
    const t = translations[currentLanguage];
    const welcome = `
╔═══════════════════════════════════════════════════════════════╗
║            ${t.welcomeTitle.padEnd(39)}║
║                      ${t.welcomeSubtitle.padEnd(33)}║
╚═══════════════════════════════════════════════════════════════╝

${t.helpPrompt}

`;
    addOutput(welcome, 'info');

    // Add announcement
    const announcement = `
┌─────────────────────────────────────────────────────────────────┐
│ ${t.updateTitle.padEnd(64)}│
├─────────────────────────────────────────────────────────────────┤
│ ${t.updateText.split('\n')[0].padEnd(64)}│
│ ${t.updateText.split('\n')[1].padEnd(64)}│
└─────────────────────────────────────────────────────────────────┘
`;
    addOutput(`<div class="terminal-announcement">${announcement}</div>`, 'info');

    executeCommand('ls');
}

function handleInput(e) {
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevent the Enter key from bubbling up
        e.stopPropagation(); // Stop event propagation

        const command = terminalInput.value.trim();
        if (command) {
            addOutput(`iPoe:~/personal_web$ ${command}`, 'command');
            commandHistory.push(command);
            historyIndex = commandHistory.length;
            executeCommand(command);
        } else {
            addOutput(`iPoe:~/personal_web$ `, 'command');
        }
        terminalInput.value = '';
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            terminalInput.value = commandHistory[historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            terminalInput.value = commandHistory[historyIndex];
        } else {
            historyIndex = commandHistory.length;
            terminalInput.value = '';
        }
    } else if (e.key === 'Tab') {
        e.preventDefault();
        autocomplete();
    }
}

function executeCommand(input) {
    const parts = input.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
        case 'help':
            showHelp();
            break;
        case 'ls':
            listFiles(args[0]);
            break;
        case 'cd':
            changeDirectory(args[0]);
            break;
        case 'view':
            viewFile(args.join(' '));
            break;
        case 'clear':
            clearTerminal();
            break;
        case 'pwd':
            addOutput(currentDirectory, 'info');
            break;
        case 'cat':
            viewFile(args.join(' '));
            break;
        case 'whoami':
            addOutput('iPoe', 'info');
            break;
        case 'date':
            addOutput(new Date().toString(), 'info');
            break;
        default:
            addOutput(`${translations[currentLanguage].commandNotFound}: ${command}. ${translations[currentLanguage].helpPrompt.split(',')[0]}.`, 'error');
    }

    scrollToBottom();
}

function showHelp() {
    const t = translations[currentLanguage];
    const help = `
${t.availableCommands}
───────────────────────────────────────────────────────────────
  ls [directory]       List files and directories
  cd <directory>       Change directory (main, publications, experiences, blog)
  view <file>          Open file in vim-style viewer
  cat <file>           Alias for 'view'
  pwd                  Print current directory
  clear                Clear terminal screen
  whoami               Display current user
  date                 Show current date and time
  help                 Show this help message
───────────────────────────────────────────────────────────────

Examples:
  ls                   # List all available files
  cd publications      # Navigate to publications directory
  view me              # View main page
  view publications    # Browse publications interactively
  view experiences     # Browse experiences interactively
  view blog            # Browse blog posts interactively

Interactive Navigation:
  ${t.interactiveHelp}
    ↑/↓ or j/k         Navigate between items
    Enter              View selected item
    b                  Go back to list (from item view)
    q                  Quit viewer
───────────────────────────────────────────────────────────────
`;
    addOutput(help, 'info');
}

function listFiles(dir) {
    const t = translations[currentLanguage];
    if (!dir) {
        // List root directory
        const output = `
${t.filesAndDirs}
  <span class="file">me</span>               About me and introduction
  <span class="directory">publications/</span>    My research publications
  <span class="directory">experiences/</span>     Professional and academic experience
  <span class="directory">blog/</span>            Blog posts and writings

${t.helpFooter}

Examples: 'view me' shows my introduction and contact information; 'view publications' shows my research publications.
`;
        addOutput(output, 'info');
    } else {
        const dirName = dir.replace('/', '');
        if (content[dirName] && content[dirName].type === 'directory') {
            const files = Object.keys(content[dirName].files);
            let output = `\n${t.contentsOf} ${dirName}/:\n`;
            files.forEach(file => {
                output += `  <span class="file">${file}</span>\n`;
            });
            output += `\nType 'view ${dirName}' to see summary, or 'view <filename>' for details.\n`;
            addOutput(output, 'info');
        } else {
            addOutput(`${t.dirNotFound}: ${dir}`, 'error');
        }
    }
}

function changeDirectory(dir) {
    if (!dir || dir === '~' || dir === '/') {
        currentDirectory = '~';
        updatePrompt();
        addOutput('Changed to home directory', 'success');
    } else if (dir === '..') {
        if (currentDirectory !== '~') {
            currentDirectory = '~';
            updatePrompt();
            addOutput('Changed to home directory', 'success');
        }
    } else {
        const dirName = dir.replace('/', '');
        if (content[dirName]) {
            if (content[dirName].type === 'directory') {
                currentDirectory = `~/${dirName}`;
                updatePrompt();
                addOutput(`${translations[currentLanguage].changedDir} ${dirName}`, 'success');
                listFiles(dirName);
            } else {
                addOutput(`${dirName} ${translations[currentLanguage].isNotDir}`, 'error');
            }
        } else {
            addOutput(`${translations[currentLanguage].dirNotFound}: ${dir}`, 'error');
        }
    }
}

function viewFile(filename) {
    if (!filename) {
        addOutput('Usage: view <filename>', 'error');
        return;
    }

    // Remove any trailing slashes
    filename = filename.replace(/\/$/, '');

    // Check if it's a me file
    if (filename === 'me' || filename === 'me.txt') {
        openVimViewer('me', content.me.content);
        return;
    }

    // Check if it's a directory summary - open interactive list
    if (content[filename] && content[filename].type === 'directory') {
        openInteractiveList(filename);
        return;
    }

    // Check in current directory if we're in one
    if (currentDirectory !== '~') {
        const dirName = currentDirectory.split('/')[1];
        const dir = content[dirName];
        if (dir && dir.files && dir.files[filename]) {
            const file = dir.files[filename];
            const formattedContent = formatFileContent(filename, file);
            openVimViewer(filename, formattedContent);
            return;
        }
    }

    // Search in all directories
    for (const [dirName, dirData] of Object.entries(content)) {
        if (dirData.type === 'directory' && dirData.files && dirData.files[filename]) {
            const file = dirData.files[filename];
            const formattedContent = formatFileContent(filename, file);
            openVimViewer(filename, formattedContent);
            return;
        }
    }

    addOutput(`${translations[currentLanguage].fileNotFound}: ${filename}`, 'error');
}

function formatFileContent(filename, file) {
    const t = translations[currentLanguage];
    if (file.title) {
        // Publication or Experience format
        let content = `═══════════════════════════════════════════════════════════════\n`;
        content += `${file.title}\n`;
        content += `═══════════════════════════════════════════════════════════════\n\n`;

        if (file.authors) {
            content += `${t.authors} ${file.authors.replace(/<strong>/g, '').replace(/<\/strong>/g, '')}\n`;
        }
        if (file.venue) {
            content += `${t.venue} ${file.venue}\n`;
        }
        if (file.organization) {
            content += `${t.organization} ${file.organization}\n`;
        }
        if (file.duration) {
            content += `${t.duration} ${file.duration}\n`;
        }
        if (file.date) {
            content += `${t.date} ${file.date}\n`;
        }

        content += `\n───────────────────────────────────────────────────────────────\n\n`;

        if (file.abstract) {
            content += `${t.abstract}\n\n${file.abstract}\n\n`;
        }
        if (file.description) {
            content += `${t.description}\n\n${file.description}\n\n`;
        }
        if (file.content) {
            content += `${file.content}\n\n`;
        }
        if (file.links) {
            content += `───────────────────────────────────────────────────────────────\n`;
            content += `${t.links}\n\n${file.links}\n`;
        }

        return content;
    }

    return JSON.stringify(file, null, 2);
}

function openInteractiveList(dirName) {
    interactiveMode = true;
    interactiveType = dirName;
    selectedIndex = 0;

    // Build list of items
    interactiveList = Object.entries(content[dirName].files);

    // Update help text
    document.querySelector('.vim-help').textContent = translations[currentLanguage].interactiveHelp;

    // Remove focus from terminal input so vim viewer can receive keypresses
    terminalInput.blur();

    // Display the interactive list
    displayInteractiveList();
}

function displayInteractiveList() {
    let displayContent = '';
    const t = translations[currentLanguage];

    if (interactiveType === 'publications') {
        displayContent = `═══════════════════════════════════════════════════════════════\n`;
        displayContent += `                        ${t.publications.padEnd(31)}                       \n`;
        displayContent += `═══════════════════════════════════════════════════════════════\n\n`;
        displayContent += `${t.interactiveHelp}\n\n`;
        displayContent += `───────────────────────────────────────────────────────────────\n\n`;

        interactiveList.forEach(([filename, fileData], index) => {
            const pointer = index === selectedIndex ? '→ ' : '  ';
            const highlight = index === selectedIndex ? '█ ' : '  ';
            displayContent += `${pointer}${highlight}${filename}\n\n`;
            displayContent += `   ${fileData.authors}\n\n`;
            displayContent += `───────────────────────────────────────────────────────────────\n\n`;
        });
    } else if (interactiveType === 'experiences') {
        displayContent = `═══════════════════════════════════════════════════════════════\n`;
        displayContent += `                         ${t.experiences.padEnd(30)}                       \n`;
        displayContent += `═══════════════════════════════════════════════════════════════\n\n`;
        displayContent += `${t.interactiveHelp}\n\n`;
        displayContent += `───────────────────────────────────────────────────────────────\n\n`;

        interactiveList.forEach(([filename, fileData], index) => {
            const pointer = index === selectedIndex ? '→ ' : '  ';
            displayContent += `${pointer}${fileData.title}\n`;
            displayContent += `   ${fileData.organization} | ${fileData.duration}\n\n`;
        });
    } else if (interactiveType === 'blog') {
        displayContent = `═══════════════════════════════════════════════════════════════\n`;
        displayContent += `                            ${t.blog.padEnd(27)}                               \n`;
        displayContent += `═══════════════════════════════════════════════════════════════\n\n`;
        displayContent += `${t.interactiveHelp}\n\n`;
        displayContent += `───────────────────────────────────────────────────────────────\n\n`;

        interactiveList.forEach(([filename, fileData], index) => {
            const pointer = index === selectedIndex ? '→ ' : '  ';
            displayContent += `${pointer}${fileData.title}\n`;
            displayContent += `   ${fileData.date}\n\n`;
        });
    }

    vimViewer.classList.remove('hidden');
    vimViewer.dataset.fromList = 'false'; // Reset the flag
    document.querySelector('.vim-filename').textContent = interactiveType;
    vimContent.textContent = displayContent;

    // Scroll to selected item
    scrollToSelectedItem();
    updateVimStatus();
}

function scrollToSelectedItem() {
    // Rough estimate: each item is about 4-5 lines, adjust as needed
    const itemHeight = interactiveType === 'publications' ? 150 : 80;
    const targetScroll = selectedIndex * itemHeight;
    vimContent.scrollTop = targetScroll;
}

function openVimViewer(filename, content) {
    const wasInteractive = interactiveMode;
    const preservedType = interactiveType;
    const preservedList = [...interactiveList];
    const preservedIndex = selectedIndex;

    interactiveMode = false;

    // Remove focus from terminal input so vim viewer can receive keypresses
    terminalInput.blur();

    vimViewer.classList.remove('hidden');
    document.querySelector('.vim-filename').textContent = filename;
    vimContent.innerHTML = content; // Use innerHTML to render HTML from me.json
    vimContent.scrollTop = 0;

    // Update help text - add back option if came from list
    const t = translations[currentLanguage];
    if (wasInteractive && preservedList.length > 0) {
        document.querySelector('.vim-help').textContent = t.pressB;
        // Store the list info so we can go back
        vimViewer.dataset.fromList = 'true';
        vimViewer.dataset.listType = preservedType;
        vimViewer.dataset.listIndex = preservedIndex;
    } else {
        document.querySelector('.vim-help').textContent = t.pressQ;
        vimViewer.dataset.fromList = 'false';
    }

    updateVimStatus();
}

function closeVimViewer() {
    vimViewer.classList.add('hidden');
    interactiveMode = false;
    interactiveList = [];
    selectedIndex = 0;
    terminalInput.focus();
}

function handleVimKeypress(e) {
    if (vimViewer.classList.contains('hidden')) return;

    if (e.key === 'q' || e.key === 'Escape') {
        e.preventDefault();
        closeVimViewer();
    } else if (e.key === 'b' && vimViewer.dataset.fromList === 'true') {
        // Go back to the interactive list
        e.preventDefault();
        const listType = vimViewer.dataset.listType;
        const listIndex = parseInt(vimViewer.dataset.listIndex) || 0;

        interactiveMode = true;
        interactiveType = listType;
        selectedIndex = listIndex;
        interactiveList = Object.entries(content[listType].files);

        document.querySelector('.vim-help').textContent = translations[currentLanguage].interactiveHelp;
        displayInteractiveList();
    } else if (interactiveMode) {
        // Interactive list navigation
        if (e.key === 'j' || e.key === 'ArrowDown') {
            e.preventDefault();
            if (selectedIndex < interactiveList.length - 1) {
                selectedIndex++;
                displayInteractiveList();
            }
        } else if (e.key === 'k' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (selectedIndex > 0) {
                selectedIndex--;
                displayInteractiveList();
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            // Open the selected item
            const [filename, fileData] = interactiveList[selectedIndex];
            const formattedContent = formatFileContent(filename, fileData);
            openVimViewer(filename, formattedContent);
        } else if (e.key === 'g') {
            e.preventDefault();
            selectedIndex = 0;
            displayInteractiveList();
        } else if (e.key === 'G') {
            e.preventDefault();
            selectedIndex = interactiveList.length - 1;
            displayInteractiveList();
        }
    } else {
        // Regular vim-style scrolling
        if (e.key === 'j' || e.key === 'ArrowDown') {
            e.preventDefault();
            vimContent.scrollTop += 40;
            updateVimStatus();
        } else if (e.key === 'k' || e.key === 'ArrowUp') {
            e.preventDefault();
            vimContent.scrollTop -= 40;
            updateVimStatus();
        } else if (e.key === 'g') {
            e.preventDefault();
            vimContent.scrollTop = 0;
            updateVimStatus();
        } else if (e.key === 'G') {
            e.preventDefault();
            vimContent.scrollTop = vimContent.scrollHeight;
            updateVimStatus();
        } else if (e.key === 'd') {
            e.preventDefault();
            vimContent.scrollTop += vimContent.clientHeight / 2;
            updateVimStatus();
        } else if (e.key === 'u') {
            e.preventDefault();
            vimContent.scrollTop -= vimContent.clientHeight / 2;
            updateVimStatus();
        }
    }
}

function updateVimStatus() {
    const scrollPercent = Math.round((vimContent.scrollTop / (vimContent.scrollHeight - vimContent.clientHeight)) * 100) || 0;
    document.getElementById('vim-status').textContent = `${scrollPercent}%`;
}

function addOutput(text, className = '') {
    const line = document.createElement('div');
    line.className = `output-line ${className}`;
    line.innerHTML = text;
    terminalOutput.appendChild(line);
}

function clearTerminal() {
    terminalOutput.innerHTML = '';
}

function scrollToBottom() {
    terminalOutput.parentElement.scrollTop = terminalOutput.parentElement.scrollHeight;
}

function updatePrompt() {
    const prompts = document.querySelectorAll('.prompt');
    prompts.forEach(prompt => {
        prompt.textContent = `iPoe:${currentDirectory}$ `;
    });
}

function autocomplete() {
    const input = terminalInput.value.trim();
    const parts = input.split(/\s+/);

    if (parts.length === 1) {
        // Complete command
        const commands = ['help', 'ls', 'cd', 'view', 'clear', 'pwd', 'cat', 'whoami', 'date'];
        const matches = commands.filter(cmd => cmd.startsWith(parts[0]));
        if (matches.length === 1) {
            terminalInput.value = matches[0] + ' ';
        }
    } else if (parts.length === 2 && (parts[0] === 'cd' || parts[0] === 'view' || parts[0] === 'ls')) {
        // Complete filename/directory
        const dirs = ['me', 'publications', 'experiences', 'blog'];
        const matches = dirs.filter(dir => dir.startsWith(parts[1]));
        if (matches.length === 1) {
            terminalInput.value = parts[0] + ' ' + matches[0];
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
