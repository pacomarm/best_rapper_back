import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://goty-766fb.firebaseio.com"
});
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
  response.json({ mensaje: "Hola estrellitas!"});
});

// export const getGOTY = functions.https.onRequest((request, response) => {

//     const nombre = request.query.nombre || 'sin nombre';
//     response.json({nombre});
// });

const db = admin.firestore();

export const getGOTY = functions.https.onRequest( async(request, response) => {

    const gotyRef = db.collection('goty');
    const docsSnap = await gotyRef.get();
    const juegos = docsSnap.docs.map( doc => doc.data() );

    response.json( juegos );
});

//Servidor en express
const app = express();              //configuración inicial
app.use( cors({ origin: true }) );

app.get('/goty', async( req, res ) => {

  const gotyRef = db.collection('goty');
  const docsSnap = await gotyRef.get();
  const juegos = docsSnap.docs.map( doc => doc.data() );

  res.json( juegos );

});

app.post('/goty/:id', async( req, res ) => {

  const id = req.params.id;
  const gameRef = db.collection('goty').doc( id );
  const gameSnap = await gameRef.get();

  if( !gameSnap.exists ){

    res.status(404).json({
      ok: false,
      mensaje: 'A rapper DNE with id ' + id,
    });
  } else {
    
    const antes = gameSnap.data() || {votos: 0};
    await gameRef.update({
      votos: antes.votos + 1
    });

    res.json({
      ok: true, 
      mensaje: `Thee has't just vot'd f'r ${antes.name}`
    });
  }

});

export const api = functions.https.onRequest( app );