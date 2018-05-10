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
       username: faker.internet.userName(),
       email: faker.internet.email(),
       password: faker.internet.password()
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
                        expect(user).to.include.keys('id', 'username', 'email');
                    });
                    singleUser = res.body[0];
                    console.log(singleUser);
                    return User.findById(singleUser.id);
                })
                .then(function(user){
                    expect(singleUser.id).to.equal(user.id);
                    expect(singleUser.username).to.equal(user.username);
                    expect(singleUser.email).to.equal(user.email);
                });
        });
    });

    describe('POST endpoint', function(){

        it('should add a new user', function(){
            const newUser = generateUserData();
            console.log(newUser);

            return chai.request(app)
                .post('/user')
                .send(newUser)
                .then(function(res){
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;
                    expect(res.body).to.include.keys('id', 'username', 'email');
                    expect(res.body.username).to.equal(newUser.username);
                    expect(res.body.email).to.equal(newUser.email.toLowerCase());
                    return User.findById(res.body.id);
                })
                .then(function(nUser){
                    expect(nUser.username).to.equal(newUser.username);
                    expect(nUser.email).to.equal(newUser.email.toLowerCase());
                    console.log(nUser)
                });
        });      
    });

    describe('PUT endpoint, updating current fields', function(){
        it('should update user fields', function(){
            const updateUser = {
                username: faker.internet.userName(),
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
                expect(res).to.have.status(204);
                return User.findById(updateUser.id);
            })
            .then(function(uUser){
                expect(uUser.username).to.equal(updateUser.username);
                expect(uUser.email).to.equal(updateUser.email.toLowerCase());
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
                    console.log(`Something ${deleteUser.id}`);
                })
            return chai.request(app)
                console.log('Is this even running?')                     
                .delete(`/user/${deleteUser.id}`)
                .then (function(res){
                    expect(res).to.have.status(204);
                    const deleted = User.findById(deleteUser.id);
                    console.log(deleted);
                    return deleted;
                })
            .then(function(dUser){
                expect(dUser).to.be.null;
            })
        });
    });
});
