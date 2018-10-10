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
yarn test:all
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
* by default preview is integrated with other services in AAT

### Smoke Tests

The smoke tests are a subset of the functional tests and are differentiated using the `@smoke` tag in their name. The same points about the functional tests also apply to the smoke tests.

Smoke tests are run, as part of the pipeline, against the `preview`, `AAT` and `prod` environments after the deployment of each slot.

### Debugging browser tests in AAT

If a functional/smoke test run is failing in AAT (or other integrated environment) it's possible to run the test suite locally against AAT in order to help debug the problem.

To do this you must set some extra environment variables locally:

* HTTP_PROXY - to configure the tests to use the HMCTS proxy
* SSCS_API_URL = this is used for the tests to bootstrap an appeal with online panel in CCD e.g. http://sscs-cor-backend-aat.service.core-compute-aat.internal for AAT
* COH_URL - this is used for the tests to bootstrap some data using the COR COH API e.g. http://coh-cor-aat.service.core-compute-aat.internal for AAT
* TEST_URL - this is the URL you are testing e.g. https://sscs-cor-frontend-aat-staging.service.core-compute-aat.internal for AAT staging slot
* HEADLESS - optionally choose to show the browser by setting this to false

Put these together with the required `yarn` command in one line like this:

```bash
HEADLESS=false ENABLE_DUMMY_LOGIN=true HTTP_PROXY=http://proxyout.reform.hmcts.net:8080 SSCS_API_URL=http://sscs-cor-backend-aat.service.core-compute-aat.internal COH_URL=http://coh-cor-aat.service.core-compute-aat.internal TEST_URL=https://sscs-cor-frontend-aat-staging.service.core-compute-aat.internal yarn test:smoke
```

### Creating test data in AAT

You can easily create a benefit appeal in CCD with online panel and associate it with an online hearing. The hearing will have one question and the question round will be issued.

This cam be done locally by using a yarn command

```bash
yarn test:create-data-aat
```

The command will output something like this:

```
Created CCD case for Zora_Little33@gmail.com with ID 1536321469004833 and reference CR45cb7fc1-d932-4d9e-9716-aa34bf0ff4f6
Created online hearing with ID fc03d461-feb9-4058-a6b8-ef7195aee8c1
Created question with ID 8601e701-11ca-4897-8ada-f29a0a51d82a
Question round issued, status pending
Question round not issued at attempt 1: question_issue_pending
Question round issued successfully at attempt 2

------------------------- CCD case -------------------------
email               Easton.Schaden@gmail.com
caseId              1536321383328128
caseReference       CR210c5296-166a-4762-8b9b-d4e1c76e6c1d
---------------------- COH test data -----------------------
hearingId           15cee00b-bc1d-4639-b872-3e3bd095ed7f
questionId          2fffb323-e807-48d0-ba59-5e5246fa28dd
questionHeader      How do you interact with people?
questionBody        You said you avoid interacting with people if possible. We'd like to know more about the times when you see friends and family.
Tell us about three separate occasions in 2017 that you have met with friends and family.
Tell us:
- who you met
- when
- where
- how it made you feel
deadlineExpiryDate  2018-09-14T23:59:59Z
------------------------------------------------------------
```

If you visit https://sscs-cor-frontend-aat.service.core-compute-aat.internal/login and enter the email address shown you should be able to use the service.

If you need to run against different environments, you can set the following environment variables:

* HTTP_PROXY - to configure the tests to use the HMCTS proxy
* SSCS_API_URL = this is used for the tests to bootstrap an appeal with online panel in CCD e.g. http://sscs-cor-backend-aat.service.core-compute-aat.internal for AAT
* COH_URL - this is used for the tests to bootstrap some data using the COR COH API e.g. http://coh-cor-aat.service.core-compute-aat.internal for AAT

And use the command
```bash
HTTP_PROXY=http://proxyout.reform.hmcts.net:8080 SSCS_API_URL=http://sscs-cor-backend-aat.service.core-compute-aat.internal COH_URL=http://coh-cor-aat.service.core-compute-aat.internal yarn test:create-data
```

