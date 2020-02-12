const express = require('express');
import * as Paths from './paths';
import * as config from 'config';
import { ensureAuthenticated, setLocals } from './middleware/ensure-authenticated';
import { checkDecision } from './middleware/check-decision';

import { setupQuestionController } from './controllers/question';
import { setupSubmitQuestionController } from './controllers/submit-question';
import { setupQuestionsCompletedController } from './controllers/questions-completed';
import { setupTaskListController } from './controllers/task-list';
import { setupLoginController, redirectToLogin } from './controllers/login';
import { setupExtendDeadlineController } from './controllers/extend-deadline';
import { setupDecisionController } from './controllers/decision';
import { setupTribunalViewController } from './controllers/tribunal-view';
import { setupHearingConfirmController } from './controllers/hearing-confirm';
import { setupHearingWhyController } from './controllers/hearing-why';
import { setupTribunalViewAcceptedController } from './controllers/tribunal-view-accepted';
import { setupTribunalViewConfirmController } from './controllers/tribunal-view-confirm';
import { setupIdamStubController } from './controllers/idam-stub';
import { setupCookiePrivacyController } from './controllers/policies';
import { supportControllers } from './controllers/support';
import { setupSessionController } from './controllers/session';
import { setupadditionalEvidenceController } from './controllers/additional-evidence';
import { setupYourDetailsController } from './controllers/your-details';
import { setupStatusController } from './controllers/status';
import { setupHistoryController } from './controllers/history';
import { setupAssignCaseController } from './controllers/assign-case';
import { setupHearingController } from './controllers/hearing';

const router = express.Router();

import { QuestionService } from './services/question';
import { HearingService } from './services/hearing';
import { IdamService } from './services/idam';
import { EvidenceService } from './services/evidence';
import { AdditionalEvidenceService } from './services/additional-evidence';
import { TrackYourApealService } from './services/tyaService';

const apiUrl: string = config.get('api.url');
const idamApiUrl: string = config.get('idam.api-url');
const tribunalsApiUrl: string = config.get('tribunals.api-url');
const appPort: string = config.get('node.port');
const appUser: string = config.get('idam.client.id');
const appSecret: string = config.get('idam.client.secret');
const httpProxy: string = config.get('httpProxy');

const evidenceService: EvidenceService = new EvidenceService(apiUrl);
const idamService: IdamService = new IdamService(idamApiUrl, appPort, appSecret);
const hearingService: HearingService = new HearingService(apiUrl);
const questionService: QuestionService = new QuestionService(apiUrl);
const additionalEvidenceService: AdditionalEvidenceService = new AdditionalEvidenceService(apiUrl);
const trackYourAppealService: TrackYourApealService = new TrackYourApealService(tribunalsApiUrl);
// todo: add here my new timestamLogService

const prereqMiddleware = [ensureAuthenticated, checkDecision];

const questionController = setupQuestionController({ questionService, evidenceService, prereqMiddleware });
const submitQuestionController = setupSubmitQuestionController({ questionService, evidenceService, prereqMiddleware });
const questionsCompletedController = setupQuestionsCompletedController({ prereqMiddleware });
const taskListController = setupTaskListController({ questionService, additionalEvidenceService, prereqMiddleware });
const extendDeadlineController = setupExtendDeadlineController({ prereqMiddleware, hearingService });
const decisionController = setupDecisionController({ prereqMiddleware: ensureAuthenticated });
const tribunalViewConfirmController = setupTribunalViewConfirmController({ prereqMiddleware: ensureAuthenticated, hearingService });
const tribunalViewController = setupTribunalViewController({ prereqMiddleware: ensureAuthenticated, hearingService });
const tribunalViewAcceptedController = setupTribunalViewAcceptedController({ prereqMiddleware: ensureAuthenticated });
const hearingConfirmController = setupHearingConfirmController({ prereqMiddleware: ensureAuthenticated });
const hearingWhyController = setupHearingWhyController({ prereqMiddleware: ensureAuthenticated, hearingService });
const loginController = setupLoginController({ hearingService, idamService, trackYourApealService: trackYourAppealService });
const idamStubController = setupIdamStubController();
const cookiePrivacyController = setupCookiePrivacyController();
const supportEvidenceController = supportControllers.setupSupportEvidenceController({ setLocals });
const supportHearingController = supportControllers.setupSupportHearingController({ setLocals });
const supportHearingExpensesController = supportControllers.setupSupportHearingExpensesController({ setLocals });
const supportRepresentativesController = supportControllers.setupSupportRepresentativesController({ setLocals });
const supportWithdrawAppealController = supportControllers.setupSupportWithdrawAppealController({ setLocals });
const sessionController = setupSessionController({ prereqMiddleware: ensureAuthenticated });
const evidenceOptionsController = setupadditionalEvidenceController({ prereqMiddleware: ensureAuthenticated, additionalEvidenceService });
const statusController = setupStatusController({ prereqMiddleware: ensureAuthenticated });
const yourDetailsController = setupYourDetailsController({ prereqMiddleware: ensureAuthenticated });
const historyController = setupHistoryController({ prereqMiddleware: ensureAuthenticated });
const assignCaseController = setupAssignCaseController({ hearingService, trackYourApealService: trackYourAppealService });
const hearingTabController = setupHearingController({ prereqMiddleware: ensureAuthenticated });

router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate, no-store');
  res.header('Pragma', 'no-cache');
  res.header('Expires', 0);
  next();
});

router.use(idamStubController);
router.use(loginController);
router.use(submitQuestionController);
router.use(questionsCompletedController);
router.use(Paths.question, questionController);
router.use(taskListController);
router.use(extendDeadlineController);
router.use(decisionController);
router.use(tribunalViewController);
router.use(tribunalViewAcceptedController);
router.use(tribunalViewConfirmController);
router.use(hearingConfirmController);
router.use(hearingWhyController);
router.use(cookiePrivacyController);
router.use(supportEvidenceController);
router.use(supportHearingController);
router.use(supportHearingExpensesController);
router.use(supportRepresentativesController);
router.use(supportWithdrawAppealController);
router.use(sessionController);
router.use(evidenceOptionsController);
router.use(statusController);
router.use(yourDetailsController);
router.use(historyController);
router.use(assignCaseController);
router.use(hearingTabController);
router.get('/', redirectToLogin);

router.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /');
});

export { router };
