const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('mongoose-type-email');
mongoose.Promise = global.Promise;

//const activityModel = require('./activityModel');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {type: String, required: true, unique: true },
    //activity: [{type: Schema.Types.ObjectId, ref: 'activity'}],
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

const User = mongoose.model('user', userSchema);
module.exports = {User}