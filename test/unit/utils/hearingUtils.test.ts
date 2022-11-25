import {
  getHearingInfo,
  isHearingBookedEvent,
  shouldShowHearing,
} from 'app/server/utils/hearingUtils';
import { expect } from 'test/chai-sinon';
import { Appeal, CaseEvent } from 'app/server/models/express-session';

describe('hearingUtils', function () {
  describe('shouldShowHearing', function () {
    it('should return false when hideHearing is true', function () {
      const appeal: Appeal = {
        hideHearing: true,
      };
      expect(shouldShowHearing(appeal)).to.equal(false);
    });

    it('should return true when hideHearing is false', function () {
      const appeal: Appeal = {
        hideHearing: false,
      };
      expect(shouldShowHearing(appeal)).to.equal(true);
    });

    it('should return true when hideHearing is null', function () {
      const appeal: Appeal = {};
      expect(shouldShowHearing(appeal)).to.equal(true);
    });

    it('should return true when appeal is null', function () {
      const appeal: Appeal = null;
      expect(shouldShowHearing(appeal)).to.equal(true);
    });
  });

  describe('isHearingBookedEvent', function () {
    it('should return false when event type is HEARING_BOOKED', function () {
      const event = {
        type: 'HEARING_BOOKED',
        date: '2022-10-10',
        contentKey: 'test',
      };
      expect(isHearingBookedEvent(event)).to.equal(true);
    });

    it('should return false when event type is NEW_HEARING_BOOKED', function () {
      const event = {
        type: 'NEW_HEARING_BOOKED',
        date: '2022-10-10',
        contentKey: 'test',
      };
      expect(isHearingBookedEvent(event)).to.equal(true);
    });

    it('should return false when event type is not correct', function () {
      const event: CaseEvent = {
        type: 'wrongType',
        date: '2022-10-10',
        contentKey: 'test',
      };
      expect(isHearingBookedEvent(event)).to.equal(false);
    });
  });

  describe('getNextHearing', function () {
    it('should return undefined when latestEvents and historicalEvents are null', function () {
      const appeal: Appeal = {};
      expect(getHearingInfo(appeal)).to.equal(undefined);
    });

    it('should return first event in latestEvents and historicalEvents', function () {
      const appeal: Appeal = {
        latestEvents: [
          { type: 'HEARING_BOOKED', date: '2022-10-10', contentKey: 'test' },
          {
            type: 'NEW_HEARING_BOOKED',
            date: '2022-09-10',
            contentKey: 'test',
          },
        ],
        historicalEvents: [
          { type: 'HEARING_BOOKED', date: '2022-08-10', contentKey: 'test' },
          {
            type: 'NEW_HEARING_BOOKED',
            date: '2022-07-10',
            contentKey: 'test',
          },
        ],
      };
      expect(getHearingInfo(appeal)).to.equal(appeal.latestEvents[0]);
    });

    it('should return first event in historicalEvents if latestEvents is empty', function () {
      const appeal: Appeal = {
        latestEvents: [],
        historicalEvents: [
          { type: 'HEARING_BOOKED', date: '2022-08-10', contentKey: 'test' },
          {
            type: 'NEW_HEARING_BOOKED',
            date: '2022-07-10',
            contentKey: 'test',
          },
        ],
      };
      expect(getHearingInfo(appeal)).to.equal(appeal.historicalEvents[0]);
    });

    it('should return first hearing event', function () {
      const appeal: Appeal = {
        latestEvents: [
          { type: 'wrongType1', date: '2022-10-10', contentKey: 'test' },
          { type: 'wrongType2', date: '2022-09-10', contentKey: 'test' },
        ],
        historicalEvents: [
          { type: 'wrongType3', date: '2022-08-10', contentKey: 'test' },
          {
            type: 'NEW_HEARING_BOOKED',
            date: '2022-07-10',
            contentKey: 'test',
          },
        ],
      };
      expect(getHearingInfo(appeal).type).to.equal('NEW_HEARING_BOOKED');
    });
  });
});
