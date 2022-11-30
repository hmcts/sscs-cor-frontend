import * as ccd from 'test/fixtures/ccd';
import * as sidam from 'test/fixtures/sidam';
import { LoggerInstance } from 'winston';
import { Logger } from '@hmcts/nodejs-logging';

const logger: LoggerInstance = Logger.getLogger('test bootstrap');

async function bootstrapCcdCase(hearingType) {
  try {
    const ccdCase = await ccd.createCase(hearingType);
    return ccdCase;
  } catch (error) {
    logger.error('Error bootstrapping CCD with test case', error);
    return Promise.reject(error);
  }
}

async function bootstrapSidamUser(ccdCase) {
  try {
    await sidam.registerRedirectUri();
    return await sidam.createUser(ccdCase);
  } catch (error) {
    logger.error('Error bootstrapping SIDAM user', error);
    return Promise.reject(error);
  }
}

export async function bootstrap(hearingType = 'oral') {
  try {
    const ccdCase = await bootstrapCcdCase(hearingType);
    const sidamUser = await bootstrapSidamUser(ccdCase);
    return { ccdCase, sidamUser };
  } catch (error) {
    return Promise.reject(error);
  }
}
