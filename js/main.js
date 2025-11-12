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

    items.forEach((it, idx) => {
        const item = document.createElement('article');
        item.className = 'timeline-item card mb-4';
        item.innerHTML = `
            <div class="timeline-marker" aria-hidden="true"><i class="bi bi-${it.icon}" aria-hidden="true"></i></div>
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <h3 class="h5 mb-1">${it.company}</h3>
                        <div class="text-muted small">${it.startDate || ''} — ${it.endDate || ''}</div>
                    </div>
                </div>
                <p class="mb-1">${it.description || ''}</p>
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
};

// Initialize timeline after UI text and age are set
document.addEventListener('DOMContentLoaded', () => {
    loadExperienceTimeline();
});