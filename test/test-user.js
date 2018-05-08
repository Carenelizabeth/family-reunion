'use strict'

const chai = require('chai');
const chaitHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;
const userRouter = require('../userRouter');

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
    return User.insertMany(userData);
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

    describe('Get endpoing', function(){
        it('should return all users', function(){
            let res;
            return chai.request(app)
                .get('/user')
                .then(function(_res){
                    res = _res;
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.an('array');
                    expect(res.body).to.have.length.of.at.least(1);
                    return User.count()
                    .then(function(count){
                        expect(res.body).to.have.lengthOf(count);
                    });
                });
        });

        it('should return the correct user when called by id', function(){
            let singleUser;
            return chai.request(app)
                .get('/event')
                .then(function(res){
                    res.body.forEach(function(user){
                        expect(user).to.be.an('object');
                        expect(user).to.include.keys('id', 'user', 'email', 'password', 'events');
                    });
                    singleUser = res.body[0];
                    return User.findById(singleUser.id);
                })
                .then(function(user){
                    expect(singleUser.id).to.equal(user.id);
                    expect(singleUser.user_name).to.equal(user.user);
                    expect(singleUser.email).to.equal(user.email);
                    expect(singleUser.password).to.equal(user.password);
                    expect(singleUser.event_id).to.equal(user.events);
                });
        });

    });





})
