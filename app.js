import dotenv from 'dotenv'
import express from 'express'
import auth from './router/authentication.js'
import cors from 'cors';
import task from './Task/task.js';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cookieParser());

dotenv.config({path : './.env'}); 

const PORT = process.env.PORT;

const dataBase = process.env.DATABASE;

mongoose.connect(dataBase, {useUnifiedTopology : true,
    useNewUrlParser : true}).then(() => {
    console.log ("Mongoose connection started")
}).catch((err)=> console.log("Mongoose connection refused", err))

app.use(
    cors({
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(auth);
app.use(task);

app.listen(PORT, () => {
  console.log('server running at port no.', PORT)
})




