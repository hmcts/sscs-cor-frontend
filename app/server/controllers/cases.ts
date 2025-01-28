import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import * as AppInsights from '../app-insights';
import { Logger } from '@hmcts/nodejs-logging';
import { getCasesByNameAndRow } from '../utils/fieldValidation';
import { Dependencies } from '../routes';
import { CaseDetails } from 'app/server/models/express-session';
import { StatusCodes } from 'http-status-codes';
import { renderErrorPage } from './login';
import { CaseService } from '../services/cases';
import { IdamService } from '../services/idam';

const logger = Logger.getLogger('cases');

export function isCaseDormant(caseDetails: CaseDetails): boolean {
  const state = caseDetails.appeal_details.state;
  return state === 'dormantAppealState' || state === 'voidState';
}

export function isCaseActive(caseDetails: CaseDetails): boolean {
  return !isCaseDormant(caseDetails);
}

export function getCases(caseService: CaseService, idamService: IdamService) {
  return async (req: Request, res: Response): Promise<void> => {
    const session = req.session;

    if (!session) {
      const missingCaseIdError = new Error(
        'Unable to retrieve session from session store'
      );
      AppInsights.trackException(missingCaseIdError);
      AppInsights.trackEvent('MYA_SESSION_READ_FAIL');
      return;
    }

    if (!session.cases || session.cases.length === 0) {
      const { statusCode, body } = await caseService.getCasesForCitizen(
        session.idamEmail,
        session.tya,
        req
      );

      if (statusCode !== StatusCodes.OK)
        return renderErrorPage(
          session.idamEmail,
          statusCode,
          body,
          idamService,
          req,
          res
        );
      session.cases = body;
    }

    const casesByNameAndRow = getCasesByNameAndRow(session.cases);
    return res.render('cases.njk', { casesByNameAndRow });
  };
}

export function setupCasesController(deps: Dependencies): Router {
  const router = Router();
  router.get(
    Paths.selectCase,
    deps.prereqMiddleware,
    deps.setLocals,
    getCases(deps.caseService, deps.idamService)
  );
  return router;
}
