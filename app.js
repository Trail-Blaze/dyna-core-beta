/*
App.js - This script creates a static server, hosts files from the "public" directory and
finds and empty port to listen on
Copyright (C) 2021  Immanuel Garcia, Luke Harris, Kai, Grayson Stowell, John McDowall
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
(at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program.  If not, see http://www.gnu.org/licenses/old-licenses/gpl-2.0.html.
*/

// Imports

/* 
VERSION LOG:

---------------------------------------- NOTE ----------------------------------------------
WHEN RELEASING A VERSION PLEASE ADD VERSION, DESCRIPTION AND CREDITS USING THE FORMAT BELOW

VERSION - DESCRIPTION [ CREDITS ]

ALSO MAKE SURE TO UPDATE THE VERSION VARIABLE!!!

---------------------------------------------------------------------------------------------

1.0.0 - INITIAL RELEASE [ ALEXDEV404 ]
1.25.6 - ADD FEATURES AND BASE [ ALEXDEV404 ]
1.30.6 - NEONITE PATCH [ ALEXDEV404 ]
1.31.6 - DESTROY PARTS OF NEONITE CODE WITH ORIGINAL CODE [ ALEXDEV404 ]
1.31.7 - EDIT ERRORS.JS PATH [ ALEXDEV404 ] 
1.31.8 - REROUTE PATHS TO LIBS IN A MINIFIED WAY [ ALEXDEV404 ] 
1.32.8 - ADDED ALL CORE MODULES [ ALEXDEV404 ] 
1.32.9 - FIXED THEME BUG [ ALEXDEV404 ] 
1.32.10 - ADDED INSTALL SCRIPT [ GRAYBTW ]
1.34.10 - REROUTED PATHS AND FIXED BACKEND [ ZINX ]
1.40.0 - STABLE RELEASE [ ZINX, VINZY, GRAYBTW, ALEXDEV404 ]
1.40.1 - IMPROVED ERROR HANDLING [ ALEXDEV404 ]
1.40.2 - SORTED MODULES AND SPREADED API.JS OUT INTO SEPARATE FILES [ ALEXDEV404 ]
1.40.3 - MADE SERVER "ACTUALLY" PRINT OUT REQUEST METHOD INSTEAD OF PRINTING OUT PRE-TYPED GARBAGE [ ALEXDEV404 ]
1.40.3 - ADD GRAYSON STOWELL TO THE AUTHORS VARIABLE [ ALEXDEV404 ]
1.41.3 - ADDED ASCII LOGO TO APPLICATION [ ALEXDEV404 ]
1.42.3 - DYNAMITE NOW SUPPORTS HTTPS! [ ALEXDEV404 ]
1.42.4 - BETTER SSL CERT PATH [ ALEXDEV404 ]
1.42.5 - PATCH API AND FIX ERRORS [ ALEXDEV404 ]
1.42.6 - HOTFIX PATH IS NOT DEFINED - FIX [ ZINX ]
1.42.7 - FRIENDS SUMMARY [ ALEXDEV404 ]
1.42.8 - CHOICE OF PORT USING PORTFILE + APP.JS CODE REFLOW TO PREVENT RACE CONDITIONS [ ALEXDEV404 ]
1.24.8 - "SAC" AFFILIATE API ADDITIONS + REWRITE [ SLUSHNIX ]
1.42.8 - 400 LINES NOW! [ ALEXDEV404 ]
1.42.8 - SIMPLIFY OAUTH.JS [ SLUSHNIX ]

*/

// TODO: ADD TIMER TO MODULE IMPORT LIST ALONG WITH A COUNTER THAT COUNTS THE AMOUNT OF MODULES IMPORTED

