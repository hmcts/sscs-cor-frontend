import * as config from 'config';

import {
  ensureAuthenticated,
  setLocals,
} from './middleware/ensure-authenticated';

import { setupTaskListController } from './controllers/task-list';
import { setupLoginController, redirectToLogin } from './controllers/login';
import { setupDecisionController } from './controllers/decision';
import { setupIdamStubController } from './controllers/idam-stub';
import { setupCookiePrivacyController } from './controllers/policies';
import { supportControllers } from './controllers/support';
import { setupSessionController } from './controllers/session';
import { setupadditionalEvidenceController } from './controllers/additional-evidence';
import { setupYourDetailsController } from './controllers/your-details';
import { setupStatusController } from './controllers/status';
import { setupActiveCasesController } from './controllers/active-cases';
import { setupDormantCasesController } from './controllers/dormant-cases';
import { setupHistoryController } from './controllers/history';
import { setupAssignCaseController } from './controllers/assign-case';
import { setupHearingController } from './controllers/hearing';
import { setupOutcomeController } from './controllers/outcome';
import { setupAvEvidenceController } from './controllers/av-evidence';
import { setupRequestTypeController } from './controllers/request-type';

import { HearingService } from './services/hearing';
import { IdamService } from './services/idam';
import { EvidenceService } from './services/evidence';
import { AdditionalEvidenceService } from './services/additional-evidence';
import { TrackYourApealService } from './services/tyaService';
import { RequestTypeService } from './services/request-type';
import { NextFunction, Request, Response, Router } from 'express';

const setLanguage = require('./setLanguage');

const router = Router();

const apiUrl: string = config.get('api.url');
const idamApiUrl: string = config.get('idam.api-url');
const tribunalsApiUrl: string = config.get('tribunals.api-url');
const appPort: string = config.get('node.port');
const appUser: string = config.get('idam.client.id');
const appSecret: string = config.get('idam.client.secret');
const { validateToken } = require('./services/tokenService');
const { notificationRedirect } = require('./controllers/notificationRedirect');
const {
  changeEmailAddress,
  stopReceivingEmails,
} = require('./services/unsubscribeService');
const { emailNotifications } = require('./controllers/content');
const { validateEmail } = require('./controllers/validateEmail');

const evidenceService: EvidenceService = new EvidenceService(apiUrl);
const idamService: IdamService = new IdamService(
  idamApiUrl,
  appPort,
  appSecret
);
const hearingService: HearingService = new HearingService(apiUrl);
const additionalEvidenceService: AdditionalEvidenceService =
  new AdditionalEvidenceService(apiUrl);
const trackYourAppealService: TrackYourApealService = new TrackYourApealService(
  tribunalsApiUrl
);
const requestTypeService: RequestTypeService = new RequestTypeService(
  tribunalsApiUrl
);

const prereqMiddleware = [ensureAuthenticated];

const taskListController = setupTaskListController({
  additionalEvidenceService,
  prereqMiddleware,
});
const decisionController = setupDecisionController({
  prereqMiddleware: ensureAuthenticated,
});
const loginController = setupLoginController({
  hearingService,
  idamService,
  trackYourApealService: trackYourAppealService,
});
const idamStubController = setupIdamStubController();
const cookiePrivacyController = setupCookiePrivacyController();
const supportEvidenceController =
  supportControllers.setupSupportEvidenceController({ setLocals });
const supportHearingController =
  supportControllers.setupSupportHearingController({ setLocals });
const supportHearingExpensesController =
  supportControllers.setupSupportHearingExpensesController({ setLocals });
const supportRepresentativesController =
  supportControllers.setupSupportRepresentativesController({ setLocals });
const supportWithdrawAppealController =
  supportControllers.setupSupportWithdrawAppealController({ setLocals });
