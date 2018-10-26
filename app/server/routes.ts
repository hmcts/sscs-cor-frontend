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

import { getQuestion as getQuestionService } from './services/getQuestion';
import * as getAllQuestionsService from './services/getAllQuestions';
import { getOnlineHearing } from './services/getOnlineHearing';
import { saveAnswer as saveAnswerService, submitAnswer as submitAnswerService } from './services/updateAnswer';
import { IdamService } from './services/idam';
import * as tribunalViewService from './services/tribunalView';
import { EvidenceService } from './services/evidence';

const apiUrl: string = config.get('api.url');
const idamApiUrl: string = config.get('idam.api-url');
const appPort: string = config.get('node.port');
const appSecret: string = config.get('idam.client.secret');
const httpProxy: string = config.get('httpProxy');

const evidenceService: EvidenceService = new EvidenceService(apiUrl);
const idamService: IdamService = new IdamService(idamApiUrl, appPort, appSecret, httpProxy);

import { extendDeadline as extendDeadlineService } from './services/extend-deadline';
const prereqMiddleware = [ensureAuthenticated, checkDecision];

const questionController = setupQuestionController({
  getAllQuestionsService,
  getQuestionService,
  saveAnswerService,
  evidenceService,
  prereqMiddleware
});
const submitQuestionController = setupSubmitQuestionController({ submitAnswerService, getAllQuestionsService, evidenceService, prereqMiddleware });
const questionsCompletedController = setupQuestionsCompletedController({ prereqMiddleware });
const taskListController = setupTaskListController({ getAllQuestionsService, prereqMiddleware });
const extendDeadlineController = setupExtendDeadlineController({ extendDeadlineService, prereqMiddleware });
const decisionController = setupDecisionController({ prereqMiddleware: ensureAuthenticated });
const tribunalViewController = setupTribunalViewController({ prereqMiddleware: ensureAuthenticated, tribunalViewService });
const tribunalViewAcceptedController = setupTribunalViewAcceptedController({ prereqMiddleware: ensureAuthenticated });
const hearingController = setupHearingConfirmController({ prereqMiddleware: ensureAuthenticated });
const hearingWhyController = setupHearingWhyController({ prereqMiddleware: ensureAuthenticated, tribunalViewService });
const loginController = setupLoginController({ getOnlineHearing, idamService });

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
