// import api from "api";
// import "bootstrap/dist/css/bootstrap.min.css";
// import React, { useState, useEffect } from "react";
// import { Button, Modal } from "react-bootstrap";
// import {
//   FaCamera,
//   FaClock,
//   FaUtensils,
//   FaWeight,
//   FaMapMarkerAlt,
// } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// import "./styles/DonateForm.css";

// const DonateForm = ({ receiverId, setShowForm }) => {
//   const [foodItems, setFoodItems] = useState("");
//   const [quantity, setQuantity] = useState("");
//   const [shelfLife, setShelfLife] = useState("");
//   const [picture, setPicture] = useState(null);
//   const [previewImage, setPreviewImage] = useState(null);
//   const [location, setLocation] = useState("");
//   const [showModal, setShowModal] = useState(true);
//   const [latitude, setLatitude] = useState(null);
//   const [longitude, setLongitude] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setLatitude(position.coords.latitude);
//           setLongitude(position.coords.longitude);
//           setLocation("Location fetched using geolocation");
//         },
//         (error) => {
//           toast.error("Location access denied. Please enable location.");
//         }
//       );
//     }
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const locationData = {
//       landmark: location || "No landmark provided",
//       latitude,
//       longitude,
//     };

//     const donationData = {
//       quantity,
//       shelfLife,
//       location: {
//         landmark: location || "No landmark provided",
//         lat: latitude || null,
//         long: longitude || null,
//       },
//       receiverId,
//     };

//     if (picture) {
//       donationData.picture = picture;
//     }

//     try {
//       const response = await api.post(
//         "http://localhost:3001/api/donation",
//         donationData,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: "Bearer " + localStorage.getItem("token"),
//           },
//         }
//       );

//       if (response.status === 201) {
//         toast.success("Donation submitted successfully!");
//       } else {
//         throw new Error("Failed to submit donation.");
//       }

//       setShowModal(false);
//       setShowForm(false);
//       resetForm();
//       alert("Donation submitted successfully!");
//       navigate("/donor");
//     } catch (error) {
//       toast.error("Failed to submit donation.");
//     }
//   };

//   const resetForm = () => {
//     setFoodItems("");
//     setQuantity("");
//     setShelfLife("");
//     setPicture(null);
//     setPreviewImage(null);
//     setLocation("");
//   };

//   const handlePictureChange = (event) => {
//     const file = event.target.files[0];
//     setPicture(file);

//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setPreviewImage(reader.result);
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleClose = () => {
//     setShowModal(false);
//     setShowForm(false);
//     navigate("/donor");
//   };

//   return (
//     <div className="container custom-modal">
//       <Modal show={showModal} onHide={handleClose}>
//         <Modal.Header closeButton>
//           <Modal.Title>Donate Food Items</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <form style={styles.form}>
//             <div className="row">
//               <div className="col-md-6">
//                 <div className="mb-3">
//                   <label className="form-label">
//                     <FaUtensils className="me-2" /> Food Items:
//                   </label>
//                   <input
//                     type="text"
//                     value={foodItems}
//                     onChange={(e) => setFoodItems(e.target.value)}
//                     className="form-control"
//                     required
//                   />
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label">
//                     <FaWeight className="me-2" /> Quantity:
//                   </label>
//                   <input
//                     type="number"
//                     value={quantity}
//                     onChange={(e) => setQuantity(e.target.value)}
//                     className="form-control"
//                     required
//                   />
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label">
//                     <FaClock className="me-2" /> Shelf Life (in hours):
//                   </label>
//                   <input
//                     type="number"
//                     value={shelfLife}
//                     onChange={(e) => setShelfLife(e.target.value)}
//                     className="form-control"
//                     required
//                   />
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label">
//                     <FaCamera className="me-2" /> Picture:
//                   </label>
//                   <input
//                     type="file"
//                     onChange={handlePictureChange}
//                     className="form-control"
//                   />
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label">
//                     <FaMapMarkerAlt className="me-2" /> Location (Landmark):
//                   </label>
//                   <input
//                     type="text"
//                     value={location || ""}
//                     onChange={(e) => setLocation(e.target.value)}
//                     className="form-control"
//                     required
//                     placeholder="Enter a landmark or location"
//                   />
//                 </div>
//               </div>
//               <div className="col-md-6">
//                 <div className="image-preview">
//                   {previewImage ? (
//                     <img src={previewImage} alt="Uploaded Image" />
//                   ) : (
//                     "Donate FOOD"
//                   )}
//                 </div>
//               </div>
//             </div>
//             <div className="row">
//               <div className="col-md-12 text-center">
//                 <Button
//                   type="submit"
//                   onClick={handleSubmit}
//                   className="btn btn-success mt-3"
//                 >
//                   Submit Donation
//                 </Button>
//               </div>
//             </div>
//           </form>
//         </Modal.Body>
//       </Modal>

//       <ToastContainer
//         position="bottom-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//       />
//     </div>
//   );
// };

// const styles = {
//   greenButton: {
//     backgroundColor: "#28a745",
//     borderColor: "#28a745",
//   },
//   form: {
//     minWidth: "400px",
//   },
//   mapBox: {
//     height: "400px",
//     border: "1px solid #ccc",
//     backgroundColor: "#fff",
//   },
//   mapPlaceholderText: {
//     textAlign: "center",
//     fontSize: "18px",
//     color: "#999",
//   },
// };

// export default DonateForm;

// import api from "api";
// import "bootstrap/dist/css/bootstrap.min.css";
// import React, { useState, useEffect } from "react";
// import { Button, Modal } from "react-bootstrap";
// import {
//   FaCamera,
//   FaClock,
//   FaUtensils,
//   FaWeight,
//   FaMapMarkerAlt,
// } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// import "./styles/DonateForm.css";

// const DonateForm = ({ receiverId, setShowForm, isReceiverRequest }) => {
//   const [foodItems, setFoodItems] = useState("");
//   const [quantity, setQuantity] = useState("");
//   const [shelfLife, setShelfLife] = useState("");
//   const [picture, setPicture] = useState(null);
//   const [previewImage, setPreviewImage] = useState(null);
//   const [location, setLocation] = useState("");
//   const [showModal, setShowModal] = useState(true);
//   const [latitude, setLatitude] = useState(null);
//   const [longitude, setLongitude] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setLatitude(position.coords.latitude);
//           setLongitude(position.coords.longitude);
//           setLocation("Location fetched using geolocation");
//         },
//         (error) => {
//           toast.error("Location access denied. Please enable location.");
//         }
//       );
//     }
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const locationData = {
//       landmark: location || "No landmark provided",
//       latitude,
//       longitude,
//     };

//     const donationData = {
//       quantity,
//       shelfLife,
//       location: {
//         landmark: location || "No landmark provided",
//         lat: latitude || null,
//         long: longitude || null,
//       },
//       receiverId,
//       isReceiverRequest, // Include the isReceiverRequest field
//     };

//     if (picture) {
//       donationData.picture = picture;
//     }

//     try {
//       const response = await api.post(
//         "http://localhost:3001/api/donation",
//         donationData,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: "Bearer " + localStorage.getItem("token"),
//           },
//         }
//       );

//       if (response.status === 201) {
//         toast.success("Donation submitted successfully!");
//       } else {
//         throw new Error("Failed to submit donation.");
//       }

//       setShowModal(false);
//       setShowForm(false);
//       resetForm();
//       alert("Donation submitted successfully!");
//       navigate("/donor");
//     } catch (error) {
//       toast.error("Failed to submit donation.");
//     }
//   };

//   const resetForm = () => {
//     setFoodItems("");
//     setQuantity("");
//     setShelfLife("");
//     setPicture(null);
//     setPreviewImage(null);
//     setLocation("");
//   };

//   const handlePictureChange = (event) => {
//     const file = event.target.files[0];
//     setPicture(file);

//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setPreviewImage(reader.result);
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleClose = () => {
//     setShowModal(false);
//     setShowForm(false);
//     navigate("/donor");
//   };

//   return (
//     <div className="container custom-modal">
//       <Modal show={showModal} onHide={handleClose}>
//         <Modal.Header closeButton>
//           <Modal.Title>Donate Food Items</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <form style={styles.form}>
//             <div className="row">
//               <div className="col-md-6">
//                 <div className="mb-3">
//                   <label className="form-label">
//                     <FaUtensils className="me-2" /> Food Items:
//                   </label>
//                   <input
//                     type="text"
//                     value={foodItems}
//                     onChange={(e) => setFoodItems(e.target.value)}
//                     className="form-control"
//                     required
//                   />
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label">
//                     <FaWeight className="me-2" /> Quantity:
//                   </label>
//                   <input
//                     type="number"
//                     value={quantity}
//                     onChange={(e) => setQuantity(e.target.value)}
//                     className="form-control"
//                     required
//                   />
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label">
//                     <FaClock className="me-2" /> Shelf Life (in hours):
//                   </label>
//                   <input
//                     type="number"
//                     value={shelfLife}
//                     onChange={(e) => setShelfLife(e.target.value)}
//                     className="form-control"
//                     required
//                   />
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label">
//                     <FaCamera className="me-2" /> Picture:
//                   </label>
//                   <input
//                     type="file"
//                     onChange={handlePictureChange}
//                     className="form-control"
//                   />
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label">
//                     <FaMapMarkerAlt className="me-2" /> Location (Landmark):
//                   </label>
//                   <input
//                     type="text"
//                     value={location || ""}
//                     onChange={(e) => setLocation(e.target.value)}
//                     className="form-control"
//                     required
//                     placeholder="Enter a landmark or location"
//                   />
//                 </div>
//               </div>
//               <div className="col-md-6">
//                 <div className="image-preview">
//                   {previewImage ? (
//                     <img src={previewImage} alt="Uploaded Image" />
//                   ) : (
//                     "Donate FOOD"
//                   )}
//                 </div>
//               </div>
//             </div>
//             <div className="row">
//               <div className="col-md-12 text-center">
//                 <Button
//                   type="submit"
//                   onClick={handleSubmit}
//                   className="btn btn-success mt-3"
//                 >
//                   Submit Donation
//                 </Button>
//               </div>
//             </div>
//           </form>
//         </Modal.Body>
//       </Modal>

//       <ToastContainer
//         position="bottom-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//       />
//     </div>
//   );
// };

// const styles = {
//   greenButton: {
//     backgroundColor: "#28a745",
//     borderColor: "#28a745",
//   },
//   form: {
//     minWidth: "400px",
//   },
//   mapBox: {
//     height: "400px",
//     border: "1px solid #ccc",
//     backgroundColor: "#fff",
//   },
//   mapPlaceholderText: {
//     textAlign: "center",
//     fontSize: "18px",
//     color: "#999",
//   },
// };

// export default DonateForm;

import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import {
  FaCamera,
  FaClock,
  FaMapMarkerAlt,
  FaUtensils,
  FaWeight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import api from "../api/axios";
import "./styles/DonateForm.css";

const DonateForm = ({
  receiverId,
  setShowForm,
  quantity,
  setQuantity,
  requestId,
  activerequests,
  activeorganizations,
  isOrganisation,
  orgID,
}) => {
  // console.log("requestId", requestId);
  // console.log("receiverId", receiverId);

  const user = JSON.parse(localStorage.getItem("user"));

  const [foodItems, setFoodItems] = useState("");
  const [shelfLife, setShelfLife] = useState("");
  const [picture, setPicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [location, setLocation] = useState(""); // User input for location or landmark
  const [useCurrentLocation, setUseCurrentLocation] = useState(false); // Checkbox state
  const [showModal, setShowModal] = useState(true);
  const [latitude, setLatitude] = useState(null); // Store latitude
  const [longitude, setLongitude] = useState(null); // Store longitude
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the user's geolocation if location permission is granted
    if (navigator.geolocation && useCurrentLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLocation(user.location.landmark); // Placeholder text for location
          console.log(longitude, latitude, "latlong");
        },
        (error) => {
          toast.error("Location access denied. Please enable location.");
        }
      );
    }
  }, [useCurrentLocation]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure we send the location data as an object
    const formData = new FormData();
    formData.append("quantity", quantity);
    formData.append("shelfLife", shelfLife);
    formData.append("receiverId", receiverId || "");
    formData.append("requestId", requestId || "");
    formData.append("isOrganisation", isOrganisation);
    formData.append("orgID", orgID || "");
    
    // Add location as a string if necessary, but backend expects nested object? 
    // Actually, backend destructured from req.body. 
    // In multi-part, we append individual fields.
    formData.append("location[landmark]", location || "No landmark provided");
    formData.append("location[lat]", latitude);
    formData.append("location[long]", longitude);

    if (picture) {
      formData.append("donationPicture", picture);
    }

    try {
      const response = await api.post(
        "/donation",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("response from donation ", response.data);

      if (response.status === 201) {
        toast.success("Donation submitted successfully!");
      } else {
        throw new Error("Failed to submit donation.");
      }

      setShowModal(false);
      setShowForm(false); // Close the form after submission
      resetForm();
      alert("Donation submitted successfully!");

      // Fetch the updated list of donations
      const updatedDonations = await api.get("/donation/getDonations");
      console.log(updatedDonations.data);
      activerequests(updatedDonations.data.requests || []);
      activeorganizations(updatedDonations.data.organizations || []);

      navigate("/donor"); // Navigate to donor.js after successful donation
    } catch (error) {
      const errorMsg = error.response?.data?.msg || "Failed to submit donation.";
      toast.error(errorMsg);
      console.error("Donation Error:", error);
    }
  };

  const resetForm = () => {
    setFoodItems("");
    setQuantity(0);
    setShelfLife("");
    setPicture(null);
    setPreviewImage(null);
    setLocation(""); // Reset location input
  };

  const handlePictureChange = (event) => {
    const file = event.target.files[0];
    setPicture(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    toast.success("Picture uploaded successfully!");
  };

  const handleClose = () => {
    setShowModal(false);
    setShowForm(false);
    navigate("/donor"); // Navigate to donor.js when the modal is closed
  };

  return (
    <div className="container custom-modal">
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Donate Food Items</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form style={styles.form}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    <FaUtensils className="me-2" /> Food Items:
                  </label>
                  <input
                    type="text"
                    value={foodItems}
                    onChange={(e) => setFoodItems(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    <FaWeight className="me-2" /> Quantity:
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    <FaClock className="me-2" /> Shelf Life (in hours):
                  </label>
                  <input
                    type="number"
                    value={shelfLife}
                    onChange={(e) => setShelfLife(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    <FaCamera className="me-2" /> Picture:
                  </label>
                  <input
                    type="file"
                    onChange={handlePictureChange}
                    className="form-control"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    <FaMapMarkerAlt className="me-2" /> Location (Landmark):
                  </label>
                  <input
                    type="text"
                    value={location || ""}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setUseCurrentLocation(false);
                      setLatitude(user.location.lat);
                      setLongitude(user.location.long);
                    }}
                    className="form-control"
                    required
                    placeholder="Enter a landmark or location"
                    disabled={useCurrentLocation} // Disable when checkbox is checked
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    <input
                      type="checkbox"
                      checked={useCurrentLocation}
                      onChange={(e) => {
                        setUseCurrentLocation(e.target.checked);
                        setLocation(user.location.landmark);
                        setLatitude(user.location.lat);
                        setLongitude(user.location.long);
                      }}
                    />
                    Use my current location
                  </label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="image-preview">
                  {previewImage ? (
                    <img src={previewImage} alt="Uploaded Image" />
                  ) : (
                    "Donate FOOD"
                  )}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 text-center">
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  className="btn btn-success mt-3"
                >
                  Submit Donation
                </Button>
              </div>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

const styles = {
  greenButton: {
    backgroundColor: "#28a745",
    borderColor: "#28a745",
  },
  form: {
    minWidth: "400px",
  },
  mapBox: {
    height: "400px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
  },
  mapPlaceholderText: {
    textAlign: "center",
    fontSize: "18px",
    color: "#999",
  },
};

export default DonateForm;