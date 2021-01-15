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

const signupRoute = require("./routes/signup");
app.use("/signup", signupRoute);

const signinRoute = require("./routes/signin");
app.use("/signin", signinRoute);

const userRoute = require("./routes/user");
app.use("/user", userRoute);

const projectRoute = require("./routes/project");
app.use("/project", projectRoute);

const pageRoute = require("./routes/page");
app.use("/page", pageRoute);

const eventRoute = require("./routes/event");
app.use("/event", eventRoute);


//database connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/webmetricDB";
mongoose.connect(MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to mongodb Database'));