const { expect, sinon } = require('test/chai-sinon');
const { verifyOnlineHearingId, setLocals, ensureAuthenticated } = require('app/server/middleware/ensure-authenticated.ts');
import { Paths } from 'app/server/paths';

describe('middleware/ensure-authenticated', () => {
  let req;
  let res;
  let next;
  const hearingDetails = {
    online_hearing_id: '1',
    case_reference: 'SC/123/456',
    appellant_name: 'John Smith'
  };

  beforeEach(() => {
    req = {
      session: {
        id: '123',
        hearing: hearingDetails,
        destroy: sinon.stub().yields()
      }
    };
    res = {
      redirect: sinon.spy(),
      locals: {}
    };
    next = sinon.spy();
  });

  describe('#verifyOnlineHearingId', () => {
    it('calls next when hearing ID exists in the session', () => {
      verifyOnlineHearingId(req, res, next);
      expect(next).to.have.been.calledOnce.calledWith();
    });

    describe('when no hearing ID exists', () => {
      beforeEach(() => {
        delete req.session.hearing;
        verifyOnlineHearingId(req, res, next);
      });

      it('destroys the session and redirects to login', () => {
        expect(req.session.destroy).to.have.been.calledOnce.calledWith();
        expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.login);
      });

      it('does not call next', () => (
        expect(next).to.not.have.been.called
      ));
    });
  });

  describe('#setLocals', () => {
    it('sets hearing data on the locals', () => {
      setLocals(req, res, next);
      expect(res.locals).to.deep.equal({ hearing: hearingDetails });
    });
  });

  describe('#ensureAuthenicated', () => {
    it('is an array of middleware functions', () => {
      expect(ensureAuthenticated).to.be.an('array');
      /* eslint-disable-next-line no-magic-numbers */
      expect(ensureAuthenticated).to.have.lengthOf(2);
    });
  });
});

export {};