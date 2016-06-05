function drawMap(state, west, south, east, north) {
  require([
        "esri/map",
//        "esri/views/MapView",
//        "esri/widgets/Home",
        "esri/dijit/HomeButton",
        "esri/layers/FeatureLayer",
//        "esri/PopupTemplate",
        "esri/geometry/Extent",
        "esri/symbols/TextSymbol",
        "esri/symbols/Font",
        "esri/layers/LabelClass",
        "esri/Color",
        "dojo/domReady!"
//    ], function (map, MapView, Home, FeatureLayer, PopupTemplate, Extent, TextSymbol, LabelClass, Color) {
    ], function (Map, HomeButton, FeatureLayer, Extent, TextSymbol, Font, LabelClass, Color) {

    //    var tpl = new PopupTemplate({
    //      title: "Electorate: {Elect_div}",
    //      content: "<p>Area: {Area_SqKm} km<sup>2</sup></p>"
    //    });

    var urlPrefix = "http://services5.arcgis.com/BZoOjszBbEr9f2ol/arcgis/rest/services/Australian_Federal_Electorates_2016_",
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

    var url = urlPrefix + states[state].replace(/ /g, "_") + urlSuffix;

    var drawColor = new Color("#008060");

    var map = new Map("viewDiv", {
      basemap: "streets",
      extent: new Extent(west, south, east, north),
      showLabels: true,
      fitExtent: true,
      //      rotationEnabled: false, // Disables map rotation
      minScale: 40000000, // User cannot zoom out beyond 1:40m (Australia)
      maxScale: 9000 // User cannot zoom in beyond 1:9k (street)
    });

    //    var lyr = new FeatureLayer({
    //      url: urlPrefix + states[state].replace(/ /g, "_") + urlSuffix,
    //      outFields: ["*"]
    //        //      outFields: [labelFields[state]]
    //        //      ,popupTemplate: tpl
    //        //          ,opacity: 0
    //    });

    var lyr = new FeatureLayer(url, {
      id: "lyr",
      //      outFields: ["*"]
      outFields: [labelFields[state]]
    });

    // create a text symbol to define the style of labels
    var label = new TextSymbol().setColor(drawColor);
    //    label.font.setSize("14pt");
    label.font.setSize("18pt");
    label.font.setFamily("arial");
    label.font.setWeight(Font.WEIGHT_BOLD);
    label.setHaloColor(new Color("white"));
    label.setHaloSize(5);

    var labelJson = {
      "labelExpressionInfo": {
        "value": "{Elect_div}"
      }
    };

    var labelClass = new LabelClass(labelJson);
    labelClass.symbol = label;

    lyr.setLabelingInfo([labelClass]);
    map.addLayer(lyr);

    var home = new HomeButton({
      map: map
    }, "HomeButton");
    home.startup();
    });
  document.getElementById("mapDiv").style.display = "initial";
}
