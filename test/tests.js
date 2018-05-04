'use strict'

const chai = require('chai');
const chaitHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;
const eventRouter = require('../eventRouter');

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
        event_name: faker.random.words(),
        event_location: faker.random.locale(),
        event_dates: {start_date: faker.date.future(), end_date: faker.date.future()},
        event_organizer: faker.name.firstName()
    }
}

function tearDownDb(){
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('Event API endpoint', function(){

    before(function(){
        return runServer(TEST_DATABASE_URL);
    });
    beforeEach(function(){
        return seedEventData();
    });
    afterEach(function(){
        return tearDownDb();
    });
    after(function(){
        return closeServer();
    });

    describe('Post endpoint', function(){
        console.log('hey, is this working?');

        it('should add a new event', function(){
            const newEvent = generateEventData();
            console.log(newEvent);

            return chai.request(app)
                .post('/event')
                .send(newEvent)
                .then(function(res){
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;
                    expect(res.body).to.include.keys('id', 'name', 'dates', 'location', 'organizer');
                    expect(res.body.name).to.equal(newEvent.event_name);
                    expect(res.body.location).to.equal(newEvent.event_location);
                    //expect(res.body.dates).to.include(newEvent.event_dates.end_date);
                    expect(res.body.organizer).to.equal(newEvent.event_organizer);
                    return Event.findById(res.body.id);
                })
                .then(function(nEvent){
                    expect(nEvent.event_name).to.equal(newEvent.event_name);
                    expect(nEvent.event_location).to.equal(newEvent.event_location);
                    expect(nEvent.event_organizer).to.equal(newEvent.event_organizer);
                });
        });
    });
});

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