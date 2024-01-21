// Easier query selector

function qs(arg) {
    return document.querySelector('.'+arg);
}

// Load in academic details

const academic = qs('academics');

fetch('data-en/academic.json')
.then(myData => myData.json())
.then(jsonData => academicFn(jsonData));

function academicFn(jsonData) {
    let j = 0;
    for (let i = jsonData.length - 1; i >= 0; i--) {
        j++;
        academic.innerHTML += 
        `
        <li class="timeline-item mb-5">
            <h5 class="fw-bold">${jsonData[i].school}</h5>
            <p class="text-muted mb-2 fw-bold">${jsonData[i].startYear}-${jsonData[i].endYear}</p>
            <p class="text-muted">
                ${jsonData[i].description}
            </p>
        </li>
        `;
    }
}

// Load in experiences

const experience = qs('experiences');

fetch('data-en/experience.json')
.then(myData => myData.json())
.then(jsonData => experiences(jsonData));

function experiences(jsonData) {
    let years = [];

    for (let i = jsonData.length - 1; i >= 0; i--) {
        if (!years.includes(jsonData[i].year)) {
            years.push(jsonData[i].year);
            experience.innerHTML += 
            `
            <div class="single-timeline-area">
                <div class="timeline-date wow fadeInLeft" data-wow-delay="0.1s" style="visibility: visible; animation-delay: 0.1s; animation-name: fadeInLeft;">
                    <p>${jsonData[i].year}</p>
                </div>
                <div class="row year-${jsonData[i].year}">
                    
                </div>
            </div>
            `
        }
    }

    years.forEach((year) => 
        {
            for (let i = 0; i < jsonData.length; i++) {
                if (jsonData[i].year == year) {
                    qs(`year-${year}`).innerHTML += 
                    `
                    <div class="col-12 col-md-6 col-lg-4">
                        <div class="single-timeline-content d-flex wow fadeInLeft" data-wow-delay="0.3s" style="visibility: visible; animation-delay: 0.3s; animation-name: fadeInLeft;">
                            <div class="timeline-icon"><i class="bi bi-${jsonData[i].icon}" aria-hidden="true"></i></div>
                            <div class="timeline-text">
                                <h6>${jsonData[i].company}</h6>
                                <p>
                                    <span class="text-muted">
                                        ${jsonData[i].startDate} - ${jsonData[i].endDate}
                                    </span>
                                    <br>
                                    ${jsonData[i].description}
                                </p>
                            </div>
                        </div>
                    </div>
                    `
                }
            }
        }
    )
}

// Load in skills

const skill = qs('skills');

fetch('data-en/skills.json')
.then(myData => myData.json())
.then(jsonData => skills(jsonData));

function skills(jsonData) {
    let j = 0;
    for (let i = 0; i < jsonData.length; i++) {
        j++;
        skill.innerHTML += 
        `
        <span>${jsonData[i].name}</span>
        <div class="progress">
            <div class="progress-bar" role="progressbar" style="width: ${jsonData[i].amount}%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        `;
    }
}