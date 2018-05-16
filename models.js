'user strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('mongoose-type-email');
mongoose.Promise = global.Promise;

const Schema = mongoose.Schema

const eventSchema = new Schema({
    event_name: String,
    event_location: String,
    event_dates: {
        start_date: String,
        end_date: String
    },
    event_organizer: String,
    event_members: [String]
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
        organizer: this.event_organizer,
        event_members: [this.event_members]
    };
};

const activitySchema = new Schema({
    eventId: String,
    activity_name: {type: String, required: true},
    activity_date: String,
    activity_time: String,
    kids_welcome: Boolean,
    kid_cost: Number,
    adult_cost: Number,
    group_cost: Number,
    group_size: Number,
    activity_host: String,
    attendees: [String],
    kid_number:Number,
    adult_number: Number,
    activity_comments: [String]
})

activitySchema.methods.serialize = function(){
    return{
        id: this.id,
        eventId: this.eventId,
        name: this.activity_name,
        date: this.activity_date,
        time: this.activity_time,
        kids_welcome: this.kids_welcome,
        kid_cost: this.kid_cost,
        adult_cost: this.adult_cost,
        group_cost: this.group_cost,
        group_size: this.group_size,
        host: this.activity_host,
        attendees: [this.attendees],
        kid_number: this.kid_number,
        adult_number: this.adult_number,
        activity_comments: [this.activity_comments]
    }
}

const userSchema = new Schema({
    username: {type: String, required: true, unique: true },
    email: {type: Schema.Types.Email, required: true},
    password: {type: String, required: true},
})

userSchema.methods.serialize = function(){
    return{
        id: this._id,
        username: this.username,
        email: this.email    
    }
}

userSchema.methods.validatePassword = function(password){
    return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password){
    return bcrypt.hash(password, 10);
};

const Event = mongoose.model('event', eventSchema);
const User = mongoose.model('user', userSchema);
const Activity = mongoose.model('activity', activitySchema);
module.exports = {Event, User, Activity};
