const { minify } = require("html-minifier-terser");
const cheerio = require("cheerio");
const csso = require("csso");
const terser = require("terser");

const html = `
  <html>
    <head>
      <style>
        body { 
          background-color: #ffffff; 
          color: #000000; 
        }
      </style>
      <script>
        function greet() {
          console.log('Hello, World!');
        }
      </script>
    </head>
    <body>
      <h1>  Hello World  </h1>
    </body>
  </html>
`;

const mainModule = async () => {
  const $ = cheerio.load(html);

  // Minify body content
  const minifiedBody = await minify($("body").html(), {
    collapseWhitespace: true,
    removeComments: true,
    removeEmptyAttributes: true,
  });

  // Minify CSS
  const cssContent = $("style").html();
  const minifiedCSS = await csso.minify(cssContent).css;

  // Minify JavaScript
  const scriptContent = $("script").html();
  let minifiedJS = "";

  if (scriptContent) {
    const result = await terser.minify(scriptContent);
    minifiedJS = result.code;
  }

  // Output the results
  console.log("Minified Body:", minifiedBody);
  console.log("Minified CSS:", minifiedCSS);
  console.log("Minified JS:", minifiedJS);
};
mainModule();
