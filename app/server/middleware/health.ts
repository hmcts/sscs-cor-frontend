const healthCheck = require('@hmcts/nodejs-healthcheck');
const config = require('config');

function getHealthConfigure() {
  return healthCheck.configure({
    checks: {
      'manage-your-appeal-api': healthCheck.web(`${config.api.url}/health`)
    },
    timeout: config.health.timeout,
    deadline: config.health.deadline
  });
}

function getReadinessConfigure() {
  return healthCheck.configure({
    readinessChecks: {
      'mmanage-your-appeal-api': healthCheck.web(`${config.api.url}/health/readiness`)
    }
  });
}

export {
  getHealthConfigure, getReadinessConfigure
};
