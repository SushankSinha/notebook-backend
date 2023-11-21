import express from 'express'
import Task from './taskSchema.js';
import User from '../models/userSchema.js';
const router = express.Router();

// Route to get all Tasks

router.get('/task/:userId', async (req, res) => {
  const userId = req.params.userId;
  const user = User.findById({_id:userId})
  if(user){
  try {
    const task = await Task.aggregate([{$match:{userId : userId}}]);
    res.send(task);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving Tasks' });
  }
}
});

// Route to get one Task

router.get('/task/:userId/:id', async (req, res) => {
  const userId = req.params.userId;
  const user = User.findById({_id:userId})
  if(user){
  const id = req.params.id;
  try {
    const task = await Task.findOne({_id:id});
    res.send(task);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving Tasks' });
  }
}
});

// Route to add a new Task

router.post('/task/:userId/add-task', async (req, res) => {
  const userId = req.params.userId;
  const user = User.findById({_id:userId})
  if(user){
  const {title, content, date, category, userId} = req.body;

  try {
              
          const taskDetails = new Task({title, content, date, category, userId});

          await taskDetails.save();            
          
          res.status(201).json({message : "Task Saved!", taskDetails})
          } catch(err){
      console.log(err)
  }
}
});

router.put('/task/:userId/edit/:id', async (req, res) => {

  const userId = req.params.userId;
  const user = User.findById({_id:userId})
  if(user){

  const id = req.params.id;

  const {title, content, date, category} = req.body;

    try {
      const updatedTask = await Task.findByIdAndUpdate({_id:id}, { title, content, date, category, userId}, { new: true });
      res.status(201).json({message : "Task Updated!", task: updatedTask});
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error updating Task', error });
    }
  }
});

router.delete('/task/:userId/delete/:id', async (req, res) => {
  const userId = req.params.userId;
  const user = User.findById({_id:userId})
  if(user){
  const id  = req.params.id;

  try {
    await Task.findByIdAndDelete({_id:id})
    res.status(204).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting Task', error });
  }
}
});


export default router;