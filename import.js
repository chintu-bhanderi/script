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
    "document_field.terms_and_conditions": {
      type: "string",
      field_type: "local",
      value: `<style>
                .term_and_condition ol {
                    padding-left: 10px;
                }
              </style> <div  class='term_and_condition'> <ol> <li>At Cargo Owner's Risk</li> <li>Declared Value as declared by the Shipper's Invoice</li> <li> Credit on input, input service, capital goods used in providing the taxable services of transportation has been taken as per the provisions of the GST Act </li> <li> The Good will be delviered at destination as per the consignee's address given in the Consignment copy </li> <li> The delivery of the goods will have to be taken with in 06 Hours, after its arrival or as per the agreed terms at the destination, failure to take the delivery will make liable for payment of Detention Charges </li> <li> No Claim shall be entertained on account of force majeure (fire, theft, accident of vehicle, rain, flood, riots, strikes etc.) </li> </ol> <p>&nbsp;</p> <p><b>Notice</b></p> <p> The consignment covered by this set of sepcial vehicle receipts form shall be stored at the destination under the control of the transport operator and shall be delivered to the order of the congisnee' s bank whose name is mentioned in the vehicle receipt. It will under no cirmcustances be delviered to anyone without the written authoriy from the consignee's bank or it's order endorsed on the consignee copy or on a spearate letter of authority </p> </div>`,
    },
    "document_field.terms_and_conditions_template_id": {
      type: "string",
      field_type: "local",
      value: "",
    },
    "document_field.letter_head": {
      type: "object",
      field_type: "local",
      value: "",
    },
  },
};

const mainModule = async () => {
  try {
    payload = {
      document_type: "consignment_note",
      // shipment_id: "187172",
      "document_field.terms_and_conditions": { $exists: false },
      "document_field.terms_and_conditions_template_id": { $exists: false },
      "document_field.letter_head": { $exists: false },
    };
    result = await Document.updateMany(payload, toBeUpdated);
    console.log("result", result);
  } catch (err) {
    console.error("error", err);
  }
};

mainModule();
