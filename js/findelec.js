var locs,
  pcLocs,
  elecs;

//var locFilename = "localtest.json";
var locFilename = "localities.json",
  elecFilename = "electorates.json",
  partyFilename = "parties.json";

var map, lyr, label, symbol, drawMap;

//var ozExtent = {"xmin": 112.921112, "ymin": -54.640301,
//                "xmax": 159.278717, "ymax": -9.22882};
var ozExtent = {
  "xmin": 112.296895,
  "ymin": -44.006562,
  "xmax": 154.915372,
  "ymax": -9.599248
};

var titleText = "Find my electorate";

var profileUrlPrefix = "http://aec.gov.au/";

var mouse = false;
var clicked = false;

var elecArray = [];

loadJson(locFilename, function (json) {
  locs = json;
});
loadJson(elecFilename, function (json) {
  elecs = json;
  elecArray = loadElecs();
});
loadJson(partyFilename, function (json) {
  parties = json;
});

// Detect mouse movement
//pcInputElem.addEventListener('mouseover', mouseListen, false);
document.addEventListener('mouseover', mouseListen, false);
document.addEventListener('click', clickListen, false);


addEvents();

// Test for datalist support: https://gist.github.com/flecno/5315453
//var dataListSupported = !!(document.createElement('datalist') && window.HTMLDataListElement);
var dataListSupported = false; // For testing

//if (!dataListSupported) {
////  alert("Datalist is not supported, adding polyfill");
//  //  var head = document.getElementsByTagName('head')[0];
//  //  var js = document.createElement("script");
//  //  js.type = "text/javascript";
//  //  js.src = "js/datalist.polyfill.min.js";
//  //  head.appendChild(js);
//
//  //  document.getElementById("elecInput").style.display = "none";
//  //  document.getElementById("elecInputPolyfill").style.display = "block";
//} else {
////  alert("Datalist is supported, no polyfill");
//}

function loadJson(url, func) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (xhttp.readyState === 4 && xhttp.status === 200) {
      func(JSON.parse(xhttp.responseText));
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}

// Load  electorates into datalist if supported, otherwise into select options
function loadElecs() {
  var options = "";
  var myArray = Object.keys(elecs).sort();

  //  for (var i = 0; i < myArray.length; i++) {
  //    options += "<option>" + myArray[i] + "</option>\n";
  //  }
  options = "<option>" + myArray.join("</option>\n<option>") + "</option>\n";
  if (dataListSupported) {
    document.getElementById("elecList").innerHTML = options;
  }
  //  else {
  //    document.getElementById("elecInputPolyfill").innerHTML = options;
  //  }
  return myArray;
}

function mouseListen() {
  //  pcInputElem.removeEventListener('mouseover', mouseListen, false);
  document.removeEventListener('mouseover', mouseListen, false);
  // If not clicked in 10ms, there's a mouse
  window.setTimeout(function () {
    if (!clicked) {
      mouse = true;
    }
  }, 50);
};

function clickListen() {
  document.removeEventListener('click', clickListen, false);
  clicked = true;
};

