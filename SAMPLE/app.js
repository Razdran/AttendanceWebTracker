var mainApp = {};
var database = firebase.database();

(function () {

	firebase.auth().onAuthStateChanged(function (user) {
		var firebase = app_fireBase;
		var uid = null;

		if (user) {
			uid = user.uid;
		}
		else {
			uid = null;
			window.location.replace("login.html");
		}
		mainApp.user = user;
		console.log("am setat user");
		mainFlow();
	});

	function logout() {
		firebase.auth().signOut();
	}
	mainApp.logout = logout;
	console.log("am setat logout");
})()

function setPermissions(_uid, _permission) {
	var ref = database.ref("permissions");
	var data = {
		[_uid]: {
			permission: _permission
		}
	}
	ref.push(data);
}
function gotData(data) {
	stored = []
	keys = Object.keys(data.val());
	for (i = 0; i < keys.length; i++)
		permission = data.val()[keys[i]][mainApp.user.uid];
	if (permission != undefined)
		console.log(permission);
}

function checkPermissions() {
	let promise = new Promise((resolve, reject) => {
		userRef = database.ref().child("permissions");
		userRef.on("value", data => {
			keys = Object.keys(data.val());

			for (i = 0; i < keys.length; i++) {
				permission = data.val()[keys[i]][mainApp.user.uid];
				if (permission != undefined) {
					resolve(permission["permission"]);
				}
			}
			resolve(0);
		})
	});

	return promise;
}
function getGrades(_sessionId,_participantId){
	let promise=new Promise((resolve,reject)=>
	{
		gradesRef=database.ref().child("grades");
		gradesRef.on("value",data=>{
			keys = Object.keys(data.val());
			for (i = 0; i < keys.length; i++) 
			{
				if (data.val()[keys[i]]["sessionId"]==_sessionId && data.val()[keys[i]]["participantId"]==_participantId) 
				{
					
					resolve(data.val()[keys[i]]);
				}
			}
		})
	});
	return promise;
}


function createSession(_titlu, _maxPrezente, _sessionCode) {
	console.log("m", mainApp);
	if (mainApp.permission == 1) {

		var ref = database.ref("sessions");
		var data =
		{
			titlu: _titlu,
			organizatorName: mainApp.user.displayName,
			organizatorUID: mainApp.user.uid,
			prezente: 0,
			maxPrezente: _maxPrezente,
			sessionCode: _sessionCode,
			active: 1,
			participants: []
		}
		var result = ref.push(data);
		return result.key;
	}

}

function getSessionById(_sessionId) {
	return firebase.database().ref('/sessions/' + _sessionId).once('value').then(function (result) {
		var object = result.val();
		object.key = _sessionId;
		return object;
	});
}


function updateSession(_sessionId, _maxPrezente, _sessionCode, _active) {
	_sessionId.then(function (result) {
		var updates = {};
		updatedSession = result;
		updatedSession.maxPrezente = _maxPrezente;
		updatedSession.sessionCode = _sessionCode;
		updatedSession.active = _active;
		keyForSession = result.key;
		delete result.key;
		updates['/sessions/' + keyForSession] = updatedSession;
		return firebase.database().ref().update(updates);
	})
}
function checkSubmited(uid, participants) {
	if (participants == undefined)
		return 0;
	else
		for (var p = 0; p < participants.length; p++) {
			if (participants[p].id == uid)
				return 1;
		}
	return 0;
}
function evaluate(_uid,_sessionId,_grade,_feedback)
{
	_sessionId.then(function(result)
	{
		var updates={};
		updatedSession=result;
		for(var i=0;i<updatedSession.participants.length;i++)
		{
			if(updatedSession.participants[i].id==_uid)
			{
				updatedSession.participants[i].grade=_grade;
				updatedSession.participants[i].feedback=_feedback;
			}
		}
		keyForSession=result.key;
		delete result.key;
		updates['/sessions/' + keyForSession] = updatedSession;
		return firebase.database().ref().update(updates);
	})
	
}
function importStudentFromCSV(_sessionId,_dateCSV)
{
	_sessionId.then(function(result){
		console.log(result);
		console.log("r",result);
		var updates={};
		updatedSession=result;
		updatedSession.prezente=updatedSession.prezente+_dateCSV.length;
		console.log("prezente",updatedSession.prezente);
		if (updatedSession.participants == undefined) {
			updatedSession.participants = [];
		}
		console.log("up",updatedSession.participants);
		for(var i=0;i<_dateCSV.length;i++)
		{
			_numeStudent=_dateCSV[i][0];
			_gradeStudent=_dateCSV[i][1];
			_feedbackStudent=_dateCSV[i][2];
			console.log(_numeStudent,_gradeStudent,_feedbackStudent);
			updatedSession.participants=updatedSession.participants.concat(
			[{
						id: "imported",
						name: _numeStudent,
						grade:_gradeStudent,
						feedback:_feedbackStudent,
						time: new Date().getTime()
					}]);
		}
		
		keyForSession = result.key;
		delete result.key;
		document.getElementById(keyForSession).childNodes[2].childNodes[0].innerHTML = updatedSession.prezente + "/" + updatedSession.maxPrezente;
		updates['/sessions/' + keyForSession] = updatedSession;
		return firebase.database().ref().update(updates);
		
	});
}
function participate(_sessionId) {
	_sessionId.then(function (result) {
		if (result.prezente < result.maxPrezente) {
			if (checkSubmited(mainApp.user.uid, result.participants) == 0) {
				console.log("participate" + _sessionId);
				var updates = {};
				updatedSession = result;
				updatedSession.prezente++;
				console.log(result);
				if (updatedSession.participants == undefined) {
					updatedSession.participants = [];
				}
				updatedSession.participants = updatedSession.participants.concat(
					[{
						id: mainApp.user.uid,
						name: mainApp.user.displayName,
						grade:0,
						feedback:"Please wait for review",
						time: new Date().getTime()
					}]);
				keyForSession = result.key;
				console.log(keyForSession);
				document.getElementById(keyForSession).childNodes[2].childNodes[0].innerHTML = updatedSession.prezente + "/" + updatedSession.maxPrezente;
				img=document.createElement("img");
				img.setAttribute("src","check.svg");
				img.id="checkMark";
				document.getElementById(keyForSession).appendChild(img);
				delete result.key;
				updates['/sessions/' + keyForSession] = updatedSession;
				return firebase.database().ref().update(updates);
			}
			else {
				console.log(mainApp.user.displayName + " has been already submitted");
			}
		}
		else {
			console.log("s-au terminat locurile");
		}

	})
}

