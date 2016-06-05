function drawMap(state, west, south, east, north) {
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
        "esri/InfoTemplate",
        "dojo/domReady!"
    ], function (Map, HomeButton, FeatureLayer, Extent, TextSymbol, Font, LabelClass, Color, SimpleMarkerSymbol, SimpleRenderer, SimpleFillSymbol, SimpleLineSymbol, InfoTemplate) {

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

    var url = urlPrefix + states[state].replace(/ /g, "_") + urlSuffix;

    var drawColor = new Color("#008060");

    var map = new Map("viewDiv", {
      basemap: "streets",
      extent: new Extent(west, south, east, north),
      showLabels: true,
      fitExtent: true,
      minScale: 40000000, // User cannot zoom out beyond 1:40m (Australia)
      maxScale: 9000 // User cannot zoom in beyond 1:9k (street)
    });

    var infoTemplate = new InfoTemplate();
    infoTemplate.setTitle("Electorate: ${" + labelFields[state] + "}");
    infoTemplate.setContent("<p>Information about ${" + labelFields[state] + "}:</p><ul><li><a href=''>Profile</a></li><li><a href=''>Sitting MP</a></li><li><a href=''>Candidates</a></li></ul>");

    var lyr = new FeatureLayer(url, {
      id: "lyr",
      infoTemplate: infoTemplate,
      outFields: [labelFields[state]]
    });

    //apply a renderer to draw the electorates layer
    var symbol = new SimpleFillSymbol(
      SimpleFillSymbol.STYLE_SOLID,
      new SimpleLineSymbol(
        SimpleLineSymbol.STYLE_SOLID,
        new Color([0, 128, 96, 1]), 3
      ),
      new Color([0, 0, 0, 0])
    );

    lyr.setRenderer(new SimpleRenderer(symbol));

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
        "value": "{" + labelFields[state] + "}"
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
