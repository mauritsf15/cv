// State Management
const state = {
    currentLanguage: localStorage.getItem('language') || 'nl',
    currentTheme: localStorage.getItem('theme') || 'light',
    currentSection: 'home',
    data: {
        nl: {},
        en: {}
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Apply saved theme
    if (state.currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    
    // Apply saved language to toggle
    const langToggle = document.querySelector('.language-toggle');
    if (state.currentLanguage === 'en') {
        langToggle.classList.add('en');
    }
    
    // Load initial content
    await loadContent(state.currentLanguage);
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize skill bars after a short delay
    setTimeout(() => {
        animateSkillBars();
    }, 500);
}

// Main content loading function
async function loadContent(language) {
    const basePath = language === 'en' ? 'data-en' : 'data';
    
    try {
        // Show loading state
        document.body.classList.add('loading');
        
        // Fetch all JSON files
        const [uiText, experience, academic, skills] = await Promise.all([
            fetch(`${basePath}/ui-text.json`).then(r => r.json()),
            fetch(`${basePath}/experience.json`).then(r => r.json()),
            fetch(`${basePath}/academic.json`).then(r => r.json()),
            fetch(`${basePath}/skills.json`).then(r => r.json())
        ]);
        
        // Store data
        state.data[language] = {
            uiText,
            experience,
            academic,
            skills
        };
        
        // Update UI text
        updateUIText(uiText);
        
        // Update dynamic content
        updateExperience(experience);
        updateEducation(academic);
        updateSkills(skills);
        
        // Update current language
        state.currentLanguage = language;
        localStorage.setItem('language', language);
        
    } catch (error) {
        console.error('Error loading content:', error);
        // Fallback: create sample data if files not found
        createSampleData(language);
    } finally {
        document.body.classList.remove('loading');
    }
}

// Update UI text based on data-key attributes
function updateUIText(uiText) {
    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.getAttribute('data-key');
        if (uiText[key]) {
            element.textContent = uiText[key];
        }
    });
}

// Update experience section
function updateExperience(experienceData) {
    const container = document.querySelector('.experience-list');
    container.innerHTML = '';
    
    // Reverse the array to show latest first
    [...experienceData].reverse().forEach(exp => {
        const item = document.createElement('div');
        item.className = 'experience-item';
        item.innerHTML = `
            <div class="experience-header">
                <h3 class="experience-company">${exp.company}</h3>
                <span class="experience-dates">${exp.startDate} - ${exp.endDate}</span>
            </div>
            <p class="experience-description">${exp.description}</p>
        `;
        container.appendChild(item);
    });
}

// Update education section
function updateEducation(academicData) {
    const container = document.querySelector('.education-list');
    container.innerHTML = '';
    
    // Reverse the array to show latest first
    [...academicData].reverse().forEach(edu => {
        const item = document.createElement('div');
        item.className = 'education-item';
        item.innerHTML = `
            <div class="education-header">
                <div>
                    <h3 class="education-school">${edu.school}</h3>
                    <p class="education-study">${edu.study}</p>
                </div>
                <span class="education-years">${edu.startYear} - ${edu.endYear}</span>
            </div>
            <p class="education-description">${edu.description}</p>
        `;
        container.appendChild(item);
    });
}

// Update skills section
function updateSkills(skillsData) {
    const container = document.querySelector('.skills-list');
    container.innerHTML = '';
    
    skillsData.forEach(skill => {
        const item = document.createElement('div');
        item.className = 'skill-item';
        item.innerHTML = `
            <div class="skill-header">
                <span class="skill-name">${skill.name}</span>
                <span class="skill-percentage">${skill.amount}%</span>
            </div>
            <div class="skill-bar">
                <div class="skill-progress" data-percentage="${skill.amount}"></div>
            </div>
        `;
        container.appendChild(item);
    });
    
    // Re-animate skill bars if on skills page
    if (state.currentSection === 'skills') {
        setTimeout(animateSkillBars, 100);
    }
}

// Animate skill bars
function animateSkillBars() {
    document.querySelectorAll('.skill-progress').forEach(bar => {
        const percentage = bar.getAttribute('data-percentage');
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = percentage + '%';
        }, 100);
    });
}

// Set up all event listeners
function setupEventListeners() {
    // Theme toggle
    document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);
    
    // Language toggle
    document.querySelector('.language-toggle').addEventListener('click', toggleLanguage);
    
    // Navigation buttons
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const targetSection = e.target.getAttribute('data-section');
            navigateToSection(targetSection);
        });
    });
    
    // Back buttons
    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', () => {
            navigateToSection('home');
        });
    });
}

