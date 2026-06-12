const Task = require('../models/Task');
const mongoose = require('mongoose');
async function createTask(req, res, next) {
 
    const { title, description, status } = req.body;
    const user= req.user._id;

    const newTask = new Task({
        title,
        description,
        status,
        owner: user

    })
    try{
        await newTask.save();
        res.status(201).json({status: 'success', task: newTask});
    }
    catch(err){
        next(err);
    }
}

async function getTasks(req, res, next){
    const user = req.user._id;

    try{
        const tasks = await Task.find({owner: user});
        res.status(200).json({status: 'success', tasks: tasks});
    }
    catch(err){
        next(err);
    }
}

async function getSpecificTask(req, res, next){
    const user = req.user._id;
    const taskId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).json({ 
            status: 'fail', 
            message: 'Invalid Task ID format' 
        });
    }

    const taskInfo = await Task.findOne({_id: taskId, owner: user});
    if(!taskInfo){
        const error = new Error('Task not found ');
        error.statusCode = 404;
        return next(error);
    }
    res.status(200).json({status: 'success', task: taskInfo});
}



async function updateTask(req, res, next){
    const user = req.user._id;
    const taskId = req.params.id;
    const {title, description, status} = req.body;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).json({ 
            status: 'fail', 
            message: 'Invalid Task ID format' 
        });
    }
    
    const updatedTask= await Task.findOneAndUpdate({_id: taskId, owner: user}, {title, description, status}, {returnDocument: 'after'});
    if(!updatedTask){
        const error = new Error('Task not found');
        error.statusCode = 404;
        return next(error);
    }
    res.status(200).json({status: 'success', task: updatedTask});
}

async function deleteTask(req, res, next){
    const user = req.user._id;
    const taskId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).json({ 
            status: 'fail', 
            message: 'Invalid Task ID format' 
        });
    }

    const deletedTask = await Task.findOneAndDelete({_id: taskId, owner: user});
    if(!deletedTask){
        const error = new Error('Task not found ');
        error.statusCode = 404;
        return next(error);
    }
    res.status(200).json({status: 'success', message: 'Task deleted successfully'});
}

async function getAllTasks(req, res, next){
    try{
        const tasks = await Task.find({})
        .populate('owner', 'username email role');
        res.status(200).json({status: 'success', tasks: tasks});
    }
    catch(err){
        next(err);
    }
}

async function deleteAnyTask(req, res, next){
    const taskId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).json({ 
            status: 'fail', 
            message: 'Invalid Task ID format' 
        });
    }

    await Task.findByIdAndDelete(taskId);
    console.log(`Deleted By: ${req.user.username} Task ID: ${taskId}`);
    res.status(200).json({status: 'success', message: 'Task deleted successfully'});
}


module.exports = {createTask, getTasks, updateTask, deleteTask, getAllTasks, deleteAnyTask, getSpecificTask};

