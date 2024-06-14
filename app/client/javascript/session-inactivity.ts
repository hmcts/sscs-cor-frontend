import moment from 'moment';
import { sessionExtension } from '../../server/paths';
import { ExtendSessionResponse } from '../../server/controllers/session';
import content from '../../common/locale/content.json';

import i18next from 'i18next';

export class SessionInactivity {
  public sessionExtendBuffer: number = 2 * 60 * 1000;
  public sessionExpiry: moment.Moment = null;
  public lastReset: moment.Moment = null;
  public answerFormEl: HTMLElement = null;
  public modal: HTMLElement = null;
  public extend: HTMLElement = null;
  public cancel: HTMLElement = null;
  public ANSWER_FORM = 'answer-form';
  public EXTEND_BUTTON = 'extend';
  public CANCEL_BUTTON = 'cancel';
  public MODAL = 'timeout-dialog';
  public keyStrokeEventListener: any;
  public timeLeft: number = null;

  private timeOut: number;
  private modalInterval: number;
  private sessionTimeOut: number;

  init(): void {
    this.answerFormEl = document.getElementById(this.ANSWER_FORM);
    this.keyStrokeEventListener = this.extendSession.bind(this);

    this.modal = document.getElementById(this.MODAL);
    this.extend = document.getElementById(this.EXTEND_BUTTON);
    this.cancel = document.getElementById(this.CANCEL_BUTTON);

    this.addListeners();
    this.extendSession();
  }

  extendSession(): void {
    if (
      this.lastReset === null ||
      moment().diff(
        moment(this.sessionExpiry).subtract(
          this.sessionExtendBuffer,
          'milliseconds'
        )
      ) > 0
    ) {
      fetch(sessionExtension)
        .then((response) => response.json())
        .then((response: ExtendSessionResponse) => {
          console.log(response);
          if (response.expireInSeconds) {
            this.sessionExpiry = moment().add(
              response.expireInSeconds,
              'milliseconds'
            );
            this.lastReset = moment();

            this.closeModal();
            this.restartCounters();
          } else {
            // It means logged out
            this.removeListeners();
            this.stopCounters();
          }
        })
        .catch(() => {
          this.removeListeners();
          this.stopCounters();
        });
    }
  }

  restartCounters(): void {
    this.stopCounters();
    this.startCounters();
  }

  startCounters(): void {
    this.startCountdown(
      this.sessionExpiry.diff(moment(), 'ms') - this.sessionExtendBuffer
    );
    this.startSessionTimeOut(this.sessionExpiry.diff(moment(), 'ms'));
  }

  stopCounters(): void {
    clearInterval(this.modalInterval);
    clearTimeout(this.timeOut);
    clearTimeout(this.sessionTimeOut);
  }

  startSessionTimeOut(timeLeft: number) {
    this.sessionTimeOut = window.setTimeout(this.signOut, timeLeft);
  }

  startCountdown(timeLeft: number): void {
    this.timeOut = window.setTimeout(() => {
      this.openModal();
      this.startModalInterval();
    }, timeLeft);
  }

  startModalInterval(): void {
    let count = 0;
    this.modalInterval = window.setInterval(() => {
      const minutes: number = moment
        .duration(this.sessionExtendBuffer - count)
        .minutes();
      const seconds: string = moment
        .duration(this.sessionExtendBuffer - count)
        .seconds()
        .toLocaleString('en-GB', { minimumIntegerDigits: 2 });
      const expiringMessage = `${
        content[i18next.language].cookieTimeOut.modal.body[0]
      } ${minutes}:${seconds} ${
        content[i18next.language].cookieTimeOut.modal.body[1]
      }`;

      document.getElementById('expiring-in-message').innerHTML =
        expiringMessage;
      count += 1000;
    }, 1000);
  }

  openModal() {
    if (this.modal) {
      this.modal.classList.add('modal--open');
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.remove('modal--open');
    }
  }

  signOut() {
    window.location.assign('/sign-out');
  }

  addListeners() {
    this.bindModalButtonListeners();
    this.bindKeyStrokeListener();
  }

  removeListeners() {
    this.removeKeyStrokeListener();
    this.removeModalButtonListeners();
  }

  bindModalButtonListeners() {
    if (this.modal && this.extend)
      this.extend.addEventListener('click', this.keyStrokeEventListener);
    if (this.modal && this.cancel)
      this.cancel.addEventListener('click', this.signOut);
  }

  removeModalButtonListeners() {
    if (this.modal && this.extend)
      this.extend.removeEventListener('click', this.keyStrokeEventListener);
    if (this.modal && this.cancel)
      this.cancel.removeEventListener('click', this.closeModal);
  }

  bindKeyStrokeListener(): void {
    if (this.modal && this.answerFormEl)
      this.answerFormEl.addEventListener(
        'keydown',
        this.keyStrokeEventListener
      );
  }

  removeKeyStrokeListener(): void {
    if (this.modal && this.answerFormEl)
      this.answerFormEl.removeEventListener(
        'keydown',
        this.keyStrokeEventListener
      );
  }
}
