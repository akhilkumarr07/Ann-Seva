import React, { useEffect } from "react";

import "./styles/VolunteerFilter.css";

const VolunteerFilter = ({ fdonations, donations, activedonations }) => {

  // console.log(activedonations);

  function distance(lat1, lon1, lat2, lon2) {
    const toRadians = (degree) => (degree * Math.PI) / 180;

    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  const user = JSON.parse(localStorage.getItem("user"));
  const { lat, long } = user.location;
  // console.log(lat, long);
  // console.log(user);

  const setd = (d) => {
    if (d === null) {
      donations(fdonations); // Reset to all donations
      console.log("Reset to all donations");
      return;
    }
  
    donations(
      fdonations.filter((donation) => {
        // Handle missing donor location gracefully
        if (
          !donation.donor?.location?.lat ||
          !donation.donor?.location?.long
        ) {
          return false; // Exclude donations with missing location data
        }
  
        const distanceInKm = distance(
          lat,
          long,
          donation.donor.location.lat,
          donation.donor.location.long
        );
  
        return distanceInKm <= d; // Return true if within the specified distance
      })
    );
  
    console.log("Filtered donations:", fdonations);
  };


  useEffect(() => {
    console.log("Filter donations", activedonations);
  }, [activedonations]);
  

  return (
    <div
      className="volunteer-filter"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#49ac3a",
        borderRadius: "9px",
        padding: "10px",
        gap: "20px",
      }}
    >
      <div className="filter-header">Filter</div>
      <div className="filter-buttons" style={{ display: "flex", gap: "10px" }}>
        <button className="filter-button" onClick={() => setd(5)}>
          5km
        </button>
        <button className="filter-button" onClick={() => setd(10)}>
          10km
        </button>
        <button className="filter-button" onClick={() => setd(25)}>
          City
        </button>
        <button className="filter-button" onClick={() => setd(null)}>
          All
        </button>
      </div>
    </div>
  );
};

export default VolunteerFilter;
