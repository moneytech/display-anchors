/* globals chrome, alert */
'use strict';
var CONTEXTMENU_ID_USE_ANCHOR_TEXT = 'contextMenus.useAnchorText';

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript(tab.id, {
        file: 'toggle-anchors.js',
        allFrames: true
    }, function(result) {
        if (chrome.runtime.lastError) {
            alert(chrome.runtime.lastError.message);
            return;
        }
        if (!result || result.indexOf(true) === -1) {
            return;
        }
        chrome.tabs.insertCSS(tab.id, {
            file: 'toggle-anchors.css',
            allFrames: true
        });
    });
});
chrome.contextMenus.onClicked.addListener(function(info) {
    if (info.id === CONTEXTMENU_ID_USE_ANCHOR_TEXT) {
        chrome.storage.sync.set({
            useAnchorText: info.checked,
        });
    }
});
if (typeof browser === 'object') {
    // Firefox does not support event pages, and context menu items must be
    // registered whenever the background page loads.
    getPrefsAndUpdateMenu();
} else {
    chrome.runtime.onInstalled.addListener(getPrefsAndUpdateMenu);
    chrome.runtime.onStartup.addListener(getPrefsAndUpdateMenu);
}
chrome.storage.onChanged.addListener(function(changes) {
    if (changes.useAnchorText) {
        updateMenu(changes.useAnchorText.newValue);
    }
});

function getPrefsAndUpdateMenu() {
    // Keep defaults in sync with toggle-anchors.js and options.js
    chrome.storage.sync.get({
        useAnchorText: true,
    }, function(items) {
        updateMenu(items.useAnchorText);
    });
}

function updateMenu(useAnchorText) {
    chrome.contextMenus.update(CONTEXTMENU_ID_USE_ANCHOR_TEXT, {
        checked: useAnchorText,
    }, function() {
        if (chrome.runtime.lastError) {
            // An error occurred. Assume that the menu does not exist.
            chrome.contextMenus.create({
                id: CONTEXTMENU_ID_USE_ANCHOR_TEXT,
                type: 'checkbox',
                title: 'Show full #anchor text',
                checked: useAnchorText,
                contexts: ['browser_action'],
            });
        }
    });
}
