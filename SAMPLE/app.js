
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
						closePopUpById('submitPresence');
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
	chartbtn.setAttribute("onclick","popUp2()");	
	chartbtn.style.width="auto";
	chartbtn.innerHTML="Create Chart";
	btngroup.appendChild(chartbtn);

	importbtn=document.createElement("button");
	importbtn.className="button";
	importbtn.id="import";
	importbtn.setAttribute("onclick","downloadJSON()");
	importbtn.style.width="auto";
	importbtn.innerHTML="Import";
	btngroup.appendChild(importbtn);
	
	exportbtn=document.createElement("button");
	exportbtn.className="button";
	exportbtn.id="export";
	exportbtn.setAttribute("onclick","downloadHTML5()");
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
{
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
		html=html+"<h1>"+data[i].titlu+"</h1>\n";
		html=html+"<h2>"+data[i].organizatorName+"</h2>\n";
		participants=data[i].participants;
		if(participants!=undefined)
		{
			html=html+"<table>\n";
			html=html+"<tr><th>Name</th><th>Grade</th><th>Feedback</th></tr>\n";
			for(j=0;j<participants.length;j++)
			{
				html=html+"<tr>\n";
				html=html+"<td>"+participants[j].name+"</td>\n";
				html=html+"<td>"+participants[j].grade+"</td>\n";
				html=html+"<td>"+participants[j].feedback+"</td>\n";
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
	//createSession("test2",20,"carapace");	
	//renderSession(id);
	//updateSession(getSessionById('-LX-ao8-BBskH1UwAfTl'), 30, 'Cacat', 0);
	//createSession("test",15,generateSessionCode());
	setup();
	renderAllSessions();
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

function renderChart(_idChart,_titlu,_legend,_data,_labels)
{
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
        tooltips:{
          enabled:true
        }
      }
    });
}


function createArraysForChart(sessions){

	rezultat={};
	note=[];
	for (var j=0;j<=15;j++)
		note[j]=0;
	for(var i=0;i<sessions.length;i++)
	{	
		if(sessions[i].participants!=undefined)
		{
		if(sessions[i].participants[0].grade!=0)
		{
			if(sessions[i].participants[0].grade=="0")
			note[0]+=1;
			
			if(sessions[i].participants[0].grade=="1")
			note[1]+=1;
			
			if(sessions[i].participants[0].grade=="2")
			note[2]+=1;
			
			if(sessions[i].participants[0].grade=="3")
			note[3]+=1;
			
			if(sessions[i].participants[0].grade=="4")
			note[4]+=1;
			
			if(sessions[i].participants[0].grade=="5")
			note[5]+=1;
			
			if(sessions[i].participants[0].grade=="6")
			note[6]+=1;
			
			if(sessions[i].participants[0].grade=="7")
			note[7]+=1;
			
			if(sessions[i].participants[0].grade=="8")
			note[8]+=1;
			
			if(sessions[i].participants[0].grade=="9")
			note[9]+=1;
			
			if(sessions[i].participants[0].grade=="10")
			note[10]+=1;
			
			if(sessions[i].participants[0].grade=="11")
			note[11]+=1;
			if(sessions[i].participants[0].grade=="12")
			note[12]+=1;
			if(sessions[i].participants[0].grade=="13")
			note[13]+=1;
			if(sessions[i].participants[0].grade=="14")
			note[14]+=1;
			if(sessions[i].participants[0].grade=="15")
			note[15]+=1;
		}
	}
	}
	rezultat["note"]=note;
	console.log(rezultat);
	
	return rezultat;
}

async function chart(){
	json=await getJSON();
	sessions=JSON.parse(json);
	
	datas=createArraysForChart(sessions);
	data=datas.note;
	labels=[];
	for(var i=0;i<=15;i++)
		labels[i]=i;
	titlu="Punctaje";
	legenda="No of Students"




	renderChart("myChart",titlu,legenda,data,labels);
	  
}