function renderSession(sessionId) {
	getSessionById(sessionId).then((session) => {
		var loader = document.getElementById("loader-container");
		loader.style.display = "none";
		console.log("si",sessionId);
		console.log(mainApp.permission, session.organizatorUID, session.active);
		if ((mainApp.permission == 1 && session.organizatorUID == mainApp.user.uid) || (mainApp.permission == 0 && session.active == 1)) {
			console.log("s", session);
			dashboard = document.getElementById("dashboard");
			card = document.createElement("div");
			card.id = sessionId;
			card.className = "card";
			card.style.position="relative";
			card.setAttribute("onclick", "sessionPopUp(\"" + card.id + "\");")
			dashboard.appendChild(card);
			titlu = document.createElement("div");
			titlu.className = "titlu";
			titluSpan = document.createElement("span");
			titluSpan.className = "titluSpan";
			titluSpan.innerHTML = session.titlu;
			card.appendChild(titlu);
			titlu.appendChild(titluSpan);
			organizator = document.createElement("div");
			organizator.className = "organizator";
			organizatorSpan = document.createElement("span");
			organizatorSpan.className = "organizatorSpan";
			organizatorSpan.innerHTML = session.organizatorName;
			card.appendChild(organizator);
			organizator.appendChild(organizatorSpan);
			prezente = document.createElement("div");
			prezente.className = "prezente";
			prezenteSpan = document.createElement("span");
			prezenteSpan.className = "prezenteSpan";
			prezenteSpan.innerHTML = session.prezente + "/" + session.maxPrezente;
			card.appendChild(prezente);
			prezente.appendChild(prezenteSpan);
			if(mainApp.permission==0)
			{
			if(checkSubmited(mainApp.user.uid,session.participants)==1)
			{
				img=document.createElement("img");
				img.setAttribute("src","check.svg");
				img.id="checkMark";
				card.appendChild(img);
			}
			}
		}
	});
}
function getSessionKeyes() {
	lista = [];
	let promise = new Promise((resolve, reject) => {
		userRef = database.ref().child("sessions");
		userRef.on("value", data => {
			keys = Object.keys(data.val());
			resolve(keys);
		});
	});
	return promise;
}
function renderAllSessions() {
	getSessionKeyes().then(function (keys) 
	{
		for (var k = 0; k < keys.length; k++) {
			renderSession(keys[k]);
		}
	});


}

function updateSession(_sessionId, _maxPrezente, _sessionCode, _active) {
	_sessionId.then(function (result) {
		var updates = {};
		updatedSession = result;
		updatedSession.maxPrezente = _maxPrezente;
		updatedSession.sessionCode = _sessionCode;
		updatedSession.active = _active;
		keyForSession = result.key;
		delete result.key;
		updates['/sessions/' + keyForSession] = updatedSession;
		return firebase.database().ref().update(updates);
	})
}

function generateSessionCode() {
	var text = "";
	var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
	for (var i = 0; i < 6; i++) {
		text += letters.charAt(Math.floor(Math.random() * letters.length))
	}
	return text;
}

