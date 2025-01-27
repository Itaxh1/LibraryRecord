/*
 * This require() statement reads environment variable values from the file
 * called .env in the project directory.  You can set up the environment
 * variables in that file to specify connection information for your own DB
 * server.
 */
require('dotenv').config();
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const api = require('./api');
const { connectToDb } = require('./lib/mongo');
const { startConsumer } = require('./consumer'); // Import the consumer
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// Load the openapi.yaml file
const swaggerDocument = YAML.load(path.join(__dirname, 'openapi.yaml'));

const app = express();
const port = process.env.PORT || 8000;

// Setup Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/*
 * Morgan is a popular logger.
 */
app.use(morgan('dev'));

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */
app.use('/', api);

app.use('*', function (req, res, next) {
  res.status(404).send({
    error: "Requested resource " + req.originalUrl + " does not exist"
  });
});

/*
 * This route will catch any errors thrown from our API endpoints and return
 * a response with a 500 status to the client.
 */
app.use('*', function (err, req, res, next) {
  console.error("== Error:", err);
  res.status(500).send({
    error: "Server error. Please try again later."
  });
});

connectToDb().then(function () {
  app.listen(port, function () {
    console.log("== Server is running on port", port);
    startConsumer(); // Start the RabbitMQ consumer when the server starts
  });
});
