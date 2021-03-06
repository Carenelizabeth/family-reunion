require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');

mongoose.Promise = global.Promise;

const eventRouter = require('./routers/eventRouter');
const userRouter = require('./routers/userRouter');
const activityRouter = require('./routers/activityRouter');
const {router: authRouter, localStrategy, jwtStrategy} = require('./auth')

mongoose.Promise = global.Promise;

const app = express();

const {DATABASE_URL, PORT} = require('./config.js');

app.use(express.static('public'));
app.use(morgan('common'));
app.use(express.json());

app.use(function (req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    if(req.method === 'OPTIONS'){
        return res.send(204);
    }
    next();
});

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/event', eventRouter);
app.use('/user', userRouter);
app.use('/auth', authRouter);
app.use('/activity', activityRouter);

let server;

function runServer(databaseUrl, port = PORT){
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err =>{
            if (err) {
                return Promise.reject(err);
            }
            server = app.listen(port, () =>{
                console.log(`Your app is listening on port ${port}`);
                resolve();
            })
        
            .on('error', err => {
                mongoose.disconnect();
                reject(err);
            });
        });
    });
}


function closeServer(){
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) =>{
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
  }
  
module.exports = { runServer, app, closeServer };


