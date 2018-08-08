require('dotenv').config()
let express = require('express')
let favicon = require('serve-favicon')
let admin = require('firebase-admin')
const cookieParser = require('cookie-parser')();
const cors = require('cors')({origin: true});

let app = express()
let port = process.env.PORT || 5000


admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.projectId,
      clientEmail: process.env.clientEmail,
      privateKey: process.env.privateKey
    }),
    databaseURL: process.env.databaseURL
  })

app.use(express.static('public'))
app.use(favicon('/img/favicon.ico'))
app.set('views', './view')
app.set('view engine', 'ejs')
app.use(cors);
app.use(cookieParser);

const validateFirebaseIdToken = async (req, res, next) => {
    console.log('Check if request is authorized with Firebase ID token');
  
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
      res.status(403).send('Unauthorized');
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

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/protect', validateFirebaseIdToken, (req, res) => {
    res.render("protect")
    console.log("USER CURRENT: ",req.user)
} )

app.listen(port, function() {console.log('Server start at port '+port)})