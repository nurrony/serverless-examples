const path = require('path');

const firebase = require('firebase-admin');
const functions = require('firebase-functions');
const engines = require('consolidate');
const express = require('express');

const firebaseApp = firebase.initializeApp(functions.config().firebase);
// const fireStoreDB = firebaseApp.firestore();
const server = express();

// fireStoreDB.settings({ timestampsInSnapshots: true });

function getTodos() {
  const todoCollection = firebaseApp.database().ref('todos');
  return todoCollection.once('value').then(snapshot => snapshot.val());
}

server.engine('hbs', engines.handlebars);
server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'hbs');
server.get('/', (_, response) => {
  getTodos()
    .then(todos => {
      console.log(todos);

      response.render('index', { todos });
    })
    .catch(console.error);
});

server.get('/api/v1/plans', (_, response) => {
  getTodos()
    .then(data => response.status(200).json({ status: 200, data }))
    .catch(error =>
      response.json({
        error
      })
    );
});
// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.app = functions.https.onRequest(server);
