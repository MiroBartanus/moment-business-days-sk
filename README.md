# moment-business-days-sk

This is a momentJS plugin that allows you to work with only business days (Monday to Friday) except slovak holidays.

## Notes

* This plugin uses [momentjs-business-days](https://github.com/kalmecak/moment-business-days).
* This plugin sets the slovak locale (sk) format (DD/MM) and official annual slovak holidays.
* 30. 10. 2018 is one-time exceptional holiday [100. výročie prijatia Deklarácie slovenského národa](https://www.google.com/search?q=30.+oktober+2018+sviatok)
* This plugin computes Easter Sunday and adds Good Friday and Easter Monday to holiday
* Computed easter sundays are cached afterwards for later use
* It is possible to add additional, custom annual holidays (for local or district holidays) with slovak format (DD/MM).
* For the documentation see [momentjs-business-days](https://github.com/kalmecak/moment-business-days) and [moment](https://momentjs.com/docs/).
* All contributions are welcome.

## Install

````bash
$ npm install --save moment-business-days-sk
````

## Usage

````javascript
var moment = require('moment-business-days-sk');
````

### Add a custom holiday

** Note that only fixed holidays are supported on this version **
** You may overwrite the holiday function or submit a PR for determining the other holidays **

````javascript
var moment = require('moment-business-days-sk');

/*
moment-business-days-sk slovak holidays:
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

    // Computed and cached
    // 'Easter Sunday'
    // Computed according to 'Easter Sunday'>
    //   'Good Friday'
    //   'Easter Monday'

    // One time exceptional case:
    '30/10/2018', // 100. výročie prijatia Deklarácie slovenského národa
 ]
*/
````

### Run Tests

`npm test`

## Methods to test slovak business days

**isHoliday**

```javascript
moment('2019-01-01').isHoliday() // true
moment('2019-11-14').isHoliday() // false
```

**easter**

```javascript
// 21.4.2019 is Easter Sunday
let easter = moment.easter(2019);

easter.month() // 3 (4-1 = 3)
easter.date() // 21

// Two days before each Easter is Friday and is holiday
let easterFriday = moment(easter).subtract(2, 'd');
easterFriday.day() // 5 ... friday
easterFriday.isHoliday() // true

// Next day after each Easter is Monday
let easterMonday = moment(easter).add(1, 'd');
easterMonday.day() // 1 ... Monday
easterMonday.isHoliday() // true
```

**isBusinessDay**

```javascript
// Year 2019 has 250 business days
let foundBusinessDays = 0;

for (let d = 0; d < 365; d++) {
let day = moment('2019-01-01').add(d, 'd');

if (day.isBusinessDay()) {
    foundBusinessDays++;
}
```

**prevBusinessDay, nextBusinessDay**

```javascript
let easter = moment.easter(2019);

let prevBusinessDay = moment(easter).prevBusinessDay();
prevBusinessDay.isHoliday() // false
prevBusinessDay.day() // 4 ... Thursday

let nextBusinessDay = moment(easter).nextBusinessDay();
nextBusinessDay.isHoliday() // false
nextBusinessDay.day() // 4 ... Tuesday
```

**lastBusinessDayOfThisMonth**

```javascript
let today = moment().startOf('day')

let firstDayOfNextMonth = moment(currDay).add(1, 'month').startOf('month');
let lastBusinessDayOfCurrMonth = moment(firstDayOfNextMonth).prevBusinessDay();
lastBusinessDayOfCurrMonth.isBusinessDay() // true
```

## Methods from [moment-business-days](https://www.npmjs.com/package/moment-business-days)

**businessAdd(days)**

Will add just business days excluding Saturday and Sunday, return a moment date object:

```javascript
// 30-01-2015 is Friday, DD-MM-YYYY is the format
moment('30-01-2015', 'DD-MM-YYYY').businessAdd(3)._d // Wed Feb 04 2015 00:00:00 GMT-0600 (CST)
```

**businessSubtract(days)**

Will subtract just business days excluding Saturday and Sunday, return a moment date object:

```javascript
// 27-01-2015 is Tuesday, DD-MM-YYYY is the format
moment('27-01-2015', 'DD-MM-YYYY').businessSubtract(3)._d // Thu Jan 22 2015 00:00:00 GMT-0600 (CST)
```

**isBusinessDay()**

Check if the date is a business day and return  **true**/**false**:

```javascript
// 31-01-2015 is Saturday
moment('31-01-2015', 'DD-MM-YYYY').isBusinessDay() // false

// 30-01-2015 is Friday
moment('30-01-2015', 'DD-MM-YYYY').isBusinessDay() // true
```

**nextBusinessDay()**

Will retrieve the next business date as moment date object:

```javascript
//Next busines day of Friday 30-01-2015
moment('30-01-2015', 'DD-MM-YYYY').nextBusinessDay()._d // Mon Feb 02 2015 00:00:00 GMT-0600 (CST)

//Next busines day of Monday 02-02-2015
moment('02-02-2015', 'DD-MM-YYYY').nextBusinessDay()._d //Tue Feb 03 2015 00:00:00 GMT-0600 (CST)
```

**prevBusinessDay()**

Will retrieve the previous business date as moment date object:

```javascript
//Previous busines day of Monday 02-02-2015
moment('02-02-2015', 'DD-MM-YYYY').prevBusinessDay()._d // Fri Jan 30 2015 00:00:00 GMT-0600 (CST)

//Previous busines day of Tuesday 03-02-2015
moment('03-02-2015', 'DD-MM-YYYY').prevBusinessDay()._d //Mon Feb 02 2015 00:00:00 GMT-0600 (CST)
```

**monthBusinessDays()**

Retrieve an array of the business days in the month, each one is a moment object.

```javascript
//Busines days in month January 2015
moment('01-01-2015', 'DD-MM-YYYY').monthBusinessDays()

/*
[ { _isAMomentObject: true,
    _i: '01-01-2015',
    _f: 'DD-MM-YYYY',
    _isUTC: false,
    _pf:{ ... },
    _locale: { ... },
    _d: Thu Jan 01 2015 00:00:00 GMT-0600 (CST)
  } {
   ...
  },
  ( ... )
]
*/
```

**monthNaturalDays()**

Is like monthBusinessDays(), but this method will include the weekends on it's response.

**monthBusinessWeeks()**

Retrieve an array of arrays, these arrays are the representation of a business weeks and each week (array) have it own business days (Monday to Friday). There could be the case that one week (array) have less than 5 days, this is because the month started on the middle of the week, for example: the first week of January 2015 just have two days, Thursday 1st and Friday 2nd. **Each day in the week arrays are moment objects.**

```javascript
//Busines weeks in month January 2015
moment('01-01-2015', 'DD-MM-YYYY').monthBusinessWeeks()

/*
[ [ { _isAMomentObject: true,
      _i: '01-01-2015',
      _f: 'DD-MM-YYYY',
      _isUTC: false,
      _pf: [...],
      _locale: [...],
      _d: Thu Jan 01 2015 00:00:00 GMT-0600 (CST) 
    }, { _isAMomentObject: true,
      _i: '01-01-2015',
      _f: 'DD-MM-YYYY',
      _isUTC: false,
      _pf: [...],
      _locale: [...],
      _d: Fri Jan 02 2015 00:00:00 GMT-0600 (CST) }
  ],
  [...]
]
*/
```

**monthNaturalWeeks()**

It's like monthBusinessWeeks(), but this method will include weekends on it's response.

The objects returned by functions are momentjs objects (**except isBusinessDay**) so you can handle it with moment native functions.

**businessDiff()**

Calculate number of busines days between dates.

```javascript
var diff = moment('05-15-2017', 'MM-DD-YYYY').businessDiff(moment('05-08-2017','MM-DD-YYYY'));
// diff = 5
```