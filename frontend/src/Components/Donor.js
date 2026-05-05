import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import api from "../api/axios";
import AcceptDonation from "./AcceptDonation";
import DonateForm from "./DonateForm";
import "./styles/Donor.css";

import Filter from "./Filter";

// Custom marker icons
const donorIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red" width="50" height="50">
      <path fill-rule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd"/>
    </svg>`
  )}`,
  iconSize: [50, 50],
});

const orgIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="green" width="50" height="50">
      <path fill-rule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd"/>
    </svg>`
  )}`,
  iconSize: [50, 50],
});


const requestIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="blue" width="50" height="50">
      <path fill-rule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd"/>
    </svg>`
  )}`,
  iconSize: [50, 50],
});




const DonorPage = () => {
  console.log(Filter);
  const [quantity, setQuantity] = useState(0);
  const user = JSON.parse(localStorage.getItem("user"));
  const donorLocation = {
    lat: user.location.lat,
    lng: user.location.long,
  }; // Donor's location

  const [frequests, setFrequests] = useState([]);
  const [finalOrganizations, setFinalOrganizations] = useState([]);

  const [activeRequests, setActiveRequests] = useState([]);
  const [activeOrganizations, setActiveOrganizations] = useState([]);
  const [showDonateForm, setShowDonateForm] = useState(false);
  const [currentDonationData, setCurrentDonationData] = useState(null);
  const [isReceiverRequest, setIsReceiverRequest] = useState(false); // Track donation type
  const [fetchError, setFetchError] = useState(null);
  const [isOrganisation, setIsOrganisation] = useState(false);
  const [orgID, setOrgid] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token is missing.");
          setFetchError("You are not authorized. Please log in.");
          return;
        }

        const response = await api.get(
          "http://localhost:3001/api/donation/getDonations",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;
        const requests = data.requests || [];
        const organizations = data.organizations || [];
        setFrequests(requests);
        setFinalOrganizations(organizations);

        setActiveRequests(requests);
        setActiveOrganizations(organizations);
        setFetchError(null);
      } catch (error) {
        console.error("Error fetching donation data:", error);
        setFetchError("Failed to fetch donations. Please try again later.");
      }
    };

    fetchData();
  }, []);

  const handleDonateClick = (data, isOrganisation, orgID) => {
    console.log("Data clicked:", data);
    setCurrentDonationData(data);
    setIsOrganisation(isOrganisation);
    if (isOrganisation) {
      setOrgid(orgID);
    }
    setShowDonateForm(true);
  };

  const closeDonateForm = () => {
    setShowDonateForm(false);
  };

  return (
    <div
      className="donor-page"
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        className="donor-down-side"
        style={{
          display: "flex",
          gap: "20px",
        }}
      >
        <div className="map-container" style={{ width: "100%" }}>
          <MapContainer
            center={donorLocation}
            zoom={20}
            style={{ height: "600px", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={donorLocation} icon={donorIcon}>
              <Popup>Donor Location</Popup>
            </Marker>
            {[...activeRequests, ...activeOrganizations].map((req) => {
              if (req.location) {
                const icon = req.role === "receiver" ? orgIcon : requestIcon;
                return (
                  <Marker
                    key={req._id || req.id}
                    position={[req.location.lat, req.location.long]}
                    icon={icon}
                  >
                    <Popup>{req.name || "No Name"}</Popup>
                  </Marker>
                );
              }
              return null;
            })}
          </MapContainer>
        </div>

        {showDonateForm && (
          <DonateForm
            receiverId={currentDonationData.receiverId}
            setShowForm={setShowDonateForm}
            quantity={quantity}
            setQuantity={setQuantity}
            requestId={currentDonationData._id || currentDonationData.id}
            activerequests={setActiveRequests}
            activeorganizations={setActiveOrganizations}
            isOrganisation={isOrganisation}
            orgID={orgID}
          />
        )}
      </div>
    </div>
  );
};

export default DonorPage;