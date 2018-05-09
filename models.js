'user strict';

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
    event_organizer: {type: Schema.Types.ObjectId, ref: 'User'}
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

const userSchema = new Schema({
    user_name: String,
    email: Schema.Types.Email,
    password: String,
    //event_id:[{type: Schema.Types.ObjectId, ref: 'Event'}]
    event_id: [String]
})

userSchema.methods.serialize = function(){
    return{
        id: this._id,
        user: this.user_name,
        email: this.email,
        password: this.password,
        events: [this.event_id]       
    }
}

const Event = mongoose.model('event', eventSchema);
const User = mongoose.model('user', userSchema);
module.exports = {Event, User};