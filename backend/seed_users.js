require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/user.model");

// ─── Deterministic user data (same every time) ───────────────────────────────

const PASSWORD = "AbhinaV.242";

const adminUser = {
  name: "Abhi",
  phone: "8309435368",
  email: "abhinavkumarcvrcollege@gmail.com",
  role: "admin",
  isAdmin: true,
  location: {
    landmark: "Adibatla, Telangana, India 501510",
    lat: 17.3748,
    long: 78.6214,
  },
};

const donors = [
  { name: "Arjun Mehta",       phone: "7799990266", email: "arjun.mehta@gmail.com",       location: { landmark: "Connaught Place, New Delhi 110001",          lat: 28.6315, long: 77.2167 } },
  { name: "Priya Iyer",        phone: "7799990267", email: "priya.iyer@gmail.com",        location: { landmark: "T. Nagar, Chennai, Tamil Nadu 600017",        lat: 13.0418, long: 80.2341 } },
  { name: "Rohit Desai",       phone: "7799990268", email: "rohit.desai@gmail.com",       location: { landmark: "Andheri West, Mumbai, Maharashtra 400058",     lat: 19.1253, long: 72.8456 } },
  { name: "Sneha Nair",        phone: "7799990269", email: "sneha.nair@gmail.com",        location: { landmark: "Indiranagar, Bengaluru, Karnataka 560038",     lat: 12.9784, long: 77.6408 } },
  { name: "Vikram Choudhary",  phone: "7799990270", email: "vikram.choudhary@gmail.com",  location: { landmark: "C-Scheme, Jaipur, Rajasthan 302001",           lat: 26.9124, long: 75.7873 } },
  { name: "Ananya Ghosh",      phone: "7799990271", email: "ananya.ghosh@gmail.com",      location: { landmark: "Salt Lake City, Kolkata, West Bengal 700091",  lat: 22.5726, long: 88.4342 } },
  { name: "Karan Sharma",      phone: "7799990272", email: "karan.sharma@gmail.com",      location: { landmark: "Hazratganj, Lucknow, Uttar Pradesh 226001",    lat: 26.8530, long: 80.9462 } },
  { name: "Divya Patel",       phone: "7799990273", email: "divya.patel@gmail.com",       location: { landmark: "Navrangpura, Ahmedabad, Gujarat 380009",       lat: 23.0350, long: 72.5569 } },
  { name: "Suresh Reddy",      phone: "7799990274", email: "suresh.reddy@gmail.com",      location: { landmark: "Jubilee Hills, Hyderabad, Telangana 500033",   lat: 17.4325, long: 78.4071 } },
  { name: "Meera Krishnan",    phone: "7799990275", email: "meera.krishnan@gmail.com",    location: { landmark: "Palayam, Thiruvananthapuram, Kerala 695034",   lat: 8.5074,  long: 76.9572 } },
];

const receivers = [
  { name: "Akshaya Patra Foundation", phone: "9542165601", email: "contact@akshayapatra.org",    location: { landmark: "Rajaji Nagar, Bengaluru, Karnataka 560010",    lat: 12.9997, long: 77.5536 } },
  { name: "Smile Foundation",         phone: "9542165602", email: "info@smilefoundation.org",     location: { landmark: "Okhla Industrial Area, New Delhi 110020",       lat: 28.5355, long: 77.2738 } },
  { name: "Goonj NGO",                phone: "9542165603", email: "mail@goonj.org",               location: { landmark: "Sarita Vihar, New Delhi 110076",                lat: 28.5322, long: 77.2962 } },
  { name: "HelpAge India",            phone: "9542165604", email: "contact@helpageindia.org",     location: { landmark: "Connaught Place, New Delhi 110001",             lat: 28.6317, long: 77.2195 } },
  { name: "Bhumi NGO",                phone: "9542165605", email: "info@bhumi.ngo",               location: { landmark: "Anna Nagar, Chennai, Tamil Nadu 600040",        lat: 13.0836, long: 80.2101 } },
  { name: "Uday Foundation",          phone: "9542165606", email: "info@udayfoundation.org",      location: { landmark: "Sector 18, Noida, Uttar Pradesh 201301",        lat: 28.5706, long: 77.3219 } },
  { name: "Robin Hood Army",          phone: "9542165607", email: "robinhoodarmy@gmail.com",      location: { landmark: "Bandra West, Mumbai, Maharashtra 400050",       lat: 19.0596, long: 72.8295 } },
  { name: "Snehalaya",                phone: "9542165608", email: "snehalaya@gmail.com",          location: { landmark: "Ahmednagar, Maharashtra 414001",                lat: 19.0948, long: 74.7480 } },
  { name: "CRY India",                phone: "9542165609", email: "cryinfo@cry.org",              location: { landmark: "Lower Parel, Mumbai, Maharashtra 400013",       lat: 18.9983, long: 72.8312 } },
  { name: "Pratham Education",        phone: "9542165610", email: "info@pratham.org",             location: { landmark: "Worli, Mumbai, Maharashtra 400018",             lat: 18.9988, long: 72.8186 } },
];

