import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js';

import {
  getData,
  sendDataByToken
} from './shared.js';

import {
  setupQuests
} from './questlog.js';

import {
  fillUsers
} from './profile.js';

let auth;

// Getting the config details from server
getData("/firebase")
.then((res) => {
  const app = initializeApp(res.data);
  auth = getAuth(app);

}).then((res)=> {

  onAuthStateChanged(auth, user => {
    // populate player list
    if(user) {
      // load current user
      //const url = '/user/'+user.uid;
      //getData(url)
      //.then((res) => {
      //  currentUser = res.data;
      //})

      // getting list of users
      getData('/userDetails')
      .then((response) => {
        fillUsers(user,response.data);
      });

      // setting up quests
      getData('/quest')
      .then((response) => {
        setupQuests(user, response.data);
      });

    }else {
      // don't display quests
      //setupQuests([]);
      getData('/userDetails')
      .then((response) => {
        fillUsers(response.data);
      });
    }
  });

}).catch((err) => {
  console.log("Error occurred" + err);
});

// sign up
const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', (e) => {
  // prevent page refresh
  e.preventDefault();
  // get user info
  const username = signupForm['signup-username'].value;
  const email = signupForm['signup-email'].value;
  const password = signupForm['signup-password'].value;

  // sign up the user
  createUserWithEmailAndPassword(auth, email, password).then(cred => {
    const modal = document.querySelector('#modal-signup');
    M.Modal.getInstance(modal).close();
    signupForm.reset();
    }).then( () => {
    auth.currentUser.getIdToken(/* forceRefresh */ false).then(function(idToken) {
      //console.log(idToken);
      // create user account in mongodb database
      let token = auth.currentUser.uid;
      let data = newUserData.slice();
      data.firebase_token = token;
      data.username = username;
      let url = '/user';
      sendDataByToken('/user','',data);
    }).catch(function(error) {
      // Handle error
    });
  });
});

//signout
const logout = document.querySelector('#logout');
logout.addEventListener('click', e => {
  e.preventDefault();
  signOut(auth);
  document.location.reload();
});

//login
const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  // get user info
  const email = loginForm['login-email'].value;
  const password = loginForm['login-password'].value;

  signInWithEmailAndPassword(auth, email, password).then(cred => {
    const modal = document.querySelector('#modal-login');
    M.Modal.getInstance(modal).close();
    loginForm.reset();
  });
});

document.addEventListener('DOMContentLoaded', function() {
  var modals = document.querySelectorAll('.modal');
  M.Modal.init(modals);

  var items = document.querySelectorAll('.collapsible');
  M.Collapsible.init(items);
});