function createGrade(_participantId, _participantName, _sessionId, _feedback, _grade) {
	if (mainApp.permission == 1) {

		var ref = database.ref("grades");
		var data =
		{
			participantId: _participantId,
			participantName: _participantName,
			sessionId: _sessionId,
			feedback: _feedback,
			grade: _grade
		}
		var result = ref.push(data);
		return result.key;
	}
}
function sessionPopUp(_sessionId) {
	if (mainApp.permission == 1) {
		getSessionById(_sessionId).then((session) => {
			console.log("organizator" + _sessionId);
			document.getElementById('viewPresence').style.display='block';
			document.getElementById("Title").value=session.titlu;
			document.getElementById("Max").value=session.maxPrezente;
			document.getElementById("Code").value=session.sessionCode;
			if(session.active==1)
				document.getElementById("checkActive").checked=true;
			else
				document.getElementById("checkActive").checked=false;
			//console.log(session.participants[0]);
			
			table=document.getElementById("studentsTable");
			if(table!=undefined)
			{
			table.remove();
			console.log("remove");
			}
			if(session.participants!=undefined)
			{
				table=document.createElement("table");
				table.id="studentsTable";
				parinte=document.getElementById("updateForm");
				parinte.appendChild(table);
				
				tr=document.createElement("tr");
				th1=document.createElement("th");
				th1.innerHTML="Name";
				th2=document.createElement("th");
				th2.innerHTML="Grade";
				th3=document.createElement("th");
				th3.innerHTML="Feedback";
				tr.appendChild(th1);
				tr.appendChild(th2);
				tr.appendChild(th3);
				table.appendChild(tr);
			for(var i=0;i<session.participants.length;i++)
			{
				console.log(session.participants[i]);
				tr=document.createElement("tr");
				td1=document.createElement("td");
				td1.id="linia"+i+"coloana0";
				input1=document.createElement("input");
				input1.className="inputEditing";
				input1.id="input"+td1.id;
				input1.setAttribute("type","text");
				input1.value=session.participants[i].name;
				td1.setAttribute("onclick","editing(\""+td1.id+"\")");
				td1.appendChild(input1);
				
				td2=document.createElement("td");
				td2.id="linia"+i+"coloana1";
				input2=document.createElement("input");
				input2.className="inputEditing";
				input2.id="input"+td2.id;
				input2.setAttribute("type","text");
				_grade=session.participants[i].grade;
				if(_grade==0)
				{
					_grade="";
				}
				input2.value=_grade;
				td2.setAttribute("onclick","editing(\""+td2.id+"\")");
				td2.appendChild(input2);
				
				td3=document.createElement("td");
				td3.id="linia"+i+"coloana2";
				input3=document.createElement("input");
				input3.className="inputEditing";
				input3.id="input"+td3.id;
				input3.setAttribute("type","text");
				_feedback=session.participants[i].feedback;
				console.log("_feedback "+_feedback);
				if(_feedback=="Please wait for review")
				{
					_feedback="";
				}
				input3.value=_feedback;
				td3.setAttribute("onclick","editing(\""+td3.id+"\")");
				td3.appendChild(input3);
				
				tr.appendChild(td1);
				tr.appendChild(td2);
				tr.appendChild(td3);
				table.appendChild(tr);
			}
			}
			submitBtn=document.getElementById("create2");
			submitBtn.addEventListener("click",function(){
					console.log("click");
					if(session.participants!=undefined)
					{
					for(i=0;i<session.participants.length;i++)
					{
							var uid=session.participants[i].id;
							var nume=document.getElementById("inputlinia"+i+"coloana0").value;
							var feedback=document.getElementById("inputlinia"+i+"coloana2").value;
							if(feedback=="")
							feedback="none";
							let grade=document.getElementById("inputlinia"+i+"coloana1").value;
							if(grade=="")
							grade=0;
							
							//console.log(uid,nume,_sessionId,feedback,grade);
							//createGrade(uid,nume,_sessionId,feedback,grade);
							evaluate(uid,getSessionById(_sessionId),grade,feedback);
					}
					}
						closePopUpById('viewPresence');
			});
			
			checkBox=document.getElementById("checkActive");
			checkBox.addEventListener("change",function(){
				if(this.checked) 
				{
						updateSession(getSessionById(_sessionId), session.maxPrezente, session.sessionCode, 1);
				} 
				else 
				{
						updateSession(getSessionById(_sessionId), session.maxPrezente, session.sessionCode, 0);
				}
			});
			
			
			
		})
	}
	else {
		getSessionById(_sessionId).then((session) => {
			console.log("participant" + _sessionId);
			if(checkSubmited(mainApp.user.uid,session.participants)==0){
				document.getElementById('code').value="";
				document.getElementById('submitPresence').style.display = 'block';
				let btn = document.getElementById('submitPresenceBtn');
				btn.addEventListener("click", function () {
					
					if (document.getElementById('code').value == session.sessionCode) {
						participate(getSessionById(_sessionId));
						showSnackbar("Participated at "+session.titlu);
						closePopUpById('submitPresence');
					}
					else{
						showSnackbar('Partticipate fail');
					}
						
				})
			}
			else{
				document.getElementById('seeGrades').style.display = 'block';
				document.getElementById("myGrades").innerHTML="not evaluated";
				document.getElementById("myFeedback").innerHTML="Please wait for feedback";
				getSessionById(_sessionId).then((sesion)=>{
					for(var i=0;i<session.participants.length;i++)
					{
						if(session.participants[i].id==mainApp.user.uid)
						{
							_grade=session.participants[i].grade;
							_feedback=session.participants[i].feedback;
						}
					}
					document.getElementById("myGrades").innerHTML=_grade;
					document.getElementById("myFeedback").innerHTML=_feedback;
				});
				
			}
		})

	}
}

function editing(id){
	var cell=document.getElementById(id);
	console.log("class",cell);
	if(cell.className!="editing")
	{
	
	cell.className="editing";
	console.log("editing "+id);
	}
}
function setup() {
btngroup=document.getElementById("btn-group");
if(mainApp.permission==1)
{


	addbtn=document.createElement("button");
	addbtn.className="button";
	addbtn.id="addClass";
	addbtn.setAttribute("onclick","popUp()");
	addbtn.style.width="auto";
	addbtn.innerHTML="Create a new session";
	btngroup.appendChild(addbtn);

	
	
	chartbtn=document.createElement("button");
	chartbtn.className="button";
	chartbtn.id="viewChart";
	chartbtn.setAttribute("onclick","popUpfilter()");	
	chartbtn.style.width="auto";
	chartbtn.innerHTML="Create Chart";
	btngroup.appendChild(chartbtn);

	importbtn=document.createElement("button");
	importbtn.className="button";
	importbtn.id="import";
	importbtn.setAttribute("onclick","popUpImport()");
	importbtn.style.width="auto";
	importbtn.innerHTML="Import";
	btngroup.appendChild(importbtn);
	
	exportbtn=document.createElement("button");
	exportbtn.className="button";
	exportbtn.id="export";
	exportbtn.setAttribute("onclick","popUpExport()");
	exportbtn.style.width="auto";
	exportbtn.innerHTML="Export";
	btngroup.appendChild(exportbtn);

}
console.log(mainApp.user.displayName);
p=document.createElement("p");
p.id="username";
p.innerHTML=mainApp.user.displayName;
p.style.color="white";
header=document.getElementsByClassName("header")[0];
header.appendChild(p);
//       <button class="button" id="addClass" onclick="popUp()" style="width: auto">Create a new class</button>


}

