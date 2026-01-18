document.addEventListener("DOMContentLoaded", () => {
const busRoutes = [
  {
    route: "DS-21",
    origin: "Dwarka Sec-23",
    destination: "Krishi Bhawan",
    stops: [
      "Dwarka Sec-22/23 X-ing",
      "Dwarka Sec-20/21 X-ing",
      "Dwarka Sec-8 Metro Station"
    ],
    morning: "08:20",
    evening: "18:05"
  },
  {
    route: "DS-22",
    origin: "Dwarka Sec-19 Pkt-3",
    destination: "Nehru Place",
    stops: [
      "Dwarka Sec-10/11",
      "Pratibha School",
      "Dwarka Sec-6/10"
    ],
    morning: "08:15",
    evening: "18:05"
  }
  // We will add more gradually
];

const busStops = {
  "Lajpat Nagar Bus Stop": [28.5665, 77.2421],
  "AIIMS Bus Stop": [28.5672, 77.2100],
  "ISBT Kashmere Gate": [28.6670, 77.2280],
  "ITO Bus Stop": [28.6304, 77.2482],
  "Dwarka Mor Bus Stop": [28.6196, 77.0335],
  "Karol Bagh Bus Stop": [28.6512, 77.1895],
  "Connaught Place Bus Stop": [28.6319, 77.2160],
  "Hauz Khas Bus Stop": [28.5491, 77.2005]
};

const locations = {
  "Lajpat Nagar": [28.5677, 77.2433],
  "Dwarka": [28.5921, 77.0460],
  "Rohini": [28.7499, 77.0565],
  "Saket": [28.5245, 77.2066],
  "Karol Bagh": [28.6517, 77.1907],
  "Connaught Place": [28.6315, 77.2167],
  "Noida Sector 18": [28.5708, 77.3260],
  "Chandni Chowk": [28.6562, 77.2303],
  "Hauz Khas": [28.5494, 77.2001],
  "Rajiv Chowk": [28.6328, 77.2197]
};

const metroStations = {
  "Rajiv Chowk": [28.6328, 77.2197],
  "Kashmere Gate": [28.6676, 77.2273],
  "Central Secretariat": [28.6143, 77.2115],
  "Hauz Khas": [28.5494, 77.2001],
  "Dwarka Sector 21": [28.5522, 77.0580],
  "Lajpat Nagar": [28.5677, 77.2433],
  "Karol Bagh": [28.6517, 77.1907],
  "Chandni Chowk": [28.6562, 77.2303],
  "Noida Sector 18": [28.5708, 77.3260]
};


/* ---------- DROPDOWNS ---------- */
const startSelect = document.getElementById("start");
const endSelect = document.getElementById("end");

startSelect.innerHTML = '<option value="">Select start location</option>';
endSelect.innerHTML = '<option value="">Select destination</option>';

Object.keys(locations).sort().forEach(place => {
  startSelect.add(new Option(place, place));
  endSelect.add(new Option(place, place));
});

/* ---------- HELPERS ---------- */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearest(placeCoords, dataset) {
  let nearest = null, min = Infinity;
  for (const [name, coords] of Object.entries(dataset)) {
    const d = calculateDistance(placeCoords[0], placeCoords[1], coords[0], coords[1]);
    if (d < min) {
      min = d;
      nearest = { name, coords, distance: d };
    }
  }
  return nearest;
}

function estimateTime(distanceKm, speedKmh) {
  return (distanceKm / speedKmh) * 60;
}
function haversine(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const sa = Math.sin(dLat / 2) ** 2 +
             Math.cos(a.lat * Math.PI / 180) *
             Math.cos(b.lat * Math.PI / 180) *
             Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(sa), Math.sqrt(1 - sa));
}

/* ---------- MAP ---------- */
const map = L.map("map").setView([28.6139, 77.2090], 11);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

let layers = [];
let chosenStopMarker;
const redIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});


