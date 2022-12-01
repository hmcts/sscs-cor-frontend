import {
  getHearingInfo,
  isHearingBookedEvent,
  shouldHideHearing,
  shouldShowHearing,
} from 'app/server/utils/hearingUtils';
import { expect } from 'test/chai-sinon';

describe('hearingUtils', function () {
  describe('shouldHideHearing', function () {
    it('should return true when hideHearing is true', function () {
      const appeal = {
        hideHearing: true,
      };
      expect(shouldHideHearing(appeal)).to.equal(true);
    });

    it('should return false when hideHearing is false', function () {
      const appeal = {
        hideHearing: false,
      };
      expect(shouldHideHearing(appeal)).to.equal(false);
    });

    it('should return false when hideHearing is null', function () {
      const appeal = {};
      expect(shouldHideHearing(appeal)).to.equal(false);
    });

    it('should return false when appeal is null', function () {
      const appeal = null;
      expect(shouldHideHearing(appeal)).to.equal(false);
    });
  });

  describe('shouldShowHearing', function () {
    it('should return false when hideHearing is true', function () {
      const appeal = {
        hideHearing: true,
      };
      expect(shouldShowHearing(appeal)).to.equal(false);
    });

    it('should return true when hideHearing is false', function () {
      const appeal = {
        hideHearing: false,
      };
      expect(shouldShowHearing(appeal)).to.equal(true);
    });

    it('should return true when hideHearing is null', function () {
      const appeal = {};
      expect(shouldShowHearing(appeal)).to.equal(true);
    });

    it('should return true when appeal is null', function () {
      const appeal = null;
      expect(shouldShowHearing(appeal)).to.equal(true);
    });
  });

  describe('isHearingBookedEvent', function () {
    it('should return false when event type is HEARING_BOOKED', function () {
      const event = {
        type: 'HEARING_BOOKED',
      };
      expect(isHearingBookedEvent(event)).to.equal(true);
    });

    it('should return false when event type is NEW_HEARING_BOOKED', function () {
      const event = {
        type: 'NEW_HEARING_BOOKED',
      };
      expect(isHearingBookedEvent(event)).to.equal(true);
    });

    it('should return false when event type is not correct', function () {
      const event = {
        type: 'wrongType',
      };
      expect(isHearingBookedEvent(event)).to.equal(false);
    });
  });

  describe('getNextHearing', function () {
    it('should return undefined when latestEvents and historicalEvents are null', function () {
      const appeal = {};
      expect(getHearingInfo(appeal)).to.equal(undefined);
    });

    it('should return first event in latestEvents and historicalEvents', function () {
      const appeal = {
        latestEvents: [
          { type: 'HEARING_BOOKED', date: '2022-10-10' },
          { type: 'NEW_HEARING_BOOKED', date: '2022-09-10' },
        ],
        historicalEvents: [
          { type: 'HEARING_BOOKED', date: '2022-08-10' },
          { type: 'NEW_HEARING_BOOKED', date: '2022-07-10' },
        ],
      };
      expect(getHearingInfo(appeal)).to.equal(appeal.latestEvents[0]);
    });

    it('should return first event in historicalEvents if latestEvents is empty', function () {
      const appeal = {
        latestEvents: [],
        historicalEvents: [
          { type: 'HEARING_BOOKED', date: '2022-08-10' },
          { type: 'NEW_HEARING_BOOKED', date: '2022-07-10' },
        ],
      };
      expect(getHearingInfo(appeal)).to.equal(appeal.historicalEvents[0]);
    });

    it('should return first hearing event', function () {
      const appeal = {
        latestEvents: [
          { type: 'wrongType1', date: '2022-10-10' },
          { type: 'wrongType2', date: '2022-09-10' },
        ],
        historicalEvents: [
          { type: 'wrongType3', date: '2022-08-10' },
          { type: 'NEW_HEARING_BOOKED', date: '2022-07-10' },
        ],
      };
      expect(getHearingInfo(appeal).type).to.equal('NEW_HEARING_BOOKED');
    });
  });
});
