import * as AppInsights from '../app-insights';
import * as moment from 'moment';
import { Router, Request, Response, NextFunction } from 'express';
import * as Paths from '../paths';
import { AdditionalEvidenceService } from '../services/additional-evidence';
import { QuestionService } from '../services/question';
import { isFeatureEnabled, Feature } from '../utils/featureEnabled';

function processDeadline(expiryDate: string, allQuestionsSubmitted: boolean) {
  if (allQuestionsSubmitted) return { status: 'completed', expiryDate: null, extendable: false };

  const endOfToday = moment.utc().endOf('day');
  const status = moment.utc(expiryDate).isBefore(endOfToday) ? 'expired' : 'pending';

  return { status, expiryDate, extendable: true };
}

const getSubmittedQuestionCount = (questions: any) => questions.filter((q: any) => q.answer_state === 'submitted').length;

function getTaskList(questionService: QuestionService) {
  return async(req: Request, res: Response, next: NextFunction) => {
    const hearing = req.session.hearing;
    try {
      const response = await questionService.getAllQuestions(hearing.online_hearing_id, req);

      req.session.hearing.deadline = response.deadline_expiry_date;
      req.session.questions = response.questions ? response.questions : [];
      req.session.hearing.extensionCount = response.deadline_extension_count;

      const totalQuestionCount = req.session.questions.length;
      let deadlineDetails = null;
      if (totalQuestionCount !== 0) {
        const allQuestionsSubmitted = totalQuestionCount === getSubmittedQuestionCount(req.session.questions);
        deadlineDetails = processDeadline(response.deadline_expiry_date, allQuestionsSubmitted);
      }
      res.render('task-list.html', {
        deadlineExpiryDate: deadlineDetails,
        questions: req.session.questions,
        enableAdditionalEvidence: isFeatureEnabled(Feature.ADDITIONAL_EVIDENCE_FEATURE, req.cookies)
      });
    } catch (error) {
      AppInsights.trackException(error);
      next(error);
    }
  };
}

function getEvidencePost(req: Request, res: Response, next: NextFunction) {
  try {
    if (!isFeatureEnabled(Feature.ADDITIONAL_EVIDENCE_FEATURE, req.cookies)) {
      res.render('post-evidence.html');
    } else {
      res.render('errors/404.html');
    }
  } catch (error) {
    AppInsights.trackException(error);
    next(error);
  }
}

function getCoversheet(additionalEvidenceService: AdditionalEvidenceService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isFeatureEnabled(Feature.ADDITIONAL_EVIDENCE_FEATURE, req.cookies)) {
        // tslint:disable-next-line
        console.log('Coversheet IS available');
        const hearingId = req.session.hearing.online_hearing_id;
        const coversheet = await additionalEvidenceService.getCoversheet(hearingId, req);
        res.header('content-type', 'application/pdf');
        res.send(coversheet);
      } else {
        // tslint:disable-next-line
        console.log('Coversheet not available');
        res.render('errors/404.html');
      }
    } catch (error) {
      AppInsights.trackException(error);
      next(error);
    }
  };
}

function setupTaskListController(deps: any): Router {
  const router: Router = Router();
  router.get(Paths.taskList, deps.prereqMiddleware, getTaskList(deps.questionService));
  router.get(Paths.postEvidence, deps.prereqMiddleware, getEvidencePost);
  router.get(Paths.coversheet, deps.prereqMiddleware, getCoversheet(deps.additionalEvidenceService));
  return router;
}

export {
  setupTaskListController,
  getCoversheet,
  getEvidencePost,
  getTaskList,
  processDeadline
};
