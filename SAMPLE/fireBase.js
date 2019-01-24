var app_fireBase={};


(function(){
	
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyDeVbowPueHPGzsngk2Q9H2cWuZA5vWhKE",
    authDomain: "attendancewebtracker.firebaseapp.com",
    databaseURL: "https://attendancewebtracker.firebaseio.com",
    projectId: "attendancewebtracker",
    storageBucket: "attendancewebtracker.appspot.com",
    messagingSenderId: "47040115686"
  };
  firebase.initializeApp(config);
	app_fireBase=firebase;
	console.log(app_fireBase);
	
})()