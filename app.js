const destInput = document.getElementById('destinationInput');
const geocodeBtn = document.getElementById('geocodeBtn');
const setBtn = document.getElementById('setBtn');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const testAlarmBtn = document.getElementById('testAlarmBtn');

const destCoordsEl = document.getElementById('destCoords');
const statusEl = document.getElementById('status');
const distanceEl = document.getElementById('distance');

const radiusInput = document.getElementById('radiusInput');

let dest = null;
let watchId = null;
let triggered = false;

// --- AUDIO ENGINE (WebAudio API, cannot be blocked) ---
let audioCtx;
let oscillator;

function playAlarm() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 800; // loud beep frequency

    gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(1, audioCtx.currentTime + 0.2);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();

    // Pulse effect for alarm
    setInterval(() => {
        oscillator.frequency.value = (oscillator.frequency.value === 800) ? 600 : 800;
    }, 300);
}

function stopAlarm() {
    if (oscillator) oscillator.stop();
    oscillator = null;
}

// Unlock audio on Android Chrome
testAlarmBtn.onclick = () => {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    playAlarm();
    setTimeout(() => stopAlarm(), 1500);
    alert("Alarm unlocked! Now it will ring properly.");
};

// --- Haversine distance ---
function getDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = deg => deg * Math.PI / 180;

    let dLat = toRad(lat2 - lat1);
    let dLon = toRad(lon2 - lon1);

    let a = Math.sin(dLat/2)**2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2)**2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// --- parse lat,lon ---
function parseLatLonMaybe(input) {
    const parts = input.split(",").map(x => x.trim());
    if (parts.length === 2) {
        let la = parseFloat(parts[0]);
        let lo = parseFloat(parts[1]);
        if (!isNaN(la) && !isNaN(lo)) return { lat: la, lon: lo };
    }
    return null;
}

// --- Geocode ---
async function geocodeAddress(q) {
    const url = "https://nominatim.openstreetmap.org/search?format=json&q=" + encodeURIComponent(q);
    try {
        const r = await fetch(url);
        const j = await r.json();
        if (j.length > 0) {
            return { lat: parseFloat(j[0].lat), lon: parseFloat(j[0].lon), name: j[0].display_name };
        }
    } catch(e) { console.log(e); }
    return null;
}

// --- UI handlers ---
geocodeBtn.onclick = async () => {
    const q = destInput.value.trim();
    if (!q) return alert("Enter destination or lat,lon");

    const manual = parseLatLonMaybe(q);
    if (manual) {
        dest = manual;
        destCoordsEl.textContent = `Destination: ${dest.lat}, ${dest.lon}`;
        statusEl.textContent = "Manual destination set";
        return;
    }

    statusEl.textContent = "Geocoding...";
    const g = await geocodeAddress(q);

    if (!g) return alert("Geocoding failed");

    dest = { lat: g.lat, lon: g.lon };
    destCoordsEl.textContent = `Destination: ${dest.lat}, ${dest.lon} — ${g.name}`;
    statusEl.textContent = "Destination set";
};

setBtn.onclick = () => {
    if (!dest) return alert("No destination set");
    alert("Destination saved!");
};

// --- Tracking ---
startBtn.onclick = () => {
    if (!dest) return alert("Set destination first");

    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtx.resume(); // ensure unlocked

    triggered = false;
    startBtn.disabled = true;
    stopBtn.disabled = false;

    statusEl.textContent = "Waiting for GPS...";

    watchId = navigator.geolocation.watchPosition(onPosition, onError, {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 10000
    });
};

stopBtn.onclick = () => {
    if (watchId) navigator.geolocation.clearWatch(watchId);
    watchId = null;

    stopAlarm();
    statusEl.textContent = "Stopped";
    startBtn.disabled = false;
    stopBtn.disabled = true;
};

function onPosition(pos) {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    const rad = Number(radiusInput.value) || 2000;
    const dist = getDistanceMeters(lat, lon, dest.lat, dest.lon);

    distanceEl.textContent = `Distance: ${Math.round(dist)} m`;
    statusEl.textContent = "Tracking...";

    if (!triggered && dist <= rad) {
        triggered = true;

        statusEl.textContent = "WITHIN RADIUS — ALARM RINGING!";
        playAlarm();
        if (navigator.vibrate) navigator.vibrate([700, 300, 700, 300, 700]);

        if (watchId) navigator.geolocation.clearWatch(watchId);
    }
}

function onError(err) {
    statusEl.textContent = "GPS Error: " + err.message;
}
