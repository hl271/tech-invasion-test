var config = {
    apiKey: "AIzaSyBTqoHmJkVo-tW-vyQQhbZ_A5YXdu4r6nw",
    authDomain: "tech-invasion-test.firebaseapp.com",
    databaseURL: "https://tech-invasion-test.firebaseio.com",
    projectId: "tech-invasion-test",
    storageBucket: "tech-invasion-test.appspot.com",
    messagingSenderId: "913948935011"
};
firebase.initializeApp(config);

responseContainer = document.getElementById('demo-response');
responseContainerCookie = document.getElementById('demo-response-cookie');
let startFunctionsRequest = function(url) {
    firebase.auth().currentUser.getIdToken().then(function(token) {
      console.log('Sending request to', url, 'with ID token in Authorization header.');
      var req = new XMLHttpRequest();
      req.onload = function() {
        responseContainer.innerText = req.responseText;
      }
      req.onerror = function() {
        responseContainer.innerText = 'There was an error';
      }
      req.open('GET', url, true);
      req.setRequestHeader('Authorization', 'Bearer ' + token);
      req.send();
    });
};

let startFunctionsCookieRequest = function(url) {
    // Set the __session cookie.
    firebase.auth().currentUser.getIdToken(true).then(function(token) {
      // set the __session cookie
      document.cookie = '__session=' + token + ';max-age=3600';
  
      console.log('Sending request to', url, 'with ID token in __session cookie.');
      var req = new XMLHttpRequest();
      req.onload = function() {
        responseContainerCookie.innerText = req.responseText;
      };
      req.onerror = function() {
        responseContainerCookie.innerText = 'There was an error';
      };
      req.open('GET',url, true);
      req.send();
    });
};

function signOut() {
    firebase.auth().signOut();
    // clear the __session cookie
    document.cookie = '__session=';
}

initApp = function() {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var uid = user.uid;
        var phoneNumber = user.phoneNumber;
        var providerData = user.providerData;
        
        user.getIdToken().then(function(accessToken) {
            document.getElementById('sign-in').innerHTML = '<button onClick="signOut()" class="waves-effect waves-light btn">Sign out</button>'
            startFunctionsRequest('/protect')
            startFunctionsCookieRequest('/protect')
        });
      } else {
        // User is signed out.
        document.getElementById('sign-in').textContent = ""
        var ui = new firebaseui.auth.AuthUI(firebase.auth());
        ui.start('#firebaseui-auth-container', {
            signInSuccessUrl: '/',
            signInOptions: [
            // Leave the lines as is for the providers you want to offer your users.
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.FacebookAuthProvider.PROVIDER_ID
            ],
            signInFlow: 'popup'
        });
      }
    }, function(error) {
      console.log(error);
    });
  };

  window.addEventListener('load', function() {
    initApp()
  });