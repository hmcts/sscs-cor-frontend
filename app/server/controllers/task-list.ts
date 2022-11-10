import * as AppInsights from '../app-insights';
import * as moment from 'moment';
import { Router, Request, Response, NextFunction } from 'express';
import * as Paths from '../paths';
import { AdditionalEvidenceService } from '../services/additional-evidence';
import { isFeatureEnabled, Feature } from '../utils/featureEnabled';

function processDeadline(expiryDate: string, allQuestionsSubmitted: boolean) {
  if (allQuestionsSubmitted)
    return { status: 'completed', expiryDate: null, extendable: false };

  const endOfToday = moment.utc().endOf('day');
  const status = moment.utc(expiryDate).isBefore(endOfToday)
    ? 'expired'
    : 'pending';

  return { status, expiryDate, extendable: true };
}

function getTaskList(req: Request, res: Response, next: NextFunction) {
  try {
    const deadlineDetails = null;
    const hearingType = req.session['appeal']!.hearingType;
    const appeal = req.session['appeal']!;
    res.render('task-list.njk', {
      deadlineExpiryDate: deadlineDetails,
      hearingType,
      appeal,
    });
  } catch (error) {
    AppInsights.trackException(error);
    next(error);
  }
}

function getEvidencePost(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('post-evidence.njk', {
      postBulkScan: isFeatureEnabled(Feature.POST_BULK_SCAN, req.cookies),
    });
  } catch (error) {
    AppInsights.trackException(error);
    next(error);
  }
}

function getCoversheet(additionalEvidenceService: AdditionalEvidenceService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = req.session;

      if (!session) {
        const missingCaseIdError = new Error('Unable to retrieve session');
        AppInsights.trackException(missingCaseIdError);
        AppInsights.trackEvent('MYA_SESSION_READ_FAIL');
      }

      const coversheet = await additionalEvidenceService.getCoversheet(
        session['hearing'].case_id,
        req
      );
      res.header('content-type', 'application/pdf');
      res.send(Buffer.from(coversheet, 'binary'));
    } catch (error) {
      AppInsights.trackException(error);
      next(error);
    }
  };
}

function setupTaskListController(deps: any): Router {
  const router: Router = Router();
  router.get(Paths.taskList, deps.prereqMiddleware, getTaskList);
  router.get(Paths.postEvidence, deps.prereqMiddleware, getEvidencePost);
  router.get(
    Paths.coversheet,
    deps.prereqMiddleware,
    getCoversheet(deps.additionalEvidenceService)
  );
  return router;
}

export {
  setupTaskListController,
  getCoversheet,
  getEvidencePost,
  getTaskList,
  processDeadline,
};