//setPermissions("dCJ8S4gZk1b9zffvWOHB03qWkKr2",1);
//setPermissions("yARRnkFD9KQpeakT4Jth1Vimmur2",0);
async function getInfoByKeys(keys){
	sessions=[];
	for (var k = 0; k < keys.length; k++) 
		{
			_session = await getSessionById(keys[k]);
			sessions.push(_session);

		}
	return sessions;
	
}

async function getJSON()
{
	keys = await getSessionKeyes();
	infos = await getInfoByKeys(keys);
	sessionsJSON=JSON.stringify(infos,null,2);
	return sessionsJSON;	
}

async function downloadJSON()
	//var Dropbox = require('dropbox').Dropbox;
{
	//driveApi();
	//getAccesTokenDropBox()
	data=await getJSON();
	var blob=new Blob([data],{type:"text/plain"});
	a=document.createElement('a');
	a.href=window.URL.createObjectURL(blob);
	a.download="sessions.json";
	document.body.appendChild(a);
	a.click();
	a.remove();
	
}

function getHTML5(data)
{
	html="";
	html=html+"<html>\n";
	html=html+"<head>\n";
	html=html+"<style>\n";
	html=html+"table \n{\nwidth: 60%;\nmargin: auto;\n}\ntable, th, td \n{\n border: 1px solid black;}\n";
	html=html+"</style>\n";
	html=html+"</head>\n";
	html=html+"<body>\n";
	for(i=0;i<data.length;i++)
	{
		html=html+"<h1 itemtype=https://schema.org/Event itemprop=event>"+data[i].titlu+"</h1>\n";
		html=html+"<h2 itemtype=http://schema.org/Person itemprop=name>"+data[i].organizatorName+"</h2>\n";
		participants=data[i].participants;
		if(participants!=undefined)
		{
			html=html+"<table>\n";
			html=html+"<tr><th>Name</th><th>Grade</th><th>Feedback</th></tr>\n";
			for(j=0;j<participants.length;j++)
			{
				html=html+"<tr>\n";
				html=html+"<td itemtype=http://schema.org/Person itemprop=name>"+participants[j].name+"</td>\n";
				html=html+"<td itemtype=http://schema.org/Rating itemprop=ratingValue>"+participants[j].grade+"</td>\n";
				html=html+"<td itemtype=https://schema.org/Review itemprop=review>"+participants[j].feedback+"</td>\n";
				html=html+"</tr>\n";
			}
			html=html+"</table>\n";
		}
		html=html+"<hr/>\n"
	}
	html=html+"</body>\n";
	html=html+"</html>\n";
	return html;
}

async function downloadHTML5()
{
	keys = await getSessionKeyes();
	data = await getInfoByKeys(keys);
	html=getHTML5(data);
	console.log(html);
	var blob=new Blob([html],{type:"text/plain"});
	a=document.createElement('a');
	a.href=window.URL.createObjectURL(blob);
	a.download="sessions.html";
	document.body.appendChild(a);
	a.click();
	a.remove();
}
async function mainFlow() {
	mainApp.permission = await checkPermissions();
	mainApp.validLocation;
	//createSession("test2",20,"carapace");	
	//renderSession(id);
	//updateSession(getSessionById('-LX-ao8-BBskH1UwAfTl'), 30, 'Cacat', 0);
	//createSession("test",15,generateSessionCode());
	//gapi.load('client',initClient);
	driveApiSetUp();
	setup();
	renderAllSessions();
	getLocation();
	//console.log(mainApp.validLocation);
	//driveApi();
	//create a new session
	btn=document.getElementById('create');
	btn.addEventListener("click",function(){
		title=document.getElementById("newTitle").value;
		max=document.getElementById("newMax").value;
		code=document.getElementById("newCode").value;
		newSession=createSession(title,max,code);
		renderSession(newSession);
		closePopUpById('createClass');
	})

	btn2=document.getElementById("generateCodeBtn");
	btn2.addEventListener("click",function(){
		document.getElementById("newCode").value=generateSessionCode();
	});
}

function closePopUpById(id){
	document.getElementById(id).style.display='none';
}




async function prepareFilters(iname,_id)
{  	
	json=await getJSON();
	sessions=JSON.parse(json);
  var avSessions=[];
  var k=-1;
  for (var i=0;i<sessions.length;i++)
  {
    if(sessions[i].organizatorName==iname)
    {
      k++;
      avSessions[k]=sessions[i].titlu;
    }
	}
	
  id=document.getElementById(_id);
  if(k!=-1)
  {
    for(var j=0;j<=k;j++)
    { 
      addbtn=document.createElement("input");
	    addbtn.type="checkbox";
      addbtn.id=avSessions[j];
      addbtn.className="checkBox";
      paragraf=document.createElement("p")
      paragraf.innerHTML=avSessions[j];
      paragraf.style.width="auto";
      paragraf.style.display="inline-block";
			paragraf.style.marginLeft="20px";
			console.log("aici e id:");
			console.log(_id);
      id.appendChild(paragraf);
      id.appendChild(addbtn);
    }
  }
}

