let API_URL = "http://localhost:5000/"; // ✅ Default for local dev

// ✅ If your frontend is running on Dev Tunnel (like VSCode tunnel)
if (window.location.hostname.includes("devtunnels.ms")) {
  API_URL = "https://9wdd2cbc-5000.inc1.devtunnels.ms/"; // your Flask tunnel URL
}

// ✅ If accessed over LAN (from another device)
else if (window.location.hostname.startsWith("10.")) {
  API_URL = "http://10.201.130.32:5000/"; // your Flask LAN IP
}

export default API_URL;
