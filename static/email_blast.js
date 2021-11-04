/* Must be run on SFDC contacts page */
function sendData(address,payload) {
    /* Send data to Python server function */
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
        console.log('Response from server')
        /* Browser is blocked from reading response due to no-cors */
    });
}

function emailBlast() {
    /* Function scrapes contacts table into memory and uses logic to gather 10 contacts, then adds to array */
    if (window.location.href.indexOf('citrite.my.salesforce.com') !== -1) {
        return
    }

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
        let URL = '/emailBlast';
        data = uniqueContactsArr;
        console.log(data);
        sendData(URL,data);
    }
}
emailBlast();