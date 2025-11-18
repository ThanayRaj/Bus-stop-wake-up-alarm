# Bus Stop Wake-Up Alarm  
A location-aware smart alarm that wakes commuters before they miss their stop.

This project solves a real-life problem: people falling asleep on buses and overshooting their destination.  
The application tracks your live GPS location and rings a loud alarm when you enter a chosen radius near your destination.

---

## Features

- Live GPS Tracking using the Geolocation API  
- Converts any address to coordinates using OpenStreetMap (Nominatim API)  
- Rings a loud alarm when you enter the selected radius  
- Uses WebAudio API to bypass autoplay restrictions on Android  
- Mobile-friendly clean interface  
- Fully deployed using Netlify  

---

## Tech Stack

Frontend:  
- HTML  
- CSS  
- JavaScript  

APIs Used:  
- Geolocation API  
- WebAudio API  
- OpenStreetMap Nominatim API  

Deployment:  
- Netlify  

---

## How It Works

1. User enters an address or latitude/longitude  
2. The app converts the address into GPS coordinates  
3. User selects a radius (example: 2000 meters)  
4. Real-time tracking begins  
5. When the user enters the radius, the alarm rings loudly and vibrates the phone  

---

## Live Demo  

Live Website:  
https://lucent-taiyaki-1986f6.netlify.app  

GitHub Repository:  
https://github.com/ThanayRaj/Bus-stop-wake-up-alarm  

---

## File Structure

index.html – Main UI  
style.css – Styling  
app.js – Core logic (GPS + Alarm)  
README.md – Project documentation  

---

## Future Improvements

- Add map preview  
- Add dark mode  
- Add “Wake me X minutes before stop”  
- Convert to Android App  
- Background GPS tracking  

---

## Developer  
Thanay Raj  
Hyderabad, India
