const gulp = require("gulp");
// const fs = require("fs");
const mongoose = require("mongoose");
// const dotenv = require("dotenv");

// if (fs.existsSync(".env")) {
//   dotenv.config();
// } else {
//   console.error(".env file does not exist!");
//   process.exit(1);
// }

const dbURI =
  "mongodb://docgenstaging:91yjDdJ5MbrCCHTi@docgen-staging-shard-00-00-3l2zn.mongodb.net:27017,docgen-staging-shard-00-01-3l2zn.mongodb.net:27017,docgen-staging-shard-00-02-3l2zn.mongodb.net:27017/docgen_staging?ssl=true&replicaSet=docgen-staging-shard-0&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1";
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// const connectMongoDB = async (dbURI) => {
//   console.log('dbURI', dbURI);
//   mongoose
//     .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log("MongoDB connected"))
//     .catch((err) => console.error("MongoDB connection error:", err));
// };

gulp.task("template_seed", async (done) => {
  // const ENV = process.env.REAL_ENV?.toUpperCase() || "LOCAL";
  // const envUrlKey = `${ENV}_URL`;
  // const dbURI = process.env[envUrlKey];
  // if (!dbURI) {
  //   console.error(`Invalid environment variable ${process.env.REAL_ENV}`);
  // } else {
  //   // await connectMongoDB(dbURI);
  // }
  // await connectMongoDB(dbURI);
  // await mainModule("./Shipmnts/Air_Export");
  // await mainModule("./Shipmnts/Air_Import");
  // await mainModule("./Shipmnts/Ocean_Export");
  // await mainModule("./Shipmnts/Ocean_Import");
  // await mainModule("./Shipmnts/Road");
  // await mongoose.connection.close();
  done();
});

gulp.task("task1", (done) => {
  const ENV = process.env.REAL_ENV?.toUpperCase() || "LOCAL";
  const envUrlKey = `${ENV}_URL`;
  const dbUrl = process.env[envUrlKey];
  if (!dbUrl) {
    console.error(`Invalid environment variable ${process.env.REAL_ENV}`);
  }
  console.log("Using API URL:", dbUrl);
  done();
});
