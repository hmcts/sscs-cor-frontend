import { bootstrap, createAndIssueDecision } from './test/browser/bootstrap';
import * as clc from 'cli-color';
import * as _ from 'lodash';

const bold = clc.bold;
const yellow = clc.yellow;
const blue = clc.blueBright.bold;
const green = clc.greenBright;
const white = clc.whiteBright;

/* tslint:disable no-console */
async function runBootstrap() {
  // reinstate assignment of `sidamUser` once we are able to use a stable deployment of SIDAM in AAT
  const { ccdCase, cohTestData } = await bootstrap();
  if (process.env.ISSUE_DECISION) {
    await createAndIssueDecision(cohTestData.hearingId, ccdCase.id);
  }

  console.log('\n' + bold(_.pad(' CCD case ', 60, '-')) + '\n');

  _.each(ccdCase, (value, key) => console.log(blue(_.padEnd(key, 20)) + white(_.padEnd(value, 40))));

  console.log('\n' + bold(_.pad(' COH test data ', 60, '-')) + '\n');

  _.each(cohTestData, (value, key) => console.log(blue(_.padEnd(key, 20)) + white(_.padEnd(value, 40))));

  // reinstate once we are able to use a stable deployment of SIDAM in AAT
  // console.log('\n' + bold(_.pad('SIDAM user', 60, '-')) + '\n');
  // _.each(sidamUser, (value, key) => console.log(blue(_.padEnd(key, 20)) + white(_.padEnd(value, 40))));

  console.log('\n' + bold(_.pad('', 60, '-')) + '\n');
}

runBootstrap()
  .then(() => console.log('Complete'))
  .catch(e => console.error('Failed', e));
