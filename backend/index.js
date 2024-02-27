const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); 
const app = express();
const mongoose = require('mongoose');
const cors = require('cors')
const port = 8080;
const bcrypt = require('bcrypt');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        fs.mkdir(uploadDir, { recursive: true }, function (err) {
            if (err) {
                console.error('Error creating upload directory:', err);
            }
            cb(null, uploadDir);
        });
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Rename files
    }
});

const upload = multer({ storage: storage });
mongoose.connect("mongodb://127.0.0.1:27017/imgUpload").then(res => {
    console.log("Successfully db Connected");
}).catch(err => console.log(err));

const userSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

const User = mongoose.model('User', userSchema);

const imageSchema = mongoose.Schema({
    name: String,
    imageURL: String,
    user: String
});

const Image = mongoose.model('Image', imageSchema);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: ["https://mdkhalilul-dobby.vercel.app"],
    methods: ["POST", "GET"],
    credentials: true
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));




const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw error;
    }
};

const verifyPassword = async (password, hashedPassword) => {
    try {
        const match = await bcrypt.compare(password, hashedPassword);
        return true;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        throw error;
    }
};
app.get("/",(req,res)=>{
    res.json("Hello")
})

app.post('/register', async (req, res) => {
    const { email, name, password } = req.body;
    try {
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.send("User with this email id is Already Existed");
        }
        const hashedPassword = await hashPassword(password);
        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword,
        });
        await newUser.save();
        res.send("Successfully Saved");
    } catch (error) {
        console.error('Error in registration:', error);
        res.send("Error in registration");
    }
});

app.post('/login', async (req, res) => {
    const { name, password } = req.body;
    try {
        const existingUser = await User.findOne({ name: name });

        if (existingUser) {
            storedHashedPassword = existingUser.password;
            const isMatch = await verifyPassword(password, storedHashedPassword);
            if (isMatch) {
                res.send({ message: "Welcome to the Book Recommendation app", user: existingUser });
            } else {
                console.log("Your Pasword is Wrong");
            }
        } else {
            console.log('User not found');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/imgDetail', upload.array('images', 10), async (req, res) => {
    const { name, userId } = req.body;
    if (!name || !userId) {
        return res.status(400).json({ error: 'Name and userId are required' });
    }

    const images = req.files.map(file => ({
        name: name,
        imageURL: file.filename, 
        user: userId
    }));
    
    try {
        const savedImages = await Image.insertMany(images);
        res.status(200).json(savedImages);
    } catch (error) {
        console.error('Error saving images:', error);
        res.status(500).json({ error: 'Failed to save images' });
    }
});



app.get('/images', async (req, res) => {
    try {
        const images = await Image.find();
        res.json(images); 
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

app.listen(port, () => {
    console.log("Backend is Connected");
});
