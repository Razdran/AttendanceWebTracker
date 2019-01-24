
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
			id: "1",
			titlu: _titlu,
			organizatorName: mainApp.user.displayName,
			organizatorUID: mainApp.user.uid,
			maxPrezente: _maxPrezente,
			sessionCode: _sessionCode,
			active: 0
		}
		ref.push(data);
	}

}

function updateSession(_maxPrezente, _sessionCode, _active) {

}

//setPermissions("dCJ8S4gZk1b9zffvWOHB03qWkKr2",1);
//setPermissions("yARRnkFD9KQpeakT4Jth1Vimmur2",0);


async function mainFlow() {
	mainApp.permission = await checkPermissions();
	console.log(mainApp.permission);
	createSession("mate", 20, "querty");
}

