const chai = require('chai');
const chaitHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;
const activityRouter = require('../routers/activityRouter');

const {Activity} = require('../models/activityModel')
const {Event} = require('../models/eventModel')
const {app, runServer, closeServer} = require('../server.js');
const {TEST_DATABASE_URL} = require('../config.js')

chai.use(chaitHttp);

function seedActivityData(){
    const activityData = []
    for (let i=1; i<=10; i++){
        activityData.push(generateActivityData());
    }
    return Activity.insertMany(activityData)
}

//Generate test data
//I used strings for the date and time and number instead of currency because that's how they are stored
function generateActivityData(){
    return{
        eventId: "5af4c9c6f4266d148c2bc6ad",
        activity_name: faker.lorem.word(),
        activity_url: faker.lorem.words(),        
        activity_date: faker.lorem.words(),
        activity_time: faker.lorem.words(),
        kids_welcome: faker.random.boolean(),
        kid_cost: faker.random.number(),
        adult_cost: faker.random.number(),
        group_cost: faker.random.number(),
        group_size: faker.random.number(),
        activity_host: faker.internet.userName(),
        host_name: faker.internet.userName(),
        //attendees: faker.internet.userName(),
        kid_number: faker.random.number(),
        adult_number: faker.random.number(),
        activity_comments: {comment: faker.lorem.sentence(), name: faker.internet.userName()}
    }
}

function tearDownDb(){
    return mongoose.connection.dropDatabase();
}