// Theme toggle function
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    state.currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', state.currentTheme);
}

// Language toggle function
async function toggleLanguage() {
    const langToggle = document.querySelector('.language-toggle');
    const newLanguage = state.currentLanguage === 'nl' ? 'en' : 'nl';
    
    langToggle.classList.toggle('en');
    await loadContent(newLanguage);
}

// Navigation function
function navigateToSection(sectionId) {
    const currentSection = document.querySelector('.section.active');
    const targetSection = document.getElementById(sectionId);
    
    if (!targetSection || currentSection.id === sectionId) return;
    
    // Add transitioning class to body for shape animations
    document.body.classList.add('section-transitioning');
    
    // Slide out current section
    currentSection.classList.add('slide-out-left');
    currentSection.classList.remove('active');
    
    // Slide in target section
    setTimeout(() => {
        currentSection.classList.remove('slide-out-left');
        targetSection.classList.add('active');
        state.currentSection = sectionId;
        
        // Animate skill bars if navigating to skills
        if (sectionId === 'skills') {
            setTimeout(animateSkillBars, 300);
        }
        
        // Remove transitioning class
        setTimeout(() => {
            document.body.classList.remove('section-transitioning');
        }, 500);
    }, 300);
}

// Create sample data if JSON files are not available
function createSampleData(language) {
    const sampleData = {
        nl: {
            uiText: {
                name: "Maurits Fokkens",
                job_title: "Software Ontwikkelaar",
                nav_experience: "Ervaring",
                nav_education: "Opleiding",
                nav_skills: "Vaardigheden",
                nav_projects: "Projecten",
                nav_about: "Over Mij",
                about_title: "Over Mij",
                about_text: "Hallo! Ik ben een gepassioneerde software ontwikkelaar.\nIk hou van het creëren van mooie en functionele web applicaties.",
                projects_title: "Mijn Projecten"
            },
            experience: [
                {
                    id: 1,
                    company: "Tech Bedrijf NL",
                    startDate: "Jan 2020",
                    endDate: "Heden",
                    description: "Full-stack ontwikkeling van web applicaties met moderne technologieën.",
                    year: 2020
                },
                {
                    id: 2,
                    company: "Startup XYZ",
                    startDate: "Jun 2018",
                    endDate: "Dec 2019",
                    description: "Frontend ontwikkeling en UI/UX design voor diverse projecten.",
                    year: 2018
                }
            ],
            academic: [
                {
                    id: 1,
                    school: "Technische Universiteit",
                    study: "Computer Science",
                    startYear: "2014",
                    endYear: "2018",
                    description: "Bachelor in Computer Science met focus op web technologieën."
                }
            ],
            skills: [
                { id: 1, name: "JavaScript", amount: 90 },
                { id: 2, name: "HTML/CSS", amount: 95 },
                { id: 3, name: "React", amount: 85 },
                { id: 4, name: "Node.js", amount: 80 },
                { id: 5, name: "Python", amount: 75 }
            ]
        },
        en: {
            uiText: {
                name: "Maurits Fokkens",
                job_title: "Software Developer",
                nav_experience: "Experience",
                nav_education: "Education",
                nav_skills: "Skills",
                nav_projects: "Projects",
                nav_about: "About Me",
                about_title: "About Me",
                about_text: "Hello! I'm a passionate software developer.\nI love creating beautiful and functional web applications.",
                projects_title: "My Projects"
            },
            experience: [
                {
                    id: 1,
                    company: "Tech Company NL",
                    startDate: "Jan 2020",
                    endDate: "Present",
                    description: "Full-stack development of web applications using modern technologies.",
                    year: 2020
                },
                {
                    id: 2,
                    company: "Startup XYZ",
                    startDate: "Jun 2018",
                    endDate: "Dec 2019",
                    description: "Frontend development and UI/UX design for various projects.",
                    year: 2018
                }
            ],
            academic: [
                {
                    id: 1,
                    school: "Technical University",
                    study: "Computer Science",
                    startYear: "2014",
                    endYear: "2018",
                    description: "Bachelor in Computer Science with focus on web technologies."
                }
            ],
            skills: [
                { id: 1, name: "JavaScript", amount: 90 },
                { id: 2, name: "HTML/CSS", amount: 95 },
                { id: 3, name: "React", amount: 85 },
                { id: 4, name: "Node.js", amount: 80 },
                { id: 5, name: "Python", amount: 75 }
            ]
        }
    };
    
    const data = sampleData[language];
    state.data[language] = data;
    
    updateUIText(data.uiText);
    updateExperience(data.experience);
    updateEducation(data.academic);
    updateSkills(data.skills);
}