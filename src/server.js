const express = require('express'),
  fileUpload = require('express-fileupload');
  compress = require('compression'),
  path = require("path"),
  cors = require('cors'),
  winston = require('winston'),
  timeout = require('connect-timeout'),
  session = require('express-session'),
  bodyParser = require('body-parser'),
  expressWinston = require('express-winston');


const configMiddleware = require('./config.js');
const routesMiddleware = require('./routes.js');

const setupApp = (app, config) => {

  if (config) {
    app.config = config;
  } else {
    console.log(configMiddleware.getConfig());
    app.config = configMiddleware.getConfig();
  }
  app.use(compress());
  app.use(cors());
  app.use(express.json());
  app.use(timeout(900000));
  app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: true,
    tempFileDir: path.join(app.config.rootDir, app.config.upload.uploadDir)
  }));
  app.use(session({secret: app.config.secret}))
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));


}

const get = (config) => {

  try {

    const app = express();

    setupApp(app, config);
    routesMiddleware.setupRoutes(app);
    console.log(`environment: ${app.get('env')}`);
    return app;

  } catch (err) {
    throw err;
  }
}
const start = (app) => {

  //https://www.codementor.io/knownasilya/testing-express-apis-with-supertest-du107mcv2

  app.listen(app.config.port, () => {
    console.log(`Server running on: ${app.config.port}`);
  });
}

module.exports = {
  get: get,
  start: start
}