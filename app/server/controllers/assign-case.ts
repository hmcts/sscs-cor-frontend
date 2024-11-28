import { Logger } from '@hmcts/nodejs-logging';
import { Request, Response, Router } from 'express';
import { CaseService } from '../services/cases';
import * as Paths from '../paths';
import { Response as ApiResponse } from '@cypress/request-promise';
import { StatusCodes } from 'http-status-codes';
import { TrackYourApealService } from '../services/tyaService';
import * as AppInsights from '../app-insights';
import { Dependencies } from '../routes';

import i18next from 'i18next';
import content from '../../common/locale/content.json';

const regex = {
  postcode: /^([A-Z][A-HJ-Y]?\d[A-Z\d]?\s?\d[A-Z]{2}|GIR ?0A{2})$/gi,
  ibcaReference: /^[a-z]\d{2}[a-z]\d{2}$/gi,
};

const logger = Logger.getLogger('login.js');

function getIndex(req: Request, res: Response) {
  return res.render('assign-case/index.njk', {});
}

function postIndex(
  caseService: CaseService,
  trackYourAppealService: TrackYourApealService
) {
  return async (req: Request, res: Response) => {
    const { postcode, ibcaReference } = req.body;
    const { tya, idamEmail } = req.session;
    const isIbcaEnabled = req.app.locals.ibcaEnabled;

    if (isIbcaEnabled && !req.body.appealType) {
      return renderError(
        {
          msg: errorContent('missing', 'appealType'),
          code: 'missing-appealType',
        },
        req,
        res
      );
    }

    let error;
    if (isIbcaEnabled && req.body.appealType === 'ibca') {
      error = validateField(req.body, 'ibcaReference');
    } else {
      error = validateField(req.body, 'postcode');
    }
    if (error) {
      return renderError(error, req, res);
    }

    if (!tya) {
      return renderError(
        { msg: errorContent('missing', 'tya'), code: 'tyaNotProvided' },
        req,
        res
      );
    }

    AppInsights.trackTrace(
      `assign-case: Finding case to assign for tya [${tya}] email [${idamEmail}] postcode [${postcode}]`
    );
    const { statusCode, body }: ApiResponse =
      await caseService.assignOnlineHearingsToCitizen(
        idamEmail,
        tya,
        postcode,
        ibcaReference,
        req
      );

    if (statusCode !== StatusCodes.OK) {
      AppInsights.trackTrace(
        `assign-case: Failed finding case to assign for tya [${tya}] email [${idamEmail}] postcode [${postcode}]`
      );
      logger.error(`StatusCode ${statusCode}, error:`, body);
      const errorField =
        req.body.appealType === 'ibca' ? 'ibcaReference' : 'postcode';
      return renderError(
        {
          msg: errorContent('invalid', errorField),
          code: 'no-matching-record',
        },
        req,
        res
      );
    }

    req.session.case = body;
    logger.info(`Assigned ${tya} to ${idamEmail}`);

    const { appeal } = await trackYourAppealService.getAppeal(
      req.session.case.case_id,
      req
    );
    req.session.appeal = appeal;
    req.session.case.case_reference = req.session.case.case_id
      ? req.session.case.case_id.toString()
      : '';

    return res.redirect(Paths.status);
  };
}

function validateField(reqBody: any, field: string) {
  let errorType;
  if (!reqBody[field] || !reqBody[field].trim()) {
    errorType = 'missing';
  } else if (!reqBody[field].replace(/\s/g, '').match(regex[field])) {
    errorType = 'invalid';
  }
  return errorType
    ? { msg: errorContent(errorType, field), code: `${errorType}-${field}` }
    : false;
}

const errorContent = (errType, field) =>
  content[i18next.language].assignCase.errors[errType][field];

function renderError(error: any, req: any, res: any) {
  logger.error(
    `${error.code} | postcode: ${req.body?.postcode}, TYA: ${req.session?.tya} and email:${req.session?.idamEmail}`
  );
  return res.render('assign-case/index.njk', { error, ...req.body });
}

function setupAssignCaseController(deps: Dependencies) {
  const router = Router();
  router.get(Paths.assignCase, deps.prereqMiddleware, getIndex);
  router.post(
    Paths.assignCase,
    deps.prereqMiddleware,
    postIndex(deps.caseService, deps.trackYourApealService)
  );
  return router;
}

export { setupAssignCaseController, getIndex, postIndex };
