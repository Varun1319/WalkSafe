# WalkSafe

A modern web application that helps you walk home safely by sharing your live location with family and friends and providing emergency features.

---

## Features

 - Real-time location tracking on a map  
 - "Send SOS" feature to alert contacts and generate a downloadable SOS badge  
 - Check-ins log with smooth fade-in animations  
 - Network connectivity status monitoring  
 - Last known location shown when walk stops  

---

## Web APIs used

| API                      | Usage                                 |
|--------------------------|---------------------------------------|
| **Geolocation API**      | Track live location.                 |
| **Network Information API** | Show connection type & alert on slow/unstable networks. |
| **Intersection Observer API** | Animate check-ins smoothly. |
| **Canvas API**           | Generate SOS badge image (downloadable). |

---

### User flow

- User clicks Start Walk - app starts tracking location  
- User can click Send SOS to highlight an emergency and generate a badge.  
- User stops the walk, app shows last known location and route.  

---


<img src="view/pic1.png" alt="App screenshot" width="400"/> <img src="view/pic2.png" alt="App screenshot" width="400"/>
<img src="view/pic3.png" alt="App screenshot" width="400"/>

I have used VPN to mask my location.
