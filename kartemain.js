let innsbruck = {
    lat: 47.267222, 
    lng: 11.392778,
    title: "Innsbruck"
};

let startLayer = L.tileLayer.provider("BasemapAT.grau")

let map = L.map("map", {
    center: [ innsbruck.lat, innsbruck.lng ], 
    zoom: 12,
    layers: [
        startLayer
    ]
});

// Maßstab hinzufügen
L.control.scale({
    imperial: false,
}).addTo(map);

// Fullscreen hinzufügen
L.control.fullscreen().addTo(map);