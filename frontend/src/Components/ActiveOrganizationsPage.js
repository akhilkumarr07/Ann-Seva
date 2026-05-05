import React, { useEffect, useState } from "react";
import api from "../api/axios";
import DonateForm from "./DonateForm";
import "./styles/Donor.css";

const ActiveOrganizationsPage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [showDonateForm, setShowDonateForm] = useState(false);
  const [currentDonationData, setCurrentDonationData] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/donation/getDonations");
        setOrganizations(response.data.organizations || []);
      } catch (error) {
        console.error("Error fetching organizations:", error);
        setFetchError("Failed to fetch organizations.");
      }
    };
    fetchData();
  }, []);

  const handleDonateClick = (org) => {
    setCurrentDonationData(org);
    setShowDonateForm(true);
  };

  return (
    <div className="active-orgs-page" style={{ padding: "20px" }}>
      <h2>Active Organizations</h2>
      {fetchError && <p className="error">{fetchError}</p>}
      <div className="requests-container">
        <ul>
          {organizations.map((item) => (
            <li key={item._id} className="organization" style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "10px", borderRadius: "8px" }}>
              <h4>{item.name}</h4>
              <p><strong>Phone:</strong> {item.phone}</p>
              <p><strong>Status:</strong> {item.isActive ? "Accepting Donations" : "Inactive"}</p>
              <button className="btn btn-success" onClick={() => handleDonateClick(item)}>Donate to Org</button>
            </li>
          ))}
          {organizations.length === 0 && !fetchError && <p>No active organizations found.</p>}
        </ul>
      </div>

      {showDonateForm && (
        <DonateForm
          receiverId={null}
          setShowForm={setShowDonateForm}
          quantity={quantity}
          setQuantity={setQuantity}
          requestId={null}
          isOrganisation={true}
          orgID={currentDonationData._id}
        />
      )}
    </div>
  );
};

export default ActiveOrganizationsPage;
