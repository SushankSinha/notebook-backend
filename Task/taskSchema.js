import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
    title : String,
    content : String,
    date : String,
    category : String,
    userId : String
})

const Task = mongoose.model('TASK', taskSchema);

export default Task