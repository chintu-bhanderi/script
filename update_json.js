const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
// Function to minify HTML
async function minifyHTML(html) {
  // Your minification process here
  const response = await fetch("https://mj.olnir.com/tools/minifier/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      html,
    }),
  });
  const minifiedHTML = await response.text();
  const textarea = new JSDOM(
    minifiedHTML,
    "text/html"
  ).window.document.querySelector("textarea");
  return textarea?.value || "";
}

// Function to extract content between specific tags
function extractContent(html) {
  const styleStart = html.indexOf("<style>");
  const styleEnd = html.indexOf("</style>");
  const scriptStart = html.indexOf("<script>");
  const scriptEnd = html.indexOf("</script>");
  const bodyStart = html.indexOf("<body>");
  const bodyEnd = html.indexOf("</body>");

  const styleContent = html.substring(styleStart + 7, styleEnd).trim();
  const scriptContent = html.substring(scriptStart + 8, scriptEnd).trim();
  const bodyContent = html.substring(bodyStart + 6, bodyEnd).trim();

  return { styleContent, scriptContent, bodyContent };
}

// Function to update JSON file
function updateJSON(styleContent, scriptContent, bodyContent, jsonFile) {
  fs.readFile(jsonFile, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading JSON file:", err);
      return;
    }
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return;
    }
    if (jsonData?.html?.styles) {
      jsonData.html.styles = styleContent;
      jsonData.html.scripts = scriptContent;
      jsonData.html.body = bodyContent;
      fs.writeFile(
        jsonFile,
        JSON.stringify(jsonData, null, 2),
        "utf8",
        (writeErr) => {
          if (writeErr) {
            console.error("Error writing JSON file:", writeErr);
            return;
          }
          console.log("JSON file updated successfully.");
        }
      );
    }
  });
}

// Read HTML file
const updateFile = (htmlFile, jsonFile) => {
  fs.readFile(htmlFile, "utf8", async (err, html) => {
    if (err) throw err;

    // Extract content
    const { styleContent, scriptContent, bodyContent } = extractContent(html);

    // Update JSON file
    const minifiedStyle = await minifyHTML(styleContent);
    const minifiedScript = await minifyHTML(scriptContent);
    const minifiedBody = await minifyHTML(bodyContent);

    updateJSON(minifiedStyle, minifiedScript, minifiedBody, jsonFile);

    console.log("JSON file updated successfully.");
  });
};

function getFiles(dir, files = []) {
  // Get an array of all files and directories in the passed directory using fs.readdirSync
  const fileList = fs.readdirSync(dir);
  // Create the full path of the file/directory by concatenating the passed directory and file/directory name
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    // Check if the current file/directory is a directory using fs.statSync
    if (fs.statSync(name).isDirectory()) {
      // If it is a directory, recursively call the getFiles function with the directory path and the files array
      getFiles(name, files);
    } else {
      // If it is a file, push the full path to the files array
      files.push(name);
    }
  }
  return files;
}

const allFiles = getFiles("demo");
allFiles.forEach((file) => {
  if (file.endsWith(".html")) {
    // find json file with same name
    allFiles.forEach((jsonFile) => {
      const fileName = file.split("/").pop().split(".")?.[0];
      if (jsonFile.includes(fileName)) {
        console.log(file, jsonFile, " printing_both_file");
        updateFile(file, jsonFile);
      }
    });
  }
});
