import axios from "axios";
import { CountUp } from "countup.js";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Accordion from "./Accordion";
import Footer from "./Footer";
import img3 from "./images/about1.png";
import missionImg from "./images/donation.jpg";
import "./styles/Home.css";
import Chatbot from "./Chatbot";
const Home = () => {
  const [metrics, setMetrics] = useState({
    totalDonations: 0,
    totalReceivers: 0,
    totalUsers: 0,
    inventoryStatus: { items: 0, categories: 0 },
  });
  const [pendingRequests, setPendingRequests] = useState([]); // eslint-disable-line no-unused-vars
  const [completedRequests, setCompletedRequests] = useState([]); // eslint-disable-line no-unused-vars
  const [donations, setDonations] = useState([]); // eslint-disable-line no-unused-vars
  const [requests, setRequests] = useState([]); // eslint-disable-line no-unused-vars

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [donationsRes, requestsRes, usersRes] = await Promise.all([
        axios.get("http://localhost:3001/api/metrics/donations"),
        axios.get("http://localhost:3001/api/metrics/requests"),
        axios.get("http://localhost:3001/api/metrics/users"),
      ]);

      setMetrics({
        totalDonations: donationsRes.data.length,
        totalReceivers: requestsRes.data.length,
        totalUsers: usersRes.data.length,
        inventoryStatus: { items: donationsRes.data.length, categories: 10 },
      });

      setPendingRequests(
        requestsRes.data.filter((request) => request.status === "pending")
      );
      setCompletedRequests(
        requestsRes.data.filter((request) => request.status === "complete")
      );
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const handleProtectedNavigation = (route) => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate(route);
    } else {
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const StatsSection = () => {
    const counters = useRef([]);

    useEffect(() => {
      const handleIntersection = (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target;
            const endValue = parseInt(target.getAttribute("data-target"), 10);
            const countUp = new CountUp(target, endValue, {
              duration: 2,
              useEasing: true,
              useGrouping: true,
              separator: ",",
            });
            countUp.start();
            observer.unobserve(target);
          }
        });
      };

      const observer = new IntersectionObserver(handleIntersection, {
        threshold: 1.0,
      });

      counters.current.forEach((counter) => {
        if (counter) {
          observer.observe(counter);
        }
      });

      return () => {
        counters.current.forEach((counter) => {
          if (counter) {
            observer.unobserve(counter);
          }
        });
      };
    }, []);

    return (
      <div className="stats-section">
        <div className="stat-item">
          <span
            className="stat-number"
            data-target={metrics.totalDonations}
            ref={(el) => (counters.current[0] = el)}
          >
            0
          </span>
          <span className="stat-label">Total Donations</span>
        </div>
        <div className="stat-item">
          <span
            className="stat-number"
            data-target={metrics.totalReceivers}
            ref={(el) => (counters.current[1] = el)}
          >
            0
          </span>
          <span className="stat-label">Total Requests</span>
        </div>
        <div className="stat-item">
          <span
            className="stat-number"
            data-target={metrics.totalUsers}
            ref={(el) => (counters.current[2] = el)}
          >
            0
          </span>
          <span className="stat-label">Total Users</span>
        </div>
      </div>
    );
  };

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content animated-form">
          <h1><div style={{color: "black"}}>Connecting Hearts Through</div><span style={{color: "green"}}>Food Donation</span> </h1>
          <p>
            Join us in our mission to fight hunger and provide nutritious food
            to those in need. Your support helps us make a real difference in
            the lives of countless individuals and families.
          </p>
          <div className="hero-actions">
            <button
              className="donate-button"
              onClick={() => handleProtectedNavigation("/donate")}
            >
              Donate
            </button>
          </div>
        </div>
        <div className="hero-image animated-form">
          <img src={missionImg} alt="Helping Hands" />
        </div>
      </div>
      <Chatbot />
      <section className="services">
        <h2>Help The Helpless</h2>
        <div className="service-cards">
          <div className="service-card">
            <div className="service-icon">
              <i className="fas fa-hands-helping"></i>
            </div>
            <h3>Volunteers</h3>
            <p>
              Our volunteers are the backbone of our organization. Join us to
              make a difference in the community.
            </p>
          </div>
          <div className="service-card">
            <div className="service-icon">
              <i className="fas fa-donate"></i>
            </div>
            <h3>Donors</h3>
            <p>
              Generous donors provide the necessary resources to keep our
              mission alive and thriving.
            </p>
          </div>
          <div className="service-card">
            <div className="service-icon">
              <i className="fas fa-user-friends"></i>
            </div>
            <h3>Recipients</h3>
            <p>
              We support recipients by providing essential food items and
              resources to help them in times of need.
            </p>
          </div>
        </div>
      </section>

      <section className="foundation" id="foundation">
        <div className="foundation-content">
          <div className="foundation-text animated-form">
            <h2>About Our Foundation</h2>
            <h3>We Are In A Mission To Help The Helpless</h3>
            <p>
              Our foundation is dedicated to fighting hunger and providing
              support to those in need. We believe in ensuring that no one goes
              hungry and everyone has access to healthy and nutritious food.
            </p>
            <p>
              Join us in our mission to make a difference in the lives of the
              helpless. Together, we can provide food and hope to those who need
              it most.
            </p>
            <button>Learn More</button>
          </div>
          <div className="foundation-images animated-form">
            <img src={img3} alt="Foundation" />
          </div>
        </div>
      </section>

      <section className="call-to-action">
        <h2>Let's Change the World With Humanity</h2>
        <button onClick={() => handleProtectedNavigation("/login")}>
          Become a Volunteer
        </button>
      </section>

      <StatsSection />
      <Accordion />
      <Footer />
    </div>
  );
};

export default Home;
