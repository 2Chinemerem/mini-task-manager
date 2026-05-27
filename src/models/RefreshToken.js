const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../.env') })

const DB_STRING = process.env.DB_STRING

mongoose.connect(DB_STRING)


const RefreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true

    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isRevoked: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true
    },

    createdByIp:{
        type: String,
    }
});

isExpired = function() {
    return this.expiresAt < new Date();
}
isActive = function() {
    return !this.isRevoked && !this.isExpired();
}




RefreshTokenSchema.methods.isExpired = isExpired;
RefreshTokenSchema.methods.isActive = isActive;
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })



const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);

module.exports = RefreshToken;