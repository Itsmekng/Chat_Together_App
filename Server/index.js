const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const connection = require('./DB/connection.js');
const cors = require('cors');
require('./Model/index.js');

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

const userRoutes = require('./Router/user.router.js');
const messageRouter = require('./Router/message.router.js');
const responseHandler = require('./Middleware/response.middleware.js');
const errorHandler = require('./Middleware/error.middleware.js');

app.use(responseHandler);
app.use("/api/v1/user",userRoutes);
app.use("/api/v1/message",messageRouter);
app.use(errorHandler);

connection.sync({force: true}).then(() =>{
    const port = 3000;
    app.listen(port, () => {
        console.log("Server listen on localhost port:" ,port)
    })
}).catch((err) =>{
    console.log(err);
    process.exit(1);
});
