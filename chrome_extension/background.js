chrome.runtime.onInstalled.addListener(() => {
    console.log('SFDC Chrome extension is now running');



});


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // If page is fully loaded and url is actual website (starts with http), inject script
    if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {
        chrome.scripting.executeScript({
            target: {tabId: tabId},
            files: ["/scripts/content.js"]
        })
            .then(() => {
                console.log('Script successfully injected into webpage!')
            })
            .catch(err => console.log(err));
        
        chrome.scripting.insertCSS({
            target: { tabId: tabId },
            files: ["/css/buttons.css"]
        })
            .then(() => {
                console.log('CSS successfully injected into webpage!')
            })
            .catch(err => console.log(err));
    }
});