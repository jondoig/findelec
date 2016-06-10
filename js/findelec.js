var locs,
  pcLocs,
  elecs;

//var locFilename = "localtest.json";
var locFilename = "localities.json";
var elecFilename = "electorates.json";

var map, label, symbol;

//var ozExtent = {"xmin": 112.921112, "ymin": -54.640301,
//                "xmax": 159.278717, "ymax": -9.22882};
var ozExtent = {
  "xmin": 112.296895,
  "ymin": -44.006562,
  "xmax": 154.915372,
  "ymax": -9.599248
};

loadJson(locFilename, function (json) {
  locs = json;
});
loadJson(elecFilename, function (json) {
  elecs = json;
});

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

var findPc, drawMap;

function initMap() {
  require([
        "esri/map",
        "esri/dijit/HomeButton",
        "esri/layers/FeatureLayer",
        "esri/geometry/Extent",
        "esri/symbols/TextSymbol",
        "esri/symbols/Font",
        "esri/layers/LabelClass",
        "esri/Color",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/renderers/SimpleRenderer",
        "esri/symbols/SimpleFillSymbol",
        "esri/symbols/SimpleLineSymbol",
        "dojo/domReady!"
    ], function (Map, HomeButton, FeatureLayer, Extent, TextSymbol, Font, LabelClass, Color, SimpleMarkerSymbol, SimpleRenderer, SimpleFillSymbol, SimpleLineSymbol) {

    var drawColor = new Color("#008060");

    var urlPrefix = "https://services5.arcgis.com/BZoOjszBbEr9f2ol/arcgis/rest/services/Australian_Federal_Electorates_2016_",
      urlSuffix = "/FeatureServer/0";

    var states = {
      ACT: "Australian Capital Territory",
      NSW: "New South Wales",
      NT: "Northern Territory",
      QLD: "Queensland",
      SA: "South Australia",
      TAS: "Tasmania",
      VIC: "Victoria",
      WA: "Western Australia"
    };

    // Label field capitalisation is inconsistent and it matters
    var labelFields = {
      ACT: "Elect_div",
      NSW: "Elect_div",
      NT: "Elect_div",
      QLD: "ELECT_DIV",
      SA: "ELECT_DIV",
      TAS: "Elect_div",
      VIC: "ELECT_DIV",
      WA: "Elect_div"
    };

    map = new Map("viewDiv", {
      basemap: "streets",
      //      extent: new Extent(west, south, east, north),
      showLabels: true,
      extent: new Extent(ozExtent),
      fitExtent: true,
      minScale: 40000000, // User cannot zoom out beyond 1:40m (Australia)
      maxScale: 9000 // User cannot zoom in beyond 1:9k (street)
    });

    //create symbol to draw the electorates layer
    symbol = new SimpleFillSymbol(
      SimpleFillSymbol.STYLE_SOLID,
      new SimpleLineSymbol(
        SimpleLineSymbol.STYLE_SOLID,
        new Color([0, 128, 96, 1]), 3
      ),
      new Color([0, 0, 0, 0])
    );

    // create a text symbol to define the style of labels
    label = new TextSymbol().setColor(drawColor);
    //    label.font.setSize("14pt");
    label.font.setSize("18pt");
    label.font.setFamily("arial");
    label.font.setWeight(Font.WEIGHT_BOLD);
    label.setHaloColor(new Color("white"));
    label.setHaloSize(5);

    var home = new HomeButton({
      map: map
    }, "HomeBtn");
    home.startup();
    document.getElementsByClassName("mapBtns")[0].style.display = "block";

    drawMap = function (state, extent) {
      map.setExtent(new Extent(extent));

      var url = urlPrefix + states[state].replace(/ /g, "_") + urlSuffix;
      var lyr = new FeatureLayer(url, {
        id: "lyr",
        outFields: [labelFields[state]]
      });

      lyr.setRenderer(new SimpleRenderer(symbol));

      // create a text symbol to define the style of labels
      var labelJson = {
        "labelExpressionInfo": {
          "value": "{" + labelFields[state] + "}"
        }
      };
      var labelClass = new LabelClass(labelJson);
      labelClass.symbol = label;
      lyr.setLabelingInfo([labelClass]);

      lyr.on("click", function (evt) {
        var attrs = evt.graphic.attributes;
        var elec = attrs[Object.keys(attrs)[0]]; // First and only attribute
        showElec(elec);
      });

      map.addLayer(lyr);
    }
  });
}

findPc = function (pc) {
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
        showElec(locs[i].e, locs[i]);
        break;
      }
    }
    if (locs[i].p > pc) {
      break;
    }
  }

  switch (pcLocs.length) {
    case 0:
      document.getElementById("pcErr").style.display = "initial";
      alert("Invalid postcode: pcErr should be showing");
      // document.getElementById("pcInput").focus();
      break;
    case 1:
      if ("e" in pcLocs[0]) { // If there is an electorate, show it
        showElec(pcLocs[0].e, pcLocs[0]);
      } else { // Otherwise map the locality
        document.getElementById("inputPanel").style.display = "none";
        drawMap(pcLocs[0].s, pcLocs[0].x);
        locText = titleCase(pcLocs[0].l) + " " + pcLocs[0].p;
        document.getElementById("mapHeader").innerHTML =
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
        showElec(pcLocs[i].e, pcLocs[i]);
      } else {
        document.getElementById("inputPanel").style.display = "none";
        drawMap(pcLocs[i].s, pcLocs[i].x);
        document.getElementById("mapHeader").innerHTML =
          "Where in " + titleCase(l) + "? Click map.";
      }
      break;
    }
  }
}

function showElec(elec, loc) {

  document.getElementById("inputPanel").style.display = "none";

  var elecDiv = document.getElementById("elecPanel");

  if (loc) {
    elecDiv.querySelector(".intro").innerHTML =
      locString(loc) + " in the federal electorate of:";
  }
  elecDiv.querySelector("h1").innerHTML = elec;
  elecDiv.querySelector("#profile").innerHTML = "<a href=\"" +
    elecs[elec].profile + "\" target=\"_blank\">Profile</a>";
  elecDiv.style.display = "block";
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
  document.getElementById("elecPanel").style.display = "none";
  //            document.getElementById("locSel").style.display = "none";
  document.getElementById("pcErr").style.display = "none";

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

function closeInput() {
  //  elem.innerHTML = "";
  document.getElementById("shadow").classList.add('closed');
}

function openInput(btn) {
  //  panel.innerHTML = "";
  document.getElementById("shadow").classList.remove('closed');

  
//  Open selected btn
}
