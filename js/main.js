// Animated Text

const animationText = document.querySelector('.animation');
let animationTextLength;

function prepare() {
    let localText = '';
    animationTextLength = animationText.innerText.length;
    for (let i = 0; i < animationText.innerText.length; i++) {
        localText += `<span class="letter-${i} letter">${animationText.innerText.charAt(i)}</span>`;
    }
    animationText.innerHTML = localText;
}

function animate() {
    let rand = Math.round(Math.random()*200 + 55);
    let rand2 = Math.round(Math.random()*200 + 55);
    let rand3 = Math.round(Math.random()*200 + 55);
    let color = `rgb(${rand}, ${rand2}, ${rand3})`;
    for (i = 0; i < animationTextLength; i++) {
        let letter = document.querySelector(`.letter-${i}`)
        setTimeout(function() {letter.style.color = color}, i * 100);
        setTimeout(function() {letter.style.color = 'inherit'}, i * 100 + 600);
    }
    setTimeout(animate, i*200 + 1000);
}

if (animationText) {
    setTimeout(prepare, 800);
    setTimeout(animate, 1000);
}

// Fill UI text
const uiTextElements = document.querySelectorAll('[data-ui-text]');

async function loadUIText() {
    try {
        const res = await fetch('data/ui-text.json');
        if (!res.ok) throw new Error(`Failed to fetch UI text: ${res.status}`);
        const texts = await res.json();

        uiTextElements.forEach(el => {
            const key = el.dataset.uiText;
            if (!key) return;
            // support dot notation like "nav.home"
            const value = key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined) ? obj[k] : undefined, texts);
            if (value !== undefined) el.textContent = value;
        });
    } catch (err) {
        console.error('Error loading UI text:', err);
    }
};

loadUIText();

// Calculate age

function calculateAge(birthDate) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

const birthDate = new Date(2004, 6, 5); // July 5, 2004 (months are 0-indexed)
const age = calculateAge(birthDate);
const ageElements = document.querySelectorAll('[data-age]');

ageElements.forEach(el => el.textContent = age);

// Timeline rendering for experiences
async function loadExperienceTimeline() {
    try {
        const res = await fetch('data/experience.json');
        if (!res.ok) throw new Error(`Failed to fetch experience: ${res.status}`);
        const experiences = await res.json();
        renderTimeline(experiences);
    } catch (err) {
        console.error('Error loading experiences:', err);
        const container = document.getElementById('timeline-items');
        if (container) container.innerHTML = '<p class="text-danger">Could not load experience data.</p>';
    }
}

function renderTimeline(items) {
    const container = document.getElementById('timeline-items');
    if (!container) return;
    // Sort by year descending then by id
    items.sort((a, b) => (b.year || 0) - (a.year || 0) || (b.id || 0) - (a.id || 0));

    container.innerHTML = '';

    const iconMap = {
        hammer: 'bi-hammer',
        shop: 'bi-shop',
        'cash-coin': 'bi-cash-coin',
        star: 'bi-star-fill',
        'egg-fried': 'bi-egg-fried',
        terminal: 'bi-terminal',
        telephone: 'bi-telephone'
    };

    const skillIconMap = {
        headset: 'bi-headset',
        users: 'bi-people-fill',
        megaphone: 'bi-megaphone',
        'cash-coin': 'bi-cash-coin',
        muscle: 'bi-activity',
        'party-popper': 'bi-balloon',
        'shoe-prints': 'bi-bag',
        clock: 'bi-clock',
        broom: 'bi-broom',
        code: 'bi-code',
        mobile: 'bi-phone',
        lightbulb: 'bi-lightbulb',
        gear: 'bi-gear',
        check: 'bi-check'
    };

    items.forEach((it, idx) => {
        const iconCls = iconMap[it.icon] || (`bi-${it.icon}`) || 'bi-briefcase';
        const item = document.createElement('article');
        item.className = 'timeline-item card mb-4';

        // build skills HTML
        let skillsHtml = '';
        if (it.skills && typeof it.skills === 'object') {
            skillsHtml = '<div class="skills" role="list">';
            Object.entries(it.skills).forEach(([label, iconName]) => {
                const ic = skillIconMap[iconName] || ('bi-' + (iconName || 'circle'));
                skillsHtml += `
                    <button type="button" class="skill" role="listitem" aria-label="${escapeHtml(label)}" data-skill="${escapeHtml(label)}" aria-expanded="false">
                        <i class="bi ${ic}" aria-hidden="true"></i>
                        <span class="skill-tooltip">${escapeHtml(label)}</span>
                    </button>`;
            });
            skillsHtml += '</div>';
        }

        item.innerHTML = `
            <div class="timeline-marker" aria-hidden="true"><i class="bi ${iconCls}" aria-hidden="true"></i></div>
            <div class="card-body d-flex flex-column flex-md-row gap-3">
                <div class="job-content flex-fill">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h3 class="h5 mb-1">${escapeHtml(it.company)}</h3>
                            <div class="text-muted small">${escapeHtml(it.startDate || '')} — ${escapeHtml(it.endDate || '')}</div>
                        </div>
                    </div>
                    <p class="mb-1">${escapeHtml(it.description || '')}</p>
                </div>
                ${skillsHtml}
            </div>
        `;

        container.appendChild(item);
    });

    // Add intersection observer for reveal animation
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) e.target.classList.add('in-view');
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.timeline-item').forEach(el => obs.observe(el));

    // Skill tooltip interaction: on touch/click toggle .show, on hover CSS handles tooltip
    document.querySelectorAll('.skill').forEach(btn => {
        // close others when opening
        btn.addEventListener('click', (e) => {
            const isShown = btn.classList.toggle('show');
            btn.setAttribute('aria-expanded', isShown ? 'true' : 'false');
            // close other open ones
            document.querySelectorAll('.skill.show').forEach(other => {
                if (other !== btn) {
                    other.classList.remove('show');
                    other.setAttribute('aria-expanded', 'false');
                }
            });
            e.stopPropagation();
        });
    });

    // close skill tooltips when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.skill.show').forEach(s => {
            s.classList.remove('show');
            s.setAttribute('aria-expanded', 'false');
        });
    });
};

