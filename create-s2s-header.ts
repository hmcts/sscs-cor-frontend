import * as clc from 'cli-color';
import { generateOauth2, generateToken } from './test/fixtures/s2s';

const bold = clc.bold;
const blue = clc.blueBright.bold;
const white = clc.whiteBright;

async function getHeaders(): Promise<{
  Authorization: string;
  ServiceAuthorization: string;
  'Content-Type': string;
}> {
  const token = await generateToken();
  const oauthToken: string = await generateOauth2();

  return {
    Authorization: `Bearer ${oauthToken}`,
    ServiceAuthorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/* tslint:disable no-console */
async function runBootstrap() {
  const { Authorization, ServiceAuthorization } = await getHeaders();

  console.log(`\n${blue(bold('Authorization: '))}${white(Authorization)}`);
  console.log(
    `\n${blue(bold('ServiceAuthorization: '))}${white(ServiceAuthorization)}`
  );
}

runBootstrap()
  .then(() => console.log('Complete'))
  .catch((e) => console.error('Failed', e));
