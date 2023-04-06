const express = require('express');
const multer = require('multer')
const app = express();
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8500;

//Home page
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname+'/index.html'));
})

//the multer middleware
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });
  // route to handle video upload
const upload = multer({ storage: storage });
  app.post('/upload',upload.single('video'),(req,res)=>{
    res.send('File uploaded successfully')

})
// route to handle video streaming
app.get('/stream', (req, res) => {

  const videoPath = './uploads/video.mp4';
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;
if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
 });

// route to handle video download
app.get('/download-video', (req, res) => {
 res.download("./uploads/video.mp4");
});

// start the server
app.listen(PORT, () => {
  console.log('Server listening on port 8500');
});
