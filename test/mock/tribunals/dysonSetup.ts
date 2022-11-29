const dyson = require('dyson');
const path = require('path');

export = () => {
  const dysonOptions = {
    configDir: path.resolve(__dirname, './services/'),
    port: 8083,
  };
  const configs = dyson.getConfigurations(dysonOptions);
  const appBefore = dyson.createServer(dysonOptions);
  dyson.registerServices(appBefore, dysonOptions, configs);
};
