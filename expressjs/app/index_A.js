var express = require('Express');
var app = express();
var things = require('./things.js');

app.set('view engine', 'pug');
app.set('views','./views');

app.use(express.static('public'));

//both index.js and things.js should be in same directory
app.use('/things', things);

//Simple request time logger
app.use(function(req, res, next){
    console.log("A new request received at " + Date.now());
    // This function call is very important. It tells that more processing is
    // required for the current request and is in the next middleware
    // function route handler.
    next();
 });

app.get('/first_template', function(req, res){
    res.render('first_view');
});

app.get('/dynamic_view', function(req, res){
    res.render('dynamic', {
        user: {name: "Carl Ek", age: "62"} 
    });
});

app.get('/components', function(req, res){
    res.render('content');
});

app.get('/static_file_test', function(req, res){
    res.render('static_file');
});
 
app.get('/hello', function(req, res){
   res.send("Hello World!");
});

app.post('/hello', function(req, res){
    res.send("You just called the post method at '/hello'!\n");
 }); 

app.all('/no-effect', function(req, res){
    res.send("app.all('/no-effect': catch for all REST methods...\n");
});

app.get('*', function(req, res){
    res.send('Sorry, this does not match any route URL.');
});

var bodyParser = require('body-parser');

//To parse URL encoded data
app.use(bodyParser.urlencoded({ extended: false }))

//To parse json data
app.use(bodyParser.json())

var cookieParser = require('cookie-parser');
app.use(cookieParser())

app.listen(3000);