/* ---------- CLICK ---------- */
document.getElementById("findRoute").addEventListener("click", () => {
  const start = startSelect.value;
  const end = endSelect.value;

  if (!locations[start] || !locations[end]) {
    alert("Select valid locations");
    return;
  }

  layers.forEach(l => map.removeLayer(l));
  layers = [];

  const startMetro = findNearest(locations[start], metroStations);
  const endMetro = findNearest(locations[end], metroStations);
  const startBus = findNearest(locations[start], busStops);
  const endBus = findNearest(locations[end], busStops);

  const metroTime =
    estimateTime(startMetro.distance, 5) +
    estimateTime(
      calculateDistance(
        startMetro.coords[0], startMetro.coords[1],
        endMetro.coords[0], endMetro.coords[1]
      ), 35
    ) +
    estimateTime(endMetro.distance, 5);

  const busTime =
    estimateTime(startBus.distance, 5) +
    estimateTime(
      calculateDistance(
        startBus.coords[0], startBus.coords[1],
        endBus.coords[0], endBus.coords[1]
      ), 30
    ) +
    estimateTime(endBus.distance, 5);

  const chosenMode = busTime < metroTime ? "bus" : "metro";
  // Remove previous chosen stop marker
if (chosenStopMarker) {
  map.removeLayer(chosenStopMarker);
}

// Add red marker based on chosen mode
if (chosenMode === "bus") {
  chosenStopMarker = L.marker(startBus.coords, { icon: redIcon })
    .addTo(map)
    .bindPopup(`Nearest Bus Stop: ${startBus.name}<br>Chosen for faster travel`);
} else {
  chosenStopMarker = L.marker(startMetro.coords, { icon: redIcon })
    .addTo(map)
    .bindPopup(`Nearest Metro Station: ${startMetro.name}<br>Chosen for faster travel`);
}

layers.push(chosenStopMarker);


  /* ---------- MAP MARKERS ---------- */
  layers.push(L.marker(locations[start]).addTo(map));
  layers.push(L.marker(locations[end]).addTo(map));

  map.fitBounds([locations[start], locations[end]], { padding: [40, 40] });
function chooseTransport(startCoord, endCoord) {
  let bestBus = null;
  let bestBusTime = Infinity;
if (choice.mode === "bus") {
  L.marker(locations[choice.details.stop], {
    icon: L.icon({
      iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
      iconSize: [32, 32]
    })
  }).addTo(map).bindPopup(
    `Take Bus ${choice.details.bus.route}`
  );
}

  busRoutes.forEach(bus => {
    bus.stops.forEach(stop => {
      if (!locations[stop]) return;

      const walkToBus = haversine(startCoord, locations[stop]) / 5 * 60;
      if (walkToBus > 15) return;

      const busRide = 25; // avg estimate
      const totalBusTime = walkToBus + busRide;

      if (totalBusTime < bestBusTime) {
        bestBusTime = totalBusTime;
        bestBus = { bus, stop };
      }
    });
  });

  const metroTime = 35; // placeholder for now

  if (bestBus && bestBusTime < metroTime) {
    return { mode: "bus", details: bestBus };
  }

  return { mode: "metro" };
}

  /* ---------- TEXT OUTPUT ---------- */
  const routeList = document.getElementById("routeList");
  const reason = document.getElementById("reason");
  const result = document.getElementById("result");

  routeList.innerHTML = "";

  if (chosenMode === "bus") {
    routeList.innerHTML += `<li>Walk to ${startBus.name} (${startBus.distance.toFixed(2)} km)</li>`;
    routeList.innerHTML += `<li>Take a bus to ${endBus.name}</li>`;
    routeList.innerHTML += `<li>Walk to ${end} (${endBus.distance.toFixed(2)} km)</li>`;
    reason.textContent = `Bus is faster (~${busTime.toFixed(1)} min) than metro (~${metroTime.toFixed(1)} min).`;
  } else {
    routeList.innerHTML += `<li>Walk to ${startMetro.name} metro station (${startMetro.distance.toFixed(2)} km)</li>`;
    routeList.innerHTML += `<li>Take metro to ${endMetro.name}</li>`;
    routeList.innerHTML += `<li>Walk to ${end} (${endMetro.distance.toFixed(2)} km)</li>`;
    reason.textContent = `Metro is faster (~${metroTime.toFixed(1)} min) than bus (~${busTime.toFixed(1)} min).`;
  }

  result.style.display = "block";
});

});
//NOTE TO ONESELF 
//CHECK IF THE ALGO IS LOOKING AT THE DIST THROUGH THE ROUTES USING DIKSTRA AND NOT DRAWING A STRAIGHT LINE 
//METRO ALSO 
//UPLOAD THE DATA FROM THE SITE 