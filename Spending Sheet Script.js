/** @OnlyCurrentDoc */
function transpose(a)
/* Transposes an array (col -> rows, rows -> col). It's magic.*/
{
  return Object.keys(a[0]).map(function (c) { return a.map(function (r) { return r[c]; }); });
}

function getSheetWithRange(sheettoread, sheettowrite, sourcerange) {
  
  /* Get the spreadsheet we need to work on */
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  /* sheetsource = where the values come from, sheet = where the values go */
  var sheetsource = ss.getSheetByName(sheettoread);
  var sheet = ss.getSheetByName(sheettowrite);

  /* Get the values from said spreadsheet that will be changed */
  var source = sheetsource.getRange(sourcerange);
  var sourcevalues = source.getValues();

  return {
    sheetsource: sheetsource,
    sheet: sheet,
    source: source,
    sourcevalues: sourcevalues,
  };
}

function gasupdate() {

  /* Use getSheetWithRange to find sheets to read and write to */
  var {sheetsource, sheet, source, sourcevalues} = getSheetWithRange("Job", "Gas", "D4:D8");
  var gastrackerrange = sheetsource.getRange("D56:D59");
  var gastrackervalues = gastrackerrange.getValues();

  /* Get variables from the Gas Tracker range and the Daily Inputs range*/
  const lastpurchasedate = gastrackervalues[0][0];
  const amountpaid = sourcevalues[1][0];
  const today = new Date();

  /* Calculate the date difference since last gas purchase to then calculate dollars/day */
  var datedif = Math.abs(today - lastpurchasedate)
  var datedif =  Math.floor(datedif / (1000 * 60 * 60 * 24));
  const dollarperday = amountpaid / datedif;

  /* Create an array of arrays (rows) to update Gas Tracker section with */
  gastracker = [
    [today], [amountpaid], [today], [dollarperday]
  ];

  /* Create a new array of rows [date, dollars/day] for every day of the week since last purchase */
  var start = lastpurchasedate;
  var end = today;

  var weeklydates = [[start, dollarperday]];
  var loop = new Date(start);
  while (loop <= end) {
    weeklydates.push([loop, dollarperday]);
    var newDate = loop.setDate(loop.getDate() + 1);
    loop = new Date(newDate);
  }  

  /* Append new rows just created into the Gas sheet as the new array created */
  LockService.getScriptLock().waitLock(60000);
    sheet.getRange(sheet.getLastRow() + 1, 1, weeklydates.length, weeklydates[0].length).setValues(weeklydates);

  /* Write the values to the Gas Tracker and reset the timer to start at TODAY() */
  gastrackerrange.setValues(gastracker);
  sheetsource.getRange("D58").setFormula("=TODAY()");
}

function recordHistory() {

  /* Use getSheetWithRange to find sheets to read and write to */
  var {sheetsource, sheet, source, sourcevalues} = getSheetWithRange("Job", "History", "D4:D9");

  /* Create a whole-lotta variables */
  const time = new Date();
  const revenue = sourcevalues[0][0];
  const otherexpenses = sourcevalues[2][0];
  const miles = sourcevalues[3][0];
  const hours = sourcevalues[4][0];
  const trips = sourcevalues[5][0];

  const gas = sourcevalues[1][0];
  if (gas != 0) {
    gasupdate();
  }
  const taxes = (revenue * 0.153);
  const carmaint = (miles * 0.40);
  const expenses = gas + taxes + carmaint + otherexpenses;
  const netincome = revenue - expenses;

  var dollarperhour = netincome / hours;
  if (isNaN(dollarperhour) || dollarperhour < -100000) {
    var dollarperhour = 0;  
  }

  var dollarpermile = netincome / miles;
  if (isNaN(dollarpermile) || dollarpermile < -100000) {
    var dollarpermile = 0;
  }

  var dollarpertrip = netincome / trips;
  if (isNaN(dollarpertrip) || dollarpertrip < -100000) {
    var dollarpertrip = 0;
  } 

  var tripsperhour = trips / hours;
  if (isNaN(tripsperhour) || tripsperhour < -100000) {
    var tripsperhour = 0;
  }

  /* Add these new variables to an array that is one row in the "History" sheet */
  toappend = [
    time, netincome, revenue, expenses, taxes, gas, carmaint, dollarperhour, dollarpermile, dollarpertrip, miles, hours, trips, tripsperhour
  ];

  /* Reset the daily inputs to 0 */
  source.setValue(0);
  /* Append the new row to the "History" sheet */
  sheet.appendRow(toappend);

  /* Set the correct date format for the date column */
  const endrange = sheet.getRange("A2:A");
  endrange.setNumberFormat("MM/dd/yyyy");
}

function datesAsRows(daysinpast, daysinfuture) {

  /* Creates two new strings (start date, end date) */
  var start = new Date();
  var start = new Date(start.setDate(start.getDate() - parseInt(daysinpast)));
  var enddate= new Date();
  var enddate = new Date(enddate.setDate(enddate.getDate() + parseInt(daysinfuture)));
  var replacedate = Utilities.formatDate(enddate, "GMT-4", "MM/dd/yyyy");
  var end = new Date(replacedate);

  /* Loop starting from start of the week and ending at end of week */
  /* Create a new array of rows for n days*/
  var weeklydates = [[start]];
  var loop = new Date(start);
  while (loop <= end) {
    weeklydates.push([loop]);
    var newDate = loop.setDate(loop.getDate() + 1);
    loop = new Date(newDate);
  }

  return weeklydates;
}

function weeklyupdate() {

  /* Use getSheetWithRange to find sheets to read and write to */
  var {sheetsource, source} = getSheetWithRange("Job", "History", "I5:O5");

  /* Use the datesAsRows function to write this week and last weeks dates into as an array */
  var thisweek = datesAsRows(7, -1);
  var lastweek = datesAsRows(0, 6);

  /* Transpose the array so that columns are inserted instead of rows */
  /* Write the values into the source sheet for this week and last week */
  var hthisweek = transpose(thisweek);
  source.setValues(hthisweek);

  var source = sheetsource.getRange("I22:O22");
  var hlastweek = transpose(lastweek);
  source.setValues(hlastweek);
}

function monthlyupdate() {

  /* Use getSheetWithRange to find sheets to read and write to */
  var {sheetsource, source} = getSheetWithRange("Job", "History", "D44:D45");


}