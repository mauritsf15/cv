function qs(arg) {
    return document.querySelector('.'+arg);
}

function randHex() {
    one = Math.random() * 200 + 1;
    two = Math.random() * 201 + 1;
    three = Math.random() * 202 + 53;
    return `${one}, ${two}, ${three}`
}

const academic = qs('academics');

fetch('data/academic.json')
.then(myData => myData.json())
.then(jsonData => academicFn(jsonData));

function academicFn(jsonData) {
    let j = 0;
    for (let i = jsonData.length - 1; i >= 0; i--) {
        j++;
        academic.innerHTML += 
        `
        <h4>${jsonData[i].school}</h4>
        <h6 class="text-secondary">${jsonData[i].startYear}-${jsonData[i].endYear} | ${jsonData[i].description}</h6>
        `;
        if (j != jsonData.length) {
            console.log(i);
            academic.innerHTML += '<hr>'
        }
    }
}

const experience = qs('experiences');

fetch('data/experience.json')
.then(myData => myData.json())
.then(jsonData => experiences(jsonData));

function experiences(jsonData) {
    let j = 0;
    for (let i = jsonData.length - 1; i >= 0; i--) {
        j++;
        experience.innerHTML += 
        `
        <div class="card">
            <h4>${jsonData[i].company}</h4>
            <h6 class="text-secondary">${jsonData[i].startDate}-${jsonData[i].endDate}</h6>
            <hr>
            <p>${jsonData[i].description}</p>
        </div>
        `;
    }
}

const skill = qs('skills');

fetch('data/skills.json')
.then(myData => myData.json())
.then(jsonData => skills(jsonData));

function skills(jsonData) {
    let j = 0;
    for (let i = 0; i < jsonData.length; i++) {
        j++;
        skill.innerHTML += 
        `
        <div class="progress">
            <div class="progress-bar" role="progressbar" style="width: ${jsonData[i].amount}%; background-color: rgb(${randHex()}) !important" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">${jsonData[i].name}</div>
        </div>
        `;
    }
}