const express = require("express"); // Used to activate the NodeJs express application libraries
const getPort = require("get-port"); // Used to listen for an empty random port
const fs = require("fs"); // Used to access the immediate filesystem of an application.
const { v4: uuidv4 } = require("uuid"); // Used to generate a unique random ID
const errors = require("./lib/errors");
const { ApiException } = errors;
const console = require("console"); // Console Library
const { exec } = require("child_process"); // Shell execution library
const app = express(); // Create an express application
const runfiles = "./modules"; // All core libraries and scripts required for Blaze to run
const path = require("path"); // Used for file extension filter
const https = require("https"); // HTTPS Module
const filename_log = "./lib/port.json";

// Definitions

const REQ_LOGGING = true; // Request Logging is set to false by default
const version = "1.42.7";
const cyear = 2022;
const authors = "Immanuel Garcia, Luke Harris, Kai, Grayson Stowell, Scott, John McDowall";
const windowTitle = "Blaze Server";
const b_logo =
  '                                                    \n88888888ba   88                                     \n88      "8b  88                                     \n88      ,8P  88                                     \n88aaaaaa8P\'  88  ,adPPYYba,  888888888   ,adPPYba,  \n88""""""8b,  88  ""     `Y8       a8P"  a8P_____88  \n88      `8b  88  ,adPPPPP88    ,d8P\'    8PP"""""""  \n88      a8P  88  88,    ,88  ,d8"       "8b,   ,aa  \n88888888P"   88  `"8bbdP"Y8  888888888   `"Ybbd8"\'  \n                                                    \n                                                    '; // ASCII Logo
const baseDir = __dirname;
const useSecureHTTPS = false;
let server;
let STATUS;

// Imported and converted from a Python Project

let port = {
  port: null,
  // portHTTP: null,
};

const bcolor = {
  HEADER: "\033[95m",
  OKBLUE: "\033[94m",
  OKCYAN: "\033[96m",
  OKGREEN: "\033[92m",
  WARN: "\033[93m",
  FAIL: "\033[91m",
  END: "\033[0m",
  BOLD: "\033[1m",
  UNDERLINE: "\033[4m",
};

// HTTPS Configuration

var key = fs.readFileSync(__dirname + "/certs/cert.key");
var cert = fs.readFileSync(__dirname + "/certs/cert.crt");
var options = {
  key: key,
  cert: cert,
};

// A sleep function I found somewhere just in case

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

// Main application starts here!
console.log("\n");
exec(`title ${windowTitle} version ${version}`); // Sets the window title to Blaze Server

// uuidv4(); // -> '6c84fb90-12c4-11e1-840d-7b25c5ee775a'

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await

// https://www.w3schools.com/js/js_strict.asp
("use strict"); // Prevents program from using uninitialized and undeclared variables
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("etag", false);

if (REQ_LOGGING) {
  // https://expressjs.com/en/guide/using-middleware.html#middleware.application

  app.use((req, res, next) => {
    // res (response variable) is never used in this scope
    console.log(`${bcolor.OKGREEN}[${req.method}]${bcolor.END}`, req.url); // Logs the response URL to the console
    next();
  });
}
// https://expressjs.com/en/starter/static-files.html

app.use("/", express.static("public")); // Set serverdir to rootdir and create an HTTP server that serves static files

/* app.use((req, res, next) => {
  // req and res are never used in this scope
  next(new ApiException(errors.com.epicgames.common.not_found)); // IDK
});*/

// Returns files with a certain file extension
// https://stackoverflow.com/a/44200655/10976415

let dirPath = path.resolve(runfiles); // path to your directory goes here
let filesList;

fs.readdir(dirPath, function (err, files) {
  if (err) {
    console.log("not found");
  } else {
    filesList = files.filter(function (e) {
      return path.extname(e).toLowerCase() === ".js";
    });
    //  console.log(filesList);
  }
});

init(); // Run init function

