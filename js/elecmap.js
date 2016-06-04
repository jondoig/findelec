function map(state, extent) {
  require([
        "esri/Map",
        "esri/views/MapView",
        "esri/widgets/Home",
        "esri/layers/FeatureLayer",
        "esri/PopupTemplate",
        "esri/geometry/Extent",
        "dojo/domReady!"
    ], function (Map, MapView, Home, FeatureLayer, PopupTemplate, Extent) {

    var tpl = new PopupTemplate({
      title: "Electorate: {Elect_div}",
      content: "<p>Area: {Area_SqKm} km<sup>2</sup></p>"
    });

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

    var map = new Map({
      basemap: "streets"
    });

    var lyr = new FeatureLayer({
      url: urlPrefix + states[state].replace(/ /g, "_") + urlSuffix,
      outFields: ["Elect_div", "Area_SqKm"],
      popupTemplate: tpl
        //          ,opacity: 0
    });
    map.add(lyr);

    var view = new MapView({
      container: "viewDiv",
      map: map,
      Extent: new Extent(extent.w, extent.s, extent.e, extent.n),
      fitExtent: true
    });

    view.constraints = {
      minScale: 40000000, // User cannot zoom out beyond 1:40m (Australia)
      maxScale: 9000, // User cannot zoom in beyond 1:9k (street)
      rotationEnabled: false // Disables map rotation
    };

    var homeWidget = new Home({
      view: view
    });

    view.ui.add(homeWidget, "top-left");
  });

  document.getElementById("mapDiv").style.display = "initial";
}
