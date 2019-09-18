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
 * valid_distance: 歩きで許容する距離
 * max_count: 乗り換え回数
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

    var valid_distance = query.valid_distance ? query.valid_distance : 10000;
    var max_count = query.max_count ? query.max_count : 1;
    var walk_speed = 80;  // 80m/m
    var car_speed = 1000;  // 1000m/m

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
            fare: reservation.fare,
            total_distance: reservation.total_distance,
            total_time: reservation.total_time,
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
    cal_distance = function(dep, des){
        deg2rad = Math.PI / 180.0;
        r = 6378.137;

        slat = dep.lat * deg2rad;
        slng = dep.lng * deg2rad;
        glat = des.lat * deg2rad;
        glng = des.lng * deg2rad;

        sx = Math.cos(slng) * Math.cos(slat);
        sy = Math.sin(slng) * Math.cos(slat);
        sz = Math.sin(slat);
        gx = Math.cos(glng) * Math.cos(glat);
        gy = Math.sin(glng) * Math.cos(glat);
        gz = Math.sin(glat);

        dot = sx * gx + sy * gy + sz * gz;
        d = r * Math.acos(dot);
        return d;
    };

    /*
    * valid_distance: 歩きで許容する距離
    * max_count: 乗り換え回数
    * walk_speed: 徒歩で移動するときの速度
    * car_speed:
    */
    fastreservations = (valid_distance, max_count, walk_speed, car_speed) =>{
        // すでに出発した投稿は使えないようにする
        // 同じ投稿を使えなくする
        responses = [];
        nows = [];
        reservations.forEach(reserve => {
            distance = cal_distance(departure_point,reserve.departure_point);
            if(reserve.condition !== "募集中")return;
            if(distance <= valid_distance){
                add = {
                    logs: [reserve],
                    destination_point: reserve.destination_point,
                    total_time: reserve.total_time + distance / walk_speed,
                };
                nows.push(add);
            }
        });
        nows.sort((a,b)=>{
            a_time = a.total_time + cal_distance(a.destination_point, destination_point);
            b_time = b.total_time + cal_distance(b.destination_point, destination_point);
            return a_time - b_time;
        });
        while(nows.length>=10)nows.pop();
        nows.forEach(now_target => {
            distance = cal_distance(now_target.destination_point, destination_point);
            if(distance > valid_distance)return;
            responses.push(now_target);
        });
        for(var i=0;i<max_count;i+=1){
            next_nows = [];
            nows.forEach(now_target => {
                reservations.forEach(reserve => {
                    distance = cal_distance(now_target.destination_point,reserve.departure_point);
                    if(reserve.condition !== "募集中")return;
                    if(distance <= valid_distance){
                        add = {
                            logs: now_target.logs.push(reserve),
                            // logs: now_target.logs.concat({reserve}),  // Error: concatがありません
                            destination_point: reserve.destination_point,
                            total_time: reserve.total_time + distance / walk_speed + now_target.total_time,
                        };
                        next_nows.push(add);
                    }
                });
            });
            nows = next_nows;
            nows.sort((a,b)=>{
                a_time = a.total_time + cal_distance(a.destination_point, destination_point);
                b_time = b.total_time + cal_distance(b.destination_point, destination_point);
                return a_time - b_time;
            });
            while(nows.length>=10)nows.pop();
            nows.forEach(now_target => {
                distance = cal_distance(now_target.destination_point, destination_point);
                if(distance > valid_distance)return;
                responses.push(now_target);
            });
        }
        return responses;
    }

    var responses = fastreservations(valid_distance, max_count, walk_speed, car_speed);
    console.log('responses:', responses);
    // res.send({departure: departure_point, destination: destination_point, reservations: reservations, Number: distance, responses: responses});
    res.send({responses: responses});
});
