const express = require("express");
const path = require("path");
const multer = require("multer");
const { register } = require("module");
require("dotenv").config({ path: path.resolve(__dirname, '.env') });
const PORT = process.env.PORT || 3001;
const app = express();

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({extended: true}));

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));


const storage = multer.diskStorage({
    destination : function(req, file, cb) {
        cb(null, path.join(__dirname, 'uploads/'));
    },
    filename : function(req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ 
    storage : storage,
    limits : { files : 15 }
});

app
    .route("/")
    .get((req, res) => {
        res.sendFile(path.join(__dirname, "public", "index.html"));
    });
    

app
    .route("/uploadOne")
    .get((req, res) => {
        const message = req.query.message || '';
        res.sendFile(path.join(__dirname, "public", "uploadOne.html"));        
    })
    .post(upload.single('photo'), (req, res) => {
        // res.send('File uploaded successfully!');
        res.redirect(`/uploadOne?message=File uploaded successfully`);
    });

app
    .route("/uploadMultiple")
    .get((req, res) => {
        const message = req.query.message || '';
        res.sendFile(path.join(__dirname, "public", "uploadMultiple.html"))
    })
    .post(upload.array("files", 100), (req, res) => {
        if(!req.files || req.files.length === 0){
            return res.status(400).send("No files uploaded.");
        }
        const filePaths = req.files.map((file, index) => `${index + 1}. ${file.path}`).join('\n');
        
        res
            .status(200)
            .type('text/plain')
            // .send(`Files uploaded successfully:\n${filePaths}`);
            .redirect(`/uploadMultiple?message=Files uploaded successfully:\n${filePaths}`);
    })

app.use((req, res, next) => {
    res.status(404).send("Route not found!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});