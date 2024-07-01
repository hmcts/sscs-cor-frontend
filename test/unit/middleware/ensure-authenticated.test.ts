import * as Paths from 'app/server/paths';
import { CaseDetails } from 'app/server/models/express-session';

import { expect, sinon } from 'test/chai-sinon';
import {
  checkAccessToken,
  ensureAuthenticated,
  setLocals,
} from 'app/server/middleware/ensure-authenticated';

describe('middleware/ensure-authenticated', function () {
  let req;
  let res;
  let next;
  const caseDetails: CaseDetails = {
    online_hearing_id: '1',
    case_reference: '12345',
    appellant_name: 'John Smith',
  };

  beforeEach(function () {
    req = {
      session: {
        accessToken: 'xxxxxxxxxxxxx',
        id: '123',
        case: caseDetails,
        appeal: {
          hearingType: 'oral',
        },
        destroy: sinon.stub().yields(),
      },
      cookie: {},
    };
    res = {
      redirect: sinon.spy(),
      locals: {},
    };
    next = sinon.spy();
  });

  describe('#checkAccessToken', function () {
    it('calls next when accessToken exists in the session', function () {
      checkAccessToken(req, res, next);
      expect(next).to.have.been.calledOnce.calledWith();
    });

    describe('when noaccessToken exists', function () {
      beforeEach(function () {
        delete req.session.accessToken;
        checkAccessToken(req, res, next);
      });

      it('destroys the session and redirects to login', function () {
        expect(req.session.destroy).to.have.been.calledOnce.calledWith();
        expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.login);
      });

      it('does not call next', function () {
        return expect(next).to.not.have.been.called;
      });
    });
  });

  describe('#setLocals', function () {
    it('sets hearing data on the locals', function () {
      req.session.appeal = undefined;
      setLocals(req, res, next);
      expect(res.locals).to.have.property('case');
      expect(res.locals).to.not.have.property('tabs');
      expect(res.locals.case).to.deep.equal(caseDetails);
    });
    it('also sets tabs data on the locals', function () {
      req.cookies = {
        hearingOutcomeTab: 'true',
        requestTabEnabled: 'true',
      };
      req.session.appeal = {
        hearingType: 'oral',
        hearingOutcome: [],
      };

      setLocals(req, res, next);
      expect(res.locals).to.have.property('tabs');
      const members = [];
      res.locals.tabs.forEach((t) => {
        members.push(t.id);
      });
      expect(members).to.have.members([
        'status',
        'hearing',
        'outcome',
        'avEvidence',
        'requestType',
      ]);
    });
    it('also remove outcome tab if hearingOutcome not present', function () {
      req.cookies = {};
      req.session.appeal = {
        hearingType: 'oral',
      };

      setLocals(req, res, next);
      expect(res.locals).to.have.property('tabs');
      const members = [];
      res.locals.tabs.forEach((t) => {
        members.push(t.id);
      });
      expect(members).to.have.members([
        'status',
        'hearing',
        'avEvidence',
        'requestType',
      ]);
    });
    it('sets signedIn on the locals', function () {
      setLocals(req, res, next);
      expect(res.locals).to.have.property('signedIn', true);
    });
  });

  describe('#ensureAuthenicated', function () {
    it('is an array of middleware functions', function () {
      expect(ensureAuthenticated).to.be.an('array');
      /* eslint-disable-next-line no-magic-numbers */
      expect(ensureAuthenticated).to.have.lengthOf(2);
    });
  });
});