function popUpfilter(){
  prepareFilters(mainApp.user.displayName,"availableSessions");//Aici trebuie pus id-ul profesorului logat
  document.getElementById('createChart').style.display='block';
  
}

function popUpExport(){
	document.getElementById('exportForm').style.display='block';
}
function popUpImport(){
	document.getElementById('importForm').style.display='block';
	prepareImportSessions();
}
function closePopUpfilter(){
  document.getElementById('createChart').style.display='none';
  
}
function getCheckedSessions()
{
  var lista=[];
  var result=[];
  var k=-1;
  lista=document.getElementsByClassName("checkBox");
  
  for (var i=0;i<lista.length;i++)
  {
    if(lista[i].checked==true)
    {
      
      k++;
      result[k]=lista[i].id;
    }
  }
  
  return result;
}
function getMarkInterval()
{
  var result=[];
  result[1]=document.getElementById("minGrade").value;
  result[2]=document.getElementById("maxGrade").value;
  if((result[1]==null||result[1]=="")&&(result[2]==null||result[2]==""))
    result[0]=1;//used to see which intervals are default
  else
    result[0]=0;
  
  if(result[1]==null||result[1]=="")
    result[1]=0;
  if(result[2]==null||result[2]=="")
    result[2]=20;


  return result;
}

function getTimeInterval(){
  var time=new Date().getTime();
  var result=[];

  result[1]=document.getElementById("startTime").value;
  result[2]=document.getElementById("endTime").value;

  if((result[1]==null||result[1]=="")&&(result[2]==null||result[2]==""))
    result[0]=1;//used to see which intervals are default
  else
    result[0]=0;
  
  if(result[1]==null||result[1]=="")
    result[1]=0;
  if(result[2]==null||result[2]=="")
    result[2]=time;

  return result;
}

function getPassed(){
result= document.getElementById("isPassed");
if(result.checked==true)
  return true;
  else
  return false;
}

function getPredefinedChart()
{
  var selection=document.getElementById("predefinedChart");

  return selection.options[selection.selectedIndex].value;
}

function renderChart(_idChart,_titlu,_legend,_data,_labels)
{
	let canvas=document.getElementById('myChart');
  var form=document.getElementById('chartContainer');
	canvas.remove();
	var canvas1=document.createElement('canvas');
  canvas1.id='myChart';
  form.appendChild(canvas1);
	let myChart = document.getElementById('myChart').getContext('2d');
	
	// Global Options
    Chart.defaults.global.defaultFontFamily = 'Lato';
    Chart.defaults.global.defaultFontSize = 18;
    Chart.defaults.global.defaultFontColor = '#777';

    let massPopChart = new Chart(myChart, {
      type:'bar', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
      data:{
        labels:_labels,
        datasets:[{
          label:_legend,
          data:_data,
          backgroundColor:'rgb(0,134,99)',
          borderWidth:1,
          borderColor:'#777',
          hoverBorderWidth:3,
          hoverBorderColor:'#000'
        }]
      },
      options:{
        title:{
          display:true,
          text:_titlu,
          fontSize:25
        },
        legend:{
          display:true,
          position:'right',
          labels:{
            fontColor:'#000'
          }
        },
        layout:{
          padding:{
            left:50,
            right:0,
            bottom:0,
            top:0
          }
        },
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Grade'
            }
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Number of students'
            }
          }],
        },     
        tooltips:{
          enabled:true
        }
      }
    });
}
function renderLineChart(_idChart,_titlu,_legend,_data,_labels,_noGrades)
{
	
	let canvas=document.getElementById('myChart');
  var form=document.getElementById('chartContainer');
	canvas.remove();
	var canvas1=document.createElement('canvas');
  canvas1.id='myChart';
  form.appendChild(canvas1);
	let myChart = document.getElementById('myChart').getContext('2d');
		
	// Global Options
    Chart.defaults.global.defaultFontFamily = 'Lato';
    Chart.defaults.global.defaultFontSize = 18;
    Chart.defaults.global.defaultFontColor = '#777';

    let massPopChart = new Chart(myChart, {
      type:'line', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
      data:{
      
        labels:_labels,
        datasets:[{
          label:_legend,
          data:_data,
          borderWidth:3,
          borderColor:'rgb(0,134,99)',
          hoverBorderWidth:3,
          hoverBorderColor:'#000'
        },
         {
          label:'Gauss',
          data:[0.001*_noGrades,0.005*_noGrades,0.02*_noGrades,0.05*_noGrades,0.1*_noGrades,
            0.15*_noGrades,0.2*_noGrades,0.2*_noGrades,0.15*_noGrades,
            0.1*_noGrades,0.05*_noGrades,0.02*_noGrades,0.005*_noGrades,0.001*_noGrades],
          borderWidth:3,
          borderColor:'red',
          hoverBorderWidth:3,
          hoverBorderColor:'#000'
        }]
      },
      options:{
        title:{
          display:true,
          text:_titlu,
          fontSize:25
        },
        legend:{
          display:true,
          position:'right',
          labels:{
            fontColor:'#000'
          }
        },
        layout:{
          padding:{
            left:50,
            right:0,
            bottom:0,
            top:0
          }
        },
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Grade'
            }
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Number of students'
            }
          }],
        },     
        tooltips:{
          enabled:true
        }
      }
    });
}


