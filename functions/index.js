const functions = require('firebase-functions');
const admin = require('firebase-admin');
var serviceAccount = require('./aisharing-ac6cc-firebase-adminsdk-eqwme-c3e3fb3a98.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "http://aisharing-ac6cc.firebaseio.com"
});

var fireStore = admin.firestore();

// Add CORS to your index.js
const cors = require('cors')({origin: true});

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

    var valid_distance = query.valid_distance ? query.valid_distance : 1000;
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
            destination_name: reservation.destination_name,
            departure_name: reservation.departure_name,
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
        r = 6378137.0;

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

        console.log("nows size is" + nows.length);

        nows.sort((a,b)=>{
            a_time = a.total_time + cal_distance(a.destination_point, destination_point);
            b_time = b.total_time + cal_distance(b.destination_point, destination_point);
            return a_time - b_time;
        });
        
        while(nows.length>=10)nows.pop();
        new_nows = [];
        nows.forEach(now_target => {
            distance = cal_distance(now_target.destination_point, destination_point);
            if(distance > valid_distance){
                new_nows.push(now_target);
                return;
            }
            responses.push(now_target);
        });
        nows = new_nows;

        for(var i=0;i<max_count;i+=1){
            next_nows = [];
            nows.forEach(now_target => {
                reservations.forEach(reserve => {
                    distance = cal_distance(now_target.destination_point,reserve.departure_point);
                    if(reserve.condition !== "募集中")return;
                    if(distance <= valid_distance){
                        new_logs = now_target.logs.slice();
                        new_logs.push(reserve);
                        add = {
                            logs: new_logs,
                            destination_point: reserve.destination_point,
                            total_time: reserve.total_time + distance / walk_speed + now_target.total_time,
                        };
                        next_nows.push(add);
                    }
                });
            });
            nows = next_nows;
            nows.sort((a,b)=>{
                a_time = a.total_time + cal_distance(a.destination_point, destination_point) / car_speed;
                b_time = b.total_time + cal_distance(b.destination_point, destination_point) / car_speed;
                return a_time - b_time;
            });
            while(nows.length>=10)nows.pop();
            new_nows = [];
            nows.forEach(now_target => {
                distance = cal_distance(now_target.destination_point, destination_point);
                if(distance > valid_distance){
                    new_nows.push(now_target);
                    return;
                }
                responses.push(now_target);
            });
            nows = new_nows;
        }
        return responses;
    }

    var responses = fastreservations(valid_distance, max_count, walk_speed, car_speed);
    console.log('responses:', responses);
    // res.send({departure: departure_point, destination: destination_point, reservations: reservations, Number: distance, responses: responses});
    res.send({responses: responses});
});

/**
 * 出発地と目的地の緯度経度で最適な乗り合わせ投稿を提案します
 * https://us-central1-aisharing-ac6cc.cloudfunctions.net/routeSearch2
 * 使用例: https://us-central1-aisharing-ac6cc.cloudfunctions.net/routeSearch2?route=30,139,21,140
 *        http://us-central1-aisharing-ac6cc.cloudfunctions.net/routeSearch2?route=37.521469,139.940061,37.507598,139.931435&departure_time=2019-09-20T17:43:00
 * 座標サンプル:
 * (会津大学) 37.521469,139.940061
 * (会津若松駅) 37.507598,139.931435
 * (ゼビオ近くの交差点) 37.517878,139.926253
 * (芦ノ牧温泉駅) 37.395645,139.932622
 * リクエストパラメーター
 * {String} route 出発地と目的地の緯度経度。「出発地の緯度、出発地の経度、目的地の緯度、目的地の経度」
 * valid_distance: 歩きで許容する距離
 * max_count: 乗り換え回数
 * departure_time: 出発予定時刻 使用例: departure_time=2019-09-19T17:15:00
 * */