function addEvents() {

  document.getElementById("pcBtn").addEventListener("click", function () {
    openPanel('input', 'pc');
  });

  document.getElementById("elecBtn").addEventListener("click", function () {
    openPanel('input', 'elec');
  });

  document.getElementById("closeInput").addEventListener("click", function () {
    this.blur();
    closePanel('input');
  });

  document.getElementById("closeElec").addEventListener("click", function () {
    this.blur();
    closePanel('elec');
  });

  document.getElementById("locateBtn").addEventListener("click", function () {
    geoLocate.locate();
    closePanel('input');
  });

  document.getElementById("pcInput").addEventListener("click", function () {
    switchBtn(this, true);
  });

  document.getElementById("elecInput").addEventListener("click", function () {
    switchBtn(this, true);
  });

  document.getElementById("pcInput").addEventListener("keyup", function () {
    switch (this.value.length) {
      case 4:
        findPc(this.value);
        break;
      case 3:
        document.getElementById('pcErr').style.display = 'none';
        break;
      default:
        break;
    }
  });

  document.getElementById("elecInput").addEventListener("input", function () {
    var p = new RegExp(this.pattern);
    if (p.test(this.value)) {
      findElec(this.value);
    }
  });

  document.getElementById("elecInputPolyfill").addEventListener("change", function () {
    findElec(this.value);
  });

  document.getElementById("locSel").addEventListener("change", function () {
    findLoc(this.value);
  });

  var btns = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "Clear", "Back"];
  for (var i = 0; i < btns.length; i++) {
    document.getElementById("btn" + btns[i]).addEventListener("click", function () {
      numWrite(this);
    });
  }
}

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

    home.on("home", function () {
      openPanel("input");
      openHdr(titleText, true);
    });

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
      openHdr("Click map for electorate details");

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

        map.on("zoom-start", function () {
          //          console.log("Map zoom-start, lyr: " + lyr.url.replace(/.*2016_/, ""));
          if (lyr) {
            lyr.showLabels = false;
          }
        });
        map.on("zoom-end", function () {
          //          console.log("Map zoom-end, lyr: " + lyr.url.replace(/.*2016_/, ""));
          if (lyr) {
            window.setTimeout(function () {
              lyr.showLabels = true;
              lyr.redraw();
            }, 100);
          }
        });

        //Pause labelling during zoom so we don't  see "undefined"
        map.on("update-start", function () {
          //          console.log("Map update-start, lyr: " + lyr.url.replace(/.*2016_/, ""));
          if (lyr) {
            lyr.showLabels = false;
          }
        });

        map.on("update-end", function () {
          //          console.log("Map update-end, lyr: " + lyr.url.replace(/.*2016_/, ""));
          if (lyr) {
            window.setTimeout(function () {
              lyr.showLabels = true;
              lyr.redraw();
            }, 100);
          }
        });

        lyr.on("click", function (evt) {
          var attrs = evt.graphic.attributes;
          var elec = attrs[Object.keys(attrs)[0]]; // First and only attribute
          closeHdr();
          showElec(elec);
          map.setExtent(evt.graphic.geometry.getExtent());
        });

        lyr.on("selection-complete", function (evt) {
          //          map.setExtent(evt.graphic.geometry.getExtent());
          if (evt.features.length === 0) {
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
            elec = "";
            //            showElec(evt.features[0].attributes[labelFields[state]]);
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
        if (extent.xmin === extent.xmax && extent.ymin === extent.ymax) {
          // (Geolocated) point: show and zoom to elec

          var query = new Query();
          query.geometry = new Point(extent.xmin, extent.ymin);
          //          query.outFields = [labelFields[state]];
          //          query.outFields = ["Elect_div"];
          lyr.selectFeatures(query, lyr.SELECTION_NEW);

        } else {
          map.setExtent(Extent(extent));
        }
      } else { // Extent not specified: must have elec
        if (!elec) {
          console.log("ERROR: Call to drawMap without extent or elec");
          return;
        }

        var query = new Query();
        var where = labelFields[state] + " = '" + elec + "'";
        query.where = where;
        //        query.outFields = [labelFields[state]];
        lyr.selectFeatures(query, lyr.SELECTION_NEW);
      }
    }

  });
}

