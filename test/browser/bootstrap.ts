import { LoggerInstance } from 'winston';
import { Logger } from '@hmcts/nodejs-logging';
import { CCDCase, createCase, createIBACase } from 'test/fixtures/ccd';
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
  hearingType = 'oral',
  benefitType = 'nonIba'
): Promise<{ sidamUser: SidamUser; ccdCase: CCDCase }> {
  try {
    let ccdCase: CCDCase;
    benefitType === 'iba'
      ? (ccdCase = await createIBACase(hearingType))
      : (ccdCase = await bootstrapCcdCase(hearingType));
    const sidamUser = await bootstrapSidamUser(ccdCase);
    return { ccdCase, sidamUser };
  } catch (error) {
    return Promise.reject(error);
  }
}
