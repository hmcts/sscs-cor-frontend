import * as moment from 'moment';
import * as _ from 'lodash';
import { CONST } from 'app/constants';
const { expect } = require('test/chai-sinon');
import { Page } from 'puppeteer';
import { startServices } from 'test/browser/common';
const mockDataQuestion = require('test/mock/cor-backend/services/question').template;
const mockDataHearing = require('test/mock/cor-backend/services/hearing').template;
import { TaskListPage } from 'test/page-objects/task-list';
import { QuestionPage } from 'test/page-objects/question';
import { SubmitQuestionPage } from 'test/page-objects/submit-question';
import { QuestionsCompletedPage } from 'test/page-objects/questions-completed';
import { UploadEvidencePage } from 'test/page-objects/upload-evidence';
const i18n = require('locale/en');
import * as Paths from 'app/server/paths';
const config = require('config');

const testUrl = config.get('testUrl');

const sampleQuestionIdList = ['001', '002', '003'];
const sampleQuestionOrdinal = '1';

const pa11y = require('pa11y');
let pa11yOpts = _.clone(config.get('pa11y'));
const pa11yScreenshotPath = config.get('pa11yScreenshotPath');

describe('Question page', () => {
  let page: Page;
  let taskListPage: TaskListPage;
  let questionPage: QuestionPage;
  let submitQuestionPage: SubmitQuestionPage;
  let questionsCompletedPage: QuestionsCompletedPage;
  let uploadEvidencePage: UploadEvidencePage;
  let questionIdList: string[];
  let questionOrdinal: string;
  let firstQuestionId: string;
  let questionHeader: string;
  let questionBody: string;
  let caseReference: string;

  before('start services and bootstrap data in CCD/COH', async () => {
    const res = await startServices({ performLogin: true });
    page = res.page;
    questionIdList = res.cohTestData.questionIdList || sampleQuestionIdList;
    firstQuestionId = questionIdList.shift();
    questionOrdinal = res.cohTestData.questionOrdinal || sampleQuestionOrdinal;
    questionHeader = res.cohTestData.questionHeader || mockDataQuestion.question_header_text({ questionId: firstQuestionId });
    questionBody = res.cohTestData.questionBody || mockDataQuestion.question_body_text({ questionId: firstQuestionId });
    caseReference = res.ccdCase.caseReference || mockDataHearing.case_reference;
    taskListPage = new TaskListPage(page);
    questionPage = new QuestionPage(page, questionOrdinal);
    submitQuestionPage = new SubmitQuestionPage(page, questionOrdinal);
    uploadEvidencePage = new UploadEvidencePage(page, questionOrdinal);
    questionsCompletedPage = new QuestionsCompletedPage(page);
    await taskListPage.clickQuestion(firstQuestionId);
    await questionPage.screenshot('question');
    pa11yOpts.browser = res.browser;
    pa11yOpts.page = questionPage.page;
  });

  after(async () => {
    if (page && page.close) {
      await page.close();
    }
  });

  it('is on the /question path', () => {
    questionPage.verifyPage();
  });

  /* PA11Y */
  it('checks /question passes @pa11y', async () => {
    pa11yOpts.screenCapture = `${pa11yScreenshotPath}/question.png`;
    const result = await pa11y(pa11yOpts);
    expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
  });

  it('displays question heading from api request', async () => {
    expect(await questionPage.getHeading()).to.equal(questionHeader);
  });

  it('displays question body from api request', async () => {
    expect(await questionPage.getBody()).to.contain(questionBody);
  });

  it('displays question answer box', async () => (
    expect(await questionPage.getElement('#question-field')).to.not.be.null
  ));

  it('allows saving an empty answer and returns to the task list', async() => {
    await questionPage.saveAnswer('');
    taskListPage.verifyPage();
  });

  it('displays an error message in the summary when you try to submit an empty answer', async () => {
    await questionPage.visitPage();
    await questionPage.submitAnswer('');
    expect(await questionPage.getElementText('.govuk-error-summary'))
      .contain(i18n.question.textareaField.error.empty);
    expect(await questionPage.getElementText('#question-field-error'))
      .equal(i18n.question.textareaField.error.empty);
  });

  describe('evidence upload per question disabled', () => {
    it('displays guidance for submitting evidence with case reference', async () => {
      const summaryText = await questionPage.getElementText('#sending-evidence-guide summary span');
      const displayedCaseRef = await taskListPage.getElementText('#evidence-case-reference');
      expect(summaryText.trim()).to.equal(i18n.question.sendingEvidence.summary);
      expect(displayedCaseRef).to.equal(caseReference);
    });
  });

  describe('with evidence upload per question enabled', () => {
    before(async () => {
      await questionPage.setCookie('evidenceUploadOverride', 'true');
      await questionPage.visitPage();
    });

    after(async () => {
      await questionPage.deleteCookie('evidenceUploadOverride');
      await questionPage.visitPage();
    });

    describe('with javascript OFF', () => {
      before(async () => {
        await page.setJavaScriptEnabled(false);
        await questionPage.visitPage();
      });
      after(async () => {
        await page.setJavaScriptEnabled(true);
      });

      it('display evidence upload section', async () => {
        const headerText = await questionPage.getElementText('#evidence-upload h2');
        const addFile = await questionPage.getElementValue('#add-file');
        expect(headerText).to.equal(i18n.question.evidenceUpload.header);
        expect(addFile).to.equal(i18n.question.evidenceUpload.addFileButton);
      });

      it('displays empty list of uploaded files', async () => {
        const firstListItem: string = await questionPage.getEvidenceListText(0);
        expect(firstListItem.trim()).to.equal('No files uploaded');
      });

      it('also displays guidance posting evidence with reference', async () => {
        const summaryText = await questionPage.getElementText('#sending-evidence-guide summary span');
        const displayedCaseRef = await questionPage.getElementText('#evidence-case-reference');
        expect(summaryText).to.contain(i18n.question.evidenceUpload.postEvidence.summary);
        expect(displayedCaseRef).to.equal(caseReference);
      });

      /* PA11Y */
      it('checks /question with evidence upload per question enabled @pa11y', async () => {
        await page.setJavaScriptEnabled(true);
        pa11yOpts.screenCapture = `${pa11yScreenshotPath}/question-evidence-enabled.png`;
        pa11yOpts.page = questionPage.page;
        const result = await pa11y(pa11yOpts);
        expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
        await page.setJavaScriptEnabled(false);
      });

      it('shows the upload evidence page', async () => {
        await Promise.all([
          page.waitForNavigation(),
          questionPage.clickElement('#add-file')
        ]);
        await questionPage.screenshot('question-upload-evidence');
        uploadEvidencePage.verifyPage();
        expect(await uploadEvidencePage.getHeading()).to.equal(i18n.questionUploadEvidence.header);
      });

      /* PA11Y */
      it('checks /upload-evidence passes @pa11y', async () => {
        await page.setJavaScriptEnabled(true);
        await uploadEvidencePage.visitPage();
        pa11yOpts.screenCapture = `${pa11yScreenshotPath}/question-upload-evidence.png`;
        pa11yOpts.page = uploadEvidencePage.page;
        const result = await pa11y(pa11yOpts);
        expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
        await page.setJavaScriptEnabled(false);
      });

      it('validates that a file has been chosen', async () => {
        await uploadEvidencePage.submit();
        expect(await uploadEvidencePage.getElementText('.govuk-error-summary')).contain(i18n.questionUploadEvidence.error.empty);
        expect(await questionPage.getElementText('#file-upload-1-error')).equal(i18n.questionUploadEvidence.error.empty);
      });

      it('takes the user back to the question after submitting evidence', async () => {
        await uploadEvidencePage.selectFile('evidence.txt');
        await uploadEvidencePage.submit();
        questionPage.verifyPage();
      });

      it('displays upload files', async () => {
        const count: number = await questionPage.countEvidence();
        const firstListItem: string = await questionPage.getEvidenceListText(0);
        expect(count).to.equal(1);
        expect(firstListItem.trim()).to.equal('evidence.txt');
      });

      it('shows question as draft status', async () => {
        await questionPage.saveAnswer('');
        const answerState = await taskListPage.getElementText(`#question-${firstQuestionId} .answer-state`);
        expect(answerState).to.equal(i18n.taskList.answerState.draft.toUpperCase());
      });

      it('tries to upload evidence file that is not an allowed type', async () => {
        await questionPage.visitPage();
        await Promise.all([
          page.waitForNavigation(),
          questionPage.clickElement('#add-file')
        ]);
        await uploadEvidencePage.selectFile('disallowed_evidence.disallowed');
        await uploadEvidencePage.submit();

        expect(await uploadEvidencePage.getElementText('#file-upload-1-error'))
          .contain(i18n.questionUploadEvidence.error.invalidFileType);
      });

      it('uploads a second evidence file and shows in upload list', async () => {
        await uploadEvidencePage.visitPage();
        await uploadEvidencePage.selectFile('evidence.pdf');
        await uploadEvidencePage.submit();

        const count: number = await questionPage.countEvidence();
        const firstItemInList: string = await questionPage.getEvidenceListText(0);
        expect(count).to.equal(2);
        expect(firstItemInList.trim()).to.equal('evidence.pdf');
      });

      it('deletes uploaded evidence', async () => {
        let count: number = await questionPage.countEvidence();
        expect(count).to.equal(2);
        for (let i = 1; i <= count; i++) {
          await questionPage.deleteEvidence();
        }
        const finalCount: number = await questionPage.countEvidence();
        expect(finalCount).to.equal(0);
      });

      it('remembers changes to answer when uploading evidence', async () => {
        await questionPage.visitPage();
        const newAnswer = 'a new upload answer no js';
        await questionPage.answerNoSubmit(newAnswer);
        await Promise.all([
          page.waitForNavigation(),
          questionPage.clickElement('#add-file')
        ]);
        await uploadEvidencePage.selectFile('evidence.pdf');
        await uploadEvidencePage.submit();
        questionPage.verifyPage();
        const savedAnswer = await questionPage.getElementValue('#question-field');
        expect(savedAnswer).to.equal(newAnswer);
      });

      it('remembers changes to answer when deleting evidence', async () => {
        await questionPage.visitPage();
        const newAnswer = 'a new delete answer no js';
        await questionPage.answerNoSubmit(newAnswer);
        await questionPage.deleteEvidence();
        questionPage.verifyPage();
        const savedAnswer = await questionPage.getElementValue('#question-field');
        expect(savedAnswer).to.equal(newAnswer);
      });
    });

    describe('with javascript ON', () => {
      before(async () => {
        await questionPage.visitPage();
      });

      it('displays evidence upload section toggle', async () => {
        const checkboxLabel = await questionPage.getElementText('[for=provide-evidence-1]');
        expect(checkboxLabel.trim()).to.equal(i18n.question.evidenceUpload.checkbox);
      });

      it('checking the box reveals the upload section', async () => {
        await page.waitForSelector('#evidence-upload-reveal-container', { hidden: true, timeout: 1000 });
        await questionPage.clickElement('#provide-evidence-1');
        await page.waitForSelector('#evidence-upload-reveal-container', { visible: true, timeout: 1000 });
      });

      /* PA11Y */
      it('checks /question with evidence upload per question enabled @pa11y', async () => {
        await questionPage.clickElement('#provide-evidence-1');
        pa11yOpts.screenCapture = `${pa11yScreenshotPath}/question-evidence-enabled-js.png`;
        pa11yOpts.page = questionPage.page;
        const result = await pa11y(pa11yOpts);
        expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
      });

      it('submits the page when a file is selected', async () => {
        await Promise.all([
          page.waitForNavigation(),
          questionPage.selectFile('evidence.txt')
        ]);
        questionPage.verifyPage();
      });

      it('displays upload files', async () => {
        const count: number = await questionPage.countEvidence();
        const firstListItem: string = await questionPage.getEvidenceListText(0);
        expect(count).to.equal(1);
        expect(firstListItem.trim()).to.equal('evidence.txt');
      });

      it('shows question as draft status', async () => {
        await questionPage.saveAnswer('');
        const answerState = await taskListPage.getElementText(`#question-${firstQuestionId} .answer-state`);
        expect(answerState).to.equal(i18n.taskList.answerState.draft.toUpperCase());
      });

      it('tries to upload evidence file that is not an allowed type', async () => {
        await questionPage.visitPage();
        await Promise.all([
          page.waitForNavigation(),
          questionPage.selectFile('disallowed_evidence.disallowed')
        ]);

        expect(await uploadEvidencePage.getElementText('#file-upload-1-error'))
          .contain(i18n.questionUploadEvidence.error.invalidFileType);
      });

      it('uploads a second piece of evidence and show in uploaded list', async () => {
        await Promise.all([
          page.waitForNavigation(),
          questionPage.selectFile('evidence.pdf')
        ]);
        questionPage.verifyPage();
        const count: number = await questionPage.countEvidence();
        const firstItemInList: string = await questionPage.getEvidenceListText(0);
        expect(count).to.equal(2);
        expect(firstItemInList.trim()).to.equal('evidence.pdf');
      });

      it('deletes uploaded evidence', async () => {
        let count: number = await questionPage.countEvidence();
        expect(count).to.equal(2);
        for (let i = 1; i <= count; i++) {
          await questionPage.deleteEvidence();
        }
        const finalCount: number = await questionPage.countEvidence();
        expect(finalCount).to.equal(0);
      });

      it('remembers changes to answer when uploading evidence', async () => {
        const newAnswer = 'a new upload answer';
        await questionPage.answerNoSubmit(newAnswer);
        await Promise.all([
          page.waitForNavigation(),
          questionPage.selectFile('evidence.pdf')
        ]);
        questionPage.verifyPage();
        const savedAnswer = await questionPage.getElementValue('#question-field');
        expect(savedAnswer).to.equal(newAnswer);
      });

      it('remembers changes to answer when deleting evidence', async () => {
        const newAnswer = 'a new delete answer';
        await questionPage.answerNoSubmit(newAnswer);
        await questionPage.deleteEvidence();
        questionPage.verifyPage();
        const savedAnswer = await questionPage.getElementValue('#question-field');
        expect(savedAnswer).to.equal(newAnswer);
      });

      it('remembers changes to answer when evidence not allowed', async () => {
        const newAnswer = 'a new not allowed answer';
        await questionPage.answerNoSubmit(newAnswer);
        await Promise.all([
          page.waitForNavigation(),
          questionPage.selectFile('disallowed_evidence.disallowed')
        ]);
        questionPage.verifyPage();
        const savedAnswer = await questionPage.getElementValue('#question-field');
        expect(savedAnswer).to.equal(newAnswer);
      });
    });
  });

  describe('saving an answer', () => {
    before('save a answer', async () => {
      await questionPage.saveAnswer('A valid answer');
    });

    it('redirects to /task-list page when a valid answer is saved', async () => {
      expect(questionPage.getCurrentUrl()).to.equal(`${testUrl}${Paths.taskList}`);
    });

    it('displays question status as draft', async () => {
      const answerState = await taskListPage.getElementText(`#question-${firstQuestionId} .answer-state`);
      expect(answerState).to.equal(i18n.taskList.answerState.draft.toUpperCase());
    });

    /* PA11Y */
    it('checks question status passes @pa11y', async () => {
      pa11yOpts.screenCapture = `${pa11yScreenshotPath}/question-list-draft.png`;
      pa11yOpts.page = taskListPage.page;
      const result = await pa11y(pa11yOpts);
      expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
    });
  });

  describe('submitting an answer', () => {
    before('selects the question', async () => {
      await taskListPage.visitPage();
      await taskListPage.clickQuestion(firstQuestionId);
    });

    it('displays the previously drafted answer', async () => {
      const savedAnswer = await questionPage.getElementValue('#question-field');
      expect(savedAnswer).to.equal('A valid answer');
    });

    /* PA11Y */
    it('checks draft answer passes @pa11y', async () => {
      pa11yOpts.screenCapture = `${pa11yScreenshotPath}/question-draft-answer.png`;
      pa11yOpts.page = questionPage.page;
      const result = await pa11y(pa11yOpts);
      expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
    });

    it('submitting a really long answer should fail', async () => {
      await questionPage.submitAnswer('Lorem ipsum dolor sit amet, csssss asf adf asdonsectetur adipiscing elit. Curabitur vulputate ultricies neque, maximus tempor erat tristique id. Pellentesque luctus eros scelerisque gravida tempus. Proin a lacus eu velit facilisis vestibulum eu vitae nisi. Sed blandit augue nec est porttitor convallis. Sed eget lobortis neque, vitae suscipit magna. Vestibulum convallis, elit a condimentum aliquet, massa massa bibendum metus, et dapibus tortor velit et tellus. Sed at nibh non dolor placerat facilisis. In hac habitasse platea dictumst. Ut semper lacus ultrices, mollis magna eget, commodo metus. Sed accumsan, enim a sollicitudin ultricies, lorem tortor viverra tellus, finibus tincidunt diam nulla a lectus. Nullam ipsum augue, suscipit eu posuere in, feugiat id ex. Duis pretium lectus nec orci varius, et semper tellus aliquam. Etiam eu lobortis ipsum. Praesent quis rhoncus nunc, et viverra quam.Fusce tristique feugiat orci ac viverra. Nullam eleifend vestibulum commodo. Integer consectetur sodales lacus ut lacinia. Aenean rhoncus faucibus auctor. Donec consequat euismod dignissim. Praesent aliquam lorem id laoreet facilisis. Sed iaculis bibendum blandit. Phasellus lacinia erat in ultricies rhoncus. Sed tellus erat, maximus nec lacinia a, vestibulum nec justo. Morbi lobortis, ex eget maximus hendrerit, purus quam ultricies nisi, ac tincidunt ipsum velit vitae massa. Cras a posuere nulla. In pharetra molestie urna sed suscipit. Sed ultrices nisi vitae aliquet iaculis. Vivamus ullamcorper, nisl sit amet congue rutrum, lorem felis auctor libero, quis maximus dolor lectus et tortor. Nunc maximus elementum magna, vitae volutpat diam bibendum quis.Pellentesque ac dignissim ante. Mauris nec fringilla nunc, ut laoreet turpis. Etiam elementum accumsan dignissim. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec ut consectetur ligula, at dignissim elit. Nulla molestie turpis ligula, vel tempor augue iaculis vel. Phasellus auctor pharetra libero nec auctor. Mauris luctus turpis sed metus consectetur, vel fringilla lectus eleifend. Sed eu ante euismod, pretium tellus aliquet, feugiat mi. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.Aliquam sed ultrices urna. Sed turpis massa, dignissim eu condimentum nec, auctor at sem. Nullam blandit diam in ante luctus, in laoreet mauris vulputate. Cras id semper mauris. Aliquam aliquet nec erat a dictum. Sed et quam metus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam et orci congue tortor interdum accumsan ut a arcu. Sed efficitur mi at risus consectetur, a gravida risus pretium. Donec eros lacus, imperdiet eu tellus varius, iaculis porta nibh. Nulla a nisl lectus. Sed vehicula eget turpis at gravida. Proin suscipit nunc sit amet dignissim dignissim.Aenean finibus vehicula mi nec dignissim. Ut at vestibulum ante. Vivamus quis pretium nibh. Integer nec dui vitae nisl accumsan ultricies in eget urna. Nulla ut faucibus mauris. Proin vel mauris vel felis sollicitudin scelerisque nec eu neque. Aenean ac efficitur lorem.Pellentesque dictum ex vel leo ornare, a egestas sapien egestas. Nullam eget quam quam. Morbi ac quam lectus. Fusce tempor dictum sapien, nec hendrerit mauris consequat quis. Maecenas rhoncus risus et enim pulvinar scelerisque. Aenean eget ex nulla. Etiam rhoncus ut velit ut efficitur. Curabitur ullamcorper rhoncus lectus, sit amet scelerisque massa viverra quis. Fusce vulputate massa felis. Vivamus convallis, magna at hendrerit efficitur, quam erat pellentesque enim, a pellentesque justo purus at turpis. Praesent aliquet et lorem nec tincidunt. Integer tristique turpis in enim dapibus, eget suscipit turpis egestas. Duis mattis dapibus pretium. Suspendisse ut mi et orci ornare posuere. Vestibulum id nunc fringilla, tincidunt odio non, placerat velit. Nullam egestas erat consequat odio rutrum, euismod venenatis quam pulvinar.Curabitur aliquet ornare aliquet. Aliquam non tellus at ex eleifend fermentum. Pellentesque quam nibh, porta finibus felis et, efficitur ullamcorper nisi. Nullam eros nunc, imperdiet et porta quis, dignissim sit amet nisl. Curabitur ligula ligula, efficitur vel nisi a, cursus convallis dolor. Proin porta molestie justo vitae pulvinar. Sed luctus orci quis interdum suscipit. Phasellus risus purus, lacinia vel nulla bibendum, pharetra imperdiet lectus. Sed hendrerit eu est vitae porta. Sed condimentum tincidunt malesuada. Nam auctor nunc purus, eget molestie ex porttitor non. Mauris id dignissim leo. Suspendisse facilisis magna sit amet sapien venenatis, vitae fermentum libero dictum. Suspendisse tempus, eros at auctor consectetur, metus elit posuere leo, at pretium diam mauris ac lectus.In facilisis, lacus eget aliquet tempor, lorem justo luctus lorem, ut sodales velit ligula at urna. Aenean ornare odio ut egestas elementum. Suspendisse accumsan nisl non ante malesuada, quis efficitur ex auctor. Nam eget arcu eu neque euismod volutpat at at risus. Nullam ornare felis ac nisi molestie lacinia. Aenean vulputate, tellus a feugiat consequat, ex tortor congue lacus, sed lacinia arcu purus congue diam. Pellentesque blandit neque quis porta pulvinar. Nulla tincidunt ante nulla, sit amet aliquet arcu tincidunt eu. Praesent lacinia tortor augue, id accumsan nunc condimentum ut. Sed et augue et nulla ullamcorper pellentesque eu tempus dui.Aenean ac elementum elit. Sed nec fringilla turpis. Nunc id pharetra turpis. In et quam et est sollicitudin aliquet. Curabitur cursus orci vitae nisi pellentesque, ut tempor dolor varius. Sed dapibus nec orci vel congue. Cras et massa sollicitudin, viverra elit eget, interdum risus. Aliquam aliquam arcu felis. Pellentesque lobortis lectus ac neque dignissim, dignissim imperdiet felis vestibulum. Ut placerat sapien eget eleifend scelerisque. Ut pulvinar tellus eu turpis ornare gravida. In eu ullamcorper libero. Vestibulum ac accumsan ex. Cras leo justo, dictum eu porttitor in, laoreet porttitor libero. Morbi efficitur felis eget neque ultrices scelerisque. Suspendisse ultrices, lorem et bibendum condimentum, tellus odio ultrices nisi, vel fringilla justo neque ut augue.Vestibulum viverra turpis id orci porta, semper maximus orci consequat. Duis convallis mauris sit amet metus feugiat porta. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis a ipsum tortor. Donec maximus consectetur nulla sit amet convallis. Aenean euismod eros non odio aliquam, quis fermentum mi ornare. Nullam quis tempus nunc. Vivamus commodo posuere lacinia. Curabitur eget nisi facilisis lacus tempor efficitur ut quis lectus. Nam molestie id justo eu convallis. Aliquam ac pulvinar nisl, nec rhoncus ligula. Praesent consectetur at ex lobortis mollis. Vestibulum vel volutpat odio. Etiam id tempus nisl, at aliquet lectus. Donec vestibulum pellentesque euismod. Duis nec justo faucibus, viverra enim at, luctus velit.Pellentesque non mauris eu neque semper mollis ut ac mauris. Nunc id ante id diam fringilla elementum et eu quam. Pellentesque nec purus non sapien congue dictum. Donec sit amet libero venenatis, vestibulum libero id, ornare ligula. Vestibulum luctus accumsan eleifend. Nunc molestie orci purus, ac sodales urna consequat a. Curabitur eu facilisis nibh. Morbi interdum nunc ac ante porta ultricies. Fusce tempus dapibus urna eu dignissim. Curabitur sed aliquam leo, quis malesuada felis.Donec eget scelerisque purus. Suspendisse sed orci vestibulum, posuere risus nec, vehicula ex. Integer sit amet neque faucibus, interdum nulla id, egestas dui. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vestibulum tincidunt pretium sapien at bibendum. Vestibulum luctus augue et sagittis accumsan. Duis congue massa et pharetra mattis.Praesent non lorem vel elit ullamcorper vestibulum. Vestibulum nisl mi, rutrum ac sapien eget, efficitur tincidunt nisi. Suspendisse eget bibendum arcu. Fusce ut condimentum nibh, et malesuada nibh. Morbi eu auctor massa, non tincidunt felis. Aenean vel ipsum euismod, vestibulum dolor feugiat, porta mauris. Ut consectetur tempus diam quis dictum. Etiam non diam fermentum, mollis ligula vestibulum, auctor mi.Aenean a consectetur ante. Sed lobortis pulvinar sem eget aliquet. Pellentesque congue interdum leo, eu feugiat ante laoreet quis. Integer interdum orci posuere, blandit nisl vitae, pellentesque ante. Suspendisse placerat aliquam elit eu tincidunt. Morbi nec molestie orci. Nulla facilisi. Nulla facilisi. Mauris faucibus erat vitae dolor volutpat, a convallis neque sollicitudin. Vestibulum facilisis, magna eu accumsan fermentum, velit quam venenatis tellus, eget gravida tortor dolor sit amet enim. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Integer iaculis neque dui. Nam et tellus felis. Vestibulum eget eros aliquet, mollis tellus ac, dapibus lorem.Curabitur at ultricies nisi. Vivamus ultrices quam vitae lorem mollis, nec pellentesque orci lacinia. Nulla facilisi. Donec pharetra pellentesque nisi, eu aliquet augue fermentum et. Quisque eu arcu posuere nunc ornare vehicula quis sit amet sem. Etiam nec massa quis velit cursus semper ut et erat. Proin id mollis sem. Pellentesque nibh massa, interdum et tempus at, sollicitudin nec sem. Vivamus a tempor velit, ut cursus leo. Praesent felis enim, varius sit amet dui eu, congue gravida libero.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean rutrum imperdiet nunc ac euismod. Proin in neque a eros posuere finibus. Nullam sit amet scelerisque sem. Fusce quis libero scelerisque, finibus massa eu, vulputate ipsum. Vivamus venenatis eros at nisi sagittis, vel lacinia tellus laoreet. Duis dapibus ante magna, vitae consequat ex viverra ut. Duis facilisis ornare scelerisque. Aliquam erat volutpat. Proin auctor lacus ut tortor bibendum ultrices. Morbi ac iaculis est. Fusce tortor lacus, sagittis in tellus nec, rutrum pellentesque turpis. Aliquam a varius enim. Nulla vitae placerat sem. Proin ultrices interdum auctor voluta.');
      expect(await questionPage.getElementText('.govuk-error-summary'))
        .contain(i18n.question.textareaField.error.maxCharacters);
      expect(await questionPage.getElementText('#question-field-error'))
        .contain(i18n.question.textareaField.error.maxCharacters);
      expect(await questionPage.getElementText('#question-field-info'))
        .contain('You have 15 characters too many');
      questionPage.verifyPage();
    });

    it('is on the /submit_answer path after submitting answer', async () => {
      await questionPage.submitAnswer('Another valid answer');
      submitQuestionPage.verifyPage();
    });

    it('redirects to /task-list page when a valid answer is submitted', async () => {
      await submitQuestionPage.submit();
      expect(submitQuestionPage.getCurrentUrl()).to.equal(`${testUrl}${Paths.taskList}`);
    });

    it('displays question status as completed', async () => {
      const answerState = await taskListPage.getElementText(`#question-${firstQuestionId} .answer-state`);
      expect(answerState).to.equal(i18n.taskList.answerState.completed.toUpperCase());
    });
  });

  describe('view a submitted answer', () => {
    before(async () => {
      await taskListPage.clickQuestion(firstQuestionId);
    });

    it('displays the previously submitted answer', async () => {
      const savedAnswer = await questionPage.getElementText('#completed-answer .answer-value');
      expect(savedAnswer).to.equal('Another valid answer');
    });

    it('displays the previously submitted answer date', async () => {
      const savedAnswerDate = await questionPage.getElementText('#completed-answer .answer-date');
      expect(savedAnswerDate).to.equal(`Submitted: ${moment.utc().format(CONST.DATE_FORMAT)}`);
    });

    it('returns to task list if back is clicked', async () => {
      await Promise.all([
        page.waitForNavigation(),
        questionPage.clickElement('.govuk-back-link')
      ]);
      expect(questionPage.getCurrentUrl()).to.equal(`${testUrl}${Paths.taskList}`);
    });
  });

  describe('submitting all answers', () => {
    async function answerQuestion(questionId) {
      await taskListPage.clickQuestion(questionId);
      await questionPage.submitAnswer('A valid answer');
      await submitQuestionPage.submit();
    }

    before('answer all but one remaining question', async () => {
      await page.goto(`${testUrl}${Paths.taskList}`);
      while (questionIdList.length > 1) {
        const questionId = questionIdList.shift();
        await answerQuestion(questionId);
        const answerState = await taskListPage.getElementText(`#question-${questionId} .answer-state`);
        expect(answerState).to.equal(i18n.taskList.answerState.completed.toUpperCase());
      }
    });

    it('is on the questions completed page after submitting the final question', async () => {
      const questionId = questionIdList.shift();
      await answerQuestion(questionId);
      questionsCompletedPage.verifyPage();
    });

    it('shows the correct date for next contact', async () => {
      const expectedDate = moment.utc().add(7, 'days').format('D MMMM YYYY');
      const contactDate = await questionsCompletedPage.getElementText('#next-contact-date');
      expect(contactDate).to.equal(expectedDate);
    });
  });
});

export { };
