// Listen for the action (extension icon) to be clicked
chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: chrome.runtime.getURL('saved_profiles.html') });
});