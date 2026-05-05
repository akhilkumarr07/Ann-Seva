import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from "react-leaflet";
import io from "socket.io-client";
import "leaflet/dist/leaflet.css";
import L from "leaflet"; // eslint-disable-line no-unused-vars
import axios from "axios";

const socket = io("http://localhost:5003"); // Connect to backend
const VolunteerTracking = ({ donor, receiver }) => {
    console.log("donor", donor, "receiver", receiver);
  
    // Transform donor and receiver props
    const transformedDonor = { lat: donor.lat, lng: donor.long };
    const transformedReceiver = { lat: receiver.lat, lng: receiver.long };
  
    console.log("Transformed Donor:", transformedDonor);
    console.log("Transformed Receiver:", transformedReceiver);
  
    const [volunteerLocation, setVolunteerLocation] = useState(null);
    const [routeToDonor, setRouteToDonor] = useState([]);
    const [routeToReceiver, setRouteToReceiver] = useState([]);
    const [estimatedTimeToDonor, setEstimatedTimeToDonor] = useState(null);
    const [estimatedTimeToReceiver, setEstimatedTimeToReceiver] = useState(null);
    const volunteerId = "volunteer_123"; // Unique volunteer ID
  
    useEffect(() => {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setVolunteerLocation({ lat: latitude, lng: longitude });
          console.log("volunteer updated location",{ volunteerId, lat: latitude, lng: longitude })
          socket.emit("updateVolunteerLocation", { volunteerId, lat: latitude, lng: longitude });
        },
        (error) => console.error("Error getting location:", error),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
  
      return () => navigator.geolocation.clearWatch(watchId);
    }, []);
  
    useEffect(() => {
      socket.on("updateVolunteer", async ({ location, routeToDonor, routeToReceiver }) => {
        setVolunteerLocation(location);
  
        if (routeToDonor && routeToDonor.length > 0) {
          setRouteToDonor(routeToDonor);
          fetchEstimatedTime(routeToDonor, "donor");
        } else {
          const newRouteToDonor = await fetchRoute(location, transformedDonor);
          setRouteToDonor(newRouteToDonor);
          fetchEstimatedTime(newRouteToDonor, "donor");
        }
  
        if (routeToReceiver && routeToReceiver.length > 0) {
          setRouteToReceiver(routeToReceiver);
          fetchEstimatedTime(routeToReceiver, "receiver");
        } else {
          const newRouteToReceiver = await fetchRoute(transformedDonor, transformedReceiver);
          setRouteToReceiver(newRouteToReceiver);
          fetchEstimatedTime(newRouteToReceiver, "receiver");
        }
      });
  
      return () => {
        socket.off("updateVolunteer");
      };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
    const fetchRoute = async (start, end) => {
      try {
        const response = await axios.get(`http://localhost:5003/get-route`, {
          params: { start: `${start.lat},${start.lng}`, end: `${end.lat},${end.lng}` },
        });
  
        if (response.data.coordinates && response.data.coordinates.length > 0) {
          return response.data.coordinates;
        } else {
          console.warn("⚠️ No route found");
          return [];
        }
      } catch (error) {
        console.error("❌ Error fetching route:", error);
        return [];
      }
    };
  
    const fetchEstimatedTime = async (route, type) => {
        if (route.length < 2) return;
        const start = route[0]; // [lat, lng]
        const end = route[route.length - 1]; // [lat, lng]
      
        try {
          const response = await axios.get(`https://api.openrouteservice.org/v2/directions/foot-walking`, {
            params: {
              api_key: "5b3ce3597851110001cf6248ef866fcaa5ed444f87fac8edbb5b426f", // Replace with your actual API key
              start: `${start[1]},${start[0]}`, // Format: "lng,lat"
              end: `${end[1]},${end[0]}`, // Format: "lng,lat"
            },
          });
      
          if (
            response.data.features &&
            response.data.features.length > 0 &&
            response.data.features[0].properties &&
            response.data.features[0].properties.summary
          ) {
            const timeInSeconds = response.data.features[0].properties.summary.duration;
            const minutes = Math.round(timeInSeconds / 60);
      
            if (type === "donor") {
              setEstimatedTimeToDonor(`${minutes} min`);
            } else {
              setEstimatedTimeToReceiver(`${minutes} min`);
            }
          } else {
            console.warn(`⚠️ No estimated time found for ${type}`);
          }
        } catch (error) {
          console.error(`❌ Error fetching estimated time for ${type}:`, error);
        }
      };
    const assignVolunteer = () => {
      socket.emit("volunteerAssigned", { volunteerId, donor: transformedDonor, receiver: transformedReceiver });
    };
  
    const containerStyle = {
        width:"800px",
      maxWidth: "1400px",
      margin: "20px auto",
      padding: "20px",
      border: "1px solid #ddd",
      borderRadius: "10px",
      backgroundColor: "#fff",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    };
  
    return (
      <div style={containerStyle}>
        <button onClick={assignVolunteer} style={{ padding: "10px", marginBottom: "10px" }}>
          Track my location
        </button>
        {estimatedTimeToDonor && (
          <p>
            Estimated Time from Volunteer to Donor: {estimatedTimeToDonor}
          </p>
        )}
        {estimatedTimeToReceiver && (
          <p>
            Estimated Time from Donor to Receiver: {estimatedTimeToReceiver}
          </p>
        )}
  
        <MapContainer center={[17.2, 78.6]} zoom={14} style={{ height: "500px", width: "100%", borderRadius: "10px" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  
          {volunteerLocation && <Marker position={[volunteerLocation.lat, volunteerLocation.lng]} />}
  
          <Marker position={[transformedDonor.lat, transformedDonor.lng]}>
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
              Donor
            </Tooltip>
          </Marker>
  
          <Marker position={[transformedReceiver.lat, transformedReceiver.lng]}>
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
              Receiver
            </Tooltip>
          </Marker>
  
          {routeToDonor.length > 0 && (
            <Polyline positions={routeToDonor} color="blue" weight={5} opacity={0.8} />
          )}
  
          {routeToReceiver.length > 0 && (
            <Polyline positions={routeToReceiver} color="green" weight={5} opacity={0.8} />
          )}
        </MapContainer>
      </div>
    );
  };
  
  export default VolunteerTracking;