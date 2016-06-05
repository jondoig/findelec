var locs = [];
var pcLocs = [];

//        var debug = true;

var xmlhttp = new XMLHttpRequest();
//        var url = "localtest.json";
var url = "localities.json";

xmlhttp.onreadystatechange = function () {
  if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
    locs = JSON.parse(xmlhttp.responseText);
  }
};
xmlhttp.open("GET", url, true);
xmlhttp.send();

function findPc(pc) {
  var pc = pc.replace('\n', '').trim();
  var elem = document.getElementById("locOptions");
  var options = "<option hidden></option>\n";
  var otherLocText = "*** OTHER PLACES ***";
  var locText;

  pcLocs = [];

  if (locs == []) {
    console.log("No locations loaded (JSON not yet read)");
  }

  for (var i = 0; i < locs.length; i++) {
    if (locs[i].p == pc) {
      if ("e" in locs[i] && !("l" in locs[i])) {
        showElec("Postcode " + locs[i].p, locs[i].e);
        break;
      }
      pcLocs.push(locs[i]);
    }
    if (locs[i].p > pc) {
      break;
    }
  }
  if (i == locs.length && pcLocs.length == 0) {
    document.getElementById("pcErr").innerHTML =
      "Invalid postcode";
    //                document.getElementById("pcInput").focus();
  }

  if (pcLocs.length > 0) {
    for (i = 0; i < pcLocs.length; i++) {
      locText = (pcLocs[i].l == "*") ? otherLocText : pcLocs[i].l;
      options += "<option value=\"" + pcLocs[i].l + "\">" + locText + "</option>\n";
    }
    elem.innerHTML = options;
    elem.style.display = "initial";
    var event = new MouseEvent('mousedown');
    elem.parentElement.dispatchEvent(event);
  }
}

function findLoc(l) {
  var otherLocText = "All other places in";
  var locText, locVerb;

  for (var i = 0; i < pcLocs.length; i++) {
    if (pcLocs[i].l == l) {
      if (l == "*") {
        locText = otherLocText;
        locVerb = "are";
      } else {
        locText = titleCase(l);
        locVerb = "is";
      }

      if ("e" in pcLocs[i]) {
        showElec(locText + " " + pcLocs[i].p + " " + locVerb, pcLocs[i].e);
      } else {
        var h = document.body.firstElementChild;
        //                        h.innerHTML = "Loading map...";
        drawMap(pcLocs[i].s, pcLocs[i].xw, pcLocs[i].xs, pcLocs[i].xe, pcLocs[i].xn);
        h.innerHTML = "Click your location in " + locText + ":";
      }
      break;
    }
  }
}

function showElec(locString, elec) {
  document.getElementById("elecP").innerHTML =
    locString + " in the federal electorate of:";
  document.getElementById("elecH1").innerHTML = elec;
  document.getElementById("showElec").style.display = "block";
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
