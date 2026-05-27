const mongoose = require('mongoose');
const path = require('path');



require('dotenv').config({ path: path.join(__dirname, '../../.env') })

const DB_STRING = process.env.DB_STRING

mongoose.connect(DB_STRING)




const TaskSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
    },
    status:{
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

const Task=  mongoose.model('Task', TaskSchema)

module.exports = Task