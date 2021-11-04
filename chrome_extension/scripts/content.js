function sendData(address,payload) {
    /* FUNCTION TO SEND DATA. TAKES ARGUMENTS ( API_ENDPOINT, PAYLOAD_DATA ). THERE WILL BE NO RESPONSE DUE TO NO-CORS */
    fetch(`http://localhost:5000${address}`, {
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=utf-8'
        }, 
        mode: 'no-cors',
        method: 'POST',
        body: JSON.stringify({
            'payload':payload
        })
    }).then((response) => {
        console.log('Response from server received')
    });
}

function blastMethod(endpoint, template) {
    /* FUNCTION SCRAPES DATA USES sendData() TO SEND TO SERVER. TAKES ARGUMENTS ( API_ENDPOINT, TEMPLATE_TYPE )
    GETS DATA FROM CONTACTS TABLE IN 3 PASSES UP TO A MAX OF 10 CONTACTS. ALSO GATHERS CUSTOMER NAME AND PRODUCT (USER INPUT)
    FORMATS DATA INTO AN ARRAY */

    let contactsLimit = 10;
    let contactsList = [];
    let table = document.querySelector('table.list');
    let trs = table.querySelectorAll('tr');
    function removeDuplicates(value, index, self) {
        return self.indexOf(value) === index;
    }
    /* Iterate through table in 3 passes. Last pass just adds the rest of the contacts to the list if the list is less than length 10 */
    for (let i=1; i<trs.length; i++) {
        if (trs[i].querySelectorAll('td')[1].innerText == "Current" && trs[i].querySelectorAll('td')[6].innerText.length > 1) {
            contactsList.push(trs[i].querySelectorAll('td')[4].innerText + '; ')
        }
    }
    contactsList = contactsList.filter(removeDuplicates);
    if (contactsList.length < contactsLimit) {
        for (let i=1; i<trs.length; i++) {
            if (trs[i].querySelectorAll('td')[1].innerText == "Current" && trs[i].querySelectorAll('td')[3].innerText.length > 1) {
                contactsList.push(trs[i].querySelectorAll('td')[4].innerText + '; ')
            }
        }
        contactsList = contactsList.filter(removeDuplicates);
    }
    if (contactsList.length < contactsLimit) {
        for (let i=1; i<trs.length; i++) {
            if (trs[i].querySelectorAll('td')[1].innerText == "Current") {
                contactsList.push(trs[i].querySelectorAll('td')[4].innerText + '; ')
            }
        }
        contactsList = contactsList.filter(removeDuplicates);
    }
    /* Slice list to length limit */
    const uniqueContactsArr = contactsList.slice(0, contactsLimit);

    /* Prompt for and add product to list, then scrape customer name and add it */
    let product = prompt(`Which product to reach out about? \n\n (${contactsList.slice(0, contactsLimit).length}) contact(s) selected`, "");
    uniqueContactsArr.push(product);

    const customerName = document.querySelector('h2.pageDescription').innerText;
    uniqueContactsArr.push(customerName);

    /* Only POST to server if we provide a valid string for product */
    if (product.length > 0 && product != null) {
        uniqueContactsArr.push(template);
        data = uniqueContactsArr;
        console.log(data);
        sendData(endpoint,data);
    }
}

function directMethod(endpoint, template) {
    /* SEE COMMENT FOR blastMethod(), THE WAY THIS FUNCTION WORKS IS THE SAME */

    let table = document.querySelector('table.list');
    let trs = table.querySelectorAll('tr');
    let infoArr = [];

    while (infoArr.length == 0) {

        let query = prompt('Which customer to reach out to? \nMust be a valid name \n\n', "");

        for (let i=1; i<trs.length; i++) {
            let [surname, name] = trs[i].querySelector('th').innerText.split(' ');
            let fullname = name + ' ' + surname.substring(0, surname.length -1);
            if (query.toUpperCase() == fullname.toUpperCase()) {
                infoArr.push(trs[i].querySelectorAll('td')[4].innerText);
                infoArr.push(name);
                break;
            }
        }
    }
    
    /* Prompt for product, then add to list. Then add customer name */
    let product = prompt('Which product to reach out about?', '');
    infoArr.push(product);
    infoArr.push(document.querySelector('h2.pageDescription').innerText);

    if (product.length > 0 && product != null) {
        infoArr.push(template);
        data = infoArr;
        console.log(data);
        sendData(endpoint,data);
    }
}

function toggleCurrentContacts() {
    /* TOGGLES CONTACTS IN CONTACT TABLE */
    let table = document.querySelector('table.list');
    let trs = table.querySelectorAll('tr');

    for (let i=1; i<trs.length; i++) {
        // HIDE CONTACTS THAT ARE NOT CURRENT
        if (trs[i].querySelectorAll('td')[1].innerText !== "Current") {
            trs[i].classList.toggle('hidden');
        };

        // HIGHLIGHT THE 'BEST CONTACTS' BASED ON CRITERIA
        if (trs[i].querySelectorAll('td')[1].innerText == "Current" && trs[i].querySelectorAll('td')[6].innerText.length > 1 && trs[i].querySelectorAll('td')[3].innerText.length > 1) {
            if (trs[i].style.backgroundColor == '') {
                trs[i].style.backgroundColor = '#009DDC';
            } else {
                trs[i].style.backgroundColor = '';
            };
        };
    };
};



