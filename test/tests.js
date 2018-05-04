'use strict'

const chai = require('chai');
const chaitHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const {Event} = require('../models')
const {app, runServer, closeServer} = require('../server.js');
const {TEST_DATABASE_URL} = require('../config')

chai.use(chaitHttp);

function seedEventData(){
    console.info('seeding event data');
    const eventData = []
    for(let i=1; i<=10; i++){
        eventData.push(generateEventData());
    }
    return Event.insertMany(eventData);
}

function generateEventData(){
    return{
        event_name: faker.random.words,
        event_location: faker.random.locale,
        event_dates: {start_date: faker.date.future, end_date: faker.date.future},
        event_organizer: faker.firstName
    }
}

function tearDownDb(){
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('Event planning API', function(){
    it('should answer a request to root with html', function(){
        let res;
        return chai.request(app)
            .get('/')
            .then(function(_res){
                res = _res;
                expect(res).to.have.status(200);
                expect(res).to.be.html;
            });
    });
});