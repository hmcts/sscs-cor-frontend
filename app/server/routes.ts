import config from 'config';
import { NextFunction, Request, Response, Router } from 'express';

import {
  ensureAuthenticated,
  setLocals,
} from './middleware/ensure-authenticated';

import { setupTaskListController } from './controllers/task-list';
import { setupLoginController, redirectToLogin } from './controllers/login';
import { setupDecisionController } from './controllers/decision';
import { setupIdamStubController } from './controllers/idam-stub';
import { setupCookiePrivacyController } from './controllers/policies';
import * as supportControllers from './controllers/support';
import { setupSessionController } from './controllers/session';
import { setupAdditionalEvidenceController } from './controllers/additional-evidence';
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
import { setupCasesController } from './controllers/cases';

import { CaseService } from './services/cases';
import { IdamService } from './services/idam';
import { AdditionalEvidenceService } from './services/additional-evidence';
import { TrackYourApealService } from './services/tyaService';
import { setupSetLanguageController } from './middleware/setLanguage';
import { validateToken } from './services/tokenService';
import { notificationRedirect } from './controllers/notificationRedirect';
import { emailNotifications } from './controllers/content';
import {
  changeEmailAddress,
  stopReceivingEmails,
} from './services/unsubscribeService';
import { validateEmail } from './controllers/validateEmail';

export interface Dependencies {
  setLocals?: (req: Request, res: Response, next: NextFunction) => void;
  prereqMiddleware?: ((
    req: Request,
    res: Response,
    next: NextFunction
  ) => void)[];
  additionalEvidenceService?: AdditionalEvidenceService;
  trackYourApealService?: TrackYourApealService;
  caseService?: CaseService;
  idamService?: IdamService;
}

const router = Router();

const apiUrl: string = config.get('tribunals-api.url');
const idamApiUrl: string = config.get('idam.api-url');
const appPort: number = config.get('node.port');
const appUser: string = config.get('idam.client.id');
const appSecret: string = config.get('idam.client.secret');

const idamService: IdamService = new IdamService(
  idamApiUrl,
  appPort,
  appSecret
);
const caseService: CaseService = new CaseService(apiUrl);
const additionalEvidenceService: AdditionalEvidenceService =
  new AdditionalEvidenceService(apiUrl);
const trackYourAppealService: TrackYourApealService = new TrackYourApealService(
  apiUrl
);

const taskListController = setupTaskListController({
  additionalEvidenceService,
  prereqMiddleware: ensureAuthenticated,
});
const decisionController = setupDecisionController({
  prereqMiddleware: ensureAuthenticated,
});
const loginController = setupLoginController({
  caseService,
  idamService,
  trackYourApealService: trackYourAppealService,
});

const setLanguageController = setupSetLanguageController();
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
const evidenceOptionsController = setupAdditionalEvidenceController({
  prereqMiddleware: ensureAuthenticated,
  additionalEvidenceService,
});
const statusController = setupStatusController({
  prereqMiddleware: ensureAuthenticated,
});
const casesController = setupCasesController({
  prereqMiddleware: ensureAuthenticated,
  setLocals,
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
  caseService,
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

router.use(setLanguageController);
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
router.use(casesController);
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
    res.render('notifications/manage-emails.njk', {
      mactoken: req.params.mactoken,
    });
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
    res.render('notifications/emails-stop.njk', {
      mactoken: req.params.mactoken,
    });
  }
);

router.get(
  '/manage-email-notifications/:mactoken/stopconfirm',
  validateToken,
  stopReceivingEmails,
  emailNotifications,
  (req: Request, res: Response, next: NextFunction) => {
    res.render('notifications/emails-stop-confirmed.njk', {
      data: { appealNumber: res.locals.token.appealId },
      mactoken: req.params.mactoken,
    });
  }
);

router.get(
  '/manage-email-notifications/:mactoken/change',
  validateToken,
  (req: Request, res: Response) => {
    res.render('notifications/email-address-change.njk', {
      mactoken: req.params.mactoken,
    });
  }
);

router.post(
  '/manage-email-notifications/:mactoken/change',
  validateToken,
  validateEmail,
  changeEmailAddress,
  emailNotifications,
  (req: Request, res: Response, next: NextFunction) => {
    res.render('notifications/email-address-change-confirmed.njk', {
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
