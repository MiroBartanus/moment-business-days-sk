import { Moment } from 'moment';
var moment = require('moment-business-days');

const MIN_YEAR = 1000;
const MIN_YEAR_CACHED = 1200;
const MAX_YEAR_CACHED = 2200;
const MAX_YEAR = 3000;

moment.locale('sk');

moment.updateLocale('sk', {
  // https://sk.wikipedia.org/wiki/Zoznam_sviatkov_na_Slovensku
  // https://sk.wikipedia.org/wiki/De%C5%88_pracovn%C3%A9ho_pokoja
  holidays: [
    // Štátne sviatky
    '01/01', // 1. január – Deň vzniku Slovenskej republiky
    '05/07', // 5. júl – Sviatok svätého Cyrila a Metoda
    '29/08', // 29. august – Výročie Slovenského národného povstania
    '01/09', // 1. september – Deň Ústavy Slovenskej republiky
    '17/11', // 17. november – Deň boja za slobodu a demokraciu

    // Dni pracovného pokoja
    '06/01', // 6. január – Zjavenie Pána (Traja králi)
    '01/05', // 1. máj – Sviatok práce
    '08/05', // 8. máj – Deň víťazstva nad fašizmom
    '15/09', // 15. september – Sedembolestná Panna Mária
    '01/11', // 1. november – Sviatok všetkých svätých
    '24/12', // 24. december – Štedrý deň
    '25/12', // 25. december – Prvý sviatok vianočný
    '26/12', // 26. december – Druhý sviatok vianočný
  ],
  holidayFormat: 'DD/MM',
  holiday: function(someMoment: Moment) {
    // Month is indexed starting at 0, so December is 11.
    let year = someMoment.year();
    let month = someMoment.month() + 1;
    let date = someMoment.date();
    let day = someMoment.day();

    //  30. október 2018 je štátnym sviatkom: 100. výročie prijatia Deklarácie slovenského národa
    if (year === 2018 && month === 10 && 30 === date) {
      return true;
    }

    // on Fridays and Mondays durig March and April test Easter also:
    if ((month == 3 || month == 4) && (day == 5 || day == 1)) {
      let someEaster = moment.easter(year);

      if (day == 5) {
        let easterFriday = moment(someEaster).subtract(2, 'd');

        if (someMoment.isSame(easterFriday, 'day')) {
          return true;
        }
      }

      if (day == 1) {
        let easterMonday = moment(someEaster).add(1, 'd');

        if (someMoment.isSame(easterMonday, 'day')) {
          return true;
        }
      }
    }

    return false;
  },
});

// Veľkonočná nedeľa
//'2019': moment({ year: 2019, month: 4 - 1, day: 21 })
const easterCache: Map<number, Moment> = new Map<number, Moment>();

// https://github.com/zaygraveyard/moment-easter/blob/master/moment.easter.js
// https://stackoverflow.com/questions/1284314/easter-date-in-javascript
// https://www.irt.org/articles/js052/index.htm
function computeEaster(Y: number): { year: number; month: number; day: number } {
  var C = Math.floor(Y / 100);
  var N = Y - 19 * Math.floor(Y / 19);
  var K = Math.floor((C - 17) / 25);
  var I = C - Math.floor(C / 4) - Math.floor((C - K) / 3) + 19 * N + 15;
  I = I - 30 * Math.floor(I / 30);
  I = I - Math.floor(I / 28) * (1 - Math.floor(I / 28) * Math.floor(29 / (I + 1)) * Math.floor((21 - N) / 11));
  var J = Y + Math.floor(Y / 4) + I + 2 - C + Math.floor(C / 4);
  J = J - 7 * Math.floor(J / 7);
  var L = I - J;
  var M = 3 + Math.floor((L + 40) / 44);
  var D = L + 28 - 31 * Math.floor(M / 4);

  return { year: Y, month: M - 1, day: D };
}

function computeEasterAlt(year: number): { year: number; month: number; day: number } {
  if (!year) year = this.year();

  /*jslint bitwise: true, vars: true */
  var a = ((year / 100) | 0) * 1483 - ((year / 400) | 0) * 2225 + 2613;
  var b = ((((year % 19) * 3510 + ((a / 25) | 0) * 319) / 330) | 0) % 29;
  // return 56 - b - ((year * 5 / 4 | 0) + a - b) % 7;
  var c = 148 - b - (((((year * 5) / 4) | 0) + a - b) % 7);

  return { year: year, month: ((c / 31) | 0) - 1, day: (c % 31) + 1 };
}

/**
 * Add an holiday.
 * @param year: year for easter computation
 */
moment.easter = function(year: number): Moment | undefined {
  if (!year) year = this.year();

  if (year < MIN_YEAR || year > MAX_YEAR) {
    return undefined;
  }

  let aEaster: Moment | undefined = undefined;

  if (year >= MIN_YEAR_CACHED && year <= MAX_YEAR_CACHED) {
    aEaster = easterCache.get(year);
  }

  if (aEaster === undefined) {
    aEaster = moment(computeEaster(year));

    if (year >= MIN_YEAR_CACHED && year <= MAX_YEAR_CACHED) {
      easterCache.set(year, aEaster as Moment);
    }
  }

  // return copy, to protect the value in chache
  return moment(aEaster);
};

/**
 * Add an holiday.
 * @param dateDDMM: string representing the date in DD/MM format.
 */
moment.addHoliday = function(dateDDMM: string) {
  let locale = this.localeData();

  locale._holidays.push(dateDDMM);
};

module.exports = moment;
