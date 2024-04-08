const multer = require('multer');
const express = require("express");
const app = express();
const cloudinary = require('./utils/cloudinary');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
require("dotenv").config();
require("express-async-errors");
const connectDB = require("./database/connect");
const path = require('path');
const Equipment=require('./Schema/EquipmentSchema');
const Crop=require('./Schema/CropSchema');
const Fertilizer=require('./Schema/FertilizersSchema');
const Cattle=require('./Schema/CattleSchema');
const axios = require('axios');
const fs=require('fs');
app.use(express.json());


const UsersDetail=require('./Schema/UserDetailSchema');

const uploadDir = path.join(__dirname, 'upload');

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log('Upload directory created successfully.');
  } else {
    console.log('Upload directory already exists.');
  }
} catch (err) {
  console.error('Error creating upload directory:', err);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); 
  }
});

const upload = multer({ storage: storage });


const port = process.env.PORT || 5000;

var transporter = nodemailer.createTransport({
  service:'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD
  }
});

app.get('/getEquipment',async (req,res)=>{
   

  try{
    const Fetcheddata=await Equipment.find();
    res.send(Fetcheddata);
  }
  catch(err){
      res.send(err);
  }
     
})
app.post('/postEquipment',async (req,res)=>{
     try{
      const RecievedData=new Equipment(req.body);
      const data=await RecievedData.save();
      res.send(data);
     }
     catch(err){
      res.send(err);
     }
})
app.get('/getCrop',async (req,res)=>{
   

  try{
    const Fetcheddata=await Crop.find();
    res.send(Fetcheddata);
  }
  catch(err){
      res.send(err);
  }
     
})

app.post('/postCrop',async (req,res)=>{
     try{
      const RecievedData=new Crop(req.body);
      const data=await RecievedData.save();
      res.send(data);
     }
     catch(err){
      res.send(err);
     }
})


app.post('/storeUserDetail', upload.fields([
  { name: 'aadhar', maxCount: 1 },
  { name: 'pan', maxCount: 1 },
  { name: 'profile', maxCount: 1 }
]), async(req, res) => {
  try {
      const { name, address, phone } = req.body;
      const aadharImage = req.files['aadhar'] ? req.files['aadhar'][0] : null;
      const panImage = req.files['pan'] ? req.files['pan'][0] : null;
      const profileImage = req.files['profile'] ? req.files['profile'][0] : null;

      
      console.log('Name:', name);
      console.log('Address:', address);
      console.log('Phone:', phone);

      
      console.log('Aadhar Image:', aadharImage ? aadharImage : 'Not provided');
      console.log('Pan Image:', panImage ? panImage : 'Not provided');
      console.log('Profile Image:', profileImage ? profileImage : 'Not provided');

      const aadharResult = aadharImage ? await cloudinary.uploader.upload(aadharImage.path) : null;
      const panResult = panImage ? await cloudinary.uploader.upload(panImage.path) : null;
      const profileResult = profileImage ? await cloudinary.uploader.upload(profileImage.path) : null;

      
      console.log('Aadhar Upload Result:', aadharResult);
      console.log('Pan Upload Result:', panResult);
      console.log('Profile Upload Result:', profileResult);

    
      const newUserDetail = new UsersDetail({
        name,
        address,
        phone,
        aadhar: aadharResult ? { public_id: aadharResult.public_id, url: aadharResult.secure_url } : null,
        panCard: panResult ? { public_id: panResult.public_id, url: panResult.secure_url } : null,
        profile: profileResult ? { public_id: profileResult.public_id, url: profileResult.secure_url } : null
      });
      await newUserDetail.save();

     
      console.log(newUserDetail);
      const content = `
  <table border="1">
    <tr>
      <th>Name</th>
      <th>Address</th>
      <th>Phone</th>
      <th>Aadhar Card</th>
      <th>Pan Card</th>
      <th>PassPort photo</th>
    </tr>
    <tr>
      <td>${newUserDetail.name}</td>
      <td>${newUserDetail.address}</td>
      <td>${newUserDetail.phone}</td>
      <td>${newUserDetail.aadhar.url}</td>
      <td>${newUserDetail.panCard.url}</td>
      <td>${newUserDetail.profile.url}</td>
    </tr>
  </table>
`;

console.log(content);
      
      console.log(content);

      
      var mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: '1ds20is016@dsce.edu.in',
        subject: 'LOAN APPROVAL REQUEST',
        html:content
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      res.status(200).send(newUserDetail);
  } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'Internal Server Error' });
  }
});


app.get('/getUserData',async(req,res)=>{
  try{
    const FetchedData=await UsersDetail.find();
    res.send(FetchedData);
  }
  catch(err){
    res.send(err);
  }
})
app.get('/getFertilizer',async (req,res)=>{
   

  try{
    const Fetcheddata=await Fertilizer.find();
    res.send(Fetcheddata);
  }
  catch(err){
      res.send(err);
  }
     
})


app.get('/api/locations', (req, res) => {
  console.log(req.query);
  let {lat,lon}=req.query;
  lat=Number(lat);
  lon=Number(lon);
  lat=lat.toFixed(4);
  lat=parseFloat(lat);
  lon=lon.toFixed(4);
  lon=parseFloat(lon);
  fs.readFile('locations.json', 'utf8', (err, data) => {
      if (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
      }
      else{
        let ObjData=JSON.parse(data);
        let arrayData=ObjData.locations;
        let minValue=1000;
        let DataItem={};
        arrayData.map((item)=>{
          if(minValue>(Math.min(minValue,Math.abs(item.latitude-lat) +Math.abs(item.longitude-lon)))){

            minValue=Math.min(minValue,Math.abs(item.latitude-lat) +Math.abs(item.longitude-lon));
            DataItem=item;


          }
          
        })
        console.log(minValue);
        res.send({price: DataItem.price_estimate_per_sqft.average,location:DataItem.location});
      }
  });
});




app.get('/getlocation', async (req, res) => {
  const { lat, lon } = req.body;
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&zoom=10&format=json`);
    const importance = response.data.importance;
    const rank=response.data.place_rank;
    const placeName=response.data.address;
    const type=response.data.type;
    res.send({ placeName,importance,rank,type });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.post('/postFertilizer',async (req,res)=>{
     try{
      const RecievedData=new Fertilizer(req.body);
      const data=await RecievedData.save();
      res.send(data);
     }
     catch(err){
      res.send(err);
     }
})

app.get('/getCattle',async (req,res)=>{
   

  try{
    const Fetcheddata=await Cattle.find();
    res.send(Fetcheddata);
  }
  catch(err){
      res.send(err);
  }
     
})

app.post('/postCattle',async (req,res)=>{
     try{
      const RecievedData=new Cattle(req.body);
      const data=await RecievedData.save();
      res.send(data);
     }
     catch(err){
      res.send(err);
     }
})

app.delete('/deleteEquipment',async (req,res)=>{
  const data=await UsersDetail.deleteOne({_id:"6603c3852a37fe69ae8b3e39"});
  res.send(data);
})

const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("Database connection established successfully...");
    app.listen(port, console.log(`Server started on port ${port}...`));
  } catch (err) {
    console.log(err);
  }
};

startServer();