const volunteers = [
  { name: "Aditya Kumar",     phone: "8919606276", email: "aditya.kumar@gmail.com",     location: { landmark: "Dilsukhnagar, Hyderabad, Telangana 500060",      lat: 17.3688, long: 78.5247 } },
  { name: "Pooja Singh",      phone: "8919606277", email: "pooja.singh@gmail.com",      location: { landmark: "Vaishali Nagar, Jaipur, Rajasthan 302021",        lat: 26.9001, long: 75.7399 } },
  { name: "Rahul Verma",      phone: "8919606278", email: "rahul.verma@gmail.com",      location: { landmark: "Gomti Nagar, Lucknow, Uttar Pradesh 226010",      lat: 26.8760, long: 80.9880 } },
  { name: "Kavitha Menon",    phone: "8919606279", email: "kavitha.menon@gmail.com",    location: { landmark: "Thrissur, Kerala 680001",                         lat: 10.5276, long: 76.2144 } },
  { name: "Sanjay Yadav",     phone: "8919606280", email: "sanjay.yadav@gmail.com",     location: { landmark: "Patna City, Patna, Bihar 800008",                 lat: 25.6093, long: 85.1235 } },
  { name: "Ritu Agarwal",     phone: "8919606281", email: "ritu.agarwal@gmail.com",     location: { landmark: "Civil Lines, Allahabad, Uttar Pradesh 211001",    lat: 25.4358, long: 81.8463 } },
  { name: "Nikhil Joshi",     phone: "8919606282", email: "nikhil.joshi@gmail.com",     location: { landmark: "Kothrud, Pune, Maharashtra 411038",               lat: 18.5095, long: 73.8068 } },
  { name: "Sunita Das",       phone: "8919606283", email: "sunita.das@gmail.com",       location: { landmark: "Behala, Kolkata, West Bengal 700034",             lat: 22.4996, long: 88.3103 } },
  { name: "Amit Bose",        phone: "8919606284", email: "amit.bose@gmail.com",        location: { landmark: "Guwahati, Assam 781001",                          lat: 26.1445, long: 91.7362 } },
  { name: "Nalini Rajan",     phone: "8919606285", email: "nalini.rajan@gmail.com",     location: { landmark: "Coimbatore, Tamil Nadu 641001",                   lat: 11.0168, long: 76.9558 } },
];

// ─── Seed runner ─────────────────────────────────────────────────────────────

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connected to MongoDB...");

    // Wipe all existing users
    await User.deleteMany({});
    console.log("🗑️  Cleared existing users.");

    const passwordHash = await bcrypt.hash(PASSWORD, 10);
    console.log("🔑  Password hashed.");

    const toInsert = [
      // Admin
      { ...adminUser, password: passwordHash },
      // Donors
      ...donors.map((d) => ({ ...d, role: "donor", isAdmin: false, password: passwordHash })),
      // Receivers
      ...receivers.map((r) => ({ ...r, role: "receiver", isAdmin: false, password: passwordHash })),
      // Volunteers
      ...volunteers.map((v) => ({ ...v, role: "volunteer", isAdmin: false, password: passwordHash })),
    ];

    await User.insertMany(toInsert);

    console.log("\n🌱 Seeded users successfully!");
    console.log(`   👤 1  Admin`);
    console.log(`   🎁 ${donors.length}  Donors`);
    console.log(`   🏢 ${receivers.length}  Receivers`);
    console.log(`   🚗 ${volunteers.length}  Volunteers`);
    console.log(`\n🔐 All users share password: ${PASSWORD}`);
    console.log("\n── Admin login ──────────────────────────────────");
    console.log(`   Phone  : ${adminUser.phone}`);
    console.log(`   Email  : ${adminUser.email}`);
    console.log(`   Role   : Admin`);
    console.log("─────────────────────────────────────────────────\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err.message);
    process.exit(1);
  }
};

seedUsers();
