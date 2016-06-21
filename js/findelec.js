var locs,
  pcLocs,
  elecs;

//var locFilename = "localtest.json";
var locFilename = "localities.json",
  elecFilename = "electorates.json",
  partyFilename = "parties.json";

var map, lyr, label, symbol;

//var ozExtent = {"xmin": 112.921112, "ymin": -54.640301,
//                "xmax": 159.278717, "ymax": -9.22882};
var ozExtent = {
  "xmin": 112.296895,
  "ymin": -44.006562,
  "xmax": 154.915372,
  "ymax": -9.599248
};

var profileUrlPrefix = "http://aec.gov.au/";
loadJson(locFilename, function (json) {
  locs = json;
});
loadJson(elecFilename, function (json) {
  elecs = json;
  loadElecs();
});
loadJson(partyFilename, function (json) {
  parties = json;
});

// Detect mouse movement
var mouse = false;
var pcInputElem = document.getElementById("pcInput");

function mouseListen() {
  pcInputElem.removeEventListener('mouseover', mouseListen, false);
  // If pcInput not clicked in 10ms, there's a mouse
  window.setTimeout(function () {
    if (!hasClass(pcInputElem, "active")) {
      mouse = true;
    }
  }, 10);
};

pcInputElem.addEventListener('mouseover', mouseListen, false);

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

// Load  electorates into datalist if supported, otherwise into select options
function loadElecs() {
  var options = "";
  var elecArray = Object.keys(elecs).sort();

  for (var i = 0; i < elecArray.length; i++) {
    options += "<option value=\"" + elecArray[i] + "\">" + elecArray[i] + "</option>\n";
  }
  if ("options" in document.createElement("datalist")) {
    document.getElementById("elecList").innerHTML = options;
  } else {
    document.getElementById("elecListPolyfill").innerHTML = options;
  }
}

var drawMap;