function renderDoughnutChart(_idChart,_titlu,_legend,_data,_labels)
{
	
	let canvas=document.getElementById('myChart');
  var form=document.getElementById('chartContainer');
	canvas.remove();
	var canvas1=document.createElement('canvas');
  canvas1.id='myChart';
  form.appendChild(canvas1);
	let myChart = document.getElementById('myChart').getContext('2d');
		// Global Options
    Chart.defaults.global.defaultFontFamily = 'Lato';
    Chart.defaults.global.defaultFontSize = 18;
    Chart.defaults.global.defaultFontColor = '#777';

    let massPopChart = new Chart(myChart, {
      type:'doughnut', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
      data:{
        labels:_labels,
        datasets:[{
          label:_legend,
          data:_data,
          backgroundColor:['rgb(0,134,99)','#00989a'],
          borderWidth:1,
          borderColor:'#777',
          hoverBorderWidth:3,
          hoverBorderColor:'#000'
        }]
      },
      options:{
        title:{
          display:true,
          text:_titlu,
          fontSize:25
        },
        legend:{
          display:true,
          position:'right',
          labels:{
            fontColor:'#000'
          }
        },
        layout:{
          padding:{
            left:50,
            right:0,
            bottom:0,
            top:0
          }
        },
        tooltips:{
          enabled:true
        }
      }
    });
}

function createArraysForChartNothingSelected(sessions)
{

	rezultat={};
	note=[];
	for (var j=0;j<=12;j++)
		note[j]=0;
	for(var i=0;i<sessions.length;i++)
	{	
		if(sessions[i].participants!=undefined)
		{
      for(var o=0;o<sessions[i].participants.length;o++)
		    if(sessions[i].participants[o].grade!=0&& sessions[i].participants[o].time!=0 )
		    {
			    note[parseInt(sessions[i].participants[o].grade)]+=1;
		    }
	  }
	}
	rezultat["note"]=note;
	console.log(rezultat);
	
	return rezultat;
}

function  getArrayforFilteredChart(sessions,i_sesiuniMarcate,i_intervalNote,i_intervalTimp,i_trecut_picat)
{
  rezultat={};
  note=[];
  min_nota=0;
  max_nota=20;
  min_timp=0;
  max_timp=new Date().getTime(); 
  if(i_intervalNote[0]==0)
  {
    

    min_nota=i_intervalNote[1];
    max_nota=i_intervalNote[2];
    //filtru pe interval note
  
    
    console.log("interval note in chart:");
    console.log(min_nota);
    console.log(max_nota);
  }
  if(i_trecut_picat==true&&min_nota<5)
    min_nota=5;
    //filtru studenti trecuti
  if(i_intervalTimp[0]==0)
  {
    min_timp=i_intervalTimp[1];
    max_timp=i_intervalTimp[2];
    //filtru timp
  }





  for (var j=0;j<=20;j++)
    note[j]=0;
    
	for(var i=0;i<sessions.length;i++)
	{	
    if(i_sesiuniMarcate.length==0)
		{
      if(sessions[i].participants!=undefined)
		  {
        for(var o=0;o<sessions[i].participants.length;o++)
		    if(sessions[i].participants[o].grade!=0 && sessions[i].participants[o].time!=0 )
		    {
          
          if(parseInt(sessions[i].participants[o].grade)>=min_nota&&
            parseInt(sessions[i].participants[o].grade)<=max_nota&&
            sessions[i].participants[o].time>=min_timp&&
            sessions[i].participants[o].time<=max_timp
            )//trebuie adaugata conditia pentru timp
			      {
              console.log("Am gasit o nota care se potriveste");
			        note[parseInt(sessions[i].participants[o].grade)]+=1;
            }
        }
      }
    }
    else
    { ok=0;
      for(var j=0;j<i_sesiuniMarcate.length;j++)
        if(sessions[i].titlu==i_sesiuniMarcate[j])
          ok=1;
      if(ok==1)
      {
        console.log("intru aici");
        if(sessions[i].participants!=undefined)
        {	
					for(var o=0;o<sessions[i].participants.length;o++)
          if(sessions[i].participants[o].grade!=0)
          {
            if(parseInt(sessions[i].participants[o].grade)>=min_nota&&
              parseInt(sessions[i].participants[o].grade)<=max_nota
              )//trebuie adaugata conditia pentru timp
              note[parseInt(sessions[i].participants[o].grade)]+=1;
          }
        } 
      }
    }
  }
  
  rezultat["note"]=note;
  rezultat["intervalNotaremin"]=min_nota;
  rezultat["intervalNotaremax"]=max_nota;
   
	console.log(rezultat);
	
	return rezultat;

}



