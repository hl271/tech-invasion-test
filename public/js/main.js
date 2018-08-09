var config = {
    apiKey: "AIzaSyBTqoHmJkVo-tW-vyQQhbZ_A5YXdu4r6nw",
    authDomain: "tech-invasion-test.firebaseapp.com",
    databaseURL: "https://tech-invasion-test.firebaseio.com",
    projectId: "tech-invasion-test",
    storageBucket: "tech-invasion-test.appspot.com",
    messagingSenderId: "913948935011"
};
firebase.initializeApp(config);

let responseContainer = document.getElementById('demo-response');
let responseContainerCookie = document.getElementById('demo-response-cookie');
let navMain = document.getElementById("nav-main")
let navMainProfile = document.querySelector(".nav-main--profile")
let navSideProfileImg = document.querySelector(".nav-side--profile_img")
let navSideProfileName = document.querySelector(".nav-side--profile_name")
let navTickets = document.querySelectorAll(".nav--ticket")

//* Loop through all dropdown buttons to toggle between hiding and showing its dropdown content - This allows the user to have multiple dropdowns without any conflict */
var dropdown = document.getElementsByClassName("dropdown-btn");
var i;

for (i = 0; i < dropdown.length; i++) {
  dropdown[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var dropdownContent = this.nextElementSibling;
    if (dropdownContent.style.display === "block") {
      dropdownContent.style.display = "none";
    } else {
      dropdownContent.style.display = "block";
    }
  });
}

let signedOutUi = function() {
  navMainProfile.innerHTML = ''
  navSideProfileImg.innerHTML = ''
  navSideProfileName.innerHTML=''
  navTickets.forEach(nav => nav.innerHTML='')
}

let signedInUi = function(displayName, photoURL) {
  document.getElementById('sign-in').innerHTML = '<button onClick="signOut()" class="waves-effect waves-light btn">Sign out</button>'
  navMainProfile.innerHTML =`<img src="${photoURL}" alt="${displayName}" class="profile circle responsive-img">`
  navSideProfileImg.innerHTML = `<img src="${photoURL}" alt="${displayName}" class="profile circle responsive-img right">`
  navSideProfileName.innerHTML = displayName
  navTickets.forEach(nav => nav.innerHTML = '<a href="/ticket">My Ticket</a>')
}

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

let startFunctionsCookieRequest = function() {
    // Set the __session cookie.
    firebase.auth().currentUser.getIdToken(true).then(function(token) {
      // set the __session cookie
      document.cookie = '__session=' + token + ';max-age=3600';
  
      // console.log('Sending request to', url, 'with ID token in __session cookie.');
      // var req = new XMLHttpRequest();
      // req.onload = function() {
      //   responseContainerCookie.innerText = req.responseText;
      // };
      // req.onerror = function() {
      //   responseContainerCookie.innerText = 'There was an error';
      // };
      // req.open('GET',url, true);
      // req.send();
    });
};

function signOut() {
    firebase.auth().signOut();
    // clear the __session cookie
    document.cookie = '__session=';
    window.location.reload(true)
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
            signedInUi(displayName, photoURL)
            // startFunctionsRequest('/protect')
            startFunctionsCookieRequest()
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