const express = require('express');
const bodyPaser = require('body-parser');
// const route = require('./route/route.js');
// const routes= require('./route/redirect.js');
const { default : mongoose } = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));

mongoose.connect("mongodb+srv://disha123:hl6LMcJIED1eCZhr@cluster0.hrerz.mongodb.net/group66Database", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))   // it passes the function when the promises gets resolved
.catch ( err => console.log(err) )
// app.use('/', routes);
// app.use('/', route );
app.use('/', require('./route/redirect.js'))
app.use('/', require('./route/route.js'))


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});