const { expect, sinon } = require('test/chai-sinon');
const { checkAccessToken, setLocals, ensureAuthenticated } = require('app/server/middleware/ensure-authenticated.ts');
import * as Paths from 'app/server/paths';

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
        accessToken: 'xxxxxxxxxxxxx',
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

  describe('#checkAccessToken', () => {
    it('calls next when accessToken exists in the session', () => {
      checkAccessToken(req, res, next);
      expect(next).to.have.been.calledOnce.calledWith();
    });

    describe('when noaccessToken exists', () => {
      beforeEach(() => {
        delete req.session.accessToken;
        checkAccessToken(req, res, next);
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
      expect(res.locals).to.have.property('hearing');
      expect(res.locals.hearing).to.deep.equal(hearingDetails);
    });
    it('sets showSignOut on the locals', () => {
      setLocals(req, res, next);
      expect(res.locals).to.have.property('showSignOut', true);
    });
  });

  describe('#ensureAuthenicated', () => {
    it('is an array of middleware functions', () => {
      expect(ensureAuthenticated).to.be.an('array');
      /* eslint-disable-next-line no-magic-numbers */
      expect(ensureAuthenticated).to.have.lengthOf(3);
    });
  });
});

export {};
