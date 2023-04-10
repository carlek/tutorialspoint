var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var upload = multer();
var app = express();
var mongoose = require('mongoose');

app.set('view engine', 'pug');
app.set('views', './views');

// for parsing application/json
app.use(bodyParser.json()); 

// for cookie support
app.use(cookieParser());

// session support
app.use(session({secret: "Your secret key"}));

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

app.get('/cookie/:name', function(req, res){
   //This cookie also expires after 360000 ms from the time it is set.
   res.cookie('name', req.params.name, {maxAge: 360000}).send('cookie ' + req.params.name + ' set'); //Sets name = express
   console.log('Cookies: ', req.cookies);
});

app.get('/clear_cookie/:name', function(req, res){
   res.clearCookie(req.params.name);
   res.send('cookie ' + req.params.name + ' cleared');
});

app.get('/people', function(_req, res){
   Person.find(function(_err, response){
      res.json(response);
   });
});

app.get('/person', function(_req, res){
   res.render('person');
});

app.put('/people/:id', function(req, res){
   Person.findByIdAndUpdate(req.params.id, req.body, function(err, response){
      if(err) res.json({message: "Error in updating person with id " + req.params.id});
      res.json(response);
   });
});

app.delete('/people/:id', function(req, res){
   Person.findByIdAndRemove(req.params.id, function(err, _response){
      if(err) res.json({message: "Error in deleting record id " + req.params.id});
      else res.json({message: "Person with id " + req.params.id + " removed."});
   });
});

app.post('/person', function (req, res) {
   var personInfo = req.body
   if(!personInfo.name || !personInfo.age || !personInfo.nationality){
      res.render('show_message', {message: "Sorry, you provided wrong info", type: "error"});
   } else {
      var newPerson = new Person({
         name: personInfo.name,
         age: personInfo.age,
         nationality: personInfo.nationality
      });
      console.log("adding newPerson...");
     
      newPerson.save(function(err, _Person){
         if(err)
            res.render('show_message', {message: "Database error", type: "error"});
         else {
            console.log("successfully added");
            console.log(newPerson)
            res.render('show_message', {message: "New person added", type: "success", person: newPerson});
         }
      });
   }
});

app.get('/session', function(req, res){
   if(req.session.page_views){
      req.session.page_views++;
      res.send("You visited this page " + req.session.page_views + " times");
   } else {
      req.session.page_views = 1;
      res.send("Welcome to this page for the first time!");
   }
});

var Users = [];

app.get('/signup', function(req, res){
   console.log("enter signup");
   res.render('signup', {message: "Signup"});
});

app.post('/signup', function(req, res){
   console.log("enter signup post");
   if(!req.body.id || !req.body.password){
      res.status("400");
      res.send("Invalid details!");
   } else {
      Users.filter(function(user){
         if(user.id === req.body.id){
            res.render('signup', {
               message: "User Already Exists! Login or choose another user id"});
         }
      });
      var newUser = {id: req.body.id, password: req.body.password};
      Users.push(newUser);
      req.session.user = newUser;
      res.redirect('/protected_page');
   }
});

function checkSignIn(req, res){
   if(req.session.user){
      next();     //If session exists, proceed to page
   } else {
      var err = new Error("Not logged in!");
      console.log(req.session.user);
      next(err);  //Error, trying to access unauthorized page!
   }
}

app.get('/protected_page', checkSignIn, function(req, res){
   res.render('protected_page', {id: req.session.user.id})
});

app.get('/login', function(req, res){
   res.render('login', {message: 'Login'});
});

app.post('/login', function(req, res){
   console.log(Users);
   if(!req.body.id || !req.body.password){
      res.render('login', {message: "Please enter both id and password"});
   } else {
      Users.filter(function(user){
         if(user.id === req.body.id && user.password === req.body.password){
            req.session.user = user;
            res.redirect('/protected_page');
         }
      });
      res.render('login', {message: "Invalid credentials!"});
   }
});

app.get('/logout', function(req, res){
   req.session.destroy(function(){
      console.log("user logged out.")
   });
   res.redirect('/login');
});

app.use('/protected_page', function(err, req, res, next){
console.log(err);
   //User should be authenticated! Redirect him to log in.
   res.redirect('/login');
});



app.listen(3000);
