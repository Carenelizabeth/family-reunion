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

const Event = mongoose.model('event', eventSchema);
module.exports = {Event};