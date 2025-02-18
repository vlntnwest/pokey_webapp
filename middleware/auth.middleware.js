const { auth } = require("express-openid-connect");
require("dotenv").config();

const authConfig = auth({
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_CLIENT_SECRET,
  baseURL: "http://localhost:5001",
  clientID: "ZUTwYPACRJ1elZefyQlvMGWmRV6ol95J",
  issuerBaseURL: "https://dev-cppdqhjf043vs4gl.eu.auth0.com",
});

module.exports = authConfig;