async function chart(_predefinedChart,_sesiuniMarcate,_intervalNote,_intervalTimp,_trecut_picat){
	json=await getJSON();
	sessions=JSON.parse(json);
	console.log("Aici e jsonul:");
	console.log(sessions);
	var l;
  if(_predefinedChart!="SelectValue")
  {
    if(_predefinedChart=="StudentiTrecuti")
    {
      var a_intervalNote=[];
      var a_intervalTimp=0;
      var a_trecut_picat;
      a_intervalNote[0]=1;
      a_intervalTimp[0]=1;
      a_trecut_picat=false;

      var labels=[];
      var titlu;
      var legenda;


      datas=getArrayforFilteredChart(sessions,_sesiuniMarcate,a_intervalNote,a_intervalTimp,a_trecut_picat);
      inote=datas.note;
      labels[0]="Picati";
      labels[1]="trecuti";
      titlu="studenti trecuti/picati";
      legenda="No of students";

      var da=0;
      var nu=0;
      for(var h=0;h<inote.length;h++)
        if(h>=5)
          da+=inote[h];
        else
          nu+=inote[h];

      var data=[];
      data[0]=nu;
      data[1]=da;
      renderDoughnutChart("myChart",titlu,legenda,data,labels);  
    }
  
    else if(_predefinedChart=="NotePuseAcumOORA")
    {
      var d = new Date();
      var n = d.getTime();
      _intervalTimp[1]=d-3600000;
      _intervalTimp[0]=0;
      
      datas=getArrayforFilteredChart(sessions,_sesiuniMarcate,_intervalNote,_intervalTimp,_trecut_picat);
      inote=datas.note;
      min=parseInt(datas.intervalNotaremin);
      var data=[];

      for(l=0;l<=parseInt(datas.intervalNotaremax)-parseInt(datas.intervalNotaremin);l++)
        {
          data[l]=inote[l+min];
        }
      labels=[];
      k=0;
      for(var i=parseInt(datas.intervalNotaremin);i<=parseInt(datas.intervalNotaremax);i++)
       labels[k++]=i;
    
      titlu="Note puse studentilor care s-au trecut prezenti in urma cu o ora";
      legenda="No of students";

      renderChart("myChart",titlu,legenda,data,labels); 
    }

    else if(_predefinedChart=="CompareGauss")
    {
		_intervalTimp[0]=1;
		_intervalNote[0]=1;
		datas=getArrayforFilteredChart(sessions,_sesiuniMarcate,_intervalNote,_intervalTimp,_trecut_picat);
	  data=datas.note;
    //data are toate notele ;

    labels=[];
  	for(var i=0;i<=12;i++)
	  	labels[i]=i;
  	titlu="Punctaje";
	  legenda="No of Students";
    var i_noGrades=0;
    for(var j=0;j<data.length;j++)
      i_noGrades+=parseInt(data[j]);
	  renderLineChart("myChart",titlu,legenda,data,labels,i_noGrades);
    }

  }

  else if(_sesiuniMarcate.length==0&&_intervalNote[0]==1&&_intervalTimp[0]==1&&_trecut_picat==false)
  {
	  datas=createArraysForChartNothingSelected(sessions);
	  data=datas.note;
    //data are toate notele ;

    labels=[];
  	for(var i=0;i<=12;i++)
	  	labels[i]=i;
  	titlu="Punctaje";
	  legenda="No of Students";

	  renderChart("myChart",titlu,legenda,data,labels);
  }
  else 
  {
    
    //All the oder cases!!!
    datas=getArrayforFilteredChart(sessions,_sesiuniMarcate,_intervalNote,_intervalTimp,_trecut_picat);
    inote=datas.note;
    min=parseInt(datas.intervalNotaremin);
    var data=[];

    for(l=0;l<=parseInt(datas.intervalNotaremax)-parseInt(datas.intervalNotaremin);l++)
      {data[l]=inote[l+min];
      }
    labels=[];
    k=0;
    for(var i=parseInt(datas.intervalNotaremin);i<=parseInt(datas.intervalNotaremax);i++)
      labels[k++]=i;
    
    titlu="Punctaje";
    legenda="No of students";

    renderChart("myChart",titlu,legenda,data,labels);
  }
}


function driveApiSetUp()
{
	gapi.load('client',initClient);
	mainApp.drive={};
}
function driveApi(request,parameter,callback)
{
    if (mainApp.drive.GoogleAuth.isSignedIn.get()) {
	  getFilesGoogleDriveAPI(true,request,parameter,callback);
    } else {
      mainApp.drive.GoogleAuth.signIn();
    }	
}
function initClient() {
  gapi.client.init({
      'apiKey': 'AIzaSyBIyNqDsAM89uWl0XkYLo4g3c_bSUjxBK4',
      'clientId': '47040115686-1j6puaaii11gsoklbndo1la91hv739qf.apps.googleusercontent.com',
      'scope': 'https://www.googleapis.com/auth/drive.readonly',
      'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/drive/v2/rest']
  }).then(function () {
      mainApp.drive.GoogleAuth = gapi.auth2.getAuthInstance();
      mainApp.drive.GoogleAuth.isSignedIn.listen(getFilesGoogleDriveAPI);
  });
}
async function getCSVFilesMetadataFromDrive()
{
		
		if(mainApp.drive.isAuthorized)
		{
			gapi.client.drive.files.list().then((response)=>{
				_items=response.result.items;
				console.log(_items);
				console.log(typeof(_items));
				console.log(_items[0].title)
				//console.log(_items.length);
				
				list_title=[];
				list_id=[];
				
				for(var i=0;i<_items.length;i++)
				{	
					if(_items[i].fileExtension=="csv")
					{
						list_title[i]=_items[i].title;
						list_id[i]=_items[i].id;
					}
				}
				csvSelectId=document.getElementById('googleDriveFiles');
				for(var i=0;i<list_title.length;i++)
				{	
					option=document.createElement("option");
					option.value=list_title[i];
					option.id=list_id[i];
					option.innerHTML=list_title[i];
					csvSelectId.appendChild(option);
				}
			});
		}
		else{
			mainApp.drive.GoogleAuth.signIn();
		}
	
}
async function sendAuthorizedApiRequest(parameter,callback) {
	searchTitle=parameter.drive_file_text;
  if (mainApp.drive.isAuthorized) {
	gapi.client.drive.files.list().then((response)=>{
		var googleDriveFiles=response.result.items;
		console.log(googleDriveFiles);
		for(var i=0;i<googleDriveFiles.length;i++)
		{
			if(googleDriveFiles[i].title==searchTitle)
			{
				searchedId=googleDriveFiles[i].id;
				console.log(googleDriveFiles[i].id,googleDriveFiles[i].title);
				break;
			}
		}
		var accessToken = gapi.auth.getToken().access_token;
		gapi.client.drive.files.get({
			fileId:searchedId,
			alt:"media",
		}).then((response)=>{
			callback(response.body,parameter);
			//downloadFile(response.result,console.log);
		})
	})
  } else {
    mainApp.drive.GoogleAuth.signIn();
  }
}
async function getFilesGoogleDriveAPI(isSignedIn,request,parameter,callback) {
  if (isSignedIn) {
    mainApp.drive.isAuthorized = true;
	if(request=="file_content")
	{
		sendAuthorizedApiRequest(parameter,callback);
	}
	if(request=="csv_metadata")
	{
		getCSVFilesMetadataFromDrive();
	}
  } else {
    mainApp.drive.isAuthorized = false;
  }
}

