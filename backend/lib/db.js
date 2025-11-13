import mongoose from "mongoose";
export const connectDB = async()=>{
    try{
       const conn =  await mongoose.connect(process.env.Mongo_Url)
       console.log(`Mongo DB Connect on ${conn.connection.host}`);
       
    }catch(err){
        console.log(err);
    }
}