import { bootstrap } from './test/browser/bootstrap';
import * as clc from 'cli-color';
import * as _ from 'lodash';

const bold = clc.bold;
const yellow = clc.yellow;
const blue = clc.blueBright.bold;
const green = clc.greenBright;
const white = clc.whiteBright;
 
async function runBootstrap() {
  const { ccdCase, cohTestData } = await bootstrap();

  console.log('\n' + bold(_.pad(' CCD case ', 60, '-')) + '\n');

  _.each(ccdCase, (value, key) => console.log(blue(_.padEnd(key, 20)) + white(_.padEnd(value, 40))));

  console.log('\n' + bold(_.pad(' COH test data ', 60, '-')) + '\n');

  _.each(cohTestData, (value, key) => console.log(blue(_.padEnd(key, 20)) + white(_.padEnd(value, 40))));

  console.log('\n' + bold(_.pad('', 60, '-')) + '\n');
}

runBootstrap();