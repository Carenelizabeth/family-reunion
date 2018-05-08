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

    describe('GET endpoint', function(){
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
                .get('/user')
                .then(function(res){
                    res.body.forEach(function(user){
                        expect(user).to.be.an('object');
                        expect(user).to.include.keys('id', 'user', 'email', 'password', 'events');
                    });
                    singleUser = res.body[0];
                    console.log(singleUser);
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

    describe('POST endpoint', function(){

        it('should add a new user', function(){
            const newUser = generateUserData();
            console.log(newUser);

            return chai.request(app)
                .post('/event')
                .send(newUser)
                .then(function(res){
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;
                    expect(res.body).to.include.keys('id', 'user', 'email', 'password', 'events');
                    expect(res.body.user).to.equal(newUser.user_name);
                    expect(res.body.email).to.equal(newUser.email);
                    expect(res.body.password).to.equal(newUser.password);
                    expect(res.body.events).to.equal(newUser.event_id);
                    return User.findById(res.body.id);
                })
                .then(function(nUser){
                    expect(nUser.user_name).to.equal(newUser.user_name);
                    expect(nUser.email).to.equal(newUser.email);
                    expect(nUser.event_id).to.equal(newUser.event_id);
                });
        });      
    });

    describe('PUT endpoint, updating current fields', function(){
        it('should update user fields', function(){
            const updateUser = {
                user_name: faker.internet.userName(),
                email: faker.internet.email(),
            };
            return User
                .findOne()
                .then(function(user){
                    updateUser.id = user.id;
                
                return chai.request(app)
                    .put(`/user/${updateUser.id}`)
                    .send(updateUser)
                })

            .then(function(res){
                expect(res).to.have.status(2004);
                return User.findById(updateUser.id);
            })
            .then(function(uUser){
                expect(uEvent.user_name).to.equal(updateUser.user_name);
                expect(uEvent.email).to.equal(updateUser.email);
            })
        });
    });

    describe('DELETE endpoint', function(){
        it('should delete a user by id', function(){
            const deleteUser = {}

            return User
                .findOne()
                .then(function(user){
                    deleteUser.id = user.id;
                })
            return chai.request(app)
                .delete(`/user/${deleteUser.id}`)
                .then (function(res){
                    expect(res).to.have.status(204);
                    return User.findById(deleteUser.id)
                })
            .then(function(dUser){
                expect(dUser).to.be.null;
            })
        });
    });
});
