const gulp = require("gulp");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

if (fs.existsSync(".env")) {
  dotenv.config();
} else {
  console.error(".env file does not exist!");
  process.exit(1);
}

const dbURI = "mongodb://0.0.0.0:27017/docgen_staging";
// const dbURI =
//   "mongodb://docgenstaging:91yjDdJ5MbrCCHTi@docgen-staging-shard-00-00-3l2zn.mongodb.net:27017,docgen-staging-shard-00-01-3l2zn.mongodb.net:27017,docgen-staging-shard-00-02-3l2zn.mongodb.net:27017/docgen_preprod?ssl=true&replicaSet=docgen-staging-shard-0&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1";

// const connectMongoDB = async () => {
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));
// };

const Template = mongoose.model(
  "template",
  new mongoose.Schema({}, { strict: false, versionKey: false }),
  "templates"
);

const upsertTemplates = async (jsonData, htmlData) => {
  const { freight_type, trade_type, tenant_id, document_type } = jsonData;
  const payload = {
    document_type: document_type,
    tenant_id: tenant_id,
    freight_type: freight_type,
    trade_type: trade_type,
  };
  if (htmlData) {
    const { minifiedStyle, minifiedScript, minifiedBody } = htmlData;
    jsonData.html = {
      styles: minifiedStyle || jsonData.html?.styles,
      scripts: minifiedScript || jsonData.html?.scripts,
      body: minifiedBody || jsonData.html?.body,
    };
  }
  let result;
  if (Array.isArray(trade_type)) {
    result = await Promise.all(
      trade_type.map(async (t) => {
        jsonData.trade_type = t;
        payload.trade_type = t;
        return Template.updateOne(
          payload,
          { $set: jsonData },
          { upsert: true }
        );
      })
    );
  } else {
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

const getMinified = async (html) => {
  const $ = cheerio.load(html);

  // Minify body content
  const minifiedBody = await minify($("body").html(), {
    collapseWhitespace: true,
    removeComments: true,
    removeEmptyAttributes: true,
  });

  // Minify CSS
  const cssContent = $("style").html();
  const minifiedStyle = await csso.minify(cssContent).css;

  // Minify JavaScript
  const scriptContent = $("script").html();
  let minifiedScript = "";

  if (scriptContent) {
    const result = await terser.minify(scriptContent);
    minifiedScript = result.code;
  }
  return { minifiedStyle, minifiedScript, minifiedBody };
};

const mainModule = async (folderPath) => {
  console.log("Running On ", folderPath);
  try {
    const files = await fs.readdir(folderPath);
    const jsonFiles = files.filter((file) => path.extname(file) === ".json");

    await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(folderPath, file);
        const data = await fs.readFile(filePath, "utf8");
        try {
          // Parse JSON data
          const jsonData = JSON.parse(data);

          // Fetch the corresponding .html file from the "html" folder
          const htmlFolderPath = path.join(folderPath, "html");
          const htmlFilePath = path.join(
            htmlFolderPath,
            file.replace(".json", ".html")
          );
          let minifiedData = null; // Initialize with null if HTML is not found
          try {
            const htmlData = await fs.readFile(htmlFilePath, "utf8");
            minifiedData = await getMinified(htmlData);
          } catch (htmlErr) {
            console.warn(
              `No matching HTML file found for ${file}. Proceeding without HTML.`
            );
          }

          // Perform your upsert action with jsonData and optionally minifiedData
          await upsertTemplates(jsonData, minifiedData);
        } catch (err) {
          console.error("Invalid JSON in file:", file, err);
        }
      })
    );
  } catch (err) {
    console.error("Error processing files:", err);
  }
};

gulp.task("template_seed", async (done) => {
  // await connectMongoDB();
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
