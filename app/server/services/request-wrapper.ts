import request from 'promise-request-retry';
import config from 'config';
import { Request } from 'express';

import * as AppInsights from '../app-insights';
const timeout: number = config.get('apiCallTimeout');

export class RequestPromise {
  static async request(options, req?: Request) {
    let defaultOptions = {};
    if (!options.encoding && options.encoding !== 'binary') {
      defaultOptions = {
        timeout,
        json: true,
      };
    }

    if (req?.session) {
      // eslint-disable-next-line dot-notation
      defaultOptions['headers'] = {
        Authorization: `Bearer ${req.session.accessToken}`,
        ServiceAuthorization: `Bearer ${req.session.serviceToken}`,
      };
    }

    // eslint-disable-next-line dot-notation
    if (options.headers && defaultOptions['headers']) {
      // eslint-disable-next-line dot-notation
      Object.assign(options.headers, defaultOptions['headers']);
    }

    Object.assign(options, defaultOptions);
    try {
      const body = await request(options);
      return await Promise.resolve(body);
    } catch (error) {
      AppInsights.trackException(error);
      AppInsights.trackEvent(
        `error is: ${error.message} calling ${options.uri}`
      );
      return Promise.reject(
        `error is: ${error.message} calling ${options.uri}`
      );
    }
  }
}
