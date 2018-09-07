import { bootstrap } from 'test/browser/bootstrap';

async function runBootstrap() {
  const { ccdCase, cohTestData } = await bootstrap();
  console.log('CCD case', ccdCase);
  console.log('COH test data', cohTestData);
}

runBootstrap();
