const express = require("express");
const path = require("path");
const multer = require("multer");
const { register } = require("module");
const fs = require("fs")
// const archiver = require('archiver');
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
        // cb(null, file.originalname);
        cb(null, `${Date.now()}-${file.originalname}`);
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
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
          } 
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

// Sending the single random file over
app.get("/fetchSingle", (req, res) => {
    let upload_dir = path.join(__dirname, "uploads");

    let uploads = fs.readdirSync(upload_dir);
    // Add error handling
    if (uploads.length == 0) {
      return res.status(503).send({
        message: "No images",
      });
    }
    let max = uploads.length - 1;
    let min = 0;
  
    let index = Math.round(Math.random() * (max - min) + min);
    let randomImage = uploads[index];
  
    res.sendFile(path.join(upload_dir, randomImage));
  });
  
// Sending the multiple random files over
app.get('/fetchMultiple', (req, res) => {
    let upload_dir = path.join(__dirname, 'uploads'); // Path to your 'uploads' directory
  
    fs.readdir(upload_dir, (err, files) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to read images directory' });
      }
  
      if (files.length === 0) {
        return res.status(404).json({ message: 'No images found' });
      }
  
      // Select a random number of images (adjust as per your requirement)
      const numberOfImages = Math.floor(Math.random() * files.length) + 1;
      const selectedImages = [];
  
      // Generate random indices to select random images
      while (selectedImages.length < numberOfImages) {
        const randomIndex = Math.floor(Math.random() * files.length);
        const randomImage = files[randomIndex];
        if (!selectedImages.includes(randomImage)) {
          selectedImages.push(randomImage);
        }
      }  
      const imagesData = selectedImages.map((image) => {
        return {
          filename: image,
          path: `/uploads/${image}`, // Adjust the path as per your directory structure
        };
      });  
      res.json(imagesData);
    });
  });

// Routes for gallery page
app.route("/gallery")
    .get((req, res) => {
        res.sendFile(path.join(__dirname, "public", "gallery.html"));
    })
    .post((req, res) => {
        // Handle any form submissions or interactions
        // Currently not used, but can be extended for future use
        res.redirect("/gallery");
    });

app.get('/fetchGalleryImages', (req, res) => {
    let upload_dir = path.join(__dirname, 'uploads');

    fs.readdir(upload_dir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read images directory' });
        }

        if (files.length === 0) {
            return res.status(404).json({ message: 'No images found' });
        }

        const imagesData = files.map(image => ({
            filename: image,
            path: `/uploads/${image}`
        }));

        res.json(imagesData);
    });
});



app.use((req, res, next) => {
    res.status(404).send("Route not found!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});