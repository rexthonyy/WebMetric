const express = require('express');
const http = require('http');
const mongoose = require('mongoose');

const app = express();
const server = http.Server(app);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

app.use(express.json());

app.use(express.static('public'));
app.use('/favicon.ico', express.static('public/images/icons/appicon.png'));

//database connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/webmetricDB";
mongoose.connect(MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to mongodb Database'));