import React, { useEffect, useState } from "react";
import HistoryCard from "./HistoryCard";
import "./styles/History.css";
import api from "../api/axios";

const HistoryPage = ({ endpoint, type }) => {
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get(endpoint);
        let data = response.data;

        if (Array.isArray(data)) {
          const sanitizedData = data.filter(
            (donation) =>
              donation &&
              donation.donationDetails &&
              donation.donationDetails.quantity !== undefined
          );
          setDonations(sanitizedData);
        }
      } catch (error) {
        console.error(`Error fetching ${type} history:`, error);
      }
    };

    fetchHistory();
  }, [endpoint, type]);

  return (
    <div className="history-page">
      <h1>{type.charAt(0).toUpperCase() + type.slice(1)} History</h1>
      {donations.length > 0 ? (
        donations.map((donation) => (
          <HistoryCard
            key={donation.donationId}
            donation={donation}
            type={type}
          />
        ))
      ) : (
        <div className="no-donations">No donation history available.</div>
      )}
    </div>
  );
};

export default HistoryPage;
