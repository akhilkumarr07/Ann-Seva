
import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./styles/Register.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon (leaflet + webpack issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Component that listens for map clicks and moves the marker
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const Registration = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    email: "",
    role: "donor",
    location: { landmark: "", lat: null, long: null },
  });
  const [markerPos, setMarkerPos] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef(null);
  const navigate = useNavigate();

  // Reverse geocode lat/long → readable address via OpenStreetMap Nominatim
  const reverseGeocode = useCallback(async (lat, lng) => {
    setIsFetchingAddress(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      const address =
        data.display_name ||
        `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setFormData((prev) => ({
        ...prev,
        location: { landmark: address, lat, long: lng },
      }));
    } catch {
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          landmark: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          lat,
          long: lng,
        },
      }));
    } finally {
      setIsFetchingAddress(false);
    }
  }, []);

  const handleMapLocationSelect = useCallback(
    (lat, lng) => {
      setMarkerPos({ lat, lng });
      reverseGeocode(lat, lng);
    },
    [reverseGeocode]
  );

  // GPS auto-detect button
  const handleGpsDetect = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMarkerPos({ lat: latitude, lng: longitude });
        reverseGeocode(latitude, longitude);
      },
      () => toast.error("Failed to detect location. Please pin on the map.")
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "landmark") {
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, landmark: value },
      }));
      
      // Auto-suggest logic using OpenStreetMap
      if (value.length > 3) {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(async () => {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(value)}&limit=5`);
            const data = await res.json();
            setAddressSuggestions(data);
            setShowSuggestions(true);
          } catch (err) {
            console.error("Address search failed", err);
          }
        }, 800);
      } else {
        setAddressSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    
    setFormData((prev) => ({
      ...prev,
      location: { 
        landmark: suggestion.display_name, 
        lat: lat, 
        long: lon 
      },
    }));
    setMarkerPos({ lat, lng: lon });
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  const handleRegister = async () => {
    if (!formData.name.trim()) {
      setErrorMessage("Name is required.");
      return;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      setErrorMessage("Enter a valid 10-digit phone number.");
      return;
    }
    if (!formData.password.trim()) {
      setErrorMessage("Password is required.");
      return;
    }
    if (
      formData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      setErrorMessage("Enter a valid email address.");
      return;
    }
    if (!formData.location.lat || !formData.location.long) {
      setErrorMessage(
        "Please pin your location on the map or use GPS detection."
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/auth/register", formData);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setErrorMessage("");
      toast.success("Registration successful!");
      const redirectUrl = response.data.redirectUrl;
      navigate(redirectUrl);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
          err.response?.data?.msg ||
          "Failed to register."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Default map center: India
  const defaultCenter = [20.5937, 78.9629];
  const mapCenter = markerPos
    ? [markerPos.lat, markerPos.lng]
    : defaultCenter;

  return (
    <div className="registration-container">
      {isLoading ? (
        <div className="registration-form animated-form">
          <div className="spinner"></div>
          <h2>⏳ Just a Moment!</h2>
          <p>Registering your account, please wait...</p>
        </div>
      ) : (
        <div className="registration-form animated-form">
          <h1>Registration</h1>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number (10 digits)"
            value={formData.phone}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="email"
            name="email"
            placeholder="Email (optional)"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="input-field"
          >
            <option value="donor">Donor</option>
            <option value="receiver">Receiver / NGO</option>
            <option value="volunteer">Volunteer</option>
            <option value="admin">Admin</option>
          </select>

          {/* ── Map Location Picker ── */}
          <div className="map-picker-section">
            <p className="map-label">
              📍 Pin Your Location{" "}
              <span className="map-label-sub">
                (click on the map to set your location)
              </span>
            </p>

            <button
              type="button"
              className="gps-button"
              onClick={handleGpsDetect}
            >
              📡 Use My GPS Location
            </button>

            <div className="map-wrapper">
              <MapContainer
                center={mapCenter}
                zoom={markerPos ? 14 : 5}
                className="register-map"
                key={markerPos ? `${markerPos.lat}-${markerPos.lng}` : "default"}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <MapClickHandler onLocationSelect={handleMapLocationSelect} />
                {markerPos && (
                  <Marker position={[markerPos.lat, markerPos.lng]} />
                )}
              </MapContainer>
            </div>

            {/* Editable address label with Autocomplete */}
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type="text"
                name="landmark"
                placeholder={
                  isFetchingAddress
                    ? "Fetching address..."
                    : "Address (auto-filled or type manually)"
                }
                value={formData.location.landmark}
                onChange={handleChange}
                className="input-field"
                disabled={isFetchingAddress}
                style={{ marginBottom: "0", width: "100%" }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onFocus={() => { if(addressSuggestions.length > 0) setShowSuggestions(true); }}
              />
              
              {showSuggestions && addressSuggestions.length > 0 && (
                <ul className="address-suggestions-list" style={{
                  position: "absolute", zIndex: 1000, background: "white", 
                  width: "100%", border: "1px solid #ccc", borderRadius: "4px", 
                  maxHeight: "150px", overflowY: "auto", padding: "0", 
                  margin: "5px 0 15px 0", listStyle: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                }}>
                  {addressSuggestions.map((s, idx) => (
                    <li 
                      key={idx} 
                      onClick={() => handleSuggestionClick(s)}
                      style={{ padding: "10px", cursor: "pointer", borderBottom: "1px solid #eee", fontSize: "14px", color: "#333", textAlign: "left" }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "#f0f0f0"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                    >
                      {s.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {markerPos && (
              <p className="coords-display">
                📌 Lat: {markerPos.lat.toFixed(5)}, Long:{" "}
                {markerPos.lng.toFixed(5)}
              </p>
            )}
          </div>

          <button onClick={handleRegister} className="submit-button">
            Register
          </button>

          {errorMessage && (
            <p className="error-message">{errorMessage}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Registration;
