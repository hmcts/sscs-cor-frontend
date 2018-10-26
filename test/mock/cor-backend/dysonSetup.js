const dyson = require('dyson');
const path = require('path');
const multer = require('multer');

const upload = multer();

module.exports = () => {
  const dysonOptions = {
    configDir: path.resolve(__dirname, './services/'),
    port: 8090
  };
  const configs = dyson.getConfigurations(dysonOptions);
  const appBefore = dyson.createServer(dysonOptions);
  appBefore.use(upload.any());
  dyson.registerServices(appBefore, dysonOptions, configs);
};