async function init() {
  await sleep(500); // Display main title for a bit then go onto the main stuffs

  // https://github.com/sindresorhus/get-port/
  // https://www.npmjs.com/package/get-port

  // For HTTPS port 443

  if (useSecureHTTPS) {
    port.port = 443; //443
    port.portHTTP = 80; //80
    server = https.createServer(options, app); // Setup as HTTPS server if secure HTTPS is enabled
    process.on("uncaughtException", () =>
      console.error(
        `${bcolor.FAIL}[ERR_CANNOT_START]${bcolor.END}${bcolor.WARN} Dynamite cannot claim port ${port.port}! If this port is already in use, please stop any programs that might be using it and then try starting Dynamite again. If running in a Docker container such as GitHub Codespaces, note that Dynamite is not designed to run inside one of these, and as a result may cause errors such as these.${bcolor.END}\n`
      )
    );
    main();
  }
  if (!useSecureHTTPS) {
    // v1.42.8 -- Allow the choice of port using the port JSON file
    fs.access(filename_log, fs.F_OK, (err) => {
      if (err) {
        processDied();
        return 0;
      }
      readPort();
    });

    server = app; // Setup as HTTP server is secure HTTPS is disabled
  }


}

function main(){
  server.listen(port.port, () => {
    console.clear(); // Switch title to Blaze Server is listening on port {port.port}.

    // Saves Port Number To File
    // https://www.w3schools.com/nodejs/nodejs_filesystem.asp

    start(); // Display Disclaimer and start Blaze

    // Creates File if Not Found
    // https://flaviocopes.com/how-to-check-if-file-exists-node/

    fs.access(filename_log, fs.F_OK, (err) => {
      if (err) {
        // console.error(err); // For debugging purposes

        console.log(
          `${bcolor.OKBLUE}[INFO]${bcolor.END}`,
          `File ${filename_log} Not Found! Is this a first-time run?`
        );
        console.log(
          `${bcolor.OKBLUE}[INFO]${bcolor.END}`,
          `File ${filename_log} Creating one...`
        );

        createPortfile();

        return 0;
      }
      /*
         // Deletes File if Found
         fs.unlink(`${filename_log}`, function (err) {
            if (err) throw err;
            console.log(
               `${bcolor.OKBLUE}[INFO]${bcolor.END}`,
               `File ${filename_log} found. Deleting...\n`
            );

         });
*/
    });

    // Check for modules directory

    /* fs.access("./managers", function(error) {
  if (error) {
    console.log("Directory does not exist.")
  } else {
    console.log("Directory exists.")
  }
})*/

    // PATCH 1.30.6! SWITCH TO NEONITE LIB!
    function start() {
      fs.access(runfiles, async function (err) {
        if (err) {
          // Stage 1 Fails

          exec(`title ${windowTitle} has failed to load!`); // Switch title to "Blaze Server has failed to load!".

          console.error(
            `${bcolor.FAIL}Core Directory Does Not Exist. Blaze Cannot Continue to Launch.${bcolor.END}`
          );
          console.log("\n");
          console.log(
            `${bcolor.HEADER}Blaze has ${bcolor.FAIL}FAILED${bcolor.END}${bcolor.HEADER} to launch!${bcolor.END}`
          );
          console.log("\n");
          console.error(`${bcolor.FAIL}THE FULL ERROR IS DISPLAYED BELOW:`);
          console.error(err);
          console.log(`${bcolor.HEADER}To exit, hit any key.${bcolor.END}\n`);
          process.exit();
        } else {
          // Stage 1 Passes
          console.log("\n");
          console.log("Core directory exists. Loading required files...\n");

          for (let range = 0; range < filesList.length; range++) {
            require(`${runfiles}/${filesList[range]}`)(app, port.port);
            console.log(
              `${bcolor.OKCYAN}[OK] Importing: ${runfiles}/${filesList[range]}${bcolor.END}`
            );
          }
          const theme = require("./ThemePacks/CurrentTheme.js")(app, port.port); // Load theme
          console.log("\n");

          // Replaced shit code with better code.
          /*  fs.readdirSync(`${__dirname}/managers`).forEach(route => { //for the managers folder
            require(`${__dirname}/managers/${route}`)(app, 5595); //port number = 5595 
          })*/

          // NEONITE STARTS

          app.use((req, res, next) => {
            next(new ApiException(errors.com.dynamite.common.not_found));
          });

          app.use((err, req, res) => {
            let error = null;

            if (err instanceof ApiException) {
              error = err;
            } else {
              const trackingId =
                req.headers["x-epic-correlation-id"] || uuidv4();
              error = new ApiException(
                errors.com.dynamite.common.server_error
              ).with(trackingId);
              console.error(trackingId, err);
            }

            error.apply(res);
          });

          // Neonite ENDS

          await sleep(2000);

          console.clear();
          console.log("\n");
          console.log(`${bcolor.OKCYAN}${bcolor.BOLD}${b_logo}${bcolor.END}`);
          console.log("\n");
          console.log(
            `${bcolor.OKGREEN}Blaze version ${version}, Copyright (C) ${cyear} ${authors}\nBlaze comes with ABSOLUTELY NO WARRANTY.\n\nThis is free software, and you are welcome to redistribute it under certain conditions.\nFor more information, please refer to the bundled LICENSE file.${bcolor.END}`
          );
          console.log("\n");
          useSecureHTTPS ? (STATUS = "[HTTPS]") : (STATUS = "[HTTP]");
          if (useSecureHTTPS) {
            app.listen(port.portHTTP); // Startup Optional HTTP Server
          }
          mesg();
          console.log(
            `${bcolor.HEADER}To exit, hit CTRL + C at any time.${bcolor.END}\n`
          );
        }
      });
    }
    // Run Color Tests
    /*
    
    console.log(`${bcolor.HEADER}HEADER${bcolor.END}`);
    console.log(`${bcolor.OKBLUE}OKBLUE${bcolor.END}`);
    console.log(`${bcolor.OKCYAN}OKCYAN${bcolor.END}`);
    console.log(`${bcolor.OKGREEN}OKGREEN${bcolor.END}`);
    console.log(`${bcolor.WARN}WARN${bcolor.END}`);
    console.log(`${bcolor.FAIL}FAIL${bcolor.END}`);
    console.log(`${bcolor.BOLD}BOLD${bcolor.END}`);
    console.log(`${bcolor.UNDERLINE}UNDERLINE${bcolor.END}`);
    */
  });

}