exports.routeSearch2 = functions.https.onRequest(async (req, res) => {
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

    var departure_time;
    if (query.departure_time) {
        departure_time = new Date(query.departure_time);
        departure_time.setHours(departure_time.getHours()-9);
    } else {
        departure_time = new Date();
    }
    // var departure_time = query.departure_time ? new Date(query.departure_time) : new Date();
    var valid_distance = query.valid_distance ? query.valid_distance : 1000;
    var max_count = query.max_count ? query.max_count : 5;
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
            departure_time: reservation.departure_time.toDate(),
            fare: reservation.fare,
            total_distance: reservation.total_distance,
            total_time: reservation.total_time / 60,  // reservation.total_timeは秒
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

    // 帰ってくるのはkm?  * 1000 でメートルにしてみた
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
        return d * 1000;
    };

    /*
    * valid_distance: 歩きで許容する距離
    * max_count: 乗り換え回数
    * walk_speed: 徒歩で移動するときの速度
    * car_speed:
    * departure_time: 出発予定時刻
    */
    fastreservations = (valid_distance, max_count, walk_speed, car_speed) =>{
        // すでに出発した投稿は使えないようにする
        // 同じ投稿を使えなくする
        responses = [];
        nows = [];

        // 終了条件
        // 現在地からゴールまでの歩きの時間
        s2g_walk_time = cal_distance(departure_point, destination_point) / walk_speed;
        console.log('出発地から目的地まで歩いたときの予想時間:', s2g_walk_time);
        console.log('出発予定時刻:', departure_time);

        // 現在地からゴールまでの車の時間
        s2g_car_time = cal_distance(departure_point, destination_point) / car_speed;

        current_target = {
            logs: [],
            f: [s2g_car_time],
            g: [0],
            h: [s2g_car_time],
            current_time: [departure_time],
            total_walking_time: 0,
            walk_time_2g: [s2g_walk_time]
        }

        var current_point = current_target.logs.length === 0 ? departure_point : current_target.logs[current_target.logs.length - 1].reservation.destination_point;
        // var current_time = departure_time;
        
        // current_time.setMinutes(current_time.getMinutes() + current_target.g[current_target.g.length - 1]);

        for (var c=0; c < max_count; c+=1){
            console.log('c:', c);
            reservations.forEach(reserve => {  // 全ての投稿に対してf(n)を計算
                if(reserve.condition !== "募集中")return;  // 募集終了のとき、この投稿を使わない
                if(reserve.passenger_count === reserve.max_passenger_count) return;  // 満車のとき、この投稿を使わない
                // if(reserve.departure_time.getTime() < current_target.current_time[current_target.current_time.length - 1].getTime()) return;  // 出発予定時刻より前に出発している投稿は使わない
                // if(reserve.departure_time.getTime() < departure_time.getTime() + current_target.g[current_target.g.length - 1] * 60) return;  // 出発予定時刻より前に出発している投稿は使わない

                // console.log('reserve.departure_time:', reserve.departure_time);

                distance = cal_distance(current_point, reserve.departure_point);
                walk_time = distance / walk_speed;  // 1
                wait_time = (reserve.departure_time.getTime() - current_target.current_time[current_target.current_time.length - 1].getTime())/(1000*60) - walk_time;  // 6
                if (wait_time < 0) return; // すでに出発した投稿
                ride_time = reserve.total_time;  // 2
                distance2g = cal_distance(reserve.destination_point, destination_point);
                mintime2g = distance2g / car_speed;  // 3
                walk_time_destination2g = distance2g / walk_speed;  // 4
                g = current_target.g[current_target.g.length - 1] + walk_time + wait_time + ride_time;  // + g(0)
                h = mintime2g;
                f = g + h;
                // console.log('distance:', distance);
                // console.log('walk_time:', walk_time);
                // console.log('wait_time:', wait_time);
                // console.log('ride_time:', ride_time);
                if (walk_time + wait_time + ride_time > walk_time_destination2g) return;// console.log({uid: reserve.uid, walk_time: walk_time, wait_time: wait_time, ride_time: ride_time, walk_time_destination2g: walk_time_destination2g});  // 次の投稿を使うより歩いて行ったほうが早い場合
                // if (reserve.departure_time.getTime() < current_target.current_time[current_target.current_time.length - 1].getTime() + walk_time * 60 * 1000) return;  // 出発予定時刻より前に出発している投稿は使わない
                if (distance > valid_distance) return;  // 現在地から投稿の出発地まで徒歩で歩ける範囲を超えていた場合
                if (s2g_walk_time < walk_time + wait_time + ride_time) return;  // 投稿を使うより歩いたほうが早い場合
                if (current_target.walk_time_2g[current_target.walk_time_2g.length - 1] < walk_time + wait_time + ride_time) return; // 次の目的地までにかかる時間よりゴールまでの徒歩時間のほうが短いとき
                current_time = new Date(current_target.current_time[current_target.current_time.length - 1].toString());
                current_time.setMinutes(current_time.getMinutes() + g);
                console.log('current time:', current_time);
                add = {
                    // logs: [{reservation: reserve, f: f, g: g, h: h}],
                    logs: current_target.logs.concat([{walking_time: walk_time, reservation: reserve}]),
                    destination_point: reserve.destination_point,
                    // total_time: reserve.total_time + distance / walk_speed,
                    // total_time: walk_time + wait_time + ride_time,  // + g(0)
                    next_total_time: walk_time + wait_time + ride_time,
                    // distance: distance,
                    // walk_time: walk_time,
                    // wait_time: wait_time,
                    // ride_time: ride_time,
                    // reserve_departure_time_getTime: reserve.departure_time.getTime(),
                    // departure_time_getTime: departure_time.getTime()
                    // f: f,
                    // g: g,
                    // h: h
                    f: current_target.f.concat([f]),
                    g: current_target.g.concat([g]),
                    h: current_target.h.concat([h]),
                    current_time: [...current_target.current_time, current_time],
                    total_walking_time: current_target.total_walking_time + walk_time,
                    walk_time_2g: [...current_target.walk_time_2g, walk_time_destination2g]
                };
                nows.push(add);
            });

            if (nows.length === 0) {
                // res.send(error("候補がありません"));  // 終了条件
                console.log('計算できる投稿がなくなったのでforを抜けます');
                break;
            }

            nows.sort((a, b) => {
                var r = a.f[a.f.length-1] - b.f[b.f.length-1];
                if (r===0) r = a.total_walking_time - b.total_walking_time;
                return r;
            });

            // var next = false;
            // nows.forEach(now => {
            //     if (now.next_total_time < 
            // });

            nows.forEach(now => {
                if (now.walk_time_2g[now.walk_time_2g.length - 1] < 10) {
                    responses.push(now);
                    nows.shift();
                }
            });

            while (responses.length > 5) responses.pop(); 
            if (responses.length === 5) break;

            current_target = nows[0];
            nows.shift();
            current_point = current_target.logs[current_target.logs.length - 1].reservation.destination_point;
            // current_time.setMinutes(current_time.getMinutes() + current_target.g[current_target.g.length - 1]);
            // console.log('current time:', current_time);
            console.log('nows:', nows);
            console.log('current_target:', current_target);
        }
        res.send(current_target);
        // res.send({nows: nows});
        // res.send({nows: nows, departure_time: departure_time});
        // nowsの一番fが小さいものを取り出して
        // 現在の位置と現在の時刻を更新する




        ////////////////////////////////////////////////////////////////////////////



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

























/**
 * 出発地と目的地の緯度経度で最適な乗り合わせ投稿を提案します
 * https://us-central1-aisharing-ac6cc.cloudfunctions.net/routeSearch3
 * 使用例: https://us-central1-aisharing-ac6cc.cloudfunctions.net/routeSearch3?route=30,139,21,140&departure_time=2019-09-20T17:43:00
 * リクエストパラメーター
 * {String} route (必須) 出発地と目的地の緯度経度。「出発地の緯度、出発地の経度、目的地の緯度、目的地の経度」
 * valid_distance: 歩きで許容する距離。単位はm (デフォルト)1000
 * valid_time: 投稿間の許容する空き時間。単位は分 (default) 60
 * max_count: 乗り換え回数 (デフォルト)10
 * departure_time: 出発予定時刻 (デフォルト)現在時刻 使用例: departure_time=2019-09-19T17:15:00
 * walk_speed: 歩くスピード。単位はm/m(メートル/分) (デフォルト) 80
 * car_speed: 車の速度。単位はm/m(メートル/分) (デフォルト) 1000
 * */
exports.routeSearch3 = functions.https.onRequest(async (req, res) => {

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

    var departure_time;
    if (query.departure_time) {
        departure_time = new Date(query.departure_time);
        departure_time.setHours(departure_time.getHours()-9);
    } else {
        departure_time = new Date();
    }

    var valid_distance = query.valid_distance ? Number(query.valid_distance) : 1000;
    var valid_time = query.valid_time ? Number(query.valid_time) : 60;
    var max_count = query.max_count ? Number(query.max_count) : 10;
    var walk_speed = query.walk_speed ? Number(query.walk_speed) : 80;  // 80m/m
    var car_speed = query.car_speed ? Number(query.car_speed) : 1000;  // 1000m/m

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
            departure_time: reservation.departure_time.toDate(),
            fare: reservation.fare,
            total_distance: reservation.total_distance,
            total_time: reservation.total_time / 60,  // reservation.total_timeは秒
            destination_name: reservation.destination_name,
            departure_name: reservation.departure_name,
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
        r = 6378137.0;

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
        dot = Math.min(1.0,dot);
        dot = Math.max(-1.0,dot);
        d = r * Math.acos(dot);
        return d;
    };

    /*
    * valid_distance: 歩きで許容する距離
    * valid_time: 次の投稿まで許容する時間
    * max_count: 乗り換え回数
    * walk_speed: 徒歩で移動するときの速度
    * car_speed:
    * departure_time: 出発時刻
    */
    fastreservations = (valid_distance, valid_time, max_count, walk_speed, car_speed, departure_time) =>{
        responses = [];
        nows = [];

        reservations.forEach(reserve => {
            distance = cal_distance(departure_point,reserve.departure_point);
            if(reserve.condition !== "募集中")return;  // 募集中の投稿のみ使用する
            if(reserve.max_passenger_count === reserve.passenger_count) return;  // 満員なので使用できない
            if (departure_time.getTime() / (1000*60) + distance / walk_speed > reserve.departure_time.getTime() / (1000*60)) return;  // すでに出発時刻を過ぎていた場合
            if (departure_time.getTime() / (1000*60) + distance / walk_speed + valid_time < reserve.departure_time.getTime() / (1000*60)) return;  // 投稿の出発時間まで許容できる時間を過ぎていた場合
            if(distance <= valid_distance){
                add = {
                    logs: [reserve],
                    destination_point: reserve.destination_point,
                    total_time: reserve.departure_time.getTime() / (1000*60) + reserve.total_time - departure_time.getTime() / (1000*60),
                    // total_time: reserve.total_time + distance / walk_speed,   // 投稿の出発までの待ち時間が考慮されていない
                    total_walk_time: distance / walk_speed
                };
                nows.push(add);
            }
        });

        //console.log("nows size is" + nows.length);

        // 距離と時間が混ざっているので投稿の目的地とゴールまでの距離を車の速度で割って時間にした
        nows.sort((a,b)=>{
            // a_time = a.total_time + cal_distance(a.destination_point, destination_point);
            // b_time = b.total_time + cal_distance(b.destination_point, destination_point);
            a_time = a.total_time + cal_distance(a.destination_point, destination_point) / car_speed;
            b_time = b.total_time + cal_distance(b.destination_point, destination_point) / car_speed;
            return a_time - b_time;
        });
        
        while(nows.length>=10)nows.pop();
        new_nows = [];
        nows.forEach(now_target => {
            distance = cal_distance(now_target.destination_point, destination_point);
            if(distance > valid_distance){
                new_nows.push(now_target);  // ゴールまで徒歩で許容する範囲を切っていなかったら探索対象に含める
                return;
            }
            now_target.total_time += distance / walk_speed;
            now_target.total_walk_time += distance / walk_speed;
            responses.push(now_target);  // ゴールまで徒歩で許容する範囲を切っていたら探索終了でレスポンスに含める
        });
        nows = new_nows;

        for(var i=0;i<max_count;i+=1){
            // console.log('nows size:', nows.length);
            // console.log('nows:', nows);
            next_nows = [];
            nows.forEach(now_target => {
                reservations.forEach(reserve => {
                    distance = cal_distance(now_target.destination_point,reserve.departure_point);
                    if(reserve.condition !== "募集中")return;
                    if(reserve.max_passenger_count === reserve.passenger_count) return;  // 満員なので使用できない
                    if (departure_time.getTime() / (1000*60) + now_target.total_time + distance / walk_speed > reserve.departure_time.getTime() / (1000*60)) return;  // すでに出発していた場合
                    if (departure_time.getTime() / (1000*60) + now_target.total_time + distance / walk_speed + valid_time < reserve.departure_time.getTime() / (1000*60)) return;  // 投稿の出発時間まで許容できる時間を過ぎていた場合
                    if(distance <= valid_distance){  // 現在地から投稿の出発地まで歩いていける距離のとき
                        new_logs = now_target.logs.slice();
                        new_logs.push(reserve);
                        add = {
                            logs: new_logs,
                            destination_point: reserve.destination_point,
                            total_time: reserve.departure_time.getTime() / (1000*60) + reserve.total_time - departure_time.getTime() / (1000*60),
                            // total_time: reserve.total_time + distance / walk_speed + now_target.total_time,  // 投稿の出発までの待ち時間が考慮されていない
                            total_walk_time: now_target.total_walk_time + distance / walk_speed
                        };
                        next_nows.push(add);
                    }
                });
            });
            nows = next_nows;
            nows.sort((a,b)=>{
                a_time = a.total_time + cal_distance(a.destination_point, destination_point) / car_speed;
                b_time = b.total_time + cal_distance(b.destination_point, destination_point) / car_speed;
                return a_time - b_time;
            });
            while(nows.length>=10)nows.pop();
            new_nows = [];
            nows.forEach(now_target => {
                distance = cal_distance(now_target.destination_point, destination_point);
                if(distance > valid_distance){
                    new_nows.push(now_target);
                    return;
                }
                now_target.total_time += distance / walk_speed;  // 最後に降りたところからゴールまで徒歩でかかる時間を追加
                now_target.total_walk_time += distance / walk_speed;  // 最後に降りたところからゴールまで徒歩でかかる時間を追加
                responses.push(now_target);
            });
            nows = new_nows;
        }
        return responses;
    }

    var responses = fastreservations(valid_distance, valid_time, max_count, walk_speed, car_speed, departure_time);
    console.log('responses:', responses);
    // res.send({departure: departure_point, destination: destination_point, reservations: reservations, Number: distance, responses: responses});

    // Put this line to your function
    // Automatically allow cross-origin requests
    cors(req, res, () => {
        res.send({responses: responses});
    });

    res.send({responses: responses});
    // res.json({responses: responses});
});



















////////////////////////////////////////////////////////////////////////////////////////////////////////////////////









/**
 * 出発地と目的地の緯度経度で最適な乗り合わせ投稿を提案します
 * https://us-central1-aisharing-ac6cc.cloudfunctions.net/routeSearch3
 * 使用例: https://us-central1-aisharing-ac6cc.cloudfunctions.net/routeSearch3?route=30,139,21,140&departure_time=2019-09-20T17:43:00
 * リクエストパラメーター
 * {String} route (必須) 出発地と目的地の緯度経度。「出発地の緯度、出発地の経度、目的地の緯度、目的地の経度」
 * valid_distance: 歩きで許容する距離。単位はm (デフォルト)1000
 * valid_time: 投稿間の許容する空き時間。単位は分 (default) 60
 * max_count: 乗り換え回数 (デフォルト)10
 * departure_time: 出発予定時刻 (デフォルト)現在時刻 使用例: departure_time=2019-09-19T17:15:00
 * walk_speed: 歩くスピード。単位はm/m(メートル/分) (デフォルト) 80
 * car_speed: 車の速度。単位はm/m(メートル/分) (デフォルト) 1000
 * */
exports.routeSearch3_onCall = functions.https.onCall(async (req, res) => {
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

    var departure_time;
    if (query.departure_time) {
        departure_time = new Date(query.departure_time);
        departure_time.setHours(departure_time.getHours()-9);
    } else {
        departure_time = new Date();
    }

    var valid_distance = query.valid_distance ? Number(query.valid_distance) : 1000;
    var valid_time = query.valid_time ? Number(query.valid_time) : 60;
    var max_count = query.max_count ? Number(query.max_count) : 10;
    var walk_speed = query.walk_speed ? Number(query.walk_speed) : 80;  // 80m/m
    var car_speed = query.car_speed ? Number(query.car_speed) : 1000;  // 1000m/m

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
            departure_time: reservation.departure_time.toDate(),
            fare: reservation.fare,
            total_distance: reservation.total_distance,
            total_time: reservation.total_time / 60,  // reservation.total_timeは秒
            destination_name: reservation.destination_name,
            departure_name: reservation.departure_name,
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
        r = 6378137.0;

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
    * valid_time: 次の投稿まで許容する時間
    * max_count: 乗り換え回数
    * walk_speed: 徒歩で移動するときの速度
    * car_speed:
    * departure_time: 出発時刻
    */
    fastreservations = (valid_distance, valid_time, max_count, walk_speed, car_speed, departure_time) =>{
        responses = [];
        nows = [];

        reservations.forEach(reserve => {
            distance = cal_distance(departure_point,reserve.departure_point);
            if(reserve.condition !== "募集中")return;  // 募集中の投稿のみ使用する
            if(reserve.max_passenger_count === reserve.passenger_count) return;  // 満員なので使用できない
            if (departure_time.getTime() / (1000*60) + distance / walk_speed > reserve.departure_time.getTime() / (1000*60)) return;  // すでに出発時刻を過ぎていた場合
            if (departure_time.getTime() / (1000*60) + distance / walk_speed + valid_time < reserve.departure_time.getTime() / (1000*60)) return;  // 投稿の出発時間まで許容できる時間を過ぎていた場合
            if(distance <= valid_distance){
                add = {
                    logs: [reserve],
                    destination_point: reserve.destination_point,
                    total_time: reserve.departure_time.getTime() / (1000*60) + reserve.total_time - departure_time.getTime() / (1000*60),
                    // total_time: reserve.total_time + distance / walk_speed,   // 投稿の出発までの待ち時間が考慮されていない
                    total_walk_time: distance / walk_speed
                };
                nows.push(add);
            }
        });

        console.log("nows size is" + nows.length);

        // 距離と時間が混ざっているので投稿の目的地とゴールまでの距離を車の速度で割って時間にした
        nows.sort((a,b)=>{
            // a_time = a.total_time + cal_distance(a.destination_point, destination_point);
            // b_time = b.total_time + cal_distance(b.destination_point, destination_point);
            a_time = a.total_time + cal_distance(a.destination_point, destination_point) / car_speed;
            b_time = b.total_time + cal_distance(b.destination_point, destination_point) / car_speed;
            return a_time - b_time;
        });
        
        while(nows.length>=10)nows.pop();
        new_nows = [];
        nows.forEach(now_target => {
            distance = cal_distance(now_target.destination_point, destination_point);
            if(distance > valid_distance){
                new_nows.push(now_target);  // ゴールまで徒歩で許容する範囲を切っていなかったら探索対象に含める
                return;
            }
            responses.push(now_target);  // ゴールまで徒歩で許容する範囲を切っていたら探索終了でレスポンスに含める
        });
        nows = new_nows;

        for(var i=0;i<max_count;i+=1){
            // console.log('nows size:', nows.length);
            // console.log('nows:', nows);
            next_nows = [];
            nows.forEach(now_target => {
                reservations.forEach(reserve => {
                    distance = cal_distance(now_target.destination_point,reserve.departure_point);
                    if(reserve.condition !== "募集中")return;
                    if(reserve.max_passenger_count === reserve.passenger_count) return;  // 満員なので使用できない
                    if (departure_time.getTime() / (1000*60) + now_target.total_time + distance / walk_speed > reserve.departure_time.getTime() / (1000*60)) return;  // すでに出発していた場合
                    if (departure_time.getTime() / (1000*60) + now_target.total_time + distance / walk_speed + valid_time < reserve.departure_time.getTime() / (1000*60)) return;  // 投稿の出発時間まで許容できる時間を過ぎていた場合
                    if(distance <= valid_distance){  // 現在地から投稿の出発地まで歩いていける距離のとき
                        new_logs = now_target.logs.slice();
                        new_logs.push(reserve);
                        add = {
                            logs: new_logs,
                            destination_point: reserve.destination_point,
                            total_time: reserve.departure_time.getTime() / (1000*60) + reserve.total_time - departure_time.getTime() / (1000*60),
                            // total_time: reserve.total_time + distance / walk_speed + now_target.total_time,  // 投稿の出発までの待ち時間が考慮されていない
                            total_walk_time: now_target.total_walk_time + distance / walk_speed
                        };
                        next_nows.push(add);
                    }
                });
            });
            nows = next_nows;
            nows.sort((a,b)=>{
                a_time = a.total_time + cal_distance(a.destination_point, destination_point) / car_speed;
                b_time = b.total_time + cal_distance(b.destination_point, destination_point) / car_speed;
                return a_time - b_time;
            });
            while(nows.length>=10)nows.pop();
            new_nows = [];
            nows.forEach(now_target => {
                distance = cal_distance(now_target.destination_point, destination_point);
                if(distance > valid_distance){
                    new_nows.push(now_target);
                    return;
                }
                now_target.total_time += distance / walk_speed;  // 最後に降りたところからゴールまで徒歩でかかる時間を追加
                now_target.total_walk_time += distance / walk_speed;  // 最後に降りたところからゴールまで徒歩でかかる時間を追加
                responses.push(now_target);
            });
            nows = new_nows;
        }
        return responses;
    }

    var responses = fastreservations(valid_distance, valid_time, max_count, walk_speed, car_speed, departure_time);
    console.log('responses:', responses);
    // res.send({departure: departure_point, destination: destination_point, reservations: reservations, Number: distance, responses: responses});
    res.send({responses: responses});
    // res.json({responses: responses});
});






//プッシュ通知するAPI
exports.send_notification = functions.https.onCall((data, context) => {
    console.log("data",data);
    //プッシュ送信
    const value = {
        notification: {
            title: data.title,
            body: data.body,
        },
        webpush: {
            headers: {
                TTL: "60"
            },
            notification: {
                icon: data.icon,
                click_action: data.click_action
            }
        },
        token: data.token,
        // url: data.url ? data.url : ''
    };

    return admin.messaging().send(value)
                        .then((response) => {
                            console.log('Successfully sent message:', response);
                            return Promise.resolve(response);
                        })
                        .catch((error) => {
                            console.log('Error sending message:', error);
                            return Promise.reject(error);
                        });
});