describe('Activity API endpoint', function(){

    before(function(){
        return runServer(TEST_DATABASE_URL);
    });
    beforeEach(function(){
        return seedActivityData();
    });
    afterEach(function(){
        return tearDownDb();
    });
    after(function(){
        return closeServer();
    });

    describe('GET endpoint', function(){
        it('should return all activities associated with an event', function(){
            let eventId = "5af4c9c6f4266d148c2bc6ad"
            let res;
            
            return chai.request(app)
                .get(`/activity/event/${eventId}`)
                .then(function(_res){
                    res = _res;
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.an('array');
                    expect(res.body).to.have.length.of.at.least(1)
                    return Activity.count()
                    .then(function(count){
                        expect(res.body).to.have.lengthOf(count);
                    });
                });
        });

        it('should return the correct activity when called by Id', function(){
            let singleAct;

            return Activity
                .findOne()
                .then(function(a){
                    singleAct = a.body;
                })

            return chai.request(app)
                .get(`activity/${singleAct.id}`)
                .then(function(res){
                    expect(res).to.be.an('object');
                    expect(res).to.include.keys('id', 'eventId', 'activity_name', 'activity_host');
                    return res
                })
                .then(function(res){
                    expect(singleAct.id).to.equal(res.id);
                    expect(singleAct.activity_name).to.equal(res.activity_name);
                    expect(singleAct.activity_comments).to.equal(res.activity_comments);
                    expect(singleAct.eventId).to.equal(res.eventId);
                    expect(singleAct.activity_host).to.equal(res.activity_host);
                });
        });

    });

    describe('POST endpoint', function(){
        xit('should create a new activity', function(){
            const newAct = generateActivityData()
            delete newAct.activity_comments
            newAct.activity_comments = faker.lorem.sentence();

            return chai.request(app)
                .post('/activity')
                .send(newAct)
                .then(function(res){
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;
                    expect(res.body).to.include.keys('id', 'eventId', 'name', 'url', 'date', 'time', 'kids_welcome',
                        'kid_cost', 'adult_cost', 'group_cost', 'group_size', 'host', 'host_name',
                        'kid_number', 'adult_number', 'activity_comments');
                    expect(res.body.name).to.equal(newAct.activity_name);
                    expect(res.body.eventId).to.equal(newAct.eventId);
                    expect(res.body.url).to.equal(newAct.activity_url);
                    expect(res.body.date).to.equal(newAct.activity_date);
                    expect(res.body.time).to.equal(newAct.activity_time);
                    expect(res.body.kids_welcome).to.equal(newAct.kids_welcome);
                    expect(res.body.kid_cost).to.equal(newAct.kid_cost);
                    expect(res.body.adult_cost).to.equal(newAct.adult_cost);
                    expect(res.body.group_cost).to.equal(newAct.group_cost);
                    expect(res.body.group_size).to.equal(newAct.group_size);
                    expect(res.body.host).to.equal(newAct.activity_host);
                    expect(res.body.host_name).to.equal(newAct.host_name);
                    //expect(res.body.attendees).to.include(newAct.attendees);
                    expect(res.body.kid_number).to.equal(newAct.kid_number);
                    expect(res.body.adult_number).to.equal(newAct.adult_number);
                    expect(res.body.activity_comments.comment).to.equal(newAct.activity_comments.comment);
                    return Activity.findById(res.body.id);
                })
                .then(function(nAct){
                    expect(nAct.activity_name).to.equal(newAct.activity_name);
                    expect(nAct.eventId).to.equal(newAct.eventId);
                    expect(nAct.activity_url).to.equal(newAct.activity_url);
                    expect(nAct.activity_date).to.equal(newAct.activity_date);
                    expect(nAct.activity_time).to.equal(newAct.activity_time);
                    expect(nAct.kids_welcome).to.equal(newAct.kids_welcome);
                    expect(nAct.kid_cost).to.equal(newAct.kid_cost);
                    expect(nAct.adult_cost).to.equal(newAct.adult_cost);
                    expect(nAct.group_cost).to.equal(newAct.group_cost);
                    expect(nAct.group_size).to.equal(newAct.group_size);
                    expect(nAct.activity_host).to.equal(newAct.activity_host);
                    expect(nAct.host_name).to.equal(newAct.host_name);
                    //expect(nAct.attendees).to.include(newAct.attendees);
                    expect(nAct.kid_number).to.equal(newAct.kid_number);
                    expect(nAct.adult_number).to.equal(newAct.adult_number);
                });
        });

    });

    describe('PUT endpoint', function(){
        it('should update included fields', function(){
            const updateAct = {
                activity_name: faker.lorem.word(),
                group_size: faker.random.number(),
            }

            return Activity
                .findOne()
                .then(function(act){
                    updateAct.id = act.id;
                return chai.request(app)
                    .put(`/activity/${updateAct.id}`)
                    .send(updateAct)
                })
            
            .then(function(res){
                expect(res).to.have.status(204);
                return Activity.findById(updateAct.id);
            })
            .then(function(uAct){
                expect(uAct.activity_name).to.equal(updateAct.activity_name);
                expect(uAct.group_size).to.equal(updateAct.group_size);
            })
        });
        
        xit('should add a userId to the attendees array and increase attendence', function(){
            const joinAct = {
                userId: faker.internet.userName(),
                kid_number: 1,
                adult_number: 1
            }
            const orgAct ={}

            return Activity
                .findOne()
                .then(function(act){
                    joinAct.id = act.id;
                    orgAct.kid_number = act.kid_number;
                    orgAct.adult_number = act.adult_number;
                return chai.request(app)
                    .put(`/activity/join/${joinAct.id}`)
                    .send(joinAct)
                })
            
            .then(function(res){
                expect(res).to.have.status(204);
                return Activity.findById(joinAct.id)
            })
            .then(function(jAct){
                expect(jAct.attendees).to.include(joinAct.userId);
                expect(jAct.kid_number).to.equal(joinAct.kid_number+orgAct.kid_number);
                expect(jAct.adult_number).to.equal(joinAct.adult_number+orgAct.adult_number);
            })
        })

        it('should add a comment to the array', function(){
            const newComment = {
                comment: faker.lorem.sentence(),
                name: faker.internet.userName()
            }

            return Activity
                .findOne()
                .then(function(act){
                    newComment.id = act.id;
                return chai.request(app)
                    .put(`/activity/comments/${newComment.id}`)
                    .send(newComment)
                })
            
            .then(function(res){
                expect(res).to.have.status(204);
                return Activity.findById(newComment.id)
            })
            .then(function(comment){
                const foundComment = comment.activity_comments.filter(c => c.comment === newComment.comment && c.name === newComment.name)
                expect(foundComment).to.have.lengthOf(1)
            })
        })
    });

    describe('DELETE endpoint', function(){
        it('should delete an activity by id', function(){
            const deleteAct = {}

            return Activity
                .findOne()
                .then(function(act){
                    deleteAct.id = act.id;
                })
            return chai.request(app)
                .delete(`/activity/${deleteAct.id}`)
                .then(function(res){
                    expect(res).to.have.status(204);
                    const deleted = Activity.findById(deleteAct.id);
                    return deleted;
                })
            .then(function(dAct){
                expect(dAct).to.be.null;
            })
        });
    });
});