function mesg() {
  console.log(
    `${bcolor.HEADER}Blaze has successfully initialized and is listening on port ${bcolor.FAIL}${port.port}${bcolor.END}${bcolor.HEADER}. ${STATUS}${bcolor.END}`
  );
  if (useSecureHTTPS) {
    console.log(
      `${bcolor.OKBLUE}[DUAL]${bcolor.END}${bcolor.OKGREEN} Loaded Optional HTTP Server for Usage on port ${bcolor.FAIL}${port.portHTTP}${bcolor.END}${bcolor.OKGREEN}.${bcolor.END}\n`
    );
  }
}

async function processDied() {
  port.port =
    process.env.app_port || (await getPort({ port: [5595, 80, 8080] }));
}

function readPort() {
  port = require(filename_log);
  createPortfile();
}

function createPortfile() {
  // Recreates File With Correct Port Number
  let portjson = JSON.stringify(port, null, 3);
  fs.writeFile(filename_log, portjson, "utf8", function (err) {
    if (err) throw err;
    console.log(
      `${bcolor.OKBLUE}[INFO]${bcolor.END}`,
      `Saved Port Number to ${filename_log}\n`
    );
  });
  exec(`title ${windowTitle} is listening on localhost port ${port.port}`);
  main();
}

// https://www.sitepoint.com/understanding-module-exports-exports-node-js/

module.exports = {
  bcolor: bcolor,
  useSecureHTTPS: useSecureHTTPS,
  baseDir: baseDir,
  app: app,
};
