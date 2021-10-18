/**
 * constants
 */
var STORAGE_KEY_PREFIX = "CHROME_KZ_ALERT_";
var SITES_KEY = STORAGE_KEY_PREFIX + "SITES";
var ALERT_MESSAGE_ELEMENT_ID = "kz-alert-message";
var DEFAULT_WARNING_SITES = ['auth.kuzen.io', 'dialog.kuzen.io', 'dashboard.kuzen.io', 'custom.kuzen.io']

function setDefaultWarningSites() {
  var storageData = {},
      defaultData = DEFAULT_WARNING_SITES.reduce((o, key) => Object.assign(o, {[key]: true}), {});

  storageData[SITES_KEY] = JSON.stringify(defaultData);

  chrome.storage.local.set(storageData);
}

chrome.storage.local.get([SITES_KEY], function(result) {
  if (!result[SITES_KEY]) {
    setDefaultWarningSites();
  }
});

function allowableWarningInCurrentSite() {
  var currentSite = window.location.hostname.replace(/^w{3}\./, "");

  chrome.storage.local.get([SITES_KEY], function(result) {
    if (result[SITES_KEY]) {
      var dataObject = JSON.parse(result[SITES_KEY]);
      if(!!dataObject[currentSite]) {
        showMessage('Please be careful when operating on this website!')
      } else {
        clearOldAlertMessages();
      }
    }
  });
}

function showMessage(message) {
  clearOldAlertMessages();
  if (!message) return;

  var messageElement = document.createElement("DIV");
  var messageContentElement = document.createElement("SPAN");
  messageElement.id = ALERT_MESSAGE_ELEMENT_ID;
  messageContentElement.innerHTML = message;

  messageElement.appendChild(messageContentElement);
  document.body.appendChild(messageElement);

  document.body.style.setProperty("margin-top", messageElement.clientHeight + "px", "important");
  window.onresize = () => document.body.style.setProperty("margin-top", messageElement.clientHeight + "px", "important");
}

function clearOldAlertMessages() {
  var oldAlertMessageElement = getAlertMessageElementId();

  while (oldAlertMessageElement) {
    oldAlertMessageElement.parentNode.removeChild(oldAlertMessageElement);
    oldAlertMessageElement = getAlertMessageElementId();
  }
}

function getAlertMessageElementId() {
  return document.getElementById(ALERT_MESSAGE_ELEMENT_ID);
}

allowableWarningInCurrentSite();

/**
 * Listen for events sent from background page (or from extension popup)
 */
chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.event === "KZ_UPDATE_DISPLAY_WARNING") {
    document.addEventListener("turbolinks:load", function() {
      allowableWarningInCurrentSite();
    });

    allowableWarningInCurrentSite();
  }
});
