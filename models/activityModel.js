const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('mongoose-type-email');
mongoose.Promise = global.Promise;

const userModel = require('./userModel');
const Schema = mongoose.Schema;

const activitySchema = new Schema({
    eventId: String,
    activity_name: {type: String, required: true},
    activity_url: String,
    activity_date: String,
    activity_time: String,
    kids_welcome: Boolean,
    kid_cost: Number,
    adult_cost: Number,
    group_cost: Number,
    group_size: Number,
    activity_host: String,
    host_name: String,
    attendees: [{type: Schema.Types.ObjectId, ref:'user'}],
    kid_number: Number,
    adult_number: Number,
    activity_comments: [{comment: String, name: String}]
});

/*activitySchema.pre('find', function(){
    this.populate({path:('user'), select:('username')});
})*/

activitySchema.methods.serialize = function(){
    return{
        id: this._id,
        eventId: this.eventId,
        name: this.activity_name,
        url: this.activity_url,
        date: this.activity_date,
        time: this.activity_time,
        kids_welcome: this.kids_welcome,
        kid_cost: this.kid_cost,
        adult_cost: this.adult_cost,
        group_cost: this.group_cost,
        group_size: this.group_size,
        host: this.activity_host,
        attendees: this.attendees.map(x => x.username),
        kid_number: this.kid_number,
        adult_number: this.adult_number,
        activity_comments: this.activity_comments
    }
}

const Activity = mongoose.model('activity', activitySchema);
module.exports = {Activity};