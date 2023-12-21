import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import express from 'express'
import Task from './taskSchema.js';
import User from '../models/userSchema.js';
const router = express.Router();
import nodemailer from "nodemailer";
import { google } from "googleapis";

const OAuth2 = google.auth.OAuth2;

const sendMailVerification = async (name, email, difference, title) => {
  try {
    let mailTransporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: process.env.ACCESS_TOKEN,
        expires: 3599,
      },
    });

    let mailOptions;

    if(difference>0){
      mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Gentle Reminder for your Note!",
        html: `<p>Greetings ${name}! You just created a note 😍. This is a gentle reminder mail regarding your upcoming scheduled note with Title -"${title}". ${difference} days to go! Don't procrastinate 🥱. Keep grinding 💪</p>`,
      };
      mailTransporter.sendMail(mailOptions, function (error) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email has been sent");
        }
      });
    }else if(difference == 0){
      mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Last day Reminder for your Note!",
        html: `<p>Greetings ${name}! This is last day reminder mail regarding your scheduled note with Title -"${title}". Today is the last day 😲 to complete it! Keep grinding 💪</p>`,
      };
      mailTransporter.sendMail(mailOptions, function (error) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email has been sent");
        }
      });
    }else if(difference<0){
      mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Not-so-Gentle Reminder for your Note!",
        html: `<p>Greetings ${name}! This is a reminder mail regarding a note with Title -"${title}". You have selected a date from past 😭. If you want to, just update the date. Keep grinding 💪</p>`,
      };
      mailTransporter.sendMail(mailOptions, function (error) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email has been sent");
        }
      });
    }

    // mailTransporter.sendMail(mailOptions, function (error) {
    //   if (error) {
    //     console.log(error);
    //   } else {
    //     console.log("Email has been sent");
    //   }
    // });
  } catch (error) {
    console.log(error.message);
  }
};


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
          
          res.status(201).json({message : "Task Saved!", taskDetails});

          function calculateDateDifference(inputDateString) {
            const parts = inputDateString.split("-");
            const inputDate = new Date(parts[2], parts[0] - 1, parts[1]); 

            const currentDate = new Date();
          
            const timeDifference = inputDate.getTime() - currentDate.getTime();
            const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
          
            return daysDifference;
          }
          
          const difference = calculateDateDifference(date);
          sendMailVerification(user.name, user.email, difference, title);
          

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