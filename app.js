require("./instrument.js");

const Sentry = require("@sentry/node");
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();
const admin = require("firebase-admin");
const morgan = require("morgan");
const helmet = require("helmet");
const fs = require("fs");
const serviceAccount = require("./utils/firebase.json");
const userRoutes = require("./routes/userRoutes");
const driverRoutes = require("./routes/driverRoutes");
const ownnerRoutes = require("./routes/ownnerRoutes");
const makeRoutes = require("./routes/makeRoutes");
const carRoutes = require("./routes/carRoutes");
const carmovingRoutes = require("./routes/carmovingRoutes");
const pharmacyRoutes = require("./routes/pharmacyRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const tourismeRoutes = require("./routes/tourismeRoutes");
const leisureRoutes = require("./routes/leisureRoutes");
const cityRoutes = require("./routes/cityRoutes");
const pricingRoutes = require("./routes/princingRoutes");

const { Driver } = require("./models");

// Init express app
const app = express();

// Firebase cloud messaging initialisation
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create upload folders middleware
const ensureFolderExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

const createUploadsUsersFolder = (req, res, next) => {
  ensureFolderExists("public/users");
  next();
};

const createUploadsDriverFolder = (req, res, next) => {
  ensureFolderExists("public/drivers");
  next();
};

const createUploadsOwnersFolder = (req, res, next) => {
  ensureFolderExists("public/owners");
  next();
};

const createUploadsCarsFolder = (req, res, next) => {
  ensureFolderExists("public/cars");
  next();
};

const createUploadsPropertiesFolder = (req, res, next) => {
  ensureFolderExists("public/properties");
  next();
};

const createTourismPropertiesFolder = (req, res, next) => {
  ensureFolderExists("public/tourisms");
  next();
};

const createAttachmentsFolder = (req, res, next) => {
  ensureFolderExists("public/attachments");
  next();
};

const createDriversFolder = (req, res, next) => {
  ensureFolderExists("public/drivers");
  next();
};

// Public directory
app.use(express.static("public"));

// Security middlewares
app.use(helmet());
app.use(helmet.xssFilter());
app.use(helmet.frameguard({ action: "sameorigin" }));
app.use(helmet.dnsPrefetchControl());
app.use(helmet.referrerPolicy({ policy: "same-origin" }));
app.use(helmet.noSniff());
app.use(
  helmet.contentSecurityPolicy({ directives: { defaultSrc: ["'self'"] } })
);

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Routes
app.use("/api/v1/user", createUploadsUsersFolder, userRoutes);
app.use(
  "/api/v1/driver",
  createUploadsDriverFolder,
  createDriversFolder,
  driverRoutes
);
app.use("/api/v1/owner", createUploadsOwnersFolder, ownnerRoutes);
app.use("/api/v1/make", makeRoutes);
app.use(
  "/api/v1/car",
  createUploadsCarsFolder,
  createAttachmentsFolder,
  carRoutes
);
app.use(
  "/api/v1/carmoving",
  createUploadsCarsFolder,
  createAttachmentsFolder,
  carmovingRoutes
);
app.use("/api/v1/pharmacy", pharmacyRoutes);
app.use("/api/v1/property", createUploadsPropertiesFolder, propertyRoutes);
app.use("/api/v1/tourism", createTourismPropertiesFolder, tourismeRoutes);
app.use("/api/v1/leisure", leisureRoutes);
app.use("/api/v1/city", cityRoutes);
app.use("/api/v1/pricing", pricingRoutes);

// Sentry
Sentry.setupExpressErrorHandler(app);

// HTTP Server and WebSocket
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["polling", "websocket"],
  allowEIO3: true,
});

// WebSocket events
io.on("connection", (socket) => {
  console.log(`🟢 New WebSocket connection: ${socket.id}`);

  socket.on("driverLocation", (data) => {
    console.log("📍 Received driverLocation:", data);
    const normalizedData = {
      driverId: data.id || data.driverId,
      latitude: data.latitude,
      longitude: data.longitude
    };
    
    io.emit("driverLocation", normalizedData);
  });

  socket.on("requestInitialDrivers", () => {
    // Récupérez les positions actuelles de tous les conducteurs depuis la base de données
      Driver.findAll().then((drivers) => {
      const driverLocations = drivers.map((driver) => ({
        driverId: driver.id,
        latitude: driver.latitude,
        longitude: driver.longitude,
      }));
      console.log(`🟢 Driver List  ` + driverLocations);
      socket.emit("initialDrivers", driverLocations);
    });
  });

  socket.on("disconnect", () => {
    console.log(`🔴 Socket disconnected: ${socket.id}`);
  });
});

// Start server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`
  ==================================
  |🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀|
  |======== API BOAS RUNNING ======|
  |🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀|
  ==================================
  🟢 Server listening on port ${port}
  `);
});

module.exports = io;
