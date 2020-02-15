const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const cookieParser = require('cookie-parser');

dotenv.config();

mongoose.Promise = global.Promise;
try {
mongoose.connect('mongodb://restfulAdmin:m3u2QpCUgauBeZjBC@localhost:27017/restful', {useUnifiedTopology:true, useNewUrlParser: true, useCreateIndex:true })
} catch (error) {
  handleError(error);
}

const app = express();

app.set('etag','weak');

app.get('/', (req, res) => {
  res.send('Now using https..');
});

app.listen('4000',()=>{
  console.log('Server started');
});
app.use(cookieParser());

const whitelist = ['https://restful.rebhan.xyz:3000', 'https://restful.rebhan.xyz:4200', 'https://restful.rebhan.xyz', '*']

app.use(cors({
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}));

// Middleware
app.use(morgan('dev'));
app.use(bodyParser.json());

// Routen
app.use('/users', require('./routes/users'));
app.use('/locations', require('./routes/locations'));
app.use('/pictures', require('./routes/pictures'));
app.use('/challenges',require('./routes/challenges'));
app.use('/profiles',require('./routes/profiles'));
app.use('/friends',require('./routes/friends'));

var options = {
  key: fs.readFileSync('/etc/letsencrypt/live/restful.rebhan.xyz/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/restful.rebhan.xyz/fullchain.pem')
}

const port = process.env.PORT || 5000;
// app.listen(port);

console.log(`Server listening at ${port}`);

https.createServer(options, app).listen(port);

module.exports = app;
