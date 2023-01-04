import { getIndex, postIndex } from 'app/server/controllers/assign-case';
import { expect, sinon } from '../../../chai-sinon';
import { OK } from 'http-status-codes';
import { TrackYourApealService } from 'app/server/services/tyaService';
import content from 'app/common/locale/content.json';
import { Appeal, CaseDetails } from 'app/server/models/express-session';
import * as citizenCaseApi from 'app/server/services/citizenCaseApi';
import { Response as fetchResponse } from 'node-fetch';
import { SinonStub } from 'sinon';
import { Response, Request } from 'express';
import i18next from 'i18next';

describe('controllers/assign-case.js', function () {
  let req: Request = null;
  let res: Response = null;

  before(function () {
    i18next.language = 'en';
  });

  beforeEach(function () {
    res = {
      render: sinon.spy(),
      redirect: sinon.spy(),
    } as Partial<Response> as Response;
  });

  describe('getIndex', function () {
    it('should render assign-case page', function () {
      req = {
        query: {},
      } as Partial<Request> as Request;

      getIndex(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith(
        'assign-case/index.njk',
        {}
      );
    });
  });

  describe('postIndex', function () {
    const idamEmail = 'someEmail@example.com';
    const tya = 'some-tya-number';
    const caseId = 1234;
    const caseDetails: CaseDetails = {
      case_id: caseId,
    };
    const appeal: Appeal = {
      hearingType: 'paper',
    };
    let trackYourAppealService: TrackYourApealService = null;
    let postIndexInst: (req: Request, res: Response) => Promise<void> = null;
    let stubAddUserToCase: SinonStub = null;

    before(function () {
      stubAddUserToCase = sinon.stub(citizenCaseApi, 'addUserToCase');
    });

    beforeEach(function () {
      trackYourAppealService = {
        getAppeal: sinon.stub().resolves({
          statusCode: OK,
          appeal,
        }),
      } as any;
    });

    after(function () {
      stubAddUserToCase.restore();
    });

    describe('for valid postcode', function () {
      const postcode = 'cm11 1ab';

      beforeEach(function () {
        req = {
          session: { idamEmail, tya },
          body: { postcode },
        } as Partial<Request> as Request;
        stubAddUserToCase.resetHistory();
        postIndexInst = postIndex(trackYourAppealService);
        stubAddUserToCase.resolves({
          status: 200,
          ok: true,
          json: sinon.stub().resolves(caseDetails),
        } as Partial<fetchResponse>);
      });

      it('assigns user to case', async function () {
        await postIndexInst(req, res);

        expect(stubAddUserToCase).to.have.been.calledOnce.calledWith(req);
      });

      it('renders assign-case/index.njk with errors if response not ok', async function () {
        stubAddUserToCase.resolves({
          status: 404,
          ok: false,
        } as Partial<fetchResponse>);

        await postIndexInst(req, res);

        expect(stubAddUserToCase).to.have.been.calledOnce.calledWith(req);
        expect(res.render).to.have.been.calledOnce.calledWith(
          'assign-case/index.njk',
          { error: content.en.assignCase.errors.postcodeDoesNotMatch }
        );
      });

      it('gets appeal', async function () {
        await postIndexInst(req, res);

        expect(
          trackYourAppealService.getAppeal
        ).to.have.been.calledOnce.calledWith(caseId, req);
      });

      it('redirects to task-list', async function () {
        await postIndexInst(req, res);

        expect(res.redirect).to.have.been.calledOnce.calledWith('/status');
      });

      it('sets hearing in session', async function () {
        await postIndexInst(req, res);

        expect(req.session.case).to.be.eql(caseDetails);
      });

      it('sets appeal in session', async function () {
        await postIndexInst(req, res);

        expect(req.session.appeal).to.be.eql(appeal);
      });
    });

    describe('for missing postcode and hideHearing true', function () {
      const postcode = 'cm11 1ab';

      beforeEach(function () {
        trackYourAppealService = {
          getAppeal: sinon.stub().resolves({
            statusCode: OK,
            appeal: {
              hearingType: 'paper',
              hideHearing: true,
            },
          }),
        } as any;

        req = {
          session: { idamEmail, tya },
          body: { postcode },
        } as Partial<Request> as Request;

        postIndexInst = postIndex(trackYourAppealService);
      });
    });

    describe('for missing postcode', function () {
      const postcode = '';

      beforeEach(function () {
        req = {
          session: { idamEmail, tya },
          body: { postcode },
        } as Partial<Request> as Request;

        postIndexInst = postIndex(trackYourAppealService);
      });

      it('redirects to task-list', async function () {
        await postIndexInst(req, res);

        expect(res.render).to.have.been.calledOnce.calledWith(
          'assign-case/index.njk',
          { error: content.en.assignCase.errors.noPostcode }
        );
      });
    });

    describe('for invalid postcode', function () {
      const postcode = 'invalid';

      beforeEach(function () {
        req = {
          session: { idamEmail, tya },
          body: { postcode },
        } as Partial<Request> as Request;

        postIndexInst = postIndex(trackYourAppealService);
      });

      it('redirects to task-list', async function () {
        await postIndexInst(req, res);

        expect(res.render).to.have.been.calledOnce.calledWith(
          'assign-case/index.njk',
          { error: content.en.assignCase.errors.invalidPostcode }
        );
      });
    });

    describe('for missing tya', function () {
      const postcode = 'TS1 1ST';

      beforeEach(function () {
        req = {
          session: { idamEmail },
          body: { postcode },
        } as Partial<Request> as Request;

        postIndexInst = postIndex(trackYourAppealService);
      });

      it('redirects to task-list', async function () {
        await postIndexInst(req, res);

        expect(res.render).to.have.been.calledOnce.calledWith(
          'assign-case/index.njk',
          { error: content.en.assignCase.errors.tyaNotProvided }
        );
      });
    });
  });
});
