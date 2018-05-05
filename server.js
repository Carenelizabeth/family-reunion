'use strict'

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const eventRouter = require('./eventRouter');

const app = express();

const {DATABASE_URL, PORT} = require('./config.js');
const {PORT} = require('./config.js');


app.use(express.static('public'));
app.use(morgan('common'));
app.use(express.json());


app.use('/event', eventRouter);

let server;

function runServer(databaseUrl, port = PORT){
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err =>{
            if (err) {
                return reject(err);
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

app.listen(PORT);
module.exports = app

