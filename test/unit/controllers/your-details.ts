const express = require('express');
const { expect, sinon } = require('test/chai-sinon');
import * as yourDetails from 'app/server/controllers/your-details';
import * as Paths from 'app/server/paths';

describe('controllers/your-details', () => {
  let req: any;
  let res: any;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    req = {
      session: {
        appeal: {},
        hearing: {
          appellant_details: {}
        }
      },
      cookies: {}
    } as any;

    res = {
      render: sandbox.stub(),
      send: sandbox.stub()
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupYourDetailsController', () => {
    let getStub;
    beforeEach(() => {
      getStub = sandbox.stub(express.Router, 'get');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call Router', () => {
      yourDetails.setupYourDetailsController({});
      expect(getStub).to.have.been.calledWith(Paths.yourDetails);
    });
  });

  describe('getYourDetails', () => {
    it('should render 404 page when mya feature not enabled', async() => {
      yourDetails.getYourDetails(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('errors/404.html');
    });

    it('should render your details page when mya feature enabled', async() => {
      req.cookies.manageYourAppeal = 'true';
      yourDetails.getYourDetails(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('your-details.html');
    });
  });
});
