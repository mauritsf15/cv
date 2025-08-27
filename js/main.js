document.addEventListener('DOMContentLoaded', () => {

    // ---=== DOM Element Selection ===---
    const themeToggle = document.getElementById('theme-toggle');
    const languageToggle = document.getElementById('language-toggle');
    const mainView = document.getElementById('main-view');
    const navButtons = document.querySelectorAll('.nav-button');
    const appContainer = document.getElementById('app-container'); // Corrected container reference
    const backButtons = document.querySelectorAll('.back-button');

    // ---=== State Management ===---
    let currentLanguage = localStorage.getItem('language') || 'nl'; // Default to Dutch
    let currentTheme = localStorage.getItem('theme') || 'light'; // Default to light

    // ---=== Core Functions ===---

    /**
     * Fetches all JSON data for a given language and populates the page.
     * @param {string} lang - The language code ('nl' or 'en').
     */
    async function loadContent(lang) {
        try {
            const basePath = lang === 'en' ? 'data-en' : 'data';
            const [uiRes, expRes, eduRes, skillsRes] = await Promise.all([
                fetch(`${basePath}/ui-text.json`),
                fetch(`${basePath}/experience.json`),
                fetch(`${basePath}/academic.json`),
                fetch(`${basePath}/skills.json`)
            ]);

            // Check if any response is not OK
            if (!uiRes.ok || !expRes.ok || !eduRes.ok || !skillsRes.ok) {
                throw new Error(`HTTP error! Could not fetch data from ${basePath}`);
            }

            const uiText = await uiRes.json();
            const experience = await expRes.json();
            const education = await eduRes.json();
            const skills = await skillsRes.json();
            
            document.documentElement.lang = lang; // Set HTML lang attribute
            populateUiText(uiText);
            populateExperience(experience);
            populateEducation(education);
            populateSkills(skills);

        } catch (error) {
            console.error("Failed to load content:", error);
            // Display error inside the main view to be safe
            mainView.innerHTML = `<p style="text-align: center; color: red; padding: 2rem;">Error loading content. Please check if the <code>/data</code> and <code>/data-en</code> directories and their JSON files exist and are correct.</p>`;
        }
    }

    /**
     * Populates all static UI text from the ui-text.json object.
     * @param {object} data - The UI text data object.
     */
    function populateUiText(data) {
        document.querySelectorAll('[data-key]').forEach(elem => {
            const key = elem.dataset.key;
            if (data[key]) {
                 // Special handling for about text with newlines
                if (key === 'about_text') {
                    document.getElementById('about-text').innerHTML = data[key].replace(/\n/g, '<br>');
                } else {
                    elem.textContent = data[key];
                }
            }
        });
    }

    /**
     * Populates the work experience section.
     * @param {Array<object>} data - The array of experience objects.
     */
    function populateExperience(data) {
        const list = document.getElementById('experience-list');
        list.innerHTML = data.map(item => `
            <div class="list-item">
                <div class="item-header">
                    <h3>${item.company}</h3>
                    <span class="date">${item.startDate} - ${item.endDate}</span>
                </div>
                <p class="item-subtitle">${item.jobTitle || ''}</p>
                <p class="item-description">${item.description}</p>
            </div>
        `).join('');
    }

    /**
     * Populates the education section.
     * @param {Array<object>} data - The array of academic objects.
     */
    function populateEducation(data) {
        const list = document.getElementById('education-list');
        list.innerHTML = data.map(item => `
            <div class="list-item">
                <div class="item-header">
                    <h3>${item.school}</h3>
                    <span class="date">${item.startYear} - ${item.endYear}</span>
                </div>
                <p class="item-subtitle">${item.study}</p>
                <p class="item-description">${item.description}</p>
            </div>
        `).join('');
    }

    /**
     * Populates the skills section.
     * @param {Array<object>} data - The array of skill objects.
     */
    function populateSkills(data) {
        const grid = document.getElementById('skills-list');
        grid.innerHTML = data.map(skill => `
            <div class="skill-item">
                <p class="skill-name">${skill.name}</p>
                <div class="skill-bar">
                    <div class="skill-level" style="width: 0%;" data-level="${skill.amount}"></div>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Animates skill bars when their section becomes visible.
     */
    function animateSkills() {
        document.querySelectorAll('.skill-level').forEach(bar => {
            const level = bar.dataset.level;
            // Use a short timeout to ensure the transition is applied correctly after the view slides in
            setTimeout(() => {
                bar.style.width = `${level}%`;
            }, 200); 
        });
    }
    
    /**
     * Resets skill bar animations so they can re-animate next time.
     */
    function resetSkills() {
        document.querySelectorAll('.skill-level').forEach(bar => {
            bar.style.width = `0%`;
        });
    }


    /**
     * Applies a theme and saves it to localStorage.
     * @param {string} theme - 'light' or 'dark'.
     */
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        currentTheme = theme;
        localStorage.setItem('theme', theme);
    }

    // ---=== Event Listeners ===---

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        applyTheme(currentTheme === 'light' ? 'dark' : 'light');
    });

    // Language Toggle
    languageToggle.addEventListener('click', () => {
        currentLanguage = currentLanguage === 'nl' ? 'en' : 'nl';
        localStorage.setItem('language', currentLanguage);
        loadContent(currentLanguage); // Reload all content with the new language
    });

    // Navigation from Main Menu
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                mainView.classList.add('slide-out');
                targetSection.classList.add('active');
                
                // If navigating to the skills section, trigger animations
                if(targetId === 'skills-section') {
                    animateSkills();
                }
            }
        });
    });

    // Navigation using Back Buttons
    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            const activeSection = document.querySelector('.content-section.active');
            
            if (activeSection) {
                mainView.classList.remove('slide-out');
                activeSection.classList.remove('active');

                // If leaving the skills section, reset the bars
                if(activeSection.id === 'skills-section') {
                    resetSkills();
                }
            }
        });
    });

    // ---=== Initialization ===---
    function init() {
        applyTheme(currentTheme);
        loadContent(currentLanguage);
    }

    init();
});