function findPc(pc) {
  var pc = pc.replace('\n', '').trim();

  pcLocs = [];

  if (!locs || locs === []) {
    alert("No locations loaded (JSON not yet read)");
  }

  for (var i = 0; i < locs.length; i++) {
    if (locs[i].p === pc) {
      pcLocs.push(locs[i]);
      if ("e" in locs[i] && !("l" in locs[i])) { // Pc has just 1 elec
        //        closePanel("input");
        //        showElec(locs[i].e);
        //        drawMap(pcLocs[i].s, "", locs[i].e);
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
        //        showElec(pcLocs[0].e);
        drawMap(pcLocs[0].s, "", pcLocs[0].e);
        //            map.setExtent(Extent(pcLocs[0].x));
      } else { // Otherwise map the locality
        drawMap(pcLocs[0].s, pcLocs[0].x);
        var locText = properName(pcLocs[0].l) + " " + pcLocs[0].p;
        openHdr("<h2>Where in " + locText.trim() + "?</h2><p>Click map</p>");
      }
      break;
    default: // Multiple locs in pc: show in drop-down
      if (!mouse) {
        document.getElementById("numpad").classList.add("closed");
      }
      selLoc(pcLocs);
      //      document.getElementById("pcInput").classList.add("active");
      break;
  }
}

function selLoc(locs) {
  var selElem = document.getElementById("locSel"),
    optElem = selElem.querySelector("#locOptions");
  var options = "<option hidden></option>\n",
    otherLocText = "*** OTHER PLACES ***",
    locText;
  var event = new MouseEvent('mousedown');

  for (i = 0; i < locs.length; i++) {
    locText = (locs[i].l === "*") ? otherLocText : locs[i].l;
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
    if (pcLocs[i].l === l) {
      closePanel("input");
      if ("e" in pcLocs[i]) {
        //        showElec(pcLocs[i].e);
        drawMap(pcLocs[i].s, "", pcLocs[i].e);
      } else {
        //        document.getElementById("inputPanel").style.display = "none";
        drawMap(pcLocs[i].s, pcLocs[i].x);
        openHdr("<h2>Where in " + properName(l) + "?</h2><p>Click map</p>");
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
  } else {
    if (!dataListSupported) {
//      alert("Datalist not supported, adding polyfill");
      selElec(elec);
    }
  }
}

function selElec(i) {
  var selElem = document.getElementById("elecInputPolyfill"),
    options = "<option hidden></option>\n",
    event = new MouseEvent('mousedown');

  i = i.toUpperCase();
  for (j = 0; j < elecArray.length; j++) {
    if (elecArray[j].toUpperCase().startsWith(i)) {
      options += "<option>" + elecArray[j] + "</option>\n";
    }
  }

  selElem.innerHTML = options;
  selElem.style.display = "initial";

  window.setTimeout(function () {
    selElem.dispatchEvent(event);
  }, 50);
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

  elecDiv.querySelector("#candies").innerHTML = formatCands(elec);
  elecDiv.querySelector("#candyWrapper").style.maxHeight = candyHeight() + "px";

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
//      if (loc.l === "*") {
//        string = otherLocString;
//        locVerb = "are";
//      } else {
//        string = properName(loc.l);
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
  var tRow, tBody = "";
  //  var e = elecs[elec];
  var img, png, alt, imgPath = "images/cands/";
  var cand, party;
  var candNameElem, candLink, candFbLink, candLinkClass, candLinkTitle;
  var partyName, partyNameElem, partyLink, partyFbLink, partyLinkClass, partyLinkTitle;
  var fbBaseUrl = "//facebook.com/";
  var googleIFLTitle = " title='Google search'";
  var candTitle = " title='Candidate web page'",
    partyTitle = " title='Party website'";
  var googleIFLuckyBaseUrl = "//google.com.au/search?btnI=I&q="

  for (i = 0; i < elecs[elec].c.length; i++) {
    if (i > 0) {
      tRow = "<tr class='gap'></tr>";
    } else {
      tRow = "";
    }
    cand = elecs[elec].c[i];
    tRow += "<tr class='cand'>";
    tRow += "<td class='leftCol'>";

    cand.n = properName(cand.n);
    candFbLink = "";
    partyFbLink = "";

    // Add candidate page from party (or other) website if available
    if (cand.u) {
      if (cand.u.length === 1) {
        if (cand.u[0].substring(0, 2) === "//") {
          candLink = cand.u[0];
        } else { // Join party website and candidate path
          candLink = "http://" + party.u + "/" + cand.u[0];
        }
      } else { // two items in candidate URL array: sub-domain and path
        candLink = "http://" + cand.u[0] + "." + party.u + "/" + cand.u[1];
      }
      candLinkClass = "";
      candLinkTitle = candTitle;
    } else {
      // No link: use Google I'm Feeling Lucky
      candLink = googleIFLuckyBaseUrl + encodeURI(cand.n + " " + cand.p + " " + elec);
      candLinkClass = " class='guess'";
      candLinkTitle = googleIFLTitle;
    }

    partyName = cand.p;

    if (parties.hasOwnProperty(cand.p)) {
      // Include details for cand's party

      party = parties[cand.p];
      partyName = party.n || cand.p;

      // I only have candidate photos for major parties
      if (party.major) {
        img = cand.n + " " + cand.p + " " + elec + ".jpg";
        img = imgPath + img.replace(/ /g, "_").replace(/\'/g, "").toLowerCase();
        png = img.replace(/jpg$/, "png");
        alt = (cand.n + " " + partyName + " candidate for " + elec).replace(/'/g, "\'");
        tRow += "<a href='" + candLink + "' target='_blank'><div class='imgFrame' style='background-image: url(" + img + "), url(" + png + ")'></div></a>";
      }

      if (party.u) {
        // Add party website if available
        partyLink = "http://" + party.u;
        partyLinkClass = "";
        partyLinkTitle = partyTitle;
      } else {
        // No link: use Google I'm Feeling Lucky
        partyLink = googleIFLuckyBaseUrl + encodeURI(partyName);
        partyLinkClass = " class='guess'";
        partyLinkTitle = googleIFLTitle;
      }

      if (cand.p === "Ind") {
        // Independents have no party so no party website or party Facebook page
        partyNameElem = partyName;
      } else {
        partyNameElem = "<a" + partyLinkClass + partyLinkTitle + " href='" +
          partyLink + "' target='_blank'>" + partyName + "</a>";

        if (party.f) {
          // Add party facebook link if available
          partyFbLink = "<a class='fbLink' title='Party Facebook page' href='" +
            fbBaseUrl + party.f + "' target='_blank'>" + "</a>";
        }
      }
    } else {
      console.warn("No party found for '" + partyName + "'")
      partyNameElem = partyName;
    }
    partyNameElem = "<p class='partyLink'>" + partyNameElem + partyFbLink + "</p>";

    candNameElem = "<a" + candLinkClass + candLinkTitle + " href='" +
      candLink + "' target='_blank'>" + cand.n + "</a>";

    if (cand.f) { // Add candidate facebook link if available
      candFbLink = "<a class='fbLink' title='Candidate Facebook page' href='" +
        fbBaseUrl + cand.f + "' target='_blank'>" + "</a>";
    }

    candNameElem = "<p class='candLink'>" + candNameElem + candFbLink + "</p>";

    if (cand.p === "Ind" || (parties.hasOwnProperty(cand.p) && party.major)) {
      tRow = tRow.replace("<tr class='cand'>", "<tr class='cand " + cand.p.toLowerCase() + "'>");
    }

    if (parties.hasOwnProperty(cand.p) && party.major) {
      tRow += "</td><td class='rightCol'>";
      tRow += candNameElem;
    } else {
      tRow += candNameElem;
      tRow += "</td><td class='rightCol'>";
    }
    tRow += partyNameElem + "</td></tr>";

    tBody += tRow;
  }
  return tBody;
}

// Can't use this now we're using background-image instead of img. Just use fall-back png
//function imgError(image) {
//  // If file extension is .jpg, try again with .png (e.g. Lib Victoria)
//  if (image.src.split(".").pop().toLowerCase() === "jpg") {
//    image.src = image.src.replace(/jpg$/, "png");
//  } else {
//    image.onerror = "";
//    image.src = "images/blank.png";
//    image.style.width = 0;
//    image.style.height = 0;
//  }
//  return true;
//}

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

function properName(name) {
  return ("" + name.replace(/[^\s\-\']+[\s\-\']*/g, function (word) {
    return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
  }).replace(/\b(Van|De|Der|Da|Von)\b/g, function (nobiliaryParticle) {
    return nobiliaryParticle.toLowerCase();
  }).replace(/Mc(.)/g, function (match, letter3) {
    return 'Mc' + letter3.toUpperCase();
  }));
}

function closePanel(panel) {
  //  elem.innerHTML = "";
  var elem = document.getElementById(panel + "Panel");
  if (panel === "input") {
    //    if (!mouse) {
    //      document.getElementById("numpad").classList.add("closed");
    //    }
    var inputs = elem.querySelectorAll(".inputBtn:not(button)");
    for (var i = 0; i < inputs.length; i++) {
      //      inputs[i].classList.remove("active");
      switchBtn(inputs[i], false);
    }
    elem.classList.add("closed");
    clearInput();
  }
  // Close the shadow containing this panel
  elem.parentElement.classList.add('closed');

  closeHdr();
  map.enableMapNavigation();
}

function clearInput() {
  document.getElementById("pcInput").value = "";
  disableNumBtns("");
  document.getElementById("locSel").style.display = "none";
  document.getElementById("pcErr").style.display = "none";
  document.getElementById("elecInput").value = "";
  if (!dataListSupported) {
    document.getElementById("elecInputPolyfill").style.display = "none";
  }
}

function openPanel(panel, btn) {
  //  panel.innerHTML = "";
  var elem = document.getElementById(panel + "Panel");
  map.disableMapNavigation();
  switch (panel) {
    case "input":
      // elem.style.display = "block";
      elem.classList.remove('closed');
      //      document.getElementById("elecPanel").style.display = "none";

      if (btn) {
        //  Open selected btn
        var btnElem = document.getElementById(btn + "Input");
        btnElem.classList.add("active");
        if (btn === "pc" && !mouse) {
          document.getElementById("numpad").classList.remove("closed")
        } else {
          btnElem.focus();
        }
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

function switchBtn(btn, on) {
  if (on) {
    switch (btn.id) {
      case "pcInput":
        if (!mouse) {
          document.getElementById('numpad').classList.remove('closed');
          btn.blur();
        }
        switchBtn(document.getElementById('elecInput'), false);
        break;
      case "elecInput":
        switchBtn(document.getElementById('pcInput'), false);
        break;
      default:
        console.warn("Unknown button '" + btn.id + "' in function switchBtn");
        break;
    }
    btn.classList.add('active');
  } else { // off
    switch (btn.id) {
      case "pcInput":
        if (!mouse) {
          document.getElementById("numpad").classList.add('closed');
        }
        //          document.getElementById("locSel").style.display = 'none';
        break;
      case "elecInput":
        break;
      default:
        console.warn("Unknown button '" + btn.id + "' in function switchBtn");
        return;
    }
    btn.classList.remove('active');
    btn.blur();
  }
  clearInput();
}

function openHdr(msg, title) {
  var mapHdr = document.getElementById("mapHeader");
  mapHdr.innerHTML = msg;
  mapHdr.classList.remove("closed");
  if (title) {
    mapHdr.classList.add("title");
  } else {
    mapHdr.classList.remove("title");
  }
}

function closeHdr() {
  var classList = document.getElementById("mapHeader").classList;
  classList.add('closed');
  classList.remove('title');
}

function candyHeight() {
  var elecPanel = document.getElementById("elecPanel");

  var style = window.getComputedStyle(elecPanel, null);

  return parseInt(style.getPropertyValue("height")) -
    fullHeight(elecPanel.querySelector(".header")) -
    fullHeight(elecPanel.querySelector("h2"));
}

function fullHeight(el) {
  // Get the DOM Node if you pass in a string
  el = (typeof el === 'string') ? document.querySelector(el) : el;

  var styles = window.getComputedStyle(el);
  var margin = parseFloat(styles['marginTop']) +
    parseFloat(styles['marginBottom']);

  return Math.ceil(el.offsetHeight + margin);
}
