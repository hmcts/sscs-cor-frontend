import { bootstrapCreateS2sTokens } from './test/browser/bootstrap';
import * as clc from 'cli-color';

const bold = clc.bold;
const blue = clc.blueBright.bold;
const white = clc.whiteBright;

/* tslint:disable no-console */
async function runBootstrap() {
  const { Authorization, ServiceAuthorization } =
    await bootstrapCreateS2sTokens();

  console.log(`\n${blue(bold('Authorization: '))}${white(Authorization)}`);
  console.log(
    `\n${blue(bold('ServiceAuthorization: '))}${white(ServiceAuthorization)}`
  );
}

runBootstrap()
  .then(() => console.log('Complete'))
  .catch((e) => console.error('Failed', e));
