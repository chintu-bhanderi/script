const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const dbURI =
  "mongodb://docgenstaging:91yjDdJ5MbrCCHTi@docgen-staging-shard-00-00-3l2zn.mongodb.net:27017,docgen-staging-shard-00-01-3l2zn.mongodb.net:27017,docgen-staging-shard-00-02-3l2zn.mongodb.net:27017/docgen_staging?ssl=true&replicaSet=docgen-staging-shard-0&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1";
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const Template = mongoose.model(
  "template",
  new mongoose.Schema({}, { strict: false }),
  "templates"
);

const upsertTemplates = async (jsonData) => {
  const { freight_type, trade_type, tenant_id, document_type } = jsonData;
  const payload = {
    document_type: document_type,
    tenant_id: tenant_id,
    freight_type: freight_type,
    trade_type: trade_type,
  };
  let result;
  if (Array.isArray(trade_type)) {
    result = await Promise.all(
      trade_type.map(async (t) => {
        jsonData.trade_type = t;
        payload.trade_type = t;
        console.log("Array->", payload, jsonData, t);
        return Template.updateOne(
          payload,
          { $set: jsonData },
          { upsert: true }
        );
      })
    );
  } else {
    console.log("Single->", payload, jsonData);
    result = await Template.updateOne(
      payload,
      { $set: jsonData },
      { upsert: true }
    );
  }
  console.log(
    `Upsert records for document_type-> ${document_type}, tenant_id-> ${tenant_id}, freight_type-> ${freight_type}, trade_type-> ${trade_type}:`,
    result
  );
};

const mainModule = async (folderPath) => {
  // console.log("folderPath->", folderPath);
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      return console.error("Unable to scan folder:", err);
    }

    // Filter for JSON files
    files
      .filter((file) => path.extname(file) === ".json")
      .forEach((file) => {
        const filePath = path.join(folderPath, file);

        // Read each JSON file
        fs.readFile(filePath, "utf8", async (err, data) => {
          if (err) {
            return console.error("Error reading file:", err);
          }
          try {
            const jsonData = JSON.parse(data);
            try {
              upsertTemplates(jsonData);
            } catch (err) {
              console.error("Upsert Error:", err);
            }
          } catch (e) {
            console.error("Invalid JSON in file:", file);
          }
        });
      });
  });
};

mainModule("./demo");
