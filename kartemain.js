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
    "BasemapAT Grau": startLayer,
    "Basemap Standard": L.tileLayer.provider("BasemapAT.basemap"),
    "Basemap High-DPI": L.tileLayer.provider("BasemapAT.highdpi"),
    "Basemap Gelände": L.tileLayer.provider("BasemapAT.terrain"),
    "Basemap Oberfläche": L.tileLayer.provider("BasemapAT.surface"),
    "Basemap Orthofoto": L.tileLayer.provider("BasemapAT.orthofoto"),
    "Basemap Beschriftung": L.tileLayer.provider("BasemapAT.overlay"),
    "Basemap mit Orthofoto und Beschriftung": L.layerGroup([
        L.tileLayer.provider("BasemapAT.orthofoto"),
        L.tileLayer.provider("BasemapAT.overlay"),
    ])
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

