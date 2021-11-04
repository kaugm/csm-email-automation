function sendData(address,payload) {
    fetch(`http://localhost:5000${address}`, {
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        }, 
        mode: 'no-cors',
        method: 'POST',
        body: JSON.stringify({
            'payload':payload
        })
    }).then((response) => {
        console.log('Response from server')
        // Browser is blocked from reading response due to no-cors
    });
}

function leadnotify() {
    let table = document.querySelectorAll('table.detailList')[0];
    let table2 = document.querySelectorAll('table.detailList')[1];
    let link = window.location.href;
    let leadinfo = [];
    
    let fsm = table.querySelectorAll('a')[0].innerText.split(' ')[0];
    let customer = table.querySelectorAll('a')[1].innerText;
    let subject = table2.querySelectorAll('td')[17].innerText;

    leadinfo.push(fsm, customer, subject, link);

    let URL = '/leadnotify';
    data = leadinfo;
    console.log(data);
    sendData(URL,data);
}
leadnotify();


