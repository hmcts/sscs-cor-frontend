import * as moment from 'moment';
import axios from 'axios';

export class SessionInactivity {
  public sessionExtendBuffer: number = 2 * 60;
  public sessionExpiry: moment.Moment = null;
  public lastReset: moment.Moment = null;
  public answerFormEl: HTMLElement = null;
  public ANSWER_FORM: string = 'answer-form';
  public keyStrokeEventListener: any;

  init(): void {
    this.answerFormEl = document.getElementById(this.ANSWER_FORM);
    this.keyStrokeEventListener = this.extendSession.bind(this);

    if (this.answerFormEl) {
      this.bindKeyStrokeListener();
      this.extendSession();
    }
  }

  extendSession(): void {
    if (this.lastReset === null || moment().diff(this.lastReset, 's') - this.sessionExtendBuffer > 0) {
      axios.get('/session-extension').then((response: any): void => {
        if (response['data'].expireInSeconds) {
          this.sessionExpiry = moment().add(response['data'].expireInSeconds, 'seconds');
          this.lastReset = moment();
        } else { // It means logged out
          this.removeKeyStrokeListener();
        }
      }).catch(() => this.removeKeyStrokeListener());
    }
  }

  bindKeyStrokeListener(): void {
    this.answerFormEl.addEventListener('keydown', this.keyStrokeEventListener);
  }

  removeKeyStrokeListener(): void {
    this.answerFormEl.removeEventListener('keydown', this.keyStrokeEventListener);
  }
}
