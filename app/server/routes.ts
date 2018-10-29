const express = require('express');
import * as Paths from './paths';
import * as config from 'config';
import { ensureAuthenticated } from './middleware/ensure-authenticated';
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

const router = express.Router();

import { QuestionService } from './services/question';
import { HearingService } from './services/hearing';
import { saveAnswer as saveAnswerService, submitAnswer as submitAnswerService } from './services/updateAnswer';
import { IdamService } from './services/idam';
import { EvidenceService } from './services/evidence';

const apiUrl: string = config.get('api.url');
const idamApiUrl: string = config.get('idam.api-url');
const appPort: string = config.get('node.port');
const appSecret: string = config.get('idam.client.secret');
const httpProxy: string = config.get('httpProxy');

const evidenceService: EvidenceService = new EvidenceService(apiUrl);
const idamService: IdamService = new IdamService(idamApiUrl, appPort, appSecret, httpProxy);
const hearingService: HearingService = new HearingService(apiUrl);
const questionService: QuestionService = new QuestionService(apiUrl);

const prereqMiddleware = [ensureAuthenticated, checkDecision];

const questionController = setupQuestionController({
  questionService,
  saveAnswerService,
  evidenceService,
  prereqMiddleware
});
const submitQuestionController = setupSubmitQuestionController({ submitAnswerService, questionService, evidenceService, prereqMiddleware });
const questionsCompletedController = setupQuestionsCompletedController({ prereqMiddleware });
const taskListController = setupTaskListController({ questionService, prereqMiddleware });
const extendDeadlineController = setupExtendDeadlineController({ prereqMiddleware, hearingService });
const decisionController = setupDecisionController({ prereqMiddleware: ensureAuthenticated });
const tribunalViewController = setupTribunalViewController({ prereqMiddleware: ensureAuthenticated, hearingService });
const tribunalViewAcceptedController = setupTribunalViewAcceptedController({ prereqMiddleware: ensureAuthenticated });
const hearingController = setupHearingConfirmController({ prereqMiddleware: ensureAuthenticated });
const hearingWhyController = setupHearingWhyController({ prereqMiddleware: ensureAuthenticated, hearingService });
const loginController = setupLoginController({ hearingService, idamService });

router.use(loginController);
router.use(submitQuestionController);
router.use(questionsCompletedController);
router.use(Paths.question, questionController);
router.use(taskListController);
router.use(extendDeadlineController);
router.use(decisionController);
router.use(tribunalViewController);
router.use(tribunalViewAcceptedController);
router.use(hearingController);
router.use(hearingWhyController);
router.get('/', redirectToLogin);

export { router };
