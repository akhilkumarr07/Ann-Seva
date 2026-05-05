# Annseva - Food Donation Platform

## 📌 Project Overview

Annseva is a food donation platform that connects **donors**, **recipients**, and **volunteers** to help combat food waste and hunger. The platform allows food donors to contribute surplus food, recipients to request food donations, and volunteers to assist in transporting food to those in need.

## ✨ Key Features

- 📢 **Emergency Food Requests** – Recipients can raise urgent food requests.
- 🎁 **Easy Donation Process** – Donors can list food items, specify quantity, shelf life, and upload images.
- 🚗 **Volunteer Assistance** – Volunteers receive notifications and can help transport food.
- 📍 **Location-Based Matching** – Uses geolocation to match donors and recipients nearby.
- 🔔 **Real-time Notifications** – Users receive updates on food requests, donations, and delivery status.
- 📊 **Impact Metrics** – Tracks donations, recipients helped, and volunteer contributions.

## 🛠️ Technologies Used

- **Frontend:** React.js, Tailwind CSS, React Bootstrap
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT Authentication
- **APIs & Services:** Google Maps API (for location), Nodemailer (for email notifications)

## 🚀 Installation & Setup

### Prerequisites:
- Node.js (v16+)
- MongoDB (running locally or via a cloud service like MongoDB Atlas)

### Steps to Run:

1. Clone the repository:
   ```sh
   git clone https://github.com/tharun2107/annseva.git
   cd annseva
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and add necessary environment variables:
   ```sh
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   
   ```

4. Start the backend server:
   ```sh
   cd backend
   node index.js
   ```

5. Start the frontend:
   ```sh
   cd frontend
   npm start
   ```

6. Open the app in the browser:
   ```
   http://localhost:3000
   ```

## 📸 Screenshots

![Annseva Homepage](https://your-image-link.com)

## 📬 Contact

If you have any questions, feel free to reach out!

- **Developer:** Annseva Team
- **Email:** annsevaord@example.com
- **GitHub:** [tharun2107](https://github.com/yourusername)
