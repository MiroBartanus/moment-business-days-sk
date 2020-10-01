import { expect } from 'chai';
import 'mocha';

import { Moment } from 'moment';
import moment from '../src/index';

describe('moment-business-days-sk tests', () => {
  before(function () {
    moment.locale('sk');
  });

  it('Default value is "now", moment() === moment(new Date())', () => {
    const aDate: Date = new Date();
    const aMoment: Moment = moment();
    const aDiff = Math.abs(aMoment.valueOf() - aDate.getTime());

    expect(aDiff).to.be.lessThan(3); // 3x 1/1000 sec
  });

  it('default locale is "sk"', () => {
    expect(moment.locale()).to.be.eq('sk');
  });

  context('isHoliday', function () {
    it('isHoliday for 2019-01-01', () => {
      let day = moment('2019-01-01');
      expect(day.isHoliday()).to.equal(true);
    });

    it('isHoliday for 2019-11-14 - FALSE', () => {
      let day = moment('2019-11-14');
      expect(day.isHoliday()).to.equal(false);
    });

    it("isHoliday for Easter Friday '2019-04-19'", function () {
      let day = moment('2019-04-19');
      expect(day.isHoliday()).to.equal(true);
    });
  });

  context('easter', function () {
    it("returns [4,21] for '2019'", function () {
      let day = moment().easter(2019) as Moment;

      expect(day.month()).to.equal(4 - 1);
      expect(day.date()).to.equal(21);
    });

    it('500x Easter is on Sunday', function () {
      for (let y = 1750; y < 2250; y++) {
        let day = moment().easter(y) as Moment;

        expect(day.day()).to.equal(0);
      }
    });

    it('Second 500x Easter is much faster because caching', function () {
      for (let y = 1750; y < 2250; y++) {
        let day = moment().easter(y) as Moment;

        expect(day.day()).to.equal(0);
      }
    });

    it('Two days before each Easter is Friday', function () {
      for (let y = 1750; y < 2250; y++) {
        let easter = moment().easter(y) as Moment;
        let easterFriday = moment(easter).subtract(2, 'd');

        expect(easterFriday.day()).to.equal(5);
      }
    });

    it('Two days before each Easter is Friday which is Holiday', function () {
      for (let y = 1750; y < 2250; y++) {
        let easter = moment().easter(y) as Moment;
        let easterFriday = moment(easter).subtract(2, 'd');

        expect(easterFriday.isHoliday()).to.equal(true);
      }
    });

    it('Next day after each Easter is Monday', function () {
      for (let y = 1750; y < 2250; y++) {
        let easter = moment().easter(y) as Moment;
        let easterMonday = moment(easter).add(1, 'd');

        expect(easterMonday.day()).to.equal(1);
      }
    });

    it('Next day after each Easter is Monday which is Holiday', function () {
      for (let y = 1750; y < 2250; y++) {
        let easter = moment().easter(y) as Moment;
        let easterMonday = moment(easter).add(1, 'd');

        expect(easterMonday.isHoliday()).to.equal(true);
      }
    });

    it('Min and max months of Easter holiday are whitin 2-3', function () {
      let minMonth = 11;
      let maxMonth = 0;

      for (let y = 1750; y < 2250; y++) {
        let easter = moment().easter(y) as Moment;
        let easterFriday = moment(easter).subtract(2, 'd');
        let easterMonday = moment(easter).add(1, 'd');

        minMonth = Math.min(minMonth, easterFriday.month());
        maxMonth = Math.max(maxMonth, easterMonday.month());

        expect(minMonth).to.be.within(2, 3);
        expect(maxMonth).to.be.within(2, 3);
      }
    });
  });

  context('isHoliday', function () {
    it('Test all holidays in 2019', function () {
      let allHolidays = [
        '2019-01-01',
        '2019-01-06',
        '2019-04-19', // EASTER FRIDAY
        '2019-04-22', // EASTER MONDAY
        '2019-05-01',
        '2019-05-08',
        '2019-07-05',
        '2019-08-29',
        '2019-09-01',
        '2019-09-15',
        '2019-11-01',
        '2019-11-17',
        '2019-12-24',
        '2019-12-25',
        '2019-12-26',
      ];

      let foundHolidays = 0;

      for (let d = 0; d < 365; d++) {
        let day = moment('2019-01-01').add(d, 'd');

        if (day.isHoliday()) {
          foundHolidays++;
          expect(allHolidays.indexOf(day.format('YYYY-MM-DD')) >= 0).to.equal(true);
        }
      }

      expect(foundHolidays).to.equal(allHolidays.length);
    });

    it('Test all holidays in 1970-2070', function () {
      for (let y = 1970; y <= 2070; y++) {
        let yString = y.toString();

        let allHolidays = [
          yString + '-01-01',
          yString + '-01-06',
          //yString + '-04-19', // EASTER FRIDAY
          //yString + '-04-22', // EASTER MONDAY
          yString + '-05-01',
          yString + '-05-08',
          yString + '-07-05',
          yString + '-08-29',
          yString + '-09-01',
          yString + '-09-15',
          yString + '-11-01',
          yString + '-11-17',
          yString + '-12-24',
          yString + '-12-25',
          yString + '-12-26',
        ];

        let easterSunday = moment().easter(y) as Moment;

        allHolidays.push(easterSunday.subtract(2, 'd').format('YYYY-MM-DD'));
        allHolidays.push(easterSunday.add(3, 'd').format('YYYY-MM-DD'));

        if (y === 2018) {
          allHolidays.push('2018-10-30');
        }

        let foundHolidays = 0;

        for (let d = 0; d < 365; d++) {
          let day = moment(yString + '-01-01').add(d, 'd');

          if (day.isHoliday()) {
            foundHolidays++;

            expect(allHolidays.indexOf(day.format('YYYY-MM-DD')) >= 0).to.equal(true);
          }
        }

        expect(foundHolidays).to.equal(allHolidays.length);
      }
    });
  });

  context('isBusinessDay', function () {
    it('Rok 2019 ma 250 pracovnych dni', function () {
      let foundBusinessDays = 0;

      for (let d = 0; d < 365; d++) {
        let day = moment('2019-01-01').add(d, 'd');

        if (day.isBusinessDay()) {
          foundBusinessDays++;
        }
      }

      expect(foundBusinessDays).to.equal(250);
    });

    // sOURCE> https://calendar.zoznam.sk/worktime-sksk.php?hy=2021
    it('Test all business days in 2010-2030', function () {
      let yearBusinessDays = [
        { y: 2010, bd: 251 },
        { y: 2011, bd: 250 },
        { y: 2012, bd: 250 },
        { y: 2013, bd: 250 },
        { y: 2014, bd: 248 },
        { y: 2015, bd: 250 },
        { y: 2016, bd: 250 },
        { y: 2017, bd: 247 },
        { y: 2018, bd: 249 },
        { y: 2019, bd: 250 },
        { y: 2020, bd: 251 },
        { y: 2021, bd: 251 },
        { y: 2022, bd: 250 },
        { y: 2023, bd: 247 },
        { y: 2024, bd: 251 },
        { y: 2025, bd: 248 },
        { y: 2026, bd: 250 },
        { y: 2027, bd: 251 },
        { y: 2028, bd: 247 },
        { y: 2029, bd: 250 },
        { y: 2030, bd: 250 },
      ];

      for (let cYear of yearBusinessDays) {
        let startDateOfTheYear = moment([cYear.y]);
        let days = startDateOfTheYear.isLeapYear() ? 366 : 365;

        let foundBusinessDays = 0;

        for (let d = 0; d < days; d++) {
          let day = moment(startDateOfTheYear).add(d, 'd');

          if (day.isBusinessDay()) {
            foundBusinessDays++;
          }
        }

        expect(foundBusinessDays).to.equal(cYear.bd);
      }
    });
  });

  context('prevBusinessDay', function () {
    it('Predchadzajuci pracovny den pred Velkou Nocou 2019 je stvrtok, 18.4.2019', function () {
      let easter = moment().easter(2019) as Moment;
      let prevBusinessDay = moment(easter).prevBusinessDay();

      expect(prevBusinessDay.isHoliday()).to.equal(false);
      expect(prevBusinessDay.day()).to.equal(4);
      expect(prevBusinessDay.isSame(moment('2019-04-18'), 'day')).to.equal(true);
    });

    it('Predchadzajuci pracovny den pred Velkou Nocou je vzdy stvrtok', function () {
      for (let y = 1750; y < 2250; y++) {
        let easter = moment().easter(y) as Moment;
        let prevBusinessDay = moment(easter).prevBusinessDay();

        expect(prevBusinessDay.isHoliday()).to.equal(false);
        expect(prevBusinessDay.day()).to.equal(4);

        let thursday = moment(easter).subtract(3, 'd');
        expect(prevBusinessDay.isSame(thursday, 'day')).to.equal(true);
      }
    });
  });

  context('nextBusinessDay', function () {
    it('Nasledujuci pracovny den po Velkej Noci 2019 je utorok, 23.4.2019', function () {
      let easter = moment().easter(2019) as Moment;
      let nextBusinessDay = moment(easter).nextBusinessDay();

      expect(nextBusinessDay.isHoliday()).to.equal(false);
      expect(nextBusinessDay.day()).to.equal(2);
      expect(nextBusinessDay.isSame(moment('2019-04-23'), 'day')).to.equal(true);
    });

    it('Nasledujuci pracovny den po Velkej Noci je vzdy utorok', function () {
      for (let y = 1200; y < 2200; y++) {
        let easter = moment().easter(y) as Moment;
        let nextBusinessDay = moment(easter).nextBusinessDay();

        expect(nextBusinessDay.isHoliday()).to.equal(false);
        expect(nextBusinessDay.day()).to.equal(2);

        let tuesday = moment(easter).add(2, 'd');
        expect(nextBusinessDay.isSame(tuesday, 'day')).to.equal(true);
      }
    });
  });

  context('lastBusinessDayOfTheMonth', function () {
    it('Posledný pracovný deň v mesiaci', function () {
      for (let d = 0; d < 365; d++) {
        let currDay = moment('2019-01-01').startOf('d').add(d, 'd');

        let firstDayOfNextMonth = moment(currDay).startOf('d').add(1, 'month').startOf('month');

        let lastBusinessDayOfCurrMonth = moment(firstDayOfNextMonth).prevBusinessDay();
        expect(lastBusinessDayOfCurrMonth.isBusinessDay()).to.equal(true);

        let nextDay = moment(lastBusinessDayOfCurrMonth).add(1, 'd');
        while (!nextDay.isBusinessDay()) {
          nextDay.add(1, 'd');
        }

        expect(nextDay.isBusinessDay()).to.equal(true);
        expect(nextDay.month()).not.equal(lastBusinessDayOfCurrMonth.month());
      }
    });
  });

  context('addHoliday', function () {
    it('Custom holiday', function () {
      let notHoliday = moment('2020-10-01');

      expect(notHoliday.isBusinessDay()).to.equal(true);

      moment().addHoliday('01/10');

      expect(notHoliday.isBusinessDay()).to.equal(false);
    });
  });
});
