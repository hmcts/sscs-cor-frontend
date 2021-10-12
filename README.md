# SSCS - ~~Continuous Online Resolution~~ Manage Your Appeal

This application is the public facing service for Manage Your Appeal (MYA).

MYA was adapted from the Continuous Online Resolution (COR) service. There are still many configuration references to
COR and SSCS-COR  as to change these to MYA would require building it as a new service and migrating over which is non-trivial engineering effort for low benefit.

It relies upon the SSCS Tribunal api backend service (https://github.com/hmcts/sscs-tribunals-case-api)

## Running

##### Prereqs

* node.js v8 or higher
* yarn
* redis running on the standard port (6379)

```bash
redis-server
```

Once you have those, you need to install the dependencies using:

```bash
yarn install
```

Then run the necessary build tasks using:

```bash
yarn build
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

### Pa11y Accessibility Tests

The pa11y tests are a subset of the browser tests, simply tagged @pa11y.  

```bash
yarn test:a11y
```

These tests generate screenshots of all pages tested and can be found in ```./functional-output/pa11y-screenshots```

On Jenkins, when viewing a build, the screenshots are available as Build Artifacts.

### Functional Tests

The same browser test suite is used for running locally and when running against the `preview` and `AAT` environments via the `yarn test:functional` script.

##### Local environments

Points to note when running the tests against your local environment:

* backend API is stubbed using Dyson
* the stubbed service has a basic way of storing state, such as answers to questions etc
* the "state" will be reset when the stub is restarted

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

* SSCS_API_URL = this is used for the tests to bootstrap an appeal with online panel in CCD e.g. http://sscs-tribunals-api-aat.service.core-compute-aat.internal for AAT
* COH_URL - this is used for the tests to bootstrap some data using the COR COH API e.g. http://coh-cor-aat.service.core-compute-aat.internal for AAT
* TEST_URL - this is the URL you are testing e.g. https://sscs-cor-frontend-aat-staging.service.core-compute-aat.internal for AAT staging slot
* HEADLESS - optionally choose to show the browser by setting this to false
* IDAM_URL - Used to check the user returns to idam when logged out (currently https://sscs-cor-frontend-aat-staging.service.core-compute-aat.internal/idam-stub when using stub)
* IDAM_API_URL - Used to create a user in idam that can login to the system (not currently used with idam stub)
* S2S_SECRET - used to provide auth for connecting to backend services
* S2S_URL - the service-2-service application for generating access tokens
* IDAM_SSCS_SYSTEMUPDATE_USER - The user to to get s2s token
* IDAM_SSCS_SYSTEMUPDATE_PASSWORD - Password for the user
* IDAM_OAUTH2_CLIENT_SECRET - Client secret to get auth token
* S2S_OAUTH2_URL - Url to get token and auth_token from

Put these together with the required `yarn` command in one line like this:

```bash
HEADLESS=false SSCS_API_URL=http://sscs-tribunals-api-aat.service.core-compute-aat.internal COH_URL=http://coh-cor-aat.service.core-compute-aat.internal TEST_URL=https://sscs-cor-frontend-aat-staging.service.core-compute-aat.internal IDAM_URL=https://sscs-cor-frontend-aat-staging.service.core-compute-aat.internal/idam-stub S2S_SECRET=XXXXXXXXXXXXX S2S_URL=http://rpe-service-auth-provider-aat.service.core-compute-aat.internal IDAM_SSCS_SYSTEMUPDATE_USER=sscs-system-update@hmcts.net IDAM_SSCS_SYSTEMUPDATE_PASSWORD=XXXXXXXXXXX IDAM_OAUTH2_CLIENT_SECRET=XXXXXXXXXXX S2S_OAUTH2_URL=https://idam-api.aat.platform.hmcts.net yarn test:functional
```

Note: see [SIDAM](#sidam) section for more info on SIDAM and stubs.

### Running app locally via terminal
Open a terminal, go to the sscs-cor-frontend directory. 

Run redis in a terminal

```bash
redis-server
```

Open another terminal. Set env vars in the terminal

```
export SSCS_API_URL=http://localhost:8080
export COH_URL=http://coh-cor-aat.service.core-compute-aat.internal
export S2S_SECRET=AAAAAAAAAAAAAAAC
export S2S_URL=http://localhost:4502
export IDAM_API_URL=http://localhost:5000
export IDAM_URL=http://localhost:3501
export HTTP_PROTOCOL=http
export TRIBUNALS_API_URL=http://localhost:8080
export IDAM_CLIENT_SECRET=QM5RQQ53LZFOSIXJ
export NODE_ENV=preview
export MYA_FEATURE_FLAG=true
export EVIDENCE_UPLOAD_QUESTION_PAGE_OVERRIDE_ALLOWED=true
export EVIDENCE_UPLOAD_QUESTION_PAGE_ENABLED=false
export ADDITIONAL_EVIDENCE_FEATURE_FLAG=true
export POST_BULK_SCAN=true
```
then do
```
yarn build
yarn start
```
and go to http://localhost:3000

In order to log in as a citizen and be able to see your appeal you might need to use the link below:
http://localhost:3000/sign-in?tya=[subscriptionCode]

If you are using the idam simulator check the sscs-docker README for some config changes

### Creating test data in AAT

You can easily create a benefit appeal in CCD with online panel and associate it with an online hearing. The hearing will have three questions and the question round will be issued.

Since this script directly accesses services such as CCD and COH, which are protected by service-2-service auth, you must specify the secret in order to connect.

This can be done locally by using a yarn command with a required environment variable

```bash
S2S_SECRET=44******* IDAM_SSCS_SYSTEMUPDATE_USER=sscs-system-update@hmcts.net IDAM_SSCS_SYSTEMUPDATE_PASSWORD=Bb******** IDAM_OAUTH2_CLIENT_SECRET=3\******** yarn test:create-data-aat
```

The command will output something like this:

```
Created CCD case for test5631931@hmcts.net with ID 1541757922252787 and reference SC285/17/1523910000
Created online hearing with ID 4bc401a3-0fe8-4be3-821b-fe1d84be8a9e
Created question with ID 43b96298-c797-43a0-9d46-2b5807a4e0c6
Created question with ID 77ce837b-eb99-4a95-bf4e-19c9b7012d17
Created question with ID c1917163-18aa-4d93-8a7b-f83e11cb69ea
Question round issued, status pending
Question round not issued at attempt 1: question_issue_pending
Question round not issued at attempt 2: question_issue_pending
Question round issued successfully at attempt 3

------------------------- CCD case -------------------------

email               test5631931@hmcts.net
caseId              1541757922252787
caseReference       SC285/17/1523910000

---------------------- COH test data -----------------------

hearingId           4bc401a3-0fe8-4be3-821b-fe1d84be8a9e
questionIdList      43b96298-c797-43a0-9d46-2b5807a4e0c6,77ce837b-eb99-4a95-bf4e-19c9b7012d17,c1917163-18aa-4d93-8a7b-f83e11cb69ea
questionId          43b96298-c797-43a0-9d46-2b5807a4e0c6
questionOrdinal     1
questionHeader      How do you interact with people?
questionBody        You said you avoid interacting with people if possible. We'd like to know more about the times when you see friends and family.

Tell us about three separate occasions in 2017 that you have met with friends and family.

Tell us:

- who you met

- when

- where

- how it made you feel
deadlineExpiryDate  2018-11-16T23:59:59Z

------------------------------------------------------------
```

If you visit https://sscs-cor-frontend-aat.service.core-compute-aat.internal/ and enter the email address shown you should be able to use the service.

If you need to run against different environments, you can set the following environment variables:

* SSCS_API_URL = this is used for the tests to bootstrap an appeal with online panel in CCD e.g. http://sscs-tribunals-api-aat.service.core-compute-aat.internal for AAT
* COH_URL - this is used for the tests to bootstrap some data using the COR COH API e.g. http://coh-cor-aat.service.core-compute-aat.internal for AAT
* S2S_SECRET - used to provide auth for connecting to backend services
* S2S_URL - the service-2-service application for generating access tokens
* IDAM_API_URL - Used to create a user in idam that can login to the system

And use the command:

```bash
SSCS_API_URL=http://sscs-tribunals-api-aat.service.core-compute-aat.internal COH_URL=http://coh-cor-aat.service.core-compute-aat.internal IDAM_API_URL=https://idam-api.aat.platform.hmcts.net S2S_URL=http://rpe-service-auth-provider-aat.service.core-compute-aat.internal S2S_SECRET=XXXXXXXXXXXXX yarn test:create-data
```

If you then want to make calls directly to COH to change the state of an online hearing you will need the S2S headers
these can be generated with

```bash
yarn test:create-s2s-headers
```

You will need the same environment variables used when creating test data.

If you wish to also issue a decision then add the environment variable ISSUE_DECISION=true. NB it does not matter the value of the variable just that it exists to issue the decision.

### Analytics

Analytics are tracking using Google Tag Manager (GTM) and Google Analytics (GA), all managed under the SSCS account.

* one GTM code is used across all environments and Tag Manager is configured to track page view events using different GA settings per environment
* page views with AAT type hostnames eg. sscs-cor-frontend-aat-staging.service.core-compute-aat.internal are sent to one GA account
* page views with PROD hostnames are sent to another
* prod hostnames are configured but will need amending when domains have been decided

### Feature flags

Feature flags are used to show or hide certain features.

* they are defined in the JSON config files within the `config` directory
* specify an environment variable which can be used to override the setting in `config/custom-environment-variables`
* these env vars are then configured using terraform, set the variable to the desired value in the `[env].tfvars` representing the desired environment
* this is then set on the app in via the `app_settings` in `main.tf`

**Current feature flags**

| Name                     | Config path                           | Environment variable                    | Notes |
|--------------------------|---------------------------------------|-----------------------------------------|-------|
| Question evidence upload | `evidenceUpload.questionPage.enabled` | `EVIDENCE_UPLOAD_QUESTION_PAGE_ENABLED` | Enables evidence upload on the question page |

**Overrides for testing**

It's possible to override a setting and temporarily enable a feature for testing purposes, includeing automated and manual tests. This is done by setting a different property in the config to allow the override to happen, then also setting a cookie on the client. Both must be present for the feature to be enabled.

| Feature name             | Override config path                          | Override environment variable                    | Override cookie               |
|--------------------------|-----------------------------------------------|--------------------------------------------------|-------------------------------|
| Question evidence upload | `evidenceUpload.questionPage.overrideAllowed` | `EVIDENCE_UPLOAD_QUESTION_PAGE_OVERRIDE_ALLOWED` | `evidenceUploadOverride=true` |

### SIDAM

We had previously integrated with SIDAM for user registration and sign-in. This included making use of the testing features, such as creating test accounts to allow sign-in to COR.
At the time of writing SIDAM is not available to use on AAT and therefore we were forced to bypass it in order to continue developing and testing this service.
To do this we added a stub to the running service, enabled via the config option "idam.enableStub", and configured the service to use that instead of the usual SIDAM URLs for the API and web interfaces.
The SIDAM stub makes use of redis to track the username associated with code/token throughout the sign-in process.

This means that 2 SIDAM stubs currently exist, as follows:

_Dyson SIDAM stub_
* found under `test/mock/idam`
* uses `memory-cache` module to keep track of username associated with code/token
* used when running functional tests locally and on the pipeline "Test" stage (note: not "Functional Test")

_Application mounted SIDAM stub_
* found at `app/server/controller/idam-stub.ts`
* uses Redis to keep track of username associated with code/token
* used when running functional tests as part of the "Functional Test" stages on the pipeline
* also used when signing into the service on preview or AAT environments