function initMap() {
  require([
        "esri/map",
        "esri/dijit/HomeButton",
        "esri/layers/FeatureLayer",
        "esri/geometry/Extent",
        "esri/geometry/Point",
        "esri/symbols/TextSymbol",
        "esri/symbols/Font",
        "esri/layers/LabelClass",
        "esri/Color",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/renderers/SimpleRenderer",
        "esri/symbols/SimpleFillSymbol",
//        "esri/graphic",
        "esri/tasks/query",
        "esri/symbols/SimpleLineSymbol",
        "esri/dijit/LocateButton",
        "dojo/domReady!"
//    ], function (Map, HomeButton, FeatureLayer, Extent, TextSymbol, Font, LabelClass, Color, SimpleMarkerSymbol, SimpleRenderer, SimpleFillSymbol, SimpleLineSymbol, Graphic, Query) {
//    ], function (Map, HomeButton, FeatureLayer, Extent, TextSymbol, Font, LabelClass, Color, SimpleMarkerSymbol, SimpleRenderer, SimpleFillSymbol, SimpleLineSymbol, Query) {
            ], function (Map, HomeButton, FeatureLayer, Extent, Point, TextSymbol, Font, LabelClass, Color, SimpleMarkerSymbol, SimpleRenderer, SimpleFillSymbol, Query, SimpleLineSymbol, LocateButton) {

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
      fitExtent: true
        //      ,minScale: 40000000, // User cannot zoom out beyond 1:40m (Australia)
        //      maxScale: 9000 // User cannot zoom in beyond 1:9k (street)
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
    // Empty fill
    //        new Color(drawColor), 3 // Rainforest green line 

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

    geoLocate = new LocateButton({
      map: map,
      setScale: false
    }, "LocateButton");
    geoLocate.startup();

    geoLocate.on("locate", function (evt) {
      //      console.log(evt.position);
      var lat = evt.position.coords.latitude;
      var lng = evt.position.coords.longitude;
      var ext = {
        xmin: lng,
        ymin: lat,
        xmax: lng,
        ymax: lat
      };

      drawMap("NSW", ext);
      var mapHdr = document.getElementById("mapHeader");
      mapHdr.innerHTML = "Click map for electorate details";
      mapHdr.classList.remove("closed");

      //      var query = new Query();
      //      query.geometry = evt.graphic.geometry;
      //      lyr.selectFeatures(query, lyr.SELECTION_NEW);
    });

    //    lyr.on("selection-complete") {
    //      var attrs = evt.graphic.attributes;
    //      var elec = attrs[Object.keys(attrs)[0]]; // First and only attribute
    ////      document.getElementById("mapHeader").classList.add('closed');
    //      showElec(elec);
    //      map.setExtent(evt.graphic.geometry.getExtent());
    //    }

    document.getElementsByClassName("mapBtns")[0].style.display = "block";

    drawMap = function (state, extent, elec) {

      // Create layer if no layer or state has changed
      var stateUrlString = states[state].replace(/ /g, "_");
      //      console.log("Create layer? " + (!lyr || lyr.url.indexOf(stateUrlString) < 0));
      if (!lyr || lyr.url.indexOf(stateUrlString) < 0) {

        if (lyr) {
          map.removeLayer(lyr);
        }

        var url = urlPrefix + stateUrlString + urlSuffix;
        lyr = new FeatureLayer(url, {
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
          document.getElementById("mapHeader").classList.add('closed');
          showElec(elec);
          map.setExtent(evt.graphic.geometry.getExtent());
        });

        lyr.on("selection-complete", function (evt) {
          //          map.setExtent(evt.graphic.geometry.getExtent());
          if (evt.features.length == 0) {
            console.log("ERROR: " + evt.features.length +
              " features with " + where + " in " + state);
          } else {
            if (evt.features.length > 1) {
              console.log("WARNING: " + evt.features.length +
                " features with " + where);
            }
            //            var highlightGraphic = new Graphic(evt.features[0].geometry, highlightSymbol);
            //            map.graphics.add(highlightGraphic);

            // TODO: cope with multiple features in electorate
            map.setExtent(evt.features[0].geometry.getExtent());
            showElec(elec || evt.features[0].attributes[labelFields[state]]);
            //            lyr.clearSelection();
          }
        });

        map.addLayer(lyr);
      }
      //      var highlightSymbol = new SimpleFillSymbol(
      //        SimpleFillSymbol.STYLE_SOLID,
      //        new SimpleLineSymbol(
      //          SimpleLineSymbol.STYLE_SOLID,
      //          new Color([128, 60, 0]), 5
      //        ),
      //        new Color([0, 128, 96, 0.35])
      //      );

      if (extent) {
        if (extent.xmin == extent.xmax && extent.ymin == extent.ymax) {
          // (Geolocated) point: show and zoom to elec

          var query = new Query();
          query.geometry = new Point(extent.xmin, extent.ymin);
          //          query.outFields = [labelFields[state]];
          //          query.outFields = ["Elect_div"];
          lyr.selectFeatures(query);

        } else {
          map.setExtent(Extent(extent));
        }
      } else {
        if (!elec) {
          console.log("ERROR: Call to drawMap without extent or elec");
          return;
        }

        var query = new Query();
        var where = labelFields[state] + " = '" + elec + "'";
        query.where = where;
        //        query.outFields = [labelFields[state]];
        lyr.selectFeatures(query);
      }
    }

  });
}

