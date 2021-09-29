const strykerConfiguration = config => {
  config.set({
    mutator: 'typescript',
    transpilers: ['typescript'],
    reporters:
       [
         'clear-text',
         'progress',
         'html'
       ],
    files:
       [
         'app/server/services/*.ts',
         'app/server/utils/*.ts',
         'test/unit/services/*.test.ts',
         'test/unit/utils/*.test.ts',
         'test/chai-sinon.ts',
         'test/fixtures/evidence/evidence.txt',
         'config/*.json',
         'locale/content.json'
       ],
    testFramework: 'mocha',
    testRunner: 'mocha',
    mutate:
       [
         'app/server/services/*.ts',
         'app/server/utils/appealStages.ts',
         '!test/unit/services/*.test.ts',
         '!test/unit/utils/appealStages.test.ts'
       ],
    maxConcurrentTestRunners: 2,
    htmlReporter: { baseDir: 'functional-output/mutation-test' },
    tsconfigFile: 'app/server/tsconfig.json',
    mochaOptions: {
      spec:
         [
           'test/unit/services/*.test.ts',
           'test/unit/utils/appealStages.test.ts'
         ]
    },
    logLevel: 'debug'
  });
};

module.exports = strykerConfiguration;