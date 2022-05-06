/** @OnlyCurrentDoc */
function recordHistory() {
	/* Get the spreadsheets we need to work on */
	var ss = SpreadsheetApp.getActiveSpreadsheet();
	/* sheetsource = where the values come from, sheet = where the values go */
	var sheetsource = ss.getSheetByName("Job");
	var sheet = ss.getSheetByName("History");
  
	/* Get the values from said spreadsheets that will be changed */
	var source = sheetsource.getRange("D4:D8");
	var values = source.getValues();
  
	/* Create a whole-lotta variables */
	const time = new Date();
	const revenue = values[0][0];
	const expenses = values[1][0];
	const miles = values[2][0];
	const hours = values[3][0];
	const trips = values[4][0];
  
	const netincome = revenue - expenses;
  
	var dollarperhour = netincome / hours;
	if (isNaN(dollarperhour)) {
	  var dollarperhour = 0;  
	}
  
	var dollarpermile = netincome / miles;
	if (isNaN(dollarpermile)) {
	  var dollarpermile = 0;
	}
  
	var dollarpertrip = netincome / trips;
	if (isNaN(dollarpertrip)) {
	  var dollarpertrip = 0;
	} 
  
	var tripsperhour = trips / hours;
	if (isNaN(tripsperhour)) {
	  var tripsperhour = 0;
	}
	
	/* Add these new variables to an array that is one row */
	toappend = [
	  time, netincome, revenue, expenses, dollarperhour, dollarpermile, dollarpertrip, miles, hours, trips, tripsperhour
	];
  
	/* Reset the daily inputs to 0 */
	source.setValue(0);
	/* Append the new row to the "History" sheet */
	sheet.appendRow(toappend);
  
	/* Set the correct date format for the date column */
	const endrange = sheet.getRange("A2:A");
	endrange.setNumberFormat("MM/dd/yyyy");
  
	console.log(toappend);
  };
  
  function weeklyupdate() {
	/* Get the spreadsheets we need to work on */
	var ss = SpreadsheetApp.getActiveSpreadsheet();
	var sheetsource = ss.getSheetByName("Job")
  
	/* Get the values from said spreadsheets that will be changed */
	var source = sheetsource.getRange("H5:N5");
	var values = source.getValues();
  
	/* Creates two new strings (start of week, end of week) */
	var start = new Date();
	var enddate = "05/XX/2022";
	var replacedate = Utilities.formatDate(new Date(), "GMT-4", "dd");
	var enddate = enddate.replace("XX", parseInt(replacedate) + 7);
	var end = new Date(enddate);
  
	/* Loop starting from start of the week and ending at end of week */
	let loop = new Date(start);
	  while (loop <= end) {
	  console.log(loop);
	  let newDate = loop.setDate(loop.getDate() + 1);
	  loop = new Date(newDate);
  }
  };