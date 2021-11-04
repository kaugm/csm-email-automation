function sendData(address,payload) {
    /* Function to send data to server */
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

function directemail() {
    /* Scrape SFDC contact page, then search for contact to reach out to */
    if (window.location.href.indexOf('citrite.my.salesforce.com') !== -1) {
        return
    }

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
        /* POST to server if valid string in product */
        let URL = '/directemail';
        data = infoArr;
        console.log(data);
        sendData(URL,data);
    }
}
directemail();