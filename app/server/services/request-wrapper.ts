import * as request from 'request-promise';
import { Request } from 'express';
const timeout = require('config').get('apiCallTimeout');
import * as AppInsights from '../app-insights';

export class RequestPromise {

  static async request(options, req?: Request) {
    let defaultOptions = {};
    if (!options.encoding && options.encoding !== 'binary') {
      defaultOptions = {
        timeout,
        json: true
      };
    }

    if (req && req.session) {
      defaultOptions['headers'] = {
        Authorization: `Bearer ${req.session.accessToken}`,
        ServiceAuthorization: `Bearer ${req.session.serviceToken}`
      };
    }

    if (options.headers && defaultOptions['headers']) {
      Object.assign(options.headers, defaultOptions['headers']);
    }

    Object.assign(options, defaultOptions);
    try {
      const body = await request(options);
      return Promise.resolve(body);
    } catch (error) {
      AppInsights.trackException(`error is: ${error.message} calling ${options.uri}`);
      return Promise.reject(`error is: ${error.message} calling ${options.uri}`);
    }

  }
}
