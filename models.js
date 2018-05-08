'user strict';

const mongoose = require('mongoose');
require('mongoose-type-email');
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

const userSchema = new mongoose.Schema({
    user_name: String,
    email: mongoose.SchemaTypes.Email,
    password: String,
    event_id: String,
})

userSchema.methods.serialize = function(){
    return{
        id: this._id,
        user: this.user_name,
        email: this.email,
        password: this.password,
        events: this.event_id,        
    }
}

const Event = mongoose.model('event', eventSchema);
const User = mongoose.model('user', userSchema);
module.exports = {Event, User};