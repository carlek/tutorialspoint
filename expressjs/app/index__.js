var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var app = express();
var mongoose = require('mongoose');

app.set('view engine', 'pug');
app.set('views', './views');

// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true })); 

// for parsing multipart/form-data
app.use(upload.array()); 
app.use(express.static('public'));

mongoose.set('strictQuery', true);
mongoose.connect('mongodb://localhost/my_db');
console.log("db ...status:", mongoose.STATES[mongoose.connection.readyState]);

var personSchema = mongoose.Schema({
   name: String,
   age: Number,
   nationality: String
});
var Person = mongoose.model("Person", personSchema);


app.get('/person', function(req, res){
   res.render('person');
});

app.post('/person', function(req, res){
   console.log(req.body);
   res.send("received your request!");
});

app.listen(3000);
