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
module.exports = {Event, User};