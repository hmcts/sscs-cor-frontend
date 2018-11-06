const { expect, sinon } = require('test/chai-sinon');
const mockData = require('test/mock/cor-backend/services/all-questions').template;
import {
  checkEvidenceUploadFeature,
  getQuestion,
  getUploadEvidence,
  handleFileUploadErrors,
  postAnswer,
  postUploadEvidence,
  setupQuestionController,
  showEvidenceUpload,
  fileTypeInWhitelist
} from 'app/server/controllers/question';
const { INTERNAL_SERVER_ERROR, NOT_FOUND } = require('http-status-codes');
import * as AppInsights from 'app/server/app-insights';
import * as express from 'express';
import * as Paths from 'app/server/paths';
const i18n = require('locale/en');
import * as moment from 'moment';
const multer = require('multer');

describe('controllers/question', () => {
  const next = sinon.stub();
  const req: any = {};
  const res: any = {};
  const questionId = '001';
  const questionOrdinal = '1';
  const questions = mockData.questions({});

  beforeEach(() => {
    req.session = {
      hearing: {
        online_hearing_id: '1',
        case_reference: 'SC/123/456',
        appellant_name: 'John Smith'
      },
      questions,
      question: {}
    };
    req.params = {
      questionOrdinal
    };
    req.body = {};
    req.cookies = {};
    res.render = sinon.stub();
    res.redirect = sinon.stub();
    sinon.stub(AppInsights, 'trackException');
  });

  afterEach(() => {
    (AppInsights.trackException as sinon.SinonStub).restore();
  });

  describe('getQuestion', () => {
    let questionService;
    const question = {
      question_id: questionId,
      question_ordinal: questionOrdinal,
      question_header_text: 'What is the meaning of life?',
      question_body_text: 'Many people ask this question...',
      answer: '',
      answer_state: 'unanswered',
      answer_date: moment.utc().format(),
      evidence: []
    };

    beforeEach(() => {
      questionService = {
        getQuestion: sinon.stub().resolves(question),
        getQuestionIdFromOrdinal: sinon.stub().returns('001')
      };
    });

    it('should call render with the template and question header', async() => {
      await getQuestion(questionService)(req, res, next);
      expect(res.render).to.have.been.calledWith('question/index.html', {
        question: {
          questionId,
          questionOrdinal: '1',
          header: question.question_header_text,
          body: question.question_body_text,
          answer: {
            value: '',
            date: question.answer_date
          },
          answer_state: question.answer_state,
          evidence: []
        },
        showEvidenceUpload: false
      });
    });

    it('should call next and appInsights with the error when there is one', async() => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      questionService.getQuestion.rejects(error);
      await getQuestion(questionService)(req, res, next);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(error);
      expect(next).to.have.been.calledWith(error);
    });

    it('redirects to task list if question id is not found', async() => {
      questionService.getQuestionIdFromOrdinal.returns(undefined);
      await getQuestion(questionService)(req, res, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.taskList);
    });
  });

  describe('postAnswer', () => {
    let questionService;
    let evidenceService;

    beforeEach(() => {
      questionService = {
        getQuestionIdFromOrdinal: sinon.stub().returns('001'),
        saveAnswer: sinon.stub().resolves()
      };
      evidenceService = null;
    });

    afterEach(() => {
      res.redirect.reset();
    });

    it('should call res.redirect when saving an answer and there are no errors', async() => {
      req.body['question-field'] = 'My amazing answer';
      await postAnswer(questionService, evidenceService)(req, res, next);
      expect(res.redirect).to.have.been.calledWith(Paths.taskList);
    });

    it('should call res.redirect when submitting an answer and there are no errors', async() => {
      req.body['question-field'] = 'My amazing answer';
      req.body.submit = 'submit';
      await postAnswer(questionService, evidenceService)(req, res, next);
      expect(res.redirect).to.have.been.calledWith(`${Paths.question}/${questionOrdinal}/submit`);
    });

    it('should call next and appInsights with the error when there is one', async() => {
      req.body['question-field'] = 'My amazing answer';
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      questionService.saveAnswer.rejects(error);
      await postAnswer(questionService, evidenceService)(req, res, next);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(error);
      expect(next).to.have.been.calledWith(error);
    });

    it('should call res.render with the validation error message', async () => {
      req.body['question-field'] = '';
      await postAnswer(questionService, evidenceService)(req, res, next);
      expect(res.render).to.have.been.calledWith('question/index.html', {
        question: {
          answer: {
            value: '',
            error: i18n.question.textareaField.error.empty
          }
        },
        showEvidenceUpload: false
      });
    });

    it.skip('should delete a file', async() => {
      req.body.delete = 'Delete';
      req.body.id = 'uuid';
      // someService = () => Promise.resolve();
      // await postAnswer(someService)(req, res, next);
      // expect(somehthing)
    });

    describe('add-file submit', () => {
      beforeEach(() => {
        req.body['add-file'] = 'Add file';
      });

      it('saves the answer if one exists, then redirects', async () => {
        const answerText = 'My amazing answer';
        req.body['question-field'] = answerText;
        await postAnswer(questionService, evidenceService)(req, res, next);
        expect(questionService.saveAnswer).to.have.been.calledOnce.calledWith('1', questionId, 'draft', answerText);
        expect(res.redirect).to.have.been.calledOnce.calledWith(`${Paths.question}/${questionOrdinal}/upload-evidence`);
      });

      it('does not attempt to save the answer if one does not exist, then redirects', async () => {
        req.body['question-field'] = '';
        await postAnswer(questionService, evidenceService)(req, res, next);
        expect(questionService.saveAnswer).not.to.have.been.called;
        expect(res.redirect).to.have.been.calledOnce.calledWith(`${Paths.question}/${questionOrdinal}/upload-evidence`);
      });
    });
  });

  describe('setupQuestionController', () => {
    const deps = {
      getQuestionService: {}
    };

    beforeEach(() => {
      sinon.stub(express, 'Router').returns({
        get: sinon.stub(),
        post: sinon.stub()
      });
    });

    afterEach(() => {
      (express.Router as sinon.SinonStub).restore();
    });

    it('calls router.get with the path and middleware', () => {
      setupQuestionController(deps);
      expect(express.Router().get).to.have.been.calledWith('/:questionOrdinal');
      expect(express.Router().get).to.have.been.calledWith('/:questionOrdinal/upload-evidence');
    });

    it('calls router.post with the path and middleware', () => {
      setupQuestionController(deps);
      expect(express.Router().post).to.have.been.calledWith('/:questionOrdinal');
      expect(express.Router().post).to.have.been.calledWith('/:questionOrdinal/upload-evidence');
    });

    it('returns the router', () => {
      const controller = setupQuestionController(deps);
      expect(controller).to.equal(express.Router());
    });
  });

  describe('#showEvidenceUpload', () => {
    it('returns true when it\'s enabled', () => {
      expect(showEvidenceUpload(true)).to.be.true;
    });
    it('returns true when it\'s not enabled, override is allowed and cookie is true', () => {
      expect(showEvidenceUpload(false, true, { evidenceUploadOverride: 'true' })).to.be.true;
    });
    it('returns false when it\'s not enabled and override is not allowed', () => {
      expect(showEvidenceUpload(false)).to.be.false;
    });
    it('returns false when it\'s not enabled, override is allowed but cookies object is undefined', () => {
      expect(showEvidenceUpload(false, true)).to.be.false;
    });
    it('returns false when it\'s not enabled, override is allowed but cookies object empty', () => {
      expect(showEvidenceUpload(false, true, {})).to.be.false;
    });
    it('returns false when it\'s not enabled, override is allowed but cookie is false', () => {
      expect(showEvidenceUpload(false, true, { evidenceUploadOverride: 'false' })).to.be.false;
    });
    it('returns false when it\'s not enabled, override is not allowed and cookie is true', () => {
      expect(showEvidenceUpload(false, false, { evidenceUploadOverride: 'true' })).to.be.false;
    });
  });

  describe('#checkEvidenceUploadFeature', () => {
    let next: sinon.SinonStub;
    beforeEach(() => {
      next = sinon.stub();
      res.status = sinon.stub();
    });
    it('calls next when feature is enabled', () => {
      checkEvidenceUploadFeature(true, false)(req, res, next);
      expect(next).to.have.been.calledOnce.calledWith();
    });
    it('calls next when feature is disabled and overridden', () => {
      req.cookies.evidenceUploadOverride = 'true';
      checkEvidenceUploadFeature(false, true)(req, res, next);
      expect(next).to.have.been.calledOnce.calledWith();
    });
    it('renders 404 when not feature is disabled, overridable and cookie not set', () => {
      checkEvidenceUploadFeature(false, true)(req, res, next);
      expect(res.status).to.have.been.calledOnce.calledWith(NOT_FOUND);
      expect(res.render).to.have.been.calledOnce.calledWith('errors/404.html');
    });
    it('renders 404 when not feature is disabled', () => {
      checkEvidenceUploadFeature(false, false)(req, res, next);
      expect(res.status).to.have.been.calledOnce.calledWith(NOT_FOUND);
      expect(res.render).to.have.been.calledOnce.calledWith('errors/404.html');
    });
  });

  describe('#getUploadEvidence', () => {
    it('renders template', () => {
      getUploadEvidence(req, res, next);
      expect(res.render).to.have.been.calledOnce.calledWith('question/upload-evidence.html', { questionOrdinal });
    });
  });

  describe('#postUploadEvidence', () => {
    let getAllQuestionsService;
    let evidenceService;

    beforeEach(() => {
      getAllQuestionsService = {
        getQuestionIdFromOrdinal: sinon.stub().returns('001')
      };
      evidenceService = {
        upload: sinon.stub().resolves({ statusCode: 200 })
      };
      req.file = {
        size: 5 * 1048576,
        mimetype: 'image/png'
      };
    });

    it('redirects to task list if no question is found', async () => {
      getAllQuestionsService.getQuestionIdFromOrdinal.returns(undefined);
      await postUploadEvidence(getAllQuestionsService, evidenceService)(req, res, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.taskList);
    });

    it('reloads upload-evidence.html with error if no file upload', async () => {
      req.file = null;
      await postUploadEvidence(getAllQuestionsService, evidenceService)(req, res, next);
      expect(res.render).to.have.been.calledOnce.calledWith(
          'question/upload-evidence.html',
          { questionOrdinal, error: i18n.questionUploadEvidence.error.empty }
        );
    });

    it('calls out to upload evidence service', async () => {
      await postUploadEvidence(getAllQuestionsService, evidenceService)(req, res, next);
      expect(evidenceService.upload).to.have.been.calledOnce.calledWith('1', '001', req.file);
    });

    it('redirects back to question when successful', async () => {
      await postUploadEvidence(getAllQuestionsService, evidenceService)(req, res, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(`${Paths.question}/${questionOrdinal}`);
    });

    it('reloads upload-evidence.html with error if file cannot be uploaded', async () => {
      evidenceService = { upload: sinon.stub().resolves({ statusCode: 422 }) };
      await postUploadEvidence(getAllQuestionsService, evidenceService)(req, res, next);
      expect(res.render).to.have.been.calledOnce.calledWith(
        'question/upload-evidence.html',
        { questionOrdinal, error: i18n.questionUploadEvidence.error.fileCannotBeUploaded }
      );
    });

    it('should call next and appInsights upon error', async() => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      evidenceService.upload.rejects(error);
      await postUploadEvidence(getAllQuestionsService, evidenceService)(req, res, next);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(error);
      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('#fileTypeInWhitelist', () => {
    const cb = sinon.stub();
    const file = {
      mimetype: 'image/png',
      originalname: 'someImage.png'
    };

    beforeEach(() => {
      cb.reset();
    });

    it('file is in whitelist', () => {
      fileTypeInWhitelist(req, file, cb);
      expect(cb).to.have.been.calledOnce.calledWith(null, true);
    });

    it('file mime type is not in whitelist', () => {
      file.mimetype = 'plain/disallowed';
      fileTypeInWhitelist(req, file, cb);
      expect(cb).to.have.been.calledOnce.calledWithMatch(new multer.MulterError('LIMIT_FILE_TYPE'));
    });

    it('file extension type is not in whitelist', () => {
      file.originalname = 'disallowed.file';
      fileTypeInWhitelist(req, file, cb);
      expect(cb).to.have.been.calledOnce.calledWithMatch(new multer.MulterError('LIMIT_FILE_TYPE'));
    });

    it('file does not have an extension ', () => {
      file.originalname = 'disallowedfile';
      fileTypeInWhitelist(req, file, cb);
      expect(cb).to.have.been.calledOnce.calledWithMatch(new multer.MulterError('LIMIT_FILE_TYPE'));
    });
  });

  describe('#handleFileUploadErrors', () => {
    afterEach(() => {
      res.redirect.reset();
      next.reset();
    });

    it('reloads upload-evidence.html with error if file type not allowed', () => {
      handleFileUploadErrors(new multer.MulterError('LIMIT_FILE_TYPE'), req, res, next);
      expect(res.render).to.have.been.calledOnce.calledWith(
        'question/upload-evidence.html',
        { questionOrdinal, error: i18n.questionUploadEvidence.error.invalidFileType }
      );
    });

    it('reloads upload-evidence.html with error if file too large', () => {
      handleFileUploadErrors(new multer.MulterError('LIMIT_FILE_SIZE'), req, res, next);
      expect(res.render).to.have.been.calledOnce.calledWith(
        'question/upload-evidence.html',
        { questionOrdinal, error: `${i18n.questionUploadEvidence.error.tooLarge} 10MB.` }
      );
    });

    it('reloads upload-evidence.html with error if Multer error not handled', () => {
      handleFileUploadErrors(new multer.MulterError('SOME_OTHER_ERROR'), req, res, next);
      expect(res.render).to.have.been.calledOnce.calledWith(
        'question/upload-evidence.html',
        { questionOrdinal, error: i18n.questionUploadEvidence.error.fileCannotBeUploaded }
      );
    });

    it('does not handle other errors', () => {
      const err = new Error();
      handleFileUploadErrors(err, req, res, next);
      expect(next).to.have.been.calledOnce.calledWith(err);
    });
  });
});