async function doit()
{
  var predefinedChart=await getPredefinedChart();
	var sesiuniMarcate=await getCheckedSessions();
  var intervalNote=await getMarkInterval();
  var intervalTimp=await getTimeInterval();
  var trecut_picat=await getPassed();
  console.log("checkboxuri marcate: ");
  console.log(sesiuniMarcate.length);
  console.log("si anume:");
  console.log(sesiuniMarcate);

  console.log("interval note: ");
  console.log(intervalNote[1]);
  console.log(", ");
  console.log(intervalNote[2]);

  
  console.log("interval timp: ");
  console.log(intervalTimp[1]);
  console.log(", ");
  console.log(intervalTimp[2]);

  console.log("afiseaza doar studentii trecuti:");
  console.log(trecut_picat);    

  console.log("predefined:");
  console.log(predefinedChart); //if the value is SelectValue do nothing!!
	

  chart(predefinedChart,sesiuniMarcate,intervalNote,intervalTimp,trecut_picat);
}

function downloadButtonFunction(){
	jsonchecked=document.getElementById('checkToExportJson');
	htmlchecked=document.getElementById('checkToExportHtml');

	if(jsonchecked.checked==true)
	{
		downloadJSON();
	}

	if(htmlchecked.checked==true)
	{
		downloadHTML5();
	}
	showSnackbar("Data Downloaded");
	closePopUpById("exportForm");
}
function processCSV(file,parameter)
{
	/*console.log("file",file);
	console.log("sesId",parameter.session_id);
	console.log("file text",parameter.drive_file_text);
	console.log("file id",parameter.drive_file_id);*/
	var liniiCSV=file.split("\n");
	var dateCSV=[];
	for(var i=0;i<liniiCSV.length-1;i++)
	{
			var dateLinieCSV=liniiCSV[i].split(",");
			if(dateLinieCSV!=[""])
			{
				dateCSV.push(dateLinieCSV);;
				
			}
	}
	//console.log("dateCSV",dateCSV);
	importStudentFromCSV(getSessionById(parameter.session_id),dateCSV);
		
}
function importButtonFunction(){
	csvSelectId=document.getElementById('googleDriveFiles');
	console.log(csvSelectId.options[csvSelectId.selectedIndex].value);
	sessionSelectId=document.getElementById('selectSessionsToImport');
	_drive_file_text=csvSelectId.options[csvSelectId.selectedIndex].value;
	_drive_file_id=csvSelectId.options[csvSelectId.selectedIndex].id;
	_session_id=sessionSelectId.options[sessionSelectId.selectedIndex].id;
	_session_text=sessionSelectId.options[sessionSelectId.selectedIndex].value;
	parameter={
		drive_file_text:_drive_file_text,
		drive_file_id:_drive_file_id,
		session_id:_session_id
	};
	driveApi("file_content",parameter,processCSV);
	showSnackbar("File "+_drive_file_text+" imported into session "+_session_text);
	closePopUpById("importForm");
}

async function prepareImportSessions(){
	driveApi("csv_metadata",undefined,undefined);
	/*csvFileMetadatas=await getCSVFilesMetadataFromDrive();
	csvSelectId=document.getElementById('googleDriveFiles');
	for(var j=0;j<csvFileMetadatas.length;j++)
	{
		option=document.createElement("option");
		option.value=csvFileMetadatas[j].title;
		option.innerHTML=csvFileMetadatas[j].title;
		csvSe*/
	json=await getJSON();
	sessions=JSON.parse(json);
		
	var avSessions=[];
	var bvSessions=[];
  var k=-1;
  for (var i=0;i<sessions.length;i++)
  {
    if(sessions[i].organizatorName==mainApp.user.displayName)
    {
      k++;
      avSessions[k]=sessions[i].titlu;
	  bvSessions[k]=sessions[i].key;
    }
	}
	
  id=document.getElementById('selectSessionsToImport');
  if(k!=-1)
  {
    for(var j=0;j<=k;j++)
    { 
      option=document.createElement("option");
			option.value=avSessions[j];
			option.innerHTML=avSessions[j];
			option.id=bvSessions[j];
			
			
			id.appendChild(option);
    }
	}
	


}
function showSnackbar(message)
{
	snackbar=document.getElementById("snackbar");
	snackbar.innerHTML=message;
	snackbar.className="show";
	setTimeout(function(){snackbar.className ="";}, 3000);
}


      async function getLocation() {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(await showPosition);
        } 
      }
      function showPosition(position) {
    if(position.coords.latitude>47.173720&&
      position.coords.latitude<47.174336&&
      position.coords.longitude>27.574524&&
      position.coords.longitude<27.575696)
          mainApp.validLocation=true;
    else
          mainApp.validLocation=false;
  }