function findPc(pc) {
  var pc = pc.replace('\n', '').trim();

  pcLocs = [];

  if (!locs || locs == []) {
    alert("No locations loaded (JSON not yet read)");
  }

  for (var i = 0; i < locs.length; i++) {
    if (locs[i].p == pc) {
      pcLocs.push(locs[i]);
      if ("e" in locs[i] && !("l" in locs[i])) { // Pc has just 1 elec
        closePanel("input");
        showElec(locs[i].e);
        drawMap(pcLocs[i].s, "", locs[i].e);
        //            map.setExtent(Extent(locs[i].x));
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
      //      alert("Invalid postcode: pcErr should be showing");
      // document.getElementById("pcInput").focus();
      break;
    case 1:
      closePanel("input");
      if ("e" in pcLocs[0]) { // If there is an electorate, show it and zoom to it
        showElec(pcLocs[0].e);
        drawMap(pcLocs[i].s, "", pcLocs[i].e);
        //            map.setExtent(Extent(pcLocs[0].x));
      } else { // Otherwise map the locality
        drawMap(pcLocs[0].s, pcLocs[0].x);
        var locText = titleCase(pcLocs[0].l) + " " + pcLocs[0].p;
        var mapHdrElem = document.getElementById("mapHeader");
        mapHdrElem.innerHTML = "<h2>Where in " + locText.trim() + "?</h2><p>Click map</p>";
        mapHdrElem.classList.remove('closed');
      }
      break;
    default: // Multiple locs in pc: show in drop-down
      if (!mouse) {
        document.getElementById("numpad").classList.add("closed");
      }
      showLocs(pcLocs);
      document.getElementById("pcInput").classList.add("active");
      break;
  }
}

function showLocs(locs) {
  var selElem = document.getElementById("locSel"),
    optElem = selElem.querySelector("#locOptions");
  var options = "<option hidden></option>\n",
    otherLocText = "*** OTHER PLACES ***",
    locText;
  var event = new MouseEvent('mousedown');

  for (i = 0; i < locs.length; i++) {
    locText = (locs[i].l == "*") ? otherLocText : locs[i].l;
    options += "<option value=\"" + locs[i].l + "\">" + locText + "</option>\n";
  }

  optElem.innerHTML = options;
  selElem.style.display = "initial";
  //  selElem.focus();
  //  selElem.select();
  window.setTimeout(function () {
    selElem.dispatchEvent(event);
  }, 50);
}

function findLoc(l) {
  for (var i = 0; i < pcLocs.length; i++) {
    if (pcLocs[i].l == l) {
      closePanel("input");
      if ("e" in pcLocs[i]) {
        showElec(pcLocs[i].e);
        drawMap(pcLocs[i].s, "", pcLocs[i].e);
      } else {
        //        document.getElementById("inputPanel").style.display = "none";
        drawMap(pcLocs[i].s, pcLocs[i].x);
        var mapHdrElem = document.getElementById("mapHeader");
        mapHdrElem.innerHTML = "<h2>Where in " + titleCase(l) + "?</h2><p>Click map</p>";
        mapHdrElem.classList.remove('closed');
      }
      break;
    }
  }
}

function findElec(elec) {
  if (elec in elecs) {
    closePanel('input');
    //    showElec(elec);
    drawMap(elecs[elec].s, "", elec);
  }
}

function showElec(elec) {
  var elecDiv = document.getElementById("elecPanel");
  var profile = profileUrlPrefix + elec.replace("'", "").replace(" ", "-");
  //  var introElem = elecDiv.querySelector(".intro");
  //  if (loc) {
  //    introElem.innerHTML = locString(loc);
  //    introElem.style.display = "initial";
  //  } else {
  //    introElem.style.display = "none";
  //  }

  elecDiv.querySelector("h1").innerHTML = elec;
  elecDiv.querySelector("#profile").innerHTML = "<a href='" + profile + "' target='_blank'>Profile</a>";
  elecDiv.querySelector("#candList").innerHTML = formatCands(elec);

  openPanel("elec");
}

function locate() {

}

//function locString(loc) {
//  var otherLocString = "All other places in";
//  var string, locVerb = "is";
////  var mappedLocString = "Your location";
////  if (loc) {
//    if (!("l" in loc)) {
//      string = "Postcode";
//    } else {
//      if (loc.l == "*") {
//        string = otherLocString;
//        locVerb = "are";
//      } else {
//        string = titleCase(loc.l);
//      }
//    }
//    string += " " + loc.p;
//    return string + " " + locVerb + " in:";
////  } else {
////    return "";
////    // Can't assume mapped: can be from elecInput
////    // string = mappedLocString;
////  }
//}

function formatCands(elec) {
  var list = "";
  //  var e = elecs[elec];
  var img, alt, imgPath = "images/cands/";
  var cand, party;
  var candLink, candLinkClass, candFbLink, partyLink, partyFbLink;
  var fbBaseUrl = "//facebook.com/";
  var googleIFLuckyBaseUrl = "//google.com.au/search?btnI=I&q="

  for (i = 0; i < elecs[elec].c.length; i++) {
    if (i > 0) {
      list += "<tr class='gap'></tr>";
    }
    cand = elecs[elec].c[i];
    list += "<tr class='cand'>";
    list += "<td class='candName'>";

    partyLink = cand.p;
    partyfbLink = "";

    if (parties.hasOwnProperty(cand.p)) { // Include details for cand's party
      party = parties[cand.p];
      partyLink = party["n"] || cand.p;
      // I only have candidate photos for major parties
      if (party["major"] == true) {
        img = cand.n + " " + cand.p + " " + elec + ".jpg";
        img = imgPath + img.replace(/ /g, "_").replace(/\'/g, "").toLowerCase();
        alt = cand.n + " " + partyLink + "candidate for " + elec;
        list += "<img src='" + img + "' alt='" + alt + "' onerror='imgError(this);'>";
      }
      if (party["u"]) { // Add party website if available
        partyLink = "<a class='partyLink' href='http://" +
          party["u"] + "' target='_blank'>" + partyLink + "</a>";
      }
      if (party["f"]) { // Add party facebook link if available
        partyfbLink = "<a class='fbLink' href='" + fbBaseUrl +
          party["f"] + "' target='_blank'>" + "</a>";
      }
    }

    if (cand["u"]) { // Add candidate page from party (or other) website if available
      if (cand["u"].length == 1) {
        if (cand["u"][0].substring(0, 2) == "//") {
          candLink = cand["u"][0];
        } else { // Join party website and candidate path
          candLink = "http://" + party["u"] + "/" + cand["u"][0];
        }
      } else { // two items in candidate URL array: sub-domain and path
        candLink = "http://" + cand["u"][0] + "." + party["u"] + "/" + cand["u"][1];
      }
      candLinkClass = "candLink";
    } else {
      // No link: use Google I'm Feeling Lucky
      candLink = googleIFLuckyBaseUrl + encodeURI(cand.n + " " + cand.p + " " + elec);
      candLinkClass = "candLink guess";
    }
    candLink = "<a class='" + candLinkClass + "' href='" +
      candLink + "' target='_blank'>" + cand.n + "</a>";

    if (cand["f"]) { // Add candidate facebook link if available
      candfbLink = "<a class='fbLink' href='" +
        fbBaseUrl + cand["f"] + "' target='_blank'>" + "</a>";
    } else {
      candfbLink = "";
    }

    list += candLink + candfbLink + "</td>";
    list += "<td class='partyName'>" + partyLink +
      partyfbLink + "</td>";
    list += "</tr>";
  }
  return list;
}

function imgError(image) {
  image.onerror = "";
  image.src = "images/blank.png";
  image.style.width = 0;
  image.style.height = 0;
  return true;
}

//
//function restart() {
////  document.getElementsByClassName("numpad")[0].style.display = "block";
////  document.getElementById("elecPanel").style.display = "none";
//  //            document.getElementById("locSel").style.display = "none";
//  document.getElementById("pcErr").style.display = "none";
//
//  var pcInput = document.getElementById("pcInput");
//  pcInput.value = "";
//  pcInput.focus();
//  disableNumBtns("");
//  //            pcInput.select();
//}

function titleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function closePanel(panel) {
  //  elem.innerHTML = "";
  var elem = document.getElementById(panel + "Panel");
  if (panel == "input") {
    //    if (!mouse) {
    //      document.getElementById("numpad").classList.add("closed");
    //    }
    var inputs = elem.querySelectorAll(".inputBtn:not(button)");
    for (var i = 0; i < inputs.length; i++) {
      //      inputs[i].classList.remove("active");
      deactivate(inputs[i]);
    }
    elem.classList.add("closed");
    clearInput();
  }
  // Close the shadow containing this panel
  elem.parentElement.classList.add('closed');

  // Hide the map header
  document.getElementById("mapHeader").classList.add('closed');
}

function clearInput() {
  document.getElementById("pcInput").value = "";
  disableNumBtns("");
  document.getElementById("locSel").style.display = "none";
  document.getElementById("pcErr").style.display = "none";
  document.getElementById("elecInput").value = "";
}

function openPanel(panel, btn) {
  //  panel.innerHTML = "";
  var elem = document.getElementById(panel + "Panel");
  switch (panel) {
    case "input":
      // elem.style.display = "block";
      elem.classList.remove('closed');
      //      document.getElementById("elecPanel").style.display = "none";
      //  Open selected btn
      var btnElem = document.getElementById(btn + "Input");
      btnElem.classList.add("active");
      if (btn == "pc" && !mouse) {
        document.getElementById("numpad").classList.remove("closed")
      } else {
        btnElem.focus();
      }
      break;
    case "elec":
      closePanel("input");
      //      document.getElementById("inputPanel").style.display = "none";
      elem.style.display = "block";
      break;
    default:
      break;
  }
  // Open the shadow containing this panel
  elem.parentElement.classList.remove('closed');
}

function hasClass(element, cls) {
  return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

function deactivate(btn) {
  switch (btn.id) {
    case "pcInput":
      window.setTimeout(function () {
        var activeElem = document.activeElement;
        //        console.log("Active: " + activeElem.id);
        //        console.log("Mouse: " + mouse);
        if (!(activeElem.id == "locSel" ||
            (activeElem.parentElement &&
              activeElem.parentElement.parentElement &&
              activeElem.parentElement.parentElement.id == "numpad"))) {
          if (!mouse) {
            document.getElementById("numpad").classList.add('closed');
          }
          document.getElementById("pcInput").classList.remove('active');
        }
      }, 10);
      break;
    case "elecInput":
      document.getElementById("elecInput").classList.remove('active');
      break;
    default:
      break;
  }
  clearInput();
}
