require("./instrument.js");

const Sentry = require("@sentry/node");
const express = require("express");
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


const createTourismPropertiesFolder = (req, res, next) => {
  const folderPath = "public/tourisms";
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  next();
};

const createAttachmentsFolder = (req, res, next) => {
  const folderPath = "public/attachments";
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
app.use('/api/v1/car', createUploadsCarsFolder, createAttachmentsFolder, carRoutes);
app.use('/api/v1/carmoving', createUploadsCarsFolder, createAttachmentsFolder, carmovingRoutes);
app.use('/api/v1/pharmacy', pharmacyRoutes);
app.use('/api/v1/property', createUploadsPropertiesFolder, propertyRoutes);
app.use('/api/v1/tourism', createTourismPropertiesFolder, tourismeRoutes);
app.use('/api/v1/leisure', leisureRoutes);
app.use('/api/v1/city', cityRoutes);

// Sentry
Sentry.setupExpressErrorHandler(app);

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
