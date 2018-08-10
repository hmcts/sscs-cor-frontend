# SSCS - Continuous Online Resolution

This application is the public facing service for online hearings.

It relies upon the SSCS COR backend service (https://github.com/hmcts/sscs-cor-backend)

## Running

##### Prereqs

* node.js v8 or higher
* yarn
* redis running on the standard port (6379)

Once you have those, you need to install the dependencies using:

```bash
yarn
```

Once complete you can start the application and required mocks using:

```bash
yarn dev-mock-api
```

Finally visit http://localhost:3000 to see the running application.

## Testing

In order to run all the tests simply use:

```bash
yarn test
```

This will run all the unit tests, followed by the browser tests, using Puppeteer.
The browser tests will start all services they require, such as the application and third-party service stubs.

To run just the unit or browser tests standalone, you can do the following:

```bash
yarn test:unit // just unit tests
yarn test:browser // just browser tests
```

### Functional Tests

The same browser test suite is used for running locally and when running against the `preview` and `AAT` environments via the `yarn test:functional` script.

##### Local environments

Points to note when running the tests against your local environment:

* backend API is stubbed using Dyson
* any request for question will display a standard response

##### Integrated environments

Integrated environments include `preview` and `AAT`. Please note the following:

* COH API is bootstrapped with an Online Hearing and question
* real backend API service is used
* real COH API service is used

### Smoke Tests

The smoke tests are a subset of the functional tests and are differentiated using the `@smoke` tag in their name. The same points about the functional tests also apply to the smoke tests.

Smoke tests are run, as part of the pipeline, against the `preview`, `AAT` and `prod` environments after the deployment of each slot.
