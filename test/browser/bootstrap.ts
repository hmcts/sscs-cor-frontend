import { LoggerInstance } from 'winston';
import { Logger } from '@hmcts/nodejs-logging';
import { CCDCase, createCase } from 'test/fixtures/ccd';
import {
  createUser,
  registerRedirectUri,
  SidamUser,
} from 'test/fixtures/sidam';

const logger: LoggerInstance = Logger.getLogger('test bootstrap');

async function bootstrapCcdCase(hearingType): Promise<CCDCase> {
  try {
    const ccdCase = await createCase(hearingType);
    return ccdCase;
  } catch (error) {
    logger.error('Error bootstrapping CCD with test case', error);
    return Promise.reject(error);
  }
}

async function bootstrapSidamUser(ccdCase: CCDCase): Promise<SidamUser> {
  try {
    await registerRedirectUri();
    return await createUser(ccdCase);
  } catch (error) {
    logger.error('Error bootstrapping SIDAM user', error);
    return Promise.reject(error);
  }
}

export async function bootstrap(
  hearingType = 'oral'
): Promise<{ sidamUser: SidamUser; ccdCase: CCDCase }> {
  try {
    const ccdCase: CCDCase = await bootstrapCcdCase(hearingType);
    const sidamUser: SidamUser = await bootstrapSidamUser(ccdCase);
    return { ccdCase, sidamUser };
  } catch (error) {
    return Promise.reject(error);
  }
}
