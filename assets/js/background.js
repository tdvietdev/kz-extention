// chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
//   chrome.tabs.sendMessage(details.tabId, {
//     event: "KZ_ALERT_HISTORY_STATE_UPDATED"
//   });
// });
//
// chrome.tabs.onActivated.addListener(function(tab){
//   chrome.tabs.sendMessage(tab.tabId, {
//     event: "KZ_ALERT_HISTORY_STATE_UPDATED"
//   });
// })
//
// chrome.runtime.onMessage.addListener((message) => {
//   let { event } = message || {};
//   switch (event) {
//     case "KZ_ALERT_REQUIRE_TOKEN":
//       requestToken();
//       return;
//     case "KZ_ALERT_REVOKE_TOKEN":
//       ssoRevoke();
//       return;
//   }
// })
