module.exports = config => {
  config.set({
    testRunner: 'mocha',
    disableTypeChecks: 'app/server/**/*.{js,ts,jsx,tsx,html,vue}',
    mutate:
       [
         'app/server/services/*.ts',
         'app/server/*.ts',
         'app/server/utils/fieldValidation.ts',
         'app/server/utils/dateUtils.ts'
       ],
    concurrency: 2,
    htmlReporter: { baseDir: 'functional-output/mutation-test' },
    tsconfigFile: 'app/server/tsconfig.json',
    coverageAnalysis: 'off',
    mochaOptions: {
      spec:
         [
           'test/unit/services/*.test.ts',
           'test/unit/*.test.ts',
           'test/unit/utils/field-validation.test.ts',
           'test/unit/utils/dateUtils.test.ts'
         ]
    },
    logLevel: 'debug'
  });
};