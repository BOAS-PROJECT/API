const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();
const morgan = require("morgan");
const helmet = require("helmet");
const fs = require("fs");
const admin = require("firebase-admin");
const serviceAccount = require("./utils/boasapp-4b0c1-firebase-adminsdk-jgcg2-5507559297.json");
const userRoutes = require("./routes/userRoutes");
const driverRoutes = require("./routes/driverRoutes");
const ownnerRoutes = require("./routes/ownnerRoutes");
const makeRoutes = require("./routes/makeRoutes");
const carRoutes = require("./routes/carRoutes");
const carmovingRoutes = require("./routes/carmovingRoutes");
const pharmacyRoutes = require("./routes/pharmacyRoutes");
const propertyRoutes = require("./routes/propertyRoutes");

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

// Middleware to create the destination folder for public
const createUploadsUsersFolder = (req, res, next) => {
  const folderPath = "public/users";
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  next();
};

const createUploadsDriverFolder = (req, res, next) => {
  const folderPath = "public/drivers";
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  next();
};

const createUploadsOwnersFolder = (req, res, next) => {
  const folderPath = "public/owners";
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  next();
};

const createUploadsCarsFolder = (req, res, next) => {
  const folderPath = "public/cars";
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  next();
};

const createUploadsPropertiesFolder = (req, res, next) => {
  const folderPath = "public/properties";
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  next();
};


// Public directory
app.use(express.static("public"));

// Implement security measures
// XSS protection
app.use(helmet.xssFilter());
app.use(helmet.frameguard({ action: "sameorigin" }));
app.use(helmet.dnsPrefetchControl());
app.use(helmet.referrerPolicy({ policy: "same-origin" }));
app.use(helmet.noSniff());
app.use(helmet());

// CSP protection
app.use(
  helmet.contentSecurityPolicy({ directives: { defaultSrc: ["'self'"] } })
);

// Permissions policy
/*
app.use(
  permissionsPolicy({
    features: {
      payment: ["self", '"nyota-api.com"'],
      syncXhr: [],
    },
  })
);
*/

// Routes
app.use("/api/v1/user", createUploadsUsersFolder, userRoutes);
app.use('/api/v1/driver', createUploadsDriverFolder,  driverRoutes);
app.use('/api/v1/owner', createUploadsOwnersFolder, ownnerRoutes);
app.use('/api/v1/make', makeRoutes);
app.use('/api/v1/car', createUploadsCarsFolder, carRoutes);
app.use('/api/v1/carmoving', createUploadsCarsFolder, carmovingRoutes);
app.use('/api/v1/pharmacy', pharmacyRoutes);
app.use('/api/v1/property', createUploadsPropertiesFolder, propertyRoutes);

// Export app
const port = process.env.PORT || 3000;

// Start server
app.listen(port, () => {
  console.log(`
    ==================================
    |🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀|
    |======== API BOAS RUNNING ======|
    |🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀|
    ==================================
    `);
});
