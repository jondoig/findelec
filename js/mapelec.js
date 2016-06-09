var map;

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

var symbol, label;

function initMap(m) {
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

    m = new Map("viewDiv", {
      basemap: "streets",
      //      extent: new Extent(west, south, east, north),
      showLabels: true,
      fitExtent: true,
      minScale: 40000000, // User cannot zoom out beyond 1:40m (Australia)
      maxScale: 9000 // User cannot zoom in beyond 1:9k (street)
    });

    m.setExtent(new Extent(ozExtent));

    //apply a renderer to draw the electorates layer
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
      map: m
    }, "HomeButton");
    home.startup();
  });
}

function drawMap(m, state, extent) {
  require([
        "esri/map",
//        "esri/dijit/HomeButton",
        "esri/layers/FeatureLayer",
        "esri/geometry/Extent",
//        "esri/symbols/TextSymbol",
//        "esri/symbols/Font",
//        "esri/layers/LabelClass",
//        "esri/Color",
//        "esri/symbols/SimpleMarkerSymbol",
        "esri/renderers/SimpleRenderer",
//        "esri/symbols/SimpleFillSymbol",
//        "esri/symbols/SimpleLineSymbol",
        "dojo/domReady!"
//    ], function (Map, HomeButton, FeatureLayer, Extent, TextSymbol, Font, LabelClass, Color, SimpleMarkerSymbol, SimpleRenderer, SimpleFillSymbol, SimpleLineSymbol) {
    ], function (Map, FeatureLayer, Extent, SimpleRenderer) {

        m.setExtent(new Extent(extent));

    if (state) {
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

      m.addLayer(lyr);
    }

    //  document.getElementById("mapDiv").style.display = "initial";
  });

}
