import * as moment from 'moment';
import axios from 'axios';

export class SessionInactivity {
  sessionExtendBuffer: number;
  sessionExpiry: moment.Moment;
  lastReset: moment.Moment;
  window: Window;

  constructor(window: Window) {
    this.sessionExtendBuffer = 2 * 60; // 2 min
    this.sessionExpiry = null;
    this.lastReset = null;
    this.window = window;
  }
  init() {
    this.bindKeyStrokes();
    this.extendSession();
  }

  extendSession() {
    if (this.lastReset === null || (moment().diff(this.lastReset, 's') - this.sessionExtendBuffer) > 0) {
      axios.get('/sess-extend').then((response: any): void => {
        if (response['data'].expireInSeconds) {
          this.sessionExpiry = moment().add(response['data'].expireInSeconds, 'seconds');
          this.lastReset = moment();
        } else { // It means logged out
          this.removeKeyStrokes();
        }
      }).catch(() => this.removeKeyStrokes());
    }
  }

  bindKeyStrokes() {
    this.window.document.addEventListener('keydown', this.extendSession.bind(this));
  }
  removeKeyStrokes() {
    this.window.document.removeEventListener('keydown',this.extendSession.bind(this));
  }
}
