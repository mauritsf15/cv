// Navigation and Section Management
const mainNav = document.getElementById('main-nav');
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.content-section');
const closeBtns = document.querySelectorAll('.close-btn');

// Navigation Click Handlers
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const targetSection = item.getAttribute('data-section');
        showSection(targetSection);
    });
});

// Close Button Click Handlers
closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        hideAllSections();
        showMainNav();
    });
});

// Show specific section
function showSection(sectionId) {
    hideMainNav();
    setTimeout(() => {
        const section = document.getElementById(sectionId);
        section.classList.add('active');
        
        // Load content for dynamic sections
        if (sectionId === 'experience') {
            loadExperience();
        } else if (sectionId === 'education') {
            loadEducation();
        } else if (sectionId === 'skills') {
            loadSkills();
        }
    }, 300);
}

// Hide all sections
function hideAllSections() {
    sections.forEach(section => {
        section.classList.remove('active');
    });
}

// Show main navigation
function showMainNav() {
    setTimeout(() => {
        mainNav.classList.add('active');
    }, 300);
}

// Hide main navigation
function hideMainNav() {
    mainNav.classList.remove('active');
}

// Load Experience Data
async function loadExperience() {
    try {
        const response = await fetch('data/experience.json');
        const data = await response.json();
        
        const timeline = document.getElementById('experience-timeline');
        timeline.innerHTML = '';
        
        // Group by year
        const groupedData = data.reduce((acc, item) => {
            if (!acc[item.year]) {
                acc[item.year] = [];
            }
            acc[item.year].push(item);
            return acc;
        }, {});
        
        // Sort years in descending order
        const years = Object.keys(groupedData).sort((a, b) => b - a);
        
        years.forEach(year => {
            // Add year header
            const yearHeader = document.createElement('div');
            yearHeader.className = 'timeline-year';
            yearHeader.textContent = year;
            timeline.appendChild(yearHeader);
            
            // Add items for this year
            groupedData[year].forEach(item => {
                const timelineItem = createTimelineItem(
                    item.company,
                    `${item.startDate} - ${item.endDate}`,
                    item.description
                );
                timeline.appendChild(timelineItem);
            });
        });
    } catch (error) {
        console.error('Error loading experience:', error);
        // Fallback content
        document.getElementById('experience-timeline').innerHTML = `
            <div class="timeline-year">2023</div>
            <div class="timeline-item">
                <div class="timeline-content">
                    <h3>Senior Full Stack Developer</h3>
                    <p class="date">Jan 2023 - Present</p>
                    <p>Leading development of cloud-based solutions and mentoring junior developers.</p>
                </div>
            </div>
            <div class="timeline-year">2022</div>
            <div class="timeline-item">
                <div class="timeline-content">
                    <h3>Full Stack Developer</h3>
                    <p class="date">Mar 2022 - Dec 2022</p>
                    <p>Developed and maintained multiple web applications using modern JavaScript frameworks.</p>
                </div>
            </div>
        `;
    }
}

// Load Education Data
async function loadEducation() {
    try {
        const response = await fetch('data/academic.json');
        const data = await response.json();
        
        const timeline = document.getElementById('education-timeline');
        timeline.innerHTML = '';
        
        data.forEach(item => {
            const timelineItem = createTimelineItem(
                item.school,
                `${item.startYear} - ${item.endYear}`,
                item.study + (item.description ? '. ' + item.description : '')
            );
            timeline.appendChild(timelineItem);
        });
    } catch (error) {
        console.error('Error loading education:', error);
        // Fallback content
        document.getElementById('education-timeline').innerHTML = `
            <div class="timeline-item">
                <div class="timeline-content">
                    <h3>University of Technology</h3>
                    <p class="date">2018 - 2022</p>
                    <p>B.Sc. Computer Science - Graduated with honors</p>
                </div>
            </div>
            <div class="timeline-item">
                <div class="timeline-content">
                    <h3>Tech Academy</h3>
                    <p class="date">2017 - 2018</p>
                    <p>Full Stack Web Development Bootcamp</p>
                </div>
            </div>
        `;
    }
}

// Load Skills Data
async function loadSkills() {
    try {
        const response = await fetch('data/skills.json');
        const data = await response.json();
        
        const container = document.getElementById('skills-container');
        container.innerHTML = '';
        
        data.forEach(skill => {
            const skillItem = createSkillItem(skill.name, skill.amount);
            container.appendChild(skillItem);
        });
        
        // Animate skill bars after a short delay
        setTimeout(() => {
            const progressBars = container.querySelectorAll('.skill-progress');
            progressBars.forEach((bar, index) => {
                setTimeout(() => {
                    bar.style.width = bar.getAttribute('data-percentage') + '%';
                }, index * 100);
            });
        }, 100);
    } catch (error) {
        console.error('Error loading skills:', error);
        // Fallback content
        const fallbackSkills = [
            { name: 'JavaScript', amount: 90 },
            { name: 'React', amount: 85 },
            { name: 'Node.js', amount: 80 },
            { name: 'CSS/SASS', amount: 85 },
            { name: 'Python', amount: 75 },
            { name: 'MongoDB', amount: 70 }
        ];
        
        const container = document.getElementById('skills-container');
        container.innerHTML = '';
        
        fallbackSkills.forEach(skill => {
            const skillItem = createSkillItem(skill.name, skill.amount);
            container.appendChild(skillItem);
        });
        
        // Animate skill bars
        setTimeout(() => {
            const progressBars = container.querySelectorAll('.skill-progress');
            progressBars.forEach((bar, index) => {
                setTimeout(() => {
                    bar.style.width = bar.getAttribute('data-percentage') + '%';
                }, index * 100);
            });
        }, 100);
    }
}

// Helper function to create timeline items
function createTimelineItem(title, date, description) {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    
    item.innerHTML = `
        <div class="timeline-content">
            <h3>${title}</h3>
            <p class="date">${date}</p>
            <p>${description}</p>
        </div>
    `;
    
    return item;
}

// Helper function to create skill items
function createSkillItem(name, percentage) {
    const item = document.createElement('div');
    item.className = 'skill-item';
    
    item.innerHTML = `
        <div class="skill-header">
            <span class="skill-name">${name}</span>
            <span class="skill-percentage">${percentage}%</span>
        </div>
        <div class="skill-bar">
            <div class="skill-progress" data-percentage="${percentage}"></div>
        </div>
    `;
    
    return item;
}

// Initialize - Show main nav on load
document.addEventListener('DOMContentLoaded', () => {
    showMainNav();
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const activeSection = document.querySelector('.content-section.active');
        if (activeSection) {
            hideAllSections();
            showMainNav();
        }
    }
});

// Touch gesture support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipeGesture();
});

function handleSwipeGesture() {
    const swipeThreshold = 50;
    const activeSection = document.querySelector('.content-section.active');
    
    if (touchEndX < touchStartX - swipeThreshold && mainNav.classList.contains('active')) {
        // Swipe left on main nav - could open first section
    } else if (touchEndX > touchStartX + swipeThreshold && activeSection) {
        // Swipe right on any section - go back to main nav
        hideAllSections();
        showMainNav();
    }
}