// https://www.typescriptlang.org/docs/handbook/declaration-merging.html
// https://www.typescriptlang.org/docs/handbook/namespaces-and-modules.html

//import moment, { Moment } from 'moment';
//import 'moment-business-days';

import { Moment } from 'moment';
import moment from 'moment-business-days';

declare module 'moment' {
  interface Moment {
    easter(year: number): moment.Moment | undefined;
    addHoliday(dateDDMM: string): void;
  }
}

const MIN_YEAR = 1000;
const MIN_YEAR_CACHED = 1750;
const MAX_YEAR_CACHED = 2250;
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
  holiday: function (someMoment: Moment) {
    // Month is indexed starting at 0, so December is 11.
    const year = someMoment.year();
    const month = someMoment.month() + 1;
    const date = someMoment.date();
    const day = someMoment.day();

    //  30. október 2018 je štátnym sviatkom: 100. výročie prijatia Deklarácie slovenského národa
    if (year === 2018 && month === 10 && 30 === date) {
      return true;
    }

    // on Fridays and Mondays durig March and April test Easter also:
    if ((month == 3 || month == 4) && (day == 5 || day == 1)) {
      const someEaster = someMoment.easter(year);

      if (day == 5) {
        const easterFriday = moment(someEaster).subtract(2, 'd');

        if (someMoment.isSame(easterFriday, 'day')) {
          return true;
        }
      }

      if (day == 1) {
        const easterMonday = moment(someEaster).add(1, 'd');

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
  const C = Math.floor(Y / 100);
  const N = Y - 19 * Math.floor(Y / 19);
  const K = Math.floor((C - 17) / 25);
  let I = C - Math.floor(C / 4) - Math.floor((C - K) / 3) + 19 * N + 15;
  I = I - 30 * Math.floor(I / 30);
  I = I - Math.floor(I / 28) * (1 - Math.floor(I / 28) * Math.floor(29 / (I + 1)) * Math.floor((21 - N) / 11));
  let J = Y + Math.floor(Y / 4) + I + 2 - C + Math.floor(C / 4);
  J = J - 7 * Math.floor(J / 7);
  const L = I - J;
  const M = 3 + Math.floor((L + 40) / 44);
  const D = L + 28 - 31 * Math.floor(M / 4);

  return { year: Y, month: M - 1, day: D };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function computeEasterAlt(year: number): { year: number; month: number; day: number } {
  /*jslint bitwise: true, vars: true */
  const a = ((year / 100) | 0) * 1483 - ((year / 400) | 0) * 2225 + 2613;
  const b = ((((year % 19) * 3510 + ((a / 25) | 0) * 319) / 330) | 0) % 29;
  // return 56 - b - ((year * 5 / 4 | 0) + a - b) % 7;
  const c = 148 - b - (((((year * 5) / 4) | 0) + a - b) % 7);

  return { year: year, month: ((c / 31) | 0) - 1, day: (c % 31) + 1 };
}

moment.fn.easter = function (year: number): Moment | undefined {
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

moment.fn.addHoliday = function (dateDDMM: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const locale: any = this.localeData();

  locale._holidays.push(dateDDMM);
};

export = moment;
