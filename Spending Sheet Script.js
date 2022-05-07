/** @OnlyCurrentDoc */
/* Transposes an array (col -> rows, rows -> col). It's magic.*/
function transpose(a)
{
  return Object.keys(a[0]).map(function (c) { return a.map(function (r) { return r[c]; }); });
}

function getSheetWithRange(sheettoread, sheettowrite, range) {
  /* Get the spreadsheet we need to work on */
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  /* sheetsource = where the values come from, sheet = where the values go */
  var sheetsource = ss.getSheetByName(sheettoread);
  var sheet = ss.getSheetByName(sheettowrite);

  /* Get the values from said spreadsheet that will be changed */
  var source = sheetsource.getRange(range);
  var values = source.getValues();

  return {
    sheetsource: sheetsource,
    sheet: sheet,
    source: source,
    values: values,
  };
}

function gasupdate() {

  /* Use getSheetWithRange to find sheets to read and write to */
  var {sheetsource, sheet, source, values} = getSheetWithRange("Job", "History", "D4:D8");

}

function recordHistory() {

  /* Use getSheetWithRange to find sheets to read and write to */
  var {sheetsource, sheet, source, values} = getSheetWithRange("Job", "History", "D4:D8");

  /* Create a whole-lotta variables */
  const time = new Date();
  const revenue = values[0][0];
  const miles = values[2][0];
  const hours = values[3][0];
  const trips = values[4][0];

  const gas = values[1][0];
  const taxes = (revenue * 0.153);
  const carmaint = (miles * 0.40);
  const expenses = gas + taxes + carmaint;
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

  /* Creates a new array for each day in the "Current Week" section to be updated daily */
  currentweek = [
    [netincome], [revenue], [expenses], [taxes], [gas], [carmaint], [dollarperhour], [dollarpermile], [dollarpertrip], [miles], [hours], [trips], [tripsperhour]
  ];

  /* Take the day of the week (Friday, Saturday, etc.) ...*/
  var replacedate = Utilities.formatDate(new Date(), "GMT-4", "EEEE");

  /* ...if match is found, update that range */
  if (replacedate == "Monday") {
    var source2 = sheetsource.getRange("H6:H18");
    sourc2.setValues(currentweek);
  }
  else if (replacedate == "Tuesday") {
    var source2 = sheetsource.getRange("I6:I18");
    source2.setValues(currentweek);
  }
  else if (replacedate == "Wednesday") {
    var source2 = sheetsource.getRange("J6:J18");
    source2.setValues(currentweek);
  }
  else if (replacedate == "Thursday") {
    var source2 = sheetsource.getRange("K6:K18");
    source2.setValues(currentweek);
  }
  else if (replacedate == "Friday") {
    var source2 = sheetsource.getRange("L6:L18");
    source2.setValues(currentweek);
  }
  else if (replacedate == "Saturday") {
    var source2 = sheetsource.getRange("M6:M18");
    source2.setValues(currentweek);
  }
  else if (replacedate == "Sunday") {
    var source2 = sheetsource.getRange("N6:N18");
    source2.setValues(currentweek);
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

  console.log(toappend);
}

function weeklyupdate() {

  /* Use getSheetWithRange to find sheets to read and write to */
  var {source} = getSheetWithRange("Job", "History", "H5:N5");

  /* Creates two new strings (start of week, end of week) */
  var start = new Date();
  var enddate = "05/XX/2022";
  var replacedate = Utilities.formatDate(new Date(), "GMT-4", "dd");
  var enddate = enddate.replace("XX", parseInt(replacedate) + 6);
  var end = new Date(enddate);

  /* Loop starting from start of the week and ending at end of week */
  /* Create a new array for the 7 days of the week to write over current dates once a week */
  var weeklydates = [[start]];
  var loop = new Date(start);
  while (loop <= end) {
    weeklydates.push([loop]);
    var newDate = loop.setDate(loop.getDate() + 1);
    loop = new Date(newDate);
  }

  /* Transpose the array so that columns are inserted instead of rows */
  /* Write the values into the source sheet */
  var tweeklydates = transpose(weeklydates);
  source.setValues(tweeklydates);
}