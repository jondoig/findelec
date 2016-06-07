var locs,
  pcLocs,
  elecs;

// var locFilename = "localtest.json";
var locFilename = "localities.json";
var elecFilename = "electorates.json";

loadJson(locFilename, setLocs);
loadJson(elecFilename, setElecs);

function loadJson(url, func) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      func(JSON.parse(xhttp.responseText));
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}

function setLocs(json) {
  locs = json;
}

function setElecs(json) {
  elecs = json;
}

function findPc(pc) {
  var pc = pc.replace('\n', '').trim();
  var elem = document.getElementById("locOptions");
  var options = "<option hidden></option>\n";
  var otherLocText = "*** OTHER PLACES ***";
  var locText;

  pcLocs = [];

  if (!locs || locs == []) {
    alert("No locations loaded (JSON not yet read)");
  }

  for (var i = 0; i < locs.length; i++) {
    if (locs[i].p == pc) {
      pcLocs.push(locs[i]);
      if ("e" in locs[i] && !("l" in locs[i])) { // Pc has just 1 elec
        showElec(locs[i]);
        break;
      }
    }
    if (locs[i].p > pc) {
      break;
    }
  }

  switch (pcLocs.length) {
    case 0:
      document.getElementById("pcErr").innerHTML = "Invalid postcode";
      alert("Invalid postcode: pcErr should be showing");
      // document.getElementById("pcInput").focus();
      break;
    case 1:
      if ("e" in pcLocs[0]) { // If there is an electorate, show it
        showElec(pcLocs[0]);
      } else { // Otherwise map the locality
        drawMap(pcLocs[0].s,
          pcLocs[0].xw, pcLocs[0].xs, pcLocs[0].xe, pcLocs[0].xn);
        locText = titleCase(pcLocs[0].l) + " " + pcLocs[0].p;
        document.body.firstElementChild.innerHTML =
          "Where in " + locText.trim() + "? Click map.";
      }
      break;
    default: // Multiple locs in pc: show in drop-down
      for (i = 0; i < pcLocs.length; i++) {
        locText = (pcLocs[i].l == "*") ? otherLocText : pcLocs[i].l;
        options += "<option value=\"" + pcLocs[i].l + "\">" + locText + "</option>\n";
      }
      elem.innerHTML = options;
      elem.style.display = "initial";
      var event = new MouseEvent('mousedown');
      elem.parentElement.dispatchEvent(event);
      break;
  }
}

function findLoc(l) {
  for (var i = 0; i < pcLocs.length; i++) {
    if (pcLocs[i].l == l) {
      if ("e" in pcLocs[i]) {
        showElec(pcLocs[i]);
      } else {
        //                        h.innerHTML = "Loading map...";
        drawMap(pcLocs[i].s, pcLocs[i].xw, pcLocs[i].xs, pcLocs[i].xe, pcLocs[i].xn);
        document.body.firstElementChild.innerHTML =
          "Where in " + titleCase(l) + "? Click map.";
      }
      break;
    }
  }
}

function showElec(loc) {
  document.getElementById("elecP").innerHTML =
    locString(loc) + " in the federal electorate of:";
  document.getElementById("elecH1").innerHTML = loc.e;
  document.getElementById("elecProfile").innerHTML = 
    "<a href=\"" + elecs[loc.e].profile + "\" target=\"_blank\">Profile</a>";
  document.getElementById("showElec").style.display = "block";
}

function locString(loc) {
  var otherLocString = "All other places in";
  var string, locVerb = "is";

  if (!("l" in loc)) {
    string = "Postcode";
  } else {
    if (loc.l == "*") {
      string = otherLocString;
      locVerb = "are";
    } else {
      string = titleCase(loc.l);
    }

  }
  return string + " " + loc.p + " " + locVerb;;
}

function restart() {
  document.getElementsByClassName("numpad")[0].style.display = "block";
  document.getElementById("showElec").style.display = "none";
  //            document.getElementById("locSel").style.display = "none";
  document.getElementById("pcErr").innerHTML = "";

  var pcInput = document.getElementById("pcInput");
  pcInput.value = "";
  pcInput.focus();
  disableNumBtns("");
  //            pcInput.select();
}

function titleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}
