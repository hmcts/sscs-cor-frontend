'use strict';

import { Logger } from '@hmcts/nodejs-logging';
const LaunchDarkly = require('../components/launch-darkly');
const CONF = require('config');

const logger = Logger.getLogger('featureToggle.js');

class FeatureToggle {
  constructor() {
    this.launchDarkly = new LaunchDarkly().getInstance();
  }

  callCheckToggle(req, res, next, launchDarkly, featureToggleKey, callbackFn, redirectPage) {
    return this.checkToggle({
      req,
      res,
      next,
      launchDarkly,
      featureToggleKey,
      callbackFn,
      redirectPage
    });
  }

  checkToggle(params) {
    const featureToggleKey = CONF.featureToggles[params.featureToggleKey];
    const ldUser = CONF.featureToggles.launchDarklyUser;

    let ldDefaultValue = false;
    if (params.launchDarkly.ftValue && params.launchDarkly.ftValue[params.featureToggleKey]) {
      ldDefaultValue = params.launchDarkly.ftValue[params.featureToggleKey];
    }

    try {
      return this.launchDarkly.variation(featureToggleKey, ldUser, ldDefaultValue, (error, showFeature) => {
        if (error) {
          return params.next();
        }

        logger.info(`Checking feature toggle: ${params.featureToggleKey}, isEnabled: ${showFeature}`);
        return params.callbackFn({
          req: params.req,
          res: params.res,
          next: params.next,
          redirectPage: params.redirectPage,
          isEnabled: showFeature,
          featureToggleKey: params.featureToggleKey
        });
      });
    } catch (error) {
      return params.next();
    }
  }

  toggleFeature(params) {
    if (!params.req.session.featureToggles) {
      params.req.session.featureToggles = {};
    }
    params.req.session.featureToggles[params.featureToggleKey] = params.isEnabled;
    return params.next();
  }

  static isEnabled(featureToggles, key) {
    if (featureToggles && featureToggles[key]) {
      return true;
    }
    return false;
  }
}

module.exports = FeatureToggle;
