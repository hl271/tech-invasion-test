initAppHome = function() {
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
        console.log('home signedin')
        user.getIdToken().then(function(accessToken) {
            // signedInUi(displayName, photoURL)
            // startFunctionsRequest('/protect')
            startFunctionsCookieRequest()
        });
      } else {
        // User is signed out.
        console.log('home signedout')
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

  window.addEventListener('DOMContentLoaded', function() {
    initAppHome()
  });