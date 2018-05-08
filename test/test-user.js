'use strict'

const chai = require('chai');
const chaitHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;
const eventRouter = require('../eventRouter');

const {User} = require('../models')
const {app, runServer, closeServer} = require('../server.js');
const {TEST_DATABASE_URL} = require('../config.js')

chai.use(chaitHttp);

function seedUserData(){
    console.info('seeding user data');
    const userData = []
    for(let i=1; i<=10; i++){
        userData.push(generateUserData())
    }
    return userData.insertMany(userData);
}

function generateUserData(){
    return{
       user_name: faker.internet.userName(),
       email: faker.internet.email(),
       password: faker.internet.password(),
       event_id: faker.lorem.word() 
    }
}

function tearDownDb(){
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('User API endpoint', function(){

    before(function(){
        return runServer(TEST_DATABASE_URL);
    });
    beforeEach(function(){
        return seedUserData();
    });
    afterEach(function(){
        return tearDownDb();
    });
    after(function(){
        return closeServer();
    });






    
})
