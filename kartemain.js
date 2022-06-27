let innsbruck = {
    lat: 47.267222,
    lng: 11.392778,
    title: "Innsbruck"
};

let startLayer = L.tileLayer.provider("BasemapAT.grau")

let map = L.map("map", {
    center: [innsbruck.lat, innsbruck.lng],
    zoom: 12,
    layers: [
        startLayer
    ]
});

// Layercontrol
let layerControl = L.control.layers({
    "Basemap Österreich Grau": startLayer,
    "Basemap Österreich Standard": L.tileLayer.provider("BasemapAT.basemap"),
    "Basemap Österreich High-DPI": L.tileLayer.provider("BasemapAT.highdpi"),
    "Basemap Österreich Gelände": L.tileLayer.provider("BasemapAT.terrain"),
    "Basemap Österreich Oberfläche": L.tileLayer.provider("BasemapAT.surface"),
    "Basemap Österreich Orthofoto": L.tileLayer.provider("BasemapAT.orthofoto"),
    "Basemap Österreich Beschriftung": L.tileLayer.provider("BasemapAT.overlay"),
    "Basemap Österreich mit Orthofoto und Beschriftung": L.layerGroup([
        L.tileLayer.provider("BasemapAT.orthofoto"),
        L.tileLayer.provider("BasemapAT.overlay"),
    ]),
    "Esri World Imagery": L.tileLayer.provider("Esri.WorldImagery")
}).addTo(map);

layerControl.expand();

// Maßstab hinzufügen
L.control.scale({
    imperial: false,
}).addTo(map);

// Fullscreen hinzufügen
L.control.fullscreen().addTo(map);

// Minimap hinzufügen
let miniMap = new L.Control.MiniMap(
    L.tileLayer.provider("BasemapAT"), {
        toggleDisplay: true
    }
).addTo(map);

// Almzentren Marker und Pop-Up mit Beschriftung
async function loadSites(url) {
    let response = await fetch(url);    
    let geojson = await response.json();

    let overlay = L.markerClusterGroup();
    layerControl.addOverlay(overlay, "Almzentren");
    overlay.addTo(map);

    L.geoJSON(geojson, {
        pointToLayer: function(geoJsonPoint, latlng) {
            let popup = `
                <strong>${geoJsonPoint.properties.NAME}</strong>
                <hr>
                Gemeindenummer: ${geoJsonPoint.properties.GEMNR}<br>
                Objektbezeichnung: ${geoJsonPoint.properties.OBJEKTBEZEICHNUNG}<br>
                Erfassungsmaßstab: ${geoJsonPoint.properties.ERFASSUNGSMASSSTAB}
            `;
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: "icons/mountains.png",
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37]
                })
            }).bindPopup(popup);
        }
    }).addTo(overlay);
}
loadSites("https://data-tiris.opendata.arcgis.com/datasets/tiris::almzentren-1.geojson");



// Overlays für Wind- und Wettervorhersage
const overlays = {
    "wind": L.featureGroup().addTo(map),
    "weather": L.featureGroup().addTo(map),
};

// Datum formatieren
let formatDate = function(date) {
    return date.toLocaleDateString("de-AT", {
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }) + " Uhr";
}

// Windvorhersage
async function loadWind(url) {
    const response = await fetch(url);
    const jsondata = await response.json();


    let forecastDate = new Date(jsondata[0].header.refTime);

    forecastDate.setHours(forecastDate.getHours() + jsondata[0].header.forecastTime);


    let forecastLabel = formatDate(forecastDate);

    layerControl.addOverlay(overlays.wind, `ECMWF Windvorhersage für ${forecastLabel}`)

    L.velocityLayer({
        data: jsondata,
        lineWidth: 5,
        displayOptions: {
            velocityType: "",
            directionString: "Windrichtung",
            speedString: "Windgeschwindigkeit",
            speedUnit: "k/h",
            emptyString: "keine Daten vorhanden",
            position: "bottomright"
        }
    }).addTo(overlays.wind);

};
loadWind("https://geographie.uibk.ac.at/webmapping/ecmwf/data/wind-10u-10v-europe.json");

// Wettervorhersage
async function loadWeather(url) {

};
loadWeather("https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=47.267222&lon=11.392778");