// Initialize timeline after UI text and age are set
document.addEventListener('DOMContentLoaded', () => {
    loadExperienceTimeline();
    loadAcademic();
    loadSkills();
});

// Academic list rendering
async function loadAcademic() {
    try {
        const res = await fetch('data/academic.json');
        if (!res.ok) throw new Error(`Failed to fetch academic: ${res.status}`);
        const items = await res.json();
        renderAcademic(items);
    } catch (err) {
        console.error('Error loading academic:', err);
        const container = document.getElementById('academic-list');
        if (container) container.innerHTML = '<p class="text-danger">Could not load academic data.</p>';
    }
}

function renderAcademic(items) {
    const container = document.getElementById('academic-list');
    if (!container) return;

    // sort by startYear descending
    items.sort((a,b) => (b.startYear || 0) - (a.startYear || 0));
    container.innerHTML = '';

    items.forEach(it => {
        const el = document.createElement('div');
        el.className = 'academic-item';
        el.innerHTML = `
            <h4>${escapeHtml(it.school)} — <small class="text-muted">${escapeHtml(it.study)}</small></h4>
            <div class="meta">${escapeHtml(it.startYear || '')} — ${escapeHtml(it.endYear || '')}</div>
            <div class="description">${escapeHtml(it.description || '')}</div>
        `;
        container.appendChild(el);
    });
}

function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Skills rendering
async function loadSkills() {
    try {
        const res = await fetch('data/skills.json');
        if (!res.ok) throw new Error(`Failed to fetch skills: ${res.status}`);
        const data = await res.json();
        renderSkills(data);
    } catch (err) {
        console.error('Error loading skills:', err);
        const techContainer = document.getElementById('tech-icons');
        const skillsContainer = document.getElementById('skills-list');
        if (techContainer) techContainer.innerHTML = '<p class="text-danger">Could not load skills data.</p>';
        if (skillsContainer) skillsContainer.innerHTML = '';
    }
}

function renderSkills(data) {
    // Render tech icons (hexagons)
    const techContainer = document.getElementById('tech-icons');
    if (techContainer && data.icons) {
        techContainer.innerHTML = '';
        data.icons.forEach(tech => {
            const hexContainer = document.createElement('div');
            hexContainer.className = 'hexagon-container';
            hexContainer.setAttribute('title', escapeHtml(tech.name));
            hexContainer.innerHTML = `
                <div class="hexagon">
                    <i class="${escapeHtml(tech.icon)}" aria-hidden="true"></i>
                </div>
                <div class="hexagon-label">${escapeHtml(tech.name)}</div>
            `;
            techContainer.appendChild(hexContainer);
        });
    }

    // Render skills (progress bars)
    const skillsContainer = document.getElementById('skills-list');
    if (skillsContainer && data.skills) {
        skillsContainer.innerHTML = '';
        data.skills.forEach(skill => {
            const skillItem = document.createElement('div');
            skillItem.className = 'skill-item';
            skillItem.innerHTML = `
                <div class="skill-name">${escapeHtml(skill.name)}</div>
                <div class="progress-bar-container" role="progressbar" aria-label="${escapeHtml(skill.name)}" aria-valuenow="${skill.level}" aria-valuemin="0" aria-valuemax="100">
                    <div class="progress-bar-fill" style="width: ${skill.level}%"></div>
                </div>
            `;
            skillsContainer.appendChild(skillItem);
        });

        // Add intersection observer for progress bar animation
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('in-view');
                }
            });
        }, { threshold: 0.3 });

        document.querySelectorAll('.skill-item').forEach(el => obs.observe(el));
    }
}
