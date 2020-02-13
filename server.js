var express = require('express');
var sql = require('mysql');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var exphbs = require('express-handlebars');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var path  = require('path');
var passport = require('passport');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var flash = require('connect-flash');
const {check, validationResult} = require('express-validator');

/*Db Connection*/
var db = require('./db_config/database');

var app = express();

app.use(morgan('dev'));  // log every request to the console
app.use(cookieParser()); // read cookies neede for auth

app.engine('handlebars', exphbs({
	defaultLayout : 'main'
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');


app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended : true }));
 


app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var options = {
	host : 'localhost',
	user : 'root',
	password : 'root',
	database : 'testdb'
};

var sessionStore = new MySQLStore(options);

app.use(session({
  secret: 'dshmfnd',
  resave: false,
  store: sessionStore,
  saveUninitialized: false,
  cookie: { maxAge: 180 * 60 * 1000  }
}))
// session secret
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req,res,next){
	res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.session = req.session;
	next();
})
app.use(flash());  // use connect-flash for flash methods stored in session


app.get('/', (req,res)=> res.render('home'));

app.use('/routing', require('./routes/routing'));

passport.use(new LocalStrategy(
  function(username, password, done) {
  	/*return done(null, 'test');*/
  	db.query('SELECT main_id, password from employee_data WHERE user_name =?',[username], function(err,results,fields){
  		if(err) {done(err)};
  		
  		if(results.length === 0){
  			done(null, false);
  		} else{
  		const hash = results[0].password.toString();
  		
  		bcrypt.compare(password, hash, function(err, response){
  				/*console.log(password,hash);*/
  			if(response === true){
          console.log("result[0].main_id.............>>>>");
      console.log(results[0].main_id);
  				
  				return done(null, {user_id: results[0].main_id});		
  			} else{
  				
  				return done(null,false);
  			}
  		})

  		}
  		
  	})
  	

  }
  
));

const PORT = process.env.PORT || 1000;

app.listen(PORT, console.log(`Server is listening on ${PORT}`));