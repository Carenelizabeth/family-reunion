'user strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('mongoose-type-email');
mongoose.Promise = global.Promise;

const Schema = mongoose.Schema

const userSchema = new Schema({
    username: {type: String, required: true, unique: true },
    email: {type: Schema.Types.Email, required: true},
    password: {type: String, required: true},
    //event_id:[{type: Schema.Types.ObjectId, ref: 'Event'}]
    event_id: {type: [String], default: ''}
})

const eventSchema = new Schema({
    event_name: String,
    event_location: String,
    event_dates: {
        start_date: String,
        end_date: String
    },
    //event_organizer: String
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



userSchema.methods.serialize = function(){
    return{
        id: this._id,
        username: this.username,
        email: this.email,
        password: this.password,
        events: [this.event_id]       
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
module.exports = {Event, User};