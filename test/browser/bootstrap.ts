import * as ccd from 'test/fixtures/ccd';
import * as sidam from 'test/fixtures/sidam';

async function bootstrapCcdCase(hearingType) {
  try {
    const ccdCase = await ccd.createCase(hearingType);
    return ccdCase;
  } catch (error) {
    console.log('Error bootstrapping CCD with test case', error);
    return Promise.reject(error);
  }
}

async function bootstrapSidamUser(ccdCase) {
  try {
    // await sidam.registerRedirectUri();
    return await sidam.createUser(ccdCase);
  } catch (error) {
    console.log('Error bootstrapping SIDAM user', error);
    return Promise.reject(error);
  }
}

export async function bootstrap(hearingType = 'oral') {
  try {
    console.log('Before creating ccd case....................');
    const ccdCase = await bootstrapCcdCase(hearingType);
    console.log('Before creating sidam user....................');
    const sidamUser = await bootstrapSidamUser(ccdCase);
    return { ccdCase, sidamUser };
  } catch (error) {
    return Promise.reject(error);
  }
}