const sessionController = setupSessionController({
  prereqMiddleware: ensureAuthenticated,
});
const evidenceOptionsController = setupadditionalEvidenceController({
  prereqMiddleware: ensureAuthenticated,
  additionalEvidenceService,
});
const statusController = setupStatusController({
  prereqMiddleware: ensureAuthenticated,
});
const activeCasesController = setupActiveCasesController({
  prereqMiddleware: ensureAuthenticated,
  setLocals,
});
const dormantCasesController = setupDormantCasesController({
  prereqMiddleware: ensureAuthenticated,
  setLocals,
});

const yourDetailsController = setupYourDetailsController({
  prereqMiddleware: ensureAuthenticated,
});
const historyController = setupHistoryController({
  prereqMiddleware: ensureAuthenticated,
});
const assignCaseController = setupAssignCaseController({
  hearingService,
  trackYourApealService: trackYourAppealService,
  prereqMiddleware: ensureAuthenticated,
});
const hearingTabController = setupHearingController({
  prereqMiddleware: ensureAuthenticated,
});
const outcomeController = setupOutcomeController({
  prereqMiddleware: ensureAuthenticated,
  trackYourApealService: trackYourAppealService,
});
const avEvidenceController = setupAvEvidenceController({
  prereqMiddleware: ensureAuthenticated,
  trackYourApealService: trackYourAppealService,
});
const requestTypeController = setupRequestTypeController({
  prereqMiddleware: ensureAuthenticated,
  requestTypeService,
  trackYourApealService: trackYourAppealService,
});

router.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader(
    'Cache-Control',
    'no-cache, max-age=0, must-revalidate, no-store'
  );
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  next();
});

router.use(setLanguage);
router.use(idamStubController);
router.use(loginController);
router.use(taskListController);
router.use(decisionController);
router.use(cookiePrivacyController);
router.use(supportEvidenceController);
router.use(supportHearingController);
router.use(supportHearingExpensesController);
router.use(supportRepresentativesController);
router.use(supportWithdrawAppealController);
router.use(sessionController);
router.use(evidenceOptionsController);
router.use(statusController);
router.use(activeCasesController);
router.use(dormantCasesController);
router.use(yourDetailsController);
router.use(historyController);
router.use(assignCaseController);
router.use(hearingTabController);
router.use(outcomeController);
router.use(avEvidenceController);
router.use(requestTypeController);
router.get('/', redirectToLogin);

router.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /');
});

router.get(
  '/manage-email-notifications/:mactoken',
  validateToken,
  (req: Request, res: Response, next: NextFunction) => {
    res.render('manage-emails.njk', { mactoken: req.params.mactoken });
  }
);

router.post(
  '/manage-email-notifications/:mactoken',
  validateToken,
  notificationRedirect,
  (req: Request, res: Response, next: NextFunction) => {
    // reload page
  }
);

router.get(
  '/manage-email-notifications/:mactoken/stop',
  validateToken,
  emailNotifications,
  (req: Request, res: Response) => {
    res.render('emails-stop.njk', { mactoken: req.params.mactoken });
  }
);

router.get(
  '/manage-email-notifications/:mactoken/stopconfirm',
  validateToken,
  stopReceivingEmails,
  emailNotifications,
  (req: Request, res: Response, next: NextFunction) => {
    res.render('emails-stop-confirmed.njk', {
      data: { appealNumber: res.locals.token.appealId },
      mactoken: req.params.mactoken,
    });
  }
);

router.get(
  '/manage-email-notifications/:mactoken/change',
  validateToken,
  (req: Request, res: Response) => {
    res.render('email-address-change.njk', { mactoken: req.params.mactoken });
  }
);

router.post(
  '/manage-email-notifications/:mactoken/change',
  validateToken,
  validateEmail,
  changeEmailAddress,
  emailNotifications,
  (req: Request, res: Response, next: NextFunction) => {
    res.render('email-address-change-confirmed.njk', {
      data: { email: req.body.email },
      mactoken: req.params.mactoken,
    });
  }
);

router.get(
  '/validate-surname/:tya/trackyourappeal',
  loginController,
  (req: Request, res: Response, next: NextFunction) => {
    res.render('redirect-mya.njk', { tyaNumber: req.query.tya });
  }
);

export { router };
