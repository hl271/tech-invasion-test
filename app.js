require('dotenv').config()
let express = require('express')
// let favicon = require('serve-favicon')
let admin = require('firebase-admin')
const QRCode = require('qrcode')
const cookieParser = require('cookie-parser')();
const cors = require('cors')({origin: true});

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.projectId,
    clientEmail: process.env.clientEmail,
    privateKey: process.env.privateKey.replace(/\\n/g, '\n')
  }),
  databaseURL: process.env.databaseURL
})

let app = express()
let port = process.env.PORT || 5000
let db = admin.database()
let usersRef = db.ref('users/')

app.use(express.static('public'))
// app.use(favicon('/img/favicon.ico'))
app.set('views', './view')
app.set('view engine', 'ejs')
app.use(cors);
app.use(cookieParser);

const validateFirebaseIdToken = async (req, res, next) => {
    console.log('Check if request is authorized with Firebase ID token');
    console.log('Cookies: ', req.cookies)
  
    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies.__session)) {
      console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
          'Make sure you authorize your request by providing the following HTTP header:',
          'Authorization: Bearer <Firebase ID Token>',
          'or by passing a "__session" cookie.');
      res.redirect('/');
      return;
    }
  
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      console.log('Found "Authorization" header');
      // Read the ID Token from the Authorization header.
      idToken = req.headers.authorization.split('Bearer ')[1];
    } else if(req.cookies) {
      console.log('Found "__session" cookie');
      // Read the ID Token from cookie.
      idToken = req.cookies.__session;
    } else {
      // No cookie
      res.redirect("/");
      return;
    }
  
    try {
      const decodedIdToken = await admin.auth().verifyIdToken(idToken);
      console.log('ID Token correctly decoded');
      req.user = decodedIdToken;
      next();
    } catch (error) {
      console.error('Error while verifying Firebase ID token:', error);
      res.redirect('/');
    }
};

const authorizeAdminAccess = async (req, res, next) => {
  if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies.__session)) {
        console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
            'Make sure you authorize your request by providing the following HTTP header:',
            'Authorization: Bearer <Firebase ID Token>',
            'or by passing a "__session" cookie.');
        res.redirect('/');
        return;
    }
  let idToken
  if (req.cookies) {
    console.log('Found "__session" cookie');
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    // No cookie
    res.redirect("/");
    return;
  }
  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    console.log('ID Token correctly decoded');
    //Check if user is admin
    if (decodedIdToken.admin) {
      req.user = decodedIdToken;
      next();
    }
    else {
      console.log('Admin access denied')
      res.redirect('/myadmin-req')
    } 
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error);
    res.redirect('/');
  }
  
}


app.get('/', (req, res) => {
    res.render('index')
})

app.get('/protect', validateFirebaseIdToken, (req, res) => {
    res.render("protect")
    console.log("USER CURRENT: ",req.user)
})


app.get('/ticket', validateFirebaseIdToken, (req, res) => {
  QRCode.toDataURL(`http://localhost:2000/checkin/${req.user.user_id}`, {width: '200px'}, (error, url) => {
    console.log(req.user.user_id)
    res.render("ticket", {
      imgURL: url,
      user: req.user
    })
  }) 
})

app.get('/privacy', (req, res) => {
  res.render('privacy')
})
app.get('/session', (req, res) => {
  res.render("session")
})

app.get('/mysession', validateFirebaseIdToken, (req, res) => {
  res.render('user-session')
})

app.get('/checkin/:id', (req, res) => {
  let id = req.params.id
  let userRef = db.ref(`users/${id}/`)
  userRef.once('value', user => {
    if (!!user.val()) {
      if (user.val().hasOwnProperty('checkedIn')) {res.send('User already checked in!!!')}
      else {
        userRef.update({checkedIn: true})
        res.send('Checked in successfully')
      }           
    }
    else {
      res.send('No user found!!!')
    }  
  })
})

app.get('/myadmin-req', validateFirebaseIdToken, (req, res) => {
  res.render('admin')
})

app.get('/myadmin-main', authorizeAdminAccess, (req, res) => {
  res.render('admin-session')
})

app.get('/myadmin-main/:id', authorizeAdminAccess, (req, res) => {
  let uid = req.params.id
  let adminReqRef = db.ref(`admin-requests/${uid}/`)
  adminReqRef.once('value', snapshot => {
    if (snapshot.val()) {
      admin.auth().setCustomUserClaims(uid, {admin: true}).then(() => {
        console.log('Set up admin successfully')
        adminReqRef.update({accepted: true})
        res.send('Set up admin successfully')
      });
    }
    else {
      console.log('No user found')
      res.send('No user found')
    }
  })
  
})
app.listen(port, function() {console.log('Server start at port '+port)})