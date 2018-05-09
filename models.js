'user strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const eventSchema = new mongoose.Schema({
    event_name: String,
    event_location: String,
    event_dates: {
        start_date: String,
        end_date: String
    },
    event_organizer: String
})

eventSchema.virtual('dateRange').get(function(){
    return `${this.event_dates.start_date} - ${this.event_dates.end_date}`;
});

eventSchema.methods.serialize = function(){
    return{
        id: this._id,
        name: this.event_name,
        location: this.event_location,
        dates: this.dateRange,
        organizer: this.event_organizer
    };
};

const costSchema = new mongoose.Schema({
    adults: Number,
    kids: Number,
    group: Number,
    group_size: Number
})

const activitySchema = new mongoose.Schema({
    activity_name: {type: String, required: true},
    activity_description: String,
    activity_date: String,
    activity_time: String,
    activity_cost: costSchema,
    activity_host: String,
    attendees: [new mongoose.Schema({name: String})]
})

activitySchema.methods.serialize = function(){
    return{
        name: this.activity_name,
        description: this.activity_description,
        date: this.activity.date,
        time: this.activity_time,
        kid_cost: this.activity_cost.kids,
        adult_cost: this.activity_cost.adults,
        group_cost: this.activity_cost.groups,
        group_size: this.activity_cost.group_size,
        host: this.activity_host
    }
}

const Event = mongoose.model('event', eventSchema);
const Activity = mongoose.model('activity', activitySchema);
module.exports = {Event, Activity};