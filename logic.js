const datePicker = document.getElementById('date');
// Set todays date
datePicker.valueAsDate = new Date();
// Referens to wagon input label
const inp = document.getElementById('input');
// Create numpad event listeners
var keys = document.getElementById('numpad').children;
for (let key of keys) {
    key.addEventListener('click', function () {
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
    });
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
        valid(value,'wagons');
    } else if (value.length === 7) {
        valid(value,'locos');
    }
}

// Create object div
function valid(value,type) {
    if (getWagons().includes(value)) {
        alert('Wagon already added!');
        inp.innerHTML = inp.innerHTML.slice(0,-1);
    } else {
        document.getElementById(type).innerHTML += '<div onclick="rm(this)">' + value + '</div>';
        inp.classList.add('valid');
        getWagons();
    }
}

function getWagons() {
    let wagons = [];
    let divs = document.getElementById('wagons').children;
    for (const div of divs) {
        wagons.push(div.innerHTML);
    }
    document.getElementById('count').innerHTML = wagons.length;
    return wagons;
}
function mark() {
    if (inp.classList.contains('valid')) {
        if (inp.classList.contains('caution')) {
            inp.classList.remove('caution');
            if (inp.innerHTML.length > 4) {
                document.getElementById('locos').lastChild.classList.remove('caution');
            } else {
                document.getElementById('wagons').lastChild.classList.remove('caution');
            }
        } else {
            inp.classList.add('caution');
            if (inp.innerHTML.length > 4) {
                document.getElementById('locos').lastChild.classList.add('caution');
            } else {
                document.getElementById('wagons').lastChild.classList.add('caution');
            }
        }
    }
}

function corr() {
    if (inp.innerHTML.length > 0) {
        if (inp.classList.length !== 0) { // valid or marked === vehicle added, so remove
            if (inp.innerHTML.length > 4) { // loco
                document.getElementById('locos').lastChild.remove();
            } else { // wagon
                document.getElementById('wagons').lastChild.remove();
                getWagons();
            }
        }
        inp.innerHTML = inp.innerHTML.slice(0,-1);
        inp.classList = '';
    }
}

function rm(vehicle) {
    if (confirm('Remove ' + vehicle.innerHTML + '?')) {
        vehicle.remove();
        getWagons();
    }
}

function reverse() {
    const list = document.getElementById('wagons');
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
}

function createMail(load) {
    const subject = 'Vagnsupptagning, ' + document.getElementById('otn').value + ', ' + document.getElementById('dep').value + ', ' + datePicker.value;
    const loaded = (load) ? 'lastade' : 'tomma';
    const wagons = document.getElementById('wagons').children;
    // New line = %0D%0A
    let body = 'Hej!%0D%0A%0D%0A' + wagons.length + ' '+ 
    loaded + ' vagnar.%0D%0A%0D%0A';

    for (const loco of document.getElementById('locos').children) {
        body += loco.innerHTML;
        body += (loco.classList.contains('caution')) ? ' *%0D%0A' : '%0D%0A';
    }

    body += '%0D%0A';

    for (let i = 0; i < wagons.length; i++) {
        body += wagons[i].innerHTML;
        body += (wagons[i].classList.contains('caution')) ? ' *%0D%0A' : '%0D%0A';
        body += ((i+1) % 5 === 0) ? '%0D%0A' : '';
    }
    window.location = 'mailto:' + getCookie('email') + '?subject=' + subject + '&body=' + body;
}
let saveMail = document.getElementById('saveMail');
let modal = document.getElementById("modalSettings");
let cog = document.getElementById("cog");
let span = document.getElementsByClassName("close")[0];
cog.onclick = function() {
  modal.style.display = "block";
  loadSettings();
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
    saveMail.value = getCookie('email');
    saveMail.classList = '';
}
function saveSettings() {
    const value = saveMail.value;
    let exp = (value != '') ? 2*365 : -1; //Expiration 2 years or yesterday to delete
    setCookie('email', value, exp);
    saveMail.classList = 'saved'
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
  
  function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }