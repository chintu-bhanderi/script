const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const dbURI =
  "mongodb://documentgenerationprod:gBpk9KVZpX9pl2JK@cluster0-shard-00-00-fky7i.mongodb.net:27017,cluster0-shard-00-01-fky7i.mongodb.net:27017,cluster0-shard-00-02-fky7i.mongodb.net:27017/docgen_production?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin";
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const Document = mongoose.model(
  "base_document",
  new mongoose.Schema({}, { strict: false }),
  "base_documents"
);

const toBeUpdated = {
  $set: {
    "document_field.cargos": {
      type: "array",
      item: "object",
      default_source: ["cargos"],
      field_type: "direct",
    },
    "document_field.load_type": {
      type: "string",
      field_type: "direct",
      default_source: ["shipment", "load_type"],
    },
    "document_field.link_shipment_json": {
      type: "string",
      field_type: "direct",
      default_source: ["shipment", "link_shipment_json"],
    },
    "document_field.remarks": {
      type: "string",
      field_type: "direct",
      default_source: ["shipment", "remarks"],
    },
    "document_field.purchase_order_number": {
      type: "string",
      field_type: "direct",
      default_source: ["shipment", "purchase_order_number"],
    },
    "document_field.place_of_issue": {
      type: "string",
      field_type: "local",
      default_source: [],
    },
    "document_field.involved_branch_gstin": {
      type: "string",
      field_type: "direct",
      default_source: [
        "shipment",
        "involved_branch",
        "tax_registration_number",
      ],
    },
    "document_field.CIN": {
      type: "string",
      field_type: "direct",
      default_source: ["default_company", "company_identification_number"],
    },
  },
};

const mainModule = async () => {
  try {
    payload = {
      document_type: "consignment_note",
      "document_field.place_of_issue": { $exists: false },
    };
    result = await Document.updateMany(payload, toBeUpdated);
    console.log("result", result);
  } catch (err) {
    console.error("error", err);
  }
};

mainModule();
