# AnnSeva — Team Setup Guide 🚀

This guide helps any team member get the project running locally in under 10 minutes.

---

## Prerequisites

Install these before starting:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v16+ | https://nodejs.org |
| MongoDB Community Server | v6+ | https://www.mongodb.com/try/download/community |
| Git | Latest | https://git-scm.com |

---

## Step 1 — Clone the Repository

```bash
git clone <your-repo-url>
cd annseva-git
```

---

## Step 2 — Configure Backend Environment

Create the `.env` file inside the `Backend/` folder:

```bash
# Backend/.env
PORT=3001
MONGO_URL=mongodb://127.0.0.1:27017/annseva
JWT_SECRET=supersecretjwtkey123
FAST_SMS_API_KEY=S3j2bT7XV9MHLfKcCkiztqnmuJ4p1rsAB8GOlQRFoNaYhWUeyxeOdEYas81tRCTDuHpPqJvk6AU7rQyl
```

> **Using MongoDB Atlas (cloud) instead of local?**  
> Replace `MONGO_URL` with your Atlas connection string:  
> `MONGO_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/annseva`

---

## Step 3 — Install Dependencies

```bash
# Backend
cd Backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## Step 4 — Start MongoDB (local only)

Start the MongoDB service on your machine before running the backend.

**Windows:**
```bash
# If installed as a service, it may auto-start. Otherwise:
net start MongoDB
```

**macOS/Linux:**
```bash
mongod --dbpath /usr/local/var/mongodb
# or if installed as a service:
brew services start mongodb-community
```

---

## Step 5 — Seed the Database

This populates the database with **31 pre-built users** (admin, donors, receivers, volunteers):

```bash
cd Backend
npm run seed
```

You should see output like:
```
✅ Connected to MongoDB...
🗑️  Cleared existing users.
🔑  Password hashed.
🌱 Seeded users successfully!
   👤 1  Admin
   🎁 10  Donors
   🏢 10  Receivers
   🚗 10  Volunteers

🔐 All users share password: AbhinaV.242

── Admin login ──────────────────────────────────
   Phone  : 8309435368
   Email  : abhinavkumarcvrcollege@gmail.com
   Role   : Admin
─────────────────────────────────────────────────
```

---

## Step 6 — Run the Application

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd Backend
npm run dev
```
Backend runs at: `http://localhost:3001`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```
Frontend runs at: `http://localhost:3000`

---

## Seeded User Credentials

All seeded users share the password: **`AbhinaV.242`**

### Admin
| Name | Phone | Email | Location |
|------|-------|-------|----------|
| Abhi | 8309435368 | abhinavkumarcvrcollege@gmail.com | Adibatla, Telangana |

### Donors (phone series: 7799990266 – 7799990275)
| Name | Phone | Location |
|------|-------|----------|
| Arjun Mehta | 7799990266 | Connaught Place, New Delhi |
| Priya Iyer | 7799990267 | T. Nagar, Chennai |
| Rohit Desai | 7799990268 | Andheri West, Mumbai |
| Sneha Nair | 7799990269 | Indiranagar, Bengaluru |
| Vikram Choudhary | 7799990270 | C-Scheme, Jaipur |
| Ananya Ghosh | 7799990271 | Salt Lake City, Kolkata |
| Karan Sharma | 7799990272 | Hazratganj, Lucknow |
| Divya Patel | 7799990273 | Navrangpura, Ahmedabad |
| Suresh Reddy | 7799990274 | Jubilee Hills, Hyderabad |
| Meera Krishnan | 7799990275 | Palayam, Thiruvananthapuram |

### Receivers / NGOs (phone series: 9542165601 – 9542165610)
| Name | Phone | Location |
|------|-------|----------|
| Akshaya Patra Foundation | 9542165601 | Rajaji Nagar, Bengaluru |
| Smile Foundation | 9542165602 | Okhla, New Delhi |
| Goonj NGO | 9542165603 | Sarita Vihar, New Delhi |
| HelpAge India | 9542165604 | Connaught Place, New Delhi |
| Bhumi NGO | 9542165605 | Anna Nagar, Chennai |
| Uday Foundation | 9542165606 | Sector 18, Noida |
| Robin Hood Army | 9542165607 | Bandra West, Mumbai |
| Snehalaya | 9542165608 | Ahmednagar, Maharashtra |
| CRY India | 9542165609 | Lower Parel, Mumbai |
| Pratham Education | 9542165610 | Worli, Mumbai |

### Volunteers (phone series: 8919606276 – 8919606285)
| Name | Phone | Location |
|------|-------|----------|
| Aditya Kumar | 8919606276 | Dilsukhnagar, Hyderabad |
| Pooja Singh | 8919606277 | Vaishali Nagar, Jaipur |
| Rahul Verma | 8919606278 | Gomti Nagar, Lucknow |
| Kavitha Menon | 8919606279 | Thrissur, Kerala |
| Sanjay Yadav | 8919606280 | Patna City, Bihar |
| Ritu Agarwal | 8919606281 | Civil Lines, Allahabad |
| Nikhil Joshi | 8919606282 | Kothrud, Pune |
| Sunita Das | 8919606283 | Behala, Kolkata |
| Amit Bose | 8919606284 | Guwahati, Assam |
| Nalini Rajan | 8919606285 | Coimbatore, Tamil Nadu |

---

## Useful Commands

```bash
# Reset and re-seed the database from scratch
cd Backend && npm run seed

# Wipe all data (no re-seed)
cd Backend && npm run wipe

# Build frontend for production
cd frontend && npm run build
```