/* BUTTON CREATION SECTION
Desired functionality: Click on email METHOD [blast, direct] and it removes those buttons and then adds X number of buttons for email TYPE [intro, checkin, techplay1, techplay2, renewal]
Have to check URL manually, here as built in extension regex isn't specific enough -> using var because let gives redeclaration error */
var URL = window.location.href;
if (URL.includes('RelatedContactList')) {

    let btnBar = document.querySelector("#bodyCell > div.listRelatedObject.contactBlock > div > div.pbHeader");

    // CREATE SUBNODES (EMAIL TYPE)
    function createSubNodes() {
        // Clear the bar (except for default button)
        for (node of btnBar.querySelectorAll('input:not(:first-child)')) {
            node.remove();
        }

        // Create new buttons
        let Types = ['Intro','Check in', 'Admin Workshop', 'Arch. & Strategy', 'Readiness Review', 'Renewal', 'Custom', '   ←   '];
        let subnodes = Types.map(type => {
            let input = document.createElement('input');
            input.value = type;
            input.className = "btn dynamic";
            input.type = "button";
            input.title = type;
            return input;
        });

        // Refresh subnode has name action regardless of method
        subnodes[7].addEventListener('click', function() {
            for (subnode of subnodes) {
                subnode.remove();
            }
            createNodes();
        });

        btnBar.append(...subnodes);
        return subnodes
    };

    // CREATE METHOD NODES
    function createNodes() {
        let Methods = ['Email Blast', 'Direct Email', 'Filter Contacts'];
        let nodes = Methods.map(method => {
            let input = document.createElement('input');
            input.value = method;
            input.className = "btn dynamic";
            input.type = "button";
            input.title = method;
            return input;
        });
        
        // BLASTING NODE -> EVENT LISTENERS FOR SUBNODES [0-6] -> Methods: blast or direct take 2 arguments: API endpoint (2 exist) and the template name (arg #2)
        nodes[0].addEventListener('click', function() {
            subnodes = createSubNodes();

            // INTRO TEMPLATE
            subnodes[0].addEventListener('click', function() {
                blastMethod('/blastMethod', 'blast_intro');
            });

            // CHECKIN TEMPLATE
            subnodes[1].addEventListener('click', function() {
                blastMethod('/blastMethod', 'blast_checkin');
            });

            // ADMIN WORKSHOP TEMPLATE
            subnodes[2].addEventListener('click', function() {
                blastMethod('/blastMethod', 'blast_admin_workshop');
            });

            // ARCHITECTURE AND STRATEGY TEMPLATE
            subnodes[3].addEventListener('click', function() {
                blastMethod('/blastMethod', 'blast_arch_and_strat');
            });

            // READINESS REVIEW TEMPLATE
            subnodes[4].addEventListener('click', function() {
                blastMethod('/blastMethod', 'blast_read_review');
            });

            // CUSTOM TEMPLATE
            subnodes[5].addEventListener('click', function() {
                blastMethod('/blastMethod', 'blast_renewal');
            });

            // RENEWAL TEMPLATE
            subnodes[6].addEventListener('click', function() {
                blastMethod('/blastMethod', 'blast_custom');
            });
            
        });
        
        // DIRECT NODE -> EVENT LISTENERS FOR SUBNODES [0-6]
        nodes[1].addEventListener('click', function() {
            subnodes = createSubNodes();

            // INTRO TEMPLATE
            subnodes[0].addEventListener('click', function() {
                directMethod('/directMethod', 'direct_intro');
            });

            // CHECKIN TEMPLATE
            subnodes[1].addEventListener('click', function() {
                directMethod('/directMethod', 'direct_checkin');
            });

            // ADMIN WORKSHOP TEMPLATE
            subnodes[2].addEventListener('click', function() {
                directMethod('/directMethod', 'direct_admin_workshop');
            });

            // ARCHITECTURE AND STRATEGY TEMPLATE
            subnodes[3].addEventListener('click', function() {
                directMethod('/directMethod', 'direct_arch_and_strat');
            });

            // READINESS REVIEW TEMPLATE
            subnodes[4].addEventListener('click', function() {
                directMethod('/directMethod', 'direct_read_review');
            });

            // CUSTOM TEMPLATE
            subnodes[5].addEventListener('click', function() {
                directMethod('/directMethod', 'direct_renewal');
            });

            // RENEWAL TEMPLATE
            subnodes[6].addEventListener('click', function() {
                directMethod('/directMethod', 'direct_custom');
            });
        });

        //FILTER NODE -> EVENT LISTENER -> TOGGLE HIDDEN CLASSES & BUTTON VALUE
        nodes[2].addEventListener('click', function() {
            toggleCurrentContacts();

            if (this.value == 'Filter Contacts') {
                this.value = 'Unfilter Contacts';
            } else {
                this.value = 'Filter Contacts';
            };
        });
        
        btnBar.append(...nodes);
    }

    // INITIAL CREATION AND APPENDAGE OF NODES
    createNodes();

}
