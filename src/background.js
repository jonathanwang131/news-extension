browser.browserAction.onClicked.addListener((tab) => {
    if (tab.url.includes('reddit.com')) {
        browser.tabs.sendMessage(tab.id, {action: "replaceFeed"});
    } else {
        alert("This extension only works on Reddit pages.");
    }
});