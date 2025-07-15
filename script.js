// Initialize Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let watchId;
let map, userMarker, routeLine;
let routeCoords = [];
let lastLatLng = null;
let sessionId = null;

let networkInfo =
  navigator.connection || navigator.mozConnection || navigator.webkitConnection;

const startBtn = document.getElementById("startTracking");
const stopBtn = document.getElementById("stopTracking");
const sendSOSBtn = document.getElementById("sendSOS");
const statusEl = document.getElementById("status");
const locationEl = document.getElementById("location");
const networkEl = document.getElementById("network");
const checkinsEl = document.getElementById("checkins");

startBtn.addEventListener("click", startTracking);
stopBtn.addEventListener("click", stopTracking);
sendSOSBtn.addEventListener("click", drawSOSBadge);

map = L.map("map").setView([0, 0], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

function startTracking() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported!");
    return;
  }

  // Generate random session ID
  sessionId = Math.random().toString(36).substring(2, 10);

  // // Create shareable link
  // const shareLink = `${window.location.origin}/track.html?sessionId=${sessionId}`;
  // alert(`Share this link with family: ${shareLink}`);

  // Clear previous check-ins and status
  checkinsEl.innerHTML = "";
  statusEl.textContent = "Tracking started. Stay safe!";
  statusEl.style.color = "green";

  routeCoords = [];
  if (userMarker) {
    map.removeLayer(userMarker);
  }
  if (routeLine) {
    map.removeLayer(routeLine);
  }

  watchId = navigator.geolocation.watchPosition(updatePosition, handleError, {
    enableHighAccuracy: true,
    maximumAge: 5000,
    timeout: 10000,
  });

  startBtn.disabled = true;
  stopBtn.disabled = false;

  updateNetworkStatus();
  networkInfo.addEventListener("change", updateNetworkStatus);
}

function stopTracking() {
  navigator.geolocation.clearWatch(watchId);
  startBtn.disabled = false;
  stopBtn.disabled = true;
  statusEl.textContent = "Tracking stopped.";
  statusEl.style.color = "black";

  if (lastLatLng) {
    const [lat, lng] = lastLatLng;
    const lastLocP = document.createElement("p");
    lastLocP.textContent = `📌 Last location known: ${lat.toFixed(
      5
    )}, ${lng.toFixed(5)} (${new Date().toLocaleTimeString()})`;
    lastLocP.style.background = "#e8f5e9";
    lastLocP.style.color = "#2e7d32";
    lastLocP.style.fontWeight = "bold";
    checkinsEl.appendChild(lastLocP);
    observer.observe(lastLocP);
  }
}

function updatePosition(position) {
  const { latitude, longitude } = position.coords;
  lastLatLng = [latitude, longitude];
  locationEl.textContent = `📍 Location: ${latitude.toFixed(
    5
  )}, ${longitude.toFixed(5)}`;

  if (sessionId) {
    firebase
      .database()
      .ref("sessions/" + sessionId)
      .set({
        lat: latitude,
        lng: longitude,
        timestamp: new Date().toISOString(),
      });
  }

  const newLatLng = [latitude, longitude];
  routeCoords.push(newLatLng);

  if (!userMarker) {
    userMarker = L.marker(newLatLng).addTo(map);
    map.setView(newLatLng, 16);
  } else {
    userMarker.setLatLng(newLatLng);
    map.setView(newLatLng);
  }

  if (routeLine) {
    map.removeLayer(routeLine);
  }
  routeLine = L.polyline(routeCoords, { color: "blue" }).addTo(map);

  const p = document.createElement("p");
  p.textContent = `✅ Check-in at ${new Date().toLocaleTimeString()}`;
  checkinsEl.appendChild(p);
  observer.observe(p);
}

function handleError(error) {
  console.error(error);
  statusEl.textContent = "Error fetching location.";
  statusEl.style.color = "red";
}

function updateNetworkStatus() {
  if (!networkInfo) {
    networkEl.textContent = "📶 Network info not supported.";
    return;
  }

  let type = networkInfo.effectiveType || "unknown";
  networkEl.textContent = `📶 Network: ${type}`;

  if (type === "slow-2g" || type === "2g") {
    alert("⚠️ Slow connection detected! Inform your contact.");
  }
}

function drawSOSBadge() {
  if (lastLatLng) {
    const [lat, lng] = lastLatLng;
    statusEl.textContent = `🚨 SOS called at ${lat.toFixed(5)}, ${lng.toFixed(
      5
    )} (${new Date().toLocaleTimeString()})`;
    statusEl.style.color = "#c62828";
    statusEl.style.fontWeight = "bold";
  }
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = 1;
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.1,
  }
);
