'user strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const eventSchema = new mongoose.Schema({
    event_name: String,
    event_location: String,
    event_dates: {
        start_date: Date,
        end_date: Date
    },
    event_organizaer: String
})

eventSchema.virtual('dateRange').get(function(){
    return `${this.event_dates.start_date} - ${this.event_dates.end_date}`;
});

eventSchema.methods.serialize = function(){
    return{
        id: this._id,
        location: this.event_location,
        dates: this.dateRange,
        organizer: this.event_organizaer
    };
};

const Event = mongoose.model('event', eventSchema);
module.exports = {Event};