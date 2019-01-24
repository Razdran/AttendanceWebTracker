
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


function createSession(_titlu, _maxPrezente, _sessionCode) {
	console.log("m",mainApp);
	if (mainApp.permission == 1) {
		
		var ref = database.ref("sessions");
		var data =
		{
			titlu: _titlu,
			organizatorName: mainApp.user.displayName,
			organizatorUID: mainApp.user.uid,
			prezente:0,
			maxPrezente: _maxPrezente,
			sessionCode: _sessionCode,
			active: 0,
			participants:[]
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
function participate(_sessionId){
	_sessionId.then(function (result) {
		var updates = {};
		updatedSession = result;
		updatedSession.prezente++;
		updatedSession.participants.push([mainApp.user.uid,mainApp.user.displayName]);
		keyForSession = result.key;
		delete result.key;
		updates['/sessions/' + keyForSession] = updatedSession;
		return firebase.database().ref().update(updates);
	})
}

function renderSession(sessionId) {
	getSessionById(sessionId).then((session) => {
		console.log("s", session);
		dashboard = document.getElementById("dashboard");
		card = document.createElement("div");
		card.id=sessionId;
		card.className="card";
		card.setAttribute("onclick","sessionPopUp(\""+card.id+"\");")
		dashboard.appendChild(card);
		titlu = document.createElement("div");
		titlu.className="titlu";
		titluSpan = document.createElement("span");
		titluSpan.className="titluSpan";
		titluSpan.innerHTML=session.titlu;
		card.appendChild(titlu);
		titlu.appendChild(titluSpan);
		organizator = document.createElement("div");
		organizator.className="organizator";
		organizatorSpan = document.createElement("span");
		organizatorSpan.className="organizatorSpan";
		organizatorSpan.innerHTML=session.organizatorName;
		card.appendChild(organizator);
		organizator.appendChild(organizatorSpan);
		prezente = document.createElement("div");
		prezente.className="prezente";
		prezenteSpan = document.createElement("span");
		prezenteSpan.className="prezenteSpan";
		prezenteSpan.innerHTML=session.prezente+"/"+session.maxPrezente;
		card.appendChild(prezente);
		prezente.appendChild(prezenteSpan);
	});
}
function getSessionKeyes(){
	lista=[];
	let promise = new Promise((resolve, reject) => 
	{
		userRef = database.ref().child("sessions");
		userRef.on("value", data => 
		{
			keys = Object.keys(data.val());
			resolve(keys);
		});
	});
	return promise;
}
function renderAllSessions(){
	getSessionKeyes().then(function(keys) 
											 { 
												
												for (var k=0;k<keys.length;k++)
												{
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

function generateSessionCode()
{
		var text="";
		var letters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
		for(var i=0;i<6;i++)
		{
			text+=letters.charAt(Math.floor(Math.random() * letters.length))
		}
		return text;
}

function createGrade(_participantId,_participantName,_sessionId,_feedback,_grade){
	if (mainApp.permission == 1) {
		
		var ref = database.ref("grades");
		var data =
		{
			participantId:_participantId,
			participantName:_participantName,
			sessionId:_sessionId,
			feedback:_feedback,
			grade:_grade
		}
		var result = ref.push(data);
		return result.key;
	}
}
function sessionPopUp(_sessionId)
{
		if(mainApp.permission==1)
		{
			console.log("organizator"+_sessionId);
		}
		else{
			console.log("participant"+_sessionId);
		}
}
function setup(){
	
	
}

//setPermissions("dCJ8S4gZk1b9zffvWOHB03qWkKr2",1);
//setPermissions("yARRnkFD9KQpeakT4Jth1Vimmur2",0);



async function mainFlow() {
	mainApp.permission = await checkPermissions();
	
	//renderSession(id);
	//updateSession(getSessionById('-LX-ao8-BBskH1UwAfTl'), 30, 'Cacat', 0);
	//createSession("test",15,generateSessionCode());
	
	renderAllSessions();
	
}
