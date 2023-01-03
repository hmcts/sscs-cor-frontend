import { Logger } from '@hmcts/nodejs-logging';
import { Request, Response, Router } from 'express';
import * as Paths from '../paths';
import { TrackYourApealService } from '../services/tyaService';
import * as AppInsights from '../app-insights';
import { Dependencies } from '../routes';
import { addUserToCase } from '../services/citizenCaseApi';
import { Response as fetchResponse } from 'node-fetch';
import { LoggerInstance } from 'winston';

import i18next from 'i18next';
import content from '../../common/locale/content.json';
import { Appeal, CaseDetails } from '../models/express-session';

const postcodeRegex = /^([A-Z][A-HJ-Y]?\d[A-Z\d]?\s?\d[A-Z]{2}|GIR ?0A{2})$/gi;

const logger: LoggerInstance = Logger.getLogger('login.js');

function getIndex(req: Request, res: Response) {
  return res.render('assign-case/index.njk', {});
}

function postIndex(
  trackYourAppealService: TrackYourApealService
): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response) => {
    const postcode = req.body.postcode as string;
    const tya = req.session.tya;
    const email = req.session.idamEmail;
    const language = i18next.language;
    if (!postcode || !postcode.trim()) {
      logger.error(
        `No postcode for postcode: ${postcode}, TYA: ${tya} and email:${email}`
      );
      return res.render('assign-case/index.njk', {
        error: content[language].assignCase.errors.noPostcode,
      });
    } else if (!postcode.replace(/\s/g, '').match(postcodeRegex)) {
      logger.error(
        `Invalid for postcode: ${postcode}, TYA: ${tya} and email:${email}`
      );
      return res.render('assign-case/index.njk', {
        error: content[language].assignCase.errors.invalidPostcode,
      });
    }
    if (!tya) {
      logger.error(
        `tyaNotProvided postcode: ${postcode}, TYA: ${tya} and email:${email}`
      );
      return res.render('assign-case/index.njk', {
        error: content[language].assignCase.errors.tyaNotProvided,
      });
    }
    AppInsights.trackTrace(
      `assign-case: Finding case to assign for tya [${tya}] email [${email}] postcode [${postcode}]`
    );

    const response: fetchResponse = await addUserToCase(req);

    if (!response.ok) {
      logger.error(
        `Not matching record for: ${postcode}, TYA: ${tya} and email:${email}. StatusCode ${response.status}, error:`,
        response.statusText
      );
      AppInsights.trackTrace(
        `assign-case: Failed finding case to assign for tya [${tya}] email [${email}] postcode [${postcode}]`
      );
      return res.render('assign-case/index.njk', {
        error: content[language].assignCase.errors.postcodeDoesNotMatch,
      });
    }

    req.session.case = (await response.json()) as CaseDetails;

    logger.info(`Assigned ${tya} to ${email}`);

    const { appeal }: { appeal: Appeal } =
      await trackYourAppealService.getAppeal(req.session.case.case_id, req);

    req.session.appeal = appeal;
    req.session.case.case_reference = req.session.case.case_id
      ? req.session.case.case_id.toString()
      : '';
    return res.redirect(Paths.status);
  };
}

function setupAssignCaseController(deps: Dependencies) {
  const router = Router();
  router.get(Paths.assignCase, deps.prereqMiddleware, getIndex);
  router.post(
    Paths.assignCase,
    deps.prereqMiddleware,
    postIndex(deps.trackYourApealService)
  );

  return router;
}

export { setupAssignCaseController, getIndex, postIndex };
