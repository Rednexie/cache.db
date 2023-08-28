const cache = require("./cache");
const consoled = require("consoled.js") // npm i consoled.js@1.0.4
// Require node-fetch module
const fetch = require('node-fetch'); //npm i node-fetch@2.6.1
const express = require("express");
const app = express();
const port = 80;
// Define a middleware function
function blockIPs(req, res, next) {
  // Get the IP address of the request
  let ip = req.connection.remoteAddress || req.socket.remoteAdress || req.headers['x-forwarded-for'];
  if(ip.includes("::ffff:")) return next()
  if(ip == "::1") return next()
  // Define a URL for the ip-api service
  let url = 'http://ip-api.com/json/' + ip;


  // Check if the IP address is already in the cache
  if (cache.has(ip)) {
    // Get the country code from the cache
    let countryCode = cache.get(ip);

    // Check if the country code is Turkey
    if (countryCode === 'TR') {
      // Allow the request to continue
      next();
    } else {
      // Deny the request and send a 403 response
      res.status(403).send('Access denied');
    }
  } else {
    // Use node-fetch to get the country code of the IP address
    fetch(url)
      .then(response => response.json())
      .then(data => {
        // Get the country code
        let countryCode = data.countryCode;

        // Store the country code in the cache
        cache.set(ip, countryCode);

        // Check if the country code is Turkey
        if (countryCode === 'TR') {
          // Allow the request to continue
          next();
        } else {
          // Deny the request and send a 403 response
          res.status(403).send('Access denied');
        }
      })
      .catch(error => {
        // Handle error
        console.error(error);
      });
  }
}

// Define an array to store the checked IP addresses
let checkedIPs = [];

// Use the middleware function for all routes
app.use(blockIPs);

app.get("/", (req, res) => {
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  res.status(200).send(ip + " erişim izni verildi.")
})
const listener = app.listen(port, () => {
  consoled.green(`Listening on http port ${listener.address().port}`);
})
