var STORAGE_KEY_PREFIX = "CHROME_KZ_ALERT_";
var SITES_KEY = STORAGE_KEY_PREFIX + "SITES";

function createTable(tableData, options = {}) {
  var table = document.createElement('table');
  table.classList.add(options['tableClass'])
  var tableBody = document.createElement('tbody');

  tableData.forEach(function (rowData) {
    var row = document.createElement('tr');

    rowData.forEach(function (cellData, i) {
      var cell = document.createElement('td');
      if (options['classes']) {
        var classes = options['classes'];
        cell.classList.add(classes[i])
      }
      cell.appendChild(document.createTextNode(cellData));
      row.appendChild(cell);

    });

    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);

  return table;
}

function createListSitesTable() {
  var tableArea = document.getElementById("list-warning-sites");
  tableArea.innerHTML = '';

  chrome.storage.local.get([SITES_KEY], function(result) {
    if (result[SITES_KEY]) {
      var dataSite = JSON.parse(result[SITES_KEY]),
          dataTable = Object.keys(dataSite).map((key) => [key, dataSite[key] ? 'Endable' : 'Disable' ]),
          table = createTable(dataTable, {classes: ['site-name', 'status'], tableClass: 'list-warning-sites-table'});

      tableArea.append(table);
    }
  });
}

function getHostName(hrefStr) {
  var l = document.createElement("a");
  l.href = hrefStr;
  return l.hostname.replace(/^w{3}\./, "");;
}

function updateStatusOfSite(site) {
  chrome.storage.local.get([SITES_KEY], function(result) {
    var dataSites = {}

    if (result[SITES_KEY]) { dataSites = JSON.parse(result[SITES_KEY])}
    if (site in dataSites) {
      dataSites[site] = !dataSites[site]
    } else {
      dataSites[site] = true;
    }

    var storageData = {};
    storageData[SITES_KEY] = JSON.stringify(dataSites);

    chrome.storage.local.set(storageData);
    updatePopupStatus(dataSites[site]);

    chrome.tabs.query({}, function(tabs) {
      tabs.forEach(function(tab) {
        chrome.tabs.sendMessage(tab.id, {
          event: "KZ_UPDATE_DISPLAY_WARNING"
        });
      })
    });
  });
}

function handleOnOffClick() {
  document.getElementById("on_off_warning").onclick = () => {
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
      var url = tabs[0].url;
      updateStatusOfSite(getHostName(url));
    });
  }
}

function updatePopupStatus(status) {
  // update button
  var buttonElement = document.getElementById("on_off_warning");

  if(status) {
    buttonElement.innerText = "TURN OFF WARNING SITE";
  } else {
    buttonElement.innerText = "TURN ON WARNING SITE";
  }
  buttonElement.className = `${status ? 'on' : 'off'}-btn`

  // update table
  createListSitesTable();
}

function initButtonOfOff() {
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    var url = tabs[0].url,
        site = getHostName(url);

    chrome.storage.local.get([SITES_KEY], function(result) {
      var dataSites = {}

      if (result[SITES_KEY]) {
        dataSites = JSON.parse(result[SITES_KEY])
      }

      updatePopupStatus(dataSites[site]);
    })
  });
}

window.onload = function() {
  handleOnOffClick();
  createListSitesTable();
  initButtonOfOff();
}
