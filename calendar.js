var d = new Date();
var g_month = d.getMonth();
var g_year = d.getFullYear();


function free() {
  var calendar_body = document.getElementById("calendar_body");
  var tables = document.getElementsByTagName("table");
  calendar_body.removeChild(tables[0]);
}


function plusMonths(index) {
  var aux = g_month + index;
  if (aux > 11) {
    g_year++;
  } else if (aux < 0) {
    g_year--;
    aux = 11;
  }
  g_month = aux % 12;
  free();
  calendar();
}

function calendar() {
  var month = g_month;
  var year = g_year;
  console.log(g_month + " " + g_year);
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  var firstDayOfMonthDate = new Date(months[month] + " 1 " + year);
  var firstDay = firstDayOfMonthDate.toDateString().substr(0, 3);
  var firstDayNumber = days.indexOf(firstDay);
  var noOfDays = new Date(year, month + 1, 0).toDateString().substr(8, 2);
  console.log("first day " + firstDayNumber);
  console.log("days " + noOfDays);
  get_calendar(firstDayNumber, noOfDays);
  var span = document.getElementById("calendar_span");
  span.innerHTML = months[month] + " " + year;

}

function get_calendar(firstDayNumber, noOfDays) {
  var days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  var table = document.createElement("table");
  var tr = document.createElement("tr");
  for (d = 0; d < 7; d++) {
    var td = document.createElement("td");
    td.innerHTML = days[d];
    td.className = "calendar-days";
    tr.appendChild(td);
  }
  table.appendChild(tr);
  var tmp = Number(firstDayNumber) + Number(noOfDays);
  console.log("tmp " + tmp);
  var numberOfRows = (tmp - (tmp % 7)) / 7 + 1;
  console.log("nr rows " + numberOfRows);

  var zi = 1;

  var tr = document.createElement("tr");
  for (var r = 0; r < 7; r++) {
    var td = document.createElement("td");
    if (r >= firstDayNumber) {
      td.innerHTML = zi;
      td.className = "calendar-box";
      td.setAttribute("tabindex","-1");
      zi++;
    }
    tr.appendChild(td);
  }
  table.appendChild(tr);

  for (var i = 1; i <= numberOfRows - 2; i++) {
    tr = document.createElement("tr");
    for (var r = 0; r < 7; r++) {
      td = document.createElement("td");
      td.innerHTML = zi;
      zi++;
      td.className = "calendar-box";
      td.setAttribute("tabindex","-1");

      tr.appendChild(td);
    }
    table.appendChild(tr);
  }

  var tr = document.createElement("tr");
  for (var r = 0; r < 7; r++) {
    var td = document.createElement("td");
    if (zi <= noOfDays) {
      td.innerHTML = zi;
      zi++;
      td.className = "calendar-box";
      td.setAttribute("tabindex","-1");
    }
    tr.appendChild(td);
  }
  table.appendChild(tr);


  document.getElementById("calendar_body").appendChild(table);
}
