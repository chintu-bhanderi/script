const mongoose = require("mongoose");

const dbURI =
  "mongodb://docgenstaging:91yjDdJ5MbrCCHTi@docgen-staging-shard-00-00-3l2zn.mongodb.net:27017,docgen-staging-shard-00-01-3l2zn.mongodb.net:27017,docgen-staging-shard-00-02-3l2zn.mongodb.net:27017/docgen_preprod?ssl=true&replicaSet=docgen-staging-shard-0&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1";

const connectMongoDB = async () => {
  mongoose
    .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
};

const Document = mongoose.model(
  "base_document",
  new mongoose.Schema({}, { strict: false }),
  "base_documents"
);

const mainModule = async () => {
  try {
    await connectMongoDB();
  } catch (err) {
    console.error("error", err);
  }
};

mainModule();
