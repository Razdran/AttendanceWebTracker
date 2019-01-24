
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
	console.log("am intrat");
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
function checkNewUser(_uid) {

}

function createSession(_titlu, _maxPrezente, _sessionCode) {

	if (mainApp.permission == 1) {
		var ref = database.ref("sessions");
		var data =
		{
			titlu: _titlu,
			organizatorName: mainApp.user.displayName,
			organizatorUID: mainApp.user.uid,
			maxPrezente: _maxPrezente,
			sessionCode: _sessionCode,
			active: 0
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

function renderSession(sessionId)
{
	getSessionById(sessionId).then((session)=>{
	console.log("s",session);
	dashboard=document.getElementById("dashboard");
	card=document.createElement("div");
	dashboard.appendChild(card);
	titlu=document.createElement("div");
	titluSpan=document.createElement("span");
	card.appendChild(titlu);
	titlu.appendChild(titluSpan);
	organizator=document.createElement("div");
	organizatorSpan=document.createElement("span");
	card.appendChild(organizator);
	organizator.appendChild(organizatorSpan);
	prezente=document.createElement("div");
	prezenteSpan=document.createElement("span");
	card.appendChild(prezente);
	prezente.appendChild(prezenteSpan);
	});

}

//setPermissions("dCJ8S4gZk1b9zffvWOHB03qWkKr2",1);
//setPermissions("jQJyXKzhCshUC9BCo5OAqofr7iM2",1);


async function mainFlow() {
	mainApp.permission = await checkPermissions();
	console.log(mainApp.permission);
	id=createSession("mate", 20, "querty");
	//renderSession(id);
	updateSession(getSessionById('-LX-ao8-BBskH1UwAfTl'), 30, 'Cacat', 0);

}

