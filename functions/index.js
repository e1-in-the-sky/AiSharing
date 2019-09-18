const functions = require('firebase-functions');
const admin = require('firebase-admin');
var serviceAccount = require('./aisharing-ac6cc-firebase-adminsdk-eqwme-c3e3fb3a98.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "http://aisharing-ac6cc.firebaseio.com"
});

var fireStore = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// exports.helloWorld = functions.https.onRequest((request, response) => {
//     console.log('request:', request);
//     console.log('response:', response);
//     response.send('Hello from Firebase!');
// });

// exports.queryTest = functions.https.onRequest(async (req, res) => {
//     console.log('req:', req);
//     console.log('res:', res);
//     const query = req.query;
//     res.send(query);
// });


/**
 * 出発地と目的地の緯度経度で最適な乗り合わせ投稿を提案します
 * https://us-central1-aisharing-ac6cc.cloudfunctions.net/routeSearch
 * 使用例: https://us-central1-aisharing-ac6cc.cloudfunctions.net/routeSearch?route=30,139,21,140
 * リクエストパラメーター
 * {String} route 出発地と目的地の緯度経度。「出発地の緯度、出発地の経度、目的地の緯度、目的地の経度」
 * */ 
exports.routeSearch = functions.https.onRequest(async (req, res) => {
    const query = req.query;
    const error = (message) => {
        return {Error: message}
    };
    if (!query.route) {
        res.send(error('route does not exist in query'));
    }
    var route = query.route;
    route = route.split(',');
    if (route.length !== 4) {
        res.send(error('Incorrect route coordinates'));
    }
    var departure_point = {
        lat: Number(route[0]),
        lng: Number(route[1])
    };
    var destination_point = {
        lat: Number(route[2]),
        lng: Number(route[3])
    };
    // console.log('route:', route);
    // console.log('admin:', admin);

    var reservationsRef = fireStore.collection('reservations');
    // console.log(reservationsRef);
    if (!reservationsRef) {
        res.send(error('reservations collection does not exist in firestore'));
    }

    var reservations = [];
    var querySnapshot = await reservationsRef.get();
    querySnapshot.forEach(doc => {
        var reservation = doc.data();
        reservation = {
            uid: reservation.uid,
            condition: reservation.condition,
            max_passenger_count: reservation.max_passenger_count,
            passenger_count: reservation.passenger_count,
            departure_time: reservation.departure_time,
            departure_point: {
                lat: reservation.departure_point.latitude,
                lng: reservation.departure_point.longitude
            },
            destination_point: {
                lat: reservation.destination_point.latitude,
                lng: reservation.destination_point.longitude
            }
        }
        reservations.push(reservation);
    });

    res.send({departure: departure_point, destination: destination_point, reservations: reservations});
});
