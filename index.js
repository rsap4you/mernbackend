const express = require('express');
const cors = require('cors');
require("dotenv").config();
const swaggerUI = require('swagger-ui-express');
const fs = require('fs');
const bodyParser = require('body-parser')
const logger = require('./logger');

const options = {};
const routes = require('./modules/v1/route_manager')
// const auth = require('./modules/v1/user/controller/user_controllers')
// create express app
const app = express();

// Enable all CORS requests
app.use(cors());

// Setup server port
const port = process.env.PORT || 5000;
/**
 * Code to parse request body
 */
app.use(express.text());
// app.use(express.json());
app.use(bodyParser.json());
// app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.engine('html', require('ejs').renderFile);

app.set('view engine', 'html');
app.use('/v1/api_document/', require('./modules/v1/api_document/index'));

const swaggerDocument = JSON.parse(fs.readFileSync('./modules/v1/api_document/swagger.json', 'utf-8'));
app.use('/api-docs', swaggerUI.serveFiles(swaggerDocument, options), swaggerUI.setup(swaggerDocument));

app.use('/api/v1', routes)

// app.route('/signup').post(auth.signup);


// listen for requests
try {
  module.exports = app.listen(port, () => {
    logger.info(`Server is listening on port ${port}`);
  });

} catch (error) {
  logger.error("Failed to start server.", error);

}
