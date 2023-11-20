if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('../service-worker.js')
            .then(reg => console.log('Service Worker: Registered'))
            .catch(err => console.log(`Service Worker: Error: ${err}`))
    });
}
// Element references
const otn = document.getElementById('otn');
const dep = document.getElementById('dep');
const datePicker = document.getElementById('date');
const btnSet = document.getElementById('set');
const btnReset = document.getElementById('new');
const inp = document.getElementById('input');
const wagonSection = document.getElementById('wagons');
const locoSection = document.getElementById('locos');
const wagonCounter = document.getElementById('count');
const saveMail = document.getElementById('saveMail');
const modal = document.getElementById("modalSettings");
const cog = document.getElementById("set");
const span = document.getElementsByClassName("close")[0];
// Create numpad event listeners
var keys = document.getElementById('numpad').children;
for (let key of keys) {
    key.onclick = function() {
        const value = key.innerHTML;
        switch (value) {
            case '*':
                mark();
                break;
            case 'C':
                corr();
                break;
            case 'TOM':
                createMail(false);
                break;
            case 'LAST':
                createMail(true);
                break;
            default:
                enter(value);
                break;
        }
    }
}
// Clear train
btnReset.onclick = function() {
    if (confirm('Bekräfta ny vagnsupptagning?')) {
        newTrain();
    }
}
// Enter digit, '.' or 'T'
function enter(n) {
    if (inp.classList.contains('valid')) {
        inp.classList = '';
        inp.innerHTML = n;
    } else {
        inp.innerHTML += n;
        validate();
    }
}
// Check only numbers for wagon or '.' or 'T' for loco
function validate() {
    const value = inp.innerHTML;
    if (value.length === 4 && /^\d+$/.test(value)) {
        valid(value,wagonSection);
    } else if (value.length === 7) {
        valid(value,locoSection);
    }
}
// Create object div
function valid(value,section) {
    if (getWagons().includes(value)) {
        alert('Wagon already added!');
        inp.innerHTML = inp.innerHTML.slice(0,-1);
    } else {
        section.innerHTML += '<div onclick="rm(this)">' + value + '</div>';
        inp.classList.add('valid');
        if (section == locoSection) {
            saveLocos();
        } else {
            saveWagons();
            countWagons();
        }
    }
}
// Returns array of wagon numbers
function getWagons() {
    let wagons = [];
    let divs = wagonSection.children;
    for (const div of divs) {
        wagons.push(div.innerHTML);
    }
    return wagons;
}
// Update counter
function countWagons() {
    wagonCounter.innerHTML = wagonSection.childElementCount;
}
// Mark wagon
function mark() {
    if (inp.classList.contains('valid')) {
        if (inp.classList.contains('caution')) {
            inp.classList.remove('caution');
            if (inp.innerHTML.length > 4) {
                locoSection.lastChild.classList.remove('caution');
            } else {
                wagonSection.lastChild.classList.remove('caution');
            }
        } else {
            inp.classList.add('caution');
            if (inp.innerHTML.length > 4) {
                locoSection.lastChild.classList.add('caution');
            } else {
                wagonSection.lastChild.classList.add('caution');
            }
        }
    }
    saveWagons();
}
// Correct input
function corr() {
    if (inp.innerHTML.length > 0) {
        if (inp.classList.length !== 0) { // valid or marked === vehicle added, so remove
            if (inp.innerHTML.length > 4) { // loco
                locoSection.lastChild.remove();
                saveLocos();
            } else { // wagon
                wagonSection.lastChild.remove();
                saveWagons();
                countWagons();
            }
        }
        inp.innerHTML = inp.innerHTML.slice(0,-1);
        inp.classList = '';
    }
}
// Remove vehicle
function rm(vehicle) {
    if (confirm('Remove ' + vehicle.innerHTML + '?')) {
        vehicle.remove();
        saveLocos();
        saveWagons();
        countWagons();
    }
}
// Flip wagon order
function reverse() {
    const list = wagonSection;
    let divs = [];
    for (let i = 0; i < list.children.length; i++) {
        divs[i] = list.children[i];
    }
    list.innerHTML = '';
    for (let i = divs.length-1; i > -1; i--) {
        list.innerHTML += divs[i].outerHTML;
    }
    inp.innerHTML = '';
    inp.classList = '';
    saveWagons();
}
// Save to local storage
function saveOtn() {
    localStorage.setItem('otn', otn.value);
}
function saveDep() {
    localStorage.setItem('dep', dep.value);
}
function saveWagons() {
    localStorage.setItem('wagons', wagonSection.innerHTML);
}
function saveLocos() {
    localStorage.setItem('locos', locoSection.innerHTML);
}
function loadTrain() {
    otn.value = localStorage.getItem('otn');
    dep.value = localStorage.getItem('dep');
    locoSection.innerHTML = localStorage.getItem('locos');
    wagonSection.innerHTML = localStorage.getItem('wagons');
    countWagons();
}
function newTrain() {
    localStorage.removeItem('otn');
    localStorage.removeItem('dep');
    localStorage.removeItem('locos');
    localStorage.removeItem('wagons');

    otn.value = '';
    dep.value = '';
    locoSection.innerHTML = '';
    wagonSection.innerHTML = '';
    datePicker.valueAsDate = new Date();
    countWagons();
}

function createMail(load) {
    let email = localStorage.getItem('email');
    if (email == null) {
        email = '';
    }
    const subject = 'Vagnsupptagning, ' + otn.value + ', ' + dep.value + ', ' + datePicker.value;
    const loaded = (load) ? 'lastade' : 'tomma';
    const wagons = wagonSection.children;
    // New line = %0D%0A
    let body = 'Hej!%0D%0A%0D%0A' + wagons.length + ' '+ 
    loaded + ' vagnar.%0D%0A%0D%0A';

    for (const loco of locoSection.children) {
        body += loco.innerHTML;
        body += (loco.classList.contains('caution')) ? ' *%0D%0A' : '%0D%0A';
    }

    body += '%0D%0A';

    for (let i = 0; i < wagons.length; i++) {
        body += wagons[i].innerHTML;
        body += (wagons[i].classList.contains('caution')) ? ' *%0D%0A' : '%0D%0A';
        body += ((i+1) % 5 === 0) ? '%0D%0A' : '';
    }
    window.location = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
}
// Modal popup
cog.onclick = function() {
  modal.style.display = "block";
}
span.onclick = function() {
  modal.style.display = "none";
}
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
function loadSettings() {
    saveMail.value = localStorage.getItem('email');
}
function saveSettings() {
    localStorage.setItem('email',saveMail.value);
    saveMail.classList = 'saved';
}

// Init
loadSettings();
loadTrain();
datePicker.valueAsDate = new Date();