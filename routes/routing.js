const express = require('express');
const router = express.Router();
var session = require('express-session');
const url = require('url');
const db = require('../db_config/database');
const mysql = require('mysql');
var bodyParser = require('body-parser');
var bcryptNodejs = require('bcrypt-nodejs');
var bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator')
var saltRounds = 10;
var passport = require('passport');
var helmet = require('helmet');
var MySQLStore = require('express-mysql-session')(session);
var LocalStrategy = require('passport-local').Strategy;
const multer = require('multer');
const path = require('path');
var formidable = require('formidable');
var fs = require('fs');
const csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

var Cart = require('./cart')



// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
/*const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('myImage');*/

const upload = multer({ 

	storage: storage,
  limits:{fileSize: 1000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
})

function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}



router.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

router.get('/registration', csrfProtection, function (req, res) {
  // pass the csrfToken to the view
  res.render('registration', { data: {}, csrfToken: req.csrfToken() })
});

/*router.get('/shoppingcart', (req,res) => res.render('shoppingcart'));*/

/*router.get('/registration', (req,res) => res.render('registration'));*/
router.get('/login', function(req,res) { 
	console.log("Req user printing....>>>>>>>>>>")
	console.log(req.user);
	console.log("Req user authentication is printing....>>>>>>>>>>")
	console.log(req.isAuthenticated());
	res.render('login')
});
/*router.get('/shoppingcart', (req,res) => res.render('shoppingcart'));*/
router.get('/shoppinghome', authenticationMiddleware(),(req,res)=>{
		
	var shoppingcartgetQuery = 'SELECT `product_id`,`title`,`productimageurl`,`productprice`,`quantity`,`prod_description` FROM `trn_image`';
	/*var getQuery = 'SELECT `main_id`,`emp_id`,`first_name`,`role` FROM `employee_data` where main_id = "'+ req.query.uid +'"';*/
	var resultQuery = db.query(shoppingcartgetQuery, (err, Imgtdataresult)=>{
		if(err) throw err;
		var resultImg = Imgtdataresult[0].img_url;
		
			res.render('shoppingitems',{ shopresult : Imgtdataresult, title: 'Shopping cart page'})
		
	}); 

});
router.get('/add-to-cart', function(req, res) {
	var productId = req.query.id;
	
	var cart = new Cart(req.session.cart ? req.session.cart : {items: {}});	
	 console.log("cart....////////");
		console.log(cart);
	var cartitemSql = 'SELECT * FROM testdb.trn_image where product_id = "'+ productId +'"';
	var cartitemquery = db.query(cartitemSql, (err, cartitemResult)=>{
		if(err){
			return res.redirect('/');
		}

		cart.add(cartitemResult, productId);
		req.session.cart = cart; 
		console.log("<<<<...........Testing req.session.cart...............>>");
		console.log(req.session.cart);
		
		res.redirect('shoppingcart');
    });
});

router.get('/shoppingcart', (req,res)=>{
	if(!req.session.cart) {
		return res.render('shoppingcart', { cartentities: null });
	}
	var cart = new Cart(req.session.cart);
	console.log('Generate Array...>>>>>>>>>>>>>>>>>');
	console.log(cart.generateArray());
	res.render('shoppingcart', {cartentities: cart.generateArray()})
});

router.post('/removefromcart', (req,res,next)=> {
	//remove item from cart
	if(req.session.cart){
		delete req.session;
		res.redirect('shoppinghome');
	} else {
		res.redirect('/');
	}

});

router.get('/editEmployee', (req,res)=>{
	var editSql = 'SELECT * FROM testdb.employee_data where main_id = "'+ req.query.uid +'"';
	var editquery = db.query(editSql, (err, empResult)=>{
	
		if(err) throw err;
		res.render("employeeEdit", {entities : empResult});
	});
});

router.get('/', function(req,res, next){
	console.log(req.user);
	console.log(req.isAuthenticated());
	res.render('home', { title: 'Home' });
})

router.post('/employeeRegistration', upload.single('myImage'),function(req,res){

	const errors = validationResult(req);

	var firstName = req.body.firstname;
	var lastName = req.body.lastname;
	var role = req.body.rolval;
	var empId = req.body.employeeval;
	var username = req.body.username;
	var pwd = req.body.password;
	var mobNumber = req.body.mobnumber;
	var email = req.body.email;
	var salt = bcryptNodejs.genSaltSync(10);
	var hash = bcryptNodejs.hashSync(pwd, salt);

	 /* return res.render('registration', {
      data: req.body,
       csrfToken: req.csrfToken()
    })*/

	  bcrypt.hash(pwd, salt, function(err, hash){
            /*if(err) throw err;*/
        pwd = hash;
        console.log("pwd is hashed here"); //shows hashed password
        console.log(pwd); //shows hashed password

       var checkdataQuery = "SELECT * FROM employee_data WHERE user_name = '"+ username +"' or email = '"+ email +"' or mob_no = '"+ mobNumber +"' ";
       
       var testdataQuery = db.query(checkdataQuery, function(err, result){
       		if(err) throw err;
       			/*const duplicateData = result.username;*/
       			console.log("checkdataQuery testing......");
       			console.log(result.length);

       			if(result.length > 0){
       				console.log("User is already exists");
       					res.redirect('registration');
       			}else{
       					var imgPath = req.file.filename;
       				   var insertQuery = 'INSERT INTO employee_data(first_name,last_name,role,emp_id,email,mob_no,user_name,password,img_url) VALUES ("'+ firstName +'","'+ lastName +'","'+ role +'","'+ empId +'","'+ email +'","'+ mobNumber +'","'+ username +'","'+ pwd +'", "'+ imgPath +'")'
             /*upload(req, res, (err) => {*/
			  /*    res.render('index', {
			          msg: 'File Uploaded!',
			          file: `uploads/${req.file}`
			        });*/
 			console.log("pwd iskjhjkh"); 
            var query = db.query(insertQuery, function(err, result){
            	if(err) throw err;

            	const main_id = result.insertId;
          
            	var imgPath = req.file.filename;

            /*	var sql = "INSERT INTO trn_image(main_id,img_url) VALUES ('"+ main_id +"','"+ imgPath +"')";
            	  db.query(sql,  function(err, Imgresult) {
			    if(err) throw err;
			    console.log('number of records inserted.')
			  });*/


            	db.query('SELECT LAST_INSERT_ID() as user_id', function(err, result, fields){
            		if(err) throw err;
            		const user_id = result[0];
            		console.log(result[0]);
            		req.login(user_id, function(err){
            			res.redirect('login');
            		})

            		
            	})
            

            })
       			}
       });

        })
	  
});

passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {
  
    done(null, user_id);
  
});
function authenticationMiddleware(){
	return(req,res,next)=>{
		console.log(
			`req.session.passport.user:  ${JSON.stringify(req.session.passport)}`);
		if(req.isAuthenticated()) return next();
		res.redirect('login')
	}
}

router.get('/profile', authenticationMiddleware(), function(req,res){
	res.render('profile', {title: 'Profile'})
});

router.post('/loginpage', passport.authenticate('local',{

	successRedirect: 'shoppinghome',
	failureRedirect: 'login'

}));

router.get('/logout', (req,res) => {
	req.logout();
	req.session.destroy();
	res.redirect('login');
});

/*router.post('/loginpage', (req,res)=>{
	var username = req.body.loginuser;
	var password = req.body.loginpwd;
	if(username && password){
		db.query('SELECT * FROM employee_data WHERE user_name = ? and password = ?', [username,password], function(err, results, fields){
			if(results.length > 0){
				req.session.loggedin = true;
				req.session.username = username;
				res.redirect('/routing/employeegrid');
			}
			else{
				res.send('Incorrect Username and password!');
			}
			res.end();
		});
	}
	else{
		res.send('Please enter username and password!');
		res.end();
	}
});*/

router.get('/employeegrid', authenticationMiddleware(),(req,res)=>{
		
	var getQuery = 'SELECT `main_id`,`emp_id`,`first_name`,`role` FROM `employee_data`';
	/*var getQuery = 'SELECT `main_id`,`emp_id`,`first_name`,`role` FROM `employee_data` where main_id = "'+ req.query.uid +'"';*/
	var resultQuery = db.query(getQuery, (err, result)=>{
		
		if(err) throw err;
			res.render('employeedata',{ result : result, title: 'Node Project'})
		
	}); 

});

router.post('/delete', (req,res)=>{
	var deleteId = req.body.id;
	console.log("deleteId");
	console.log(deleteId);
	let sql = 'DELETE FROM employee_data where main_id = "'+ req.body.id +'";'
	let query = db.query(sql, (err, result)=>{
		if(err) throw err;
		res.redirect('employeegrid')
	})
});

router.post('/employeeEdit',authenticationMiddleware(), (req,res)=>{
	var firstname = req.body.firstname;
	var lastName = req.body.lastname;
	var role = req.body.rolval;
	var empId = req.body.employeeval;
	var username = req.body.username;
	var pwd = req.body.password;
	var mobNumber = req.body.mobnumber;
	var email = req.body.email;
	var userId = req.body.userid;
		var salt = bcryptNodejs.genSaltSync(10);
	var hash = bcryptNodejs.hashSync(pwd, salt);
	  bcrypt.hash(pwd, salt, function(err, hash){
            /*if(err) throw err;*/
        pwd = hash;		
/*	var updateQuery = 'INSERT INTO employee_data(first_name,last_name,role,emp_id,email,mob_no,user_name,password) VALUES ("'+ firstName +'","'+ lastName +'","'+ role +'","'+ empId +'","'+ email +'","'+ mobNumber +'","'+ username +'","'+ pwd +'")'*/
	var updateQuery = 'UPDATE employee_data SET first_name="'+ firstname +'",last_name="'+ lastName +'",role="'+ role +'",emp_id="'+ empId +'",email="'+ email +'",mob_no="'+ mobNumber +'",user_name="'+ username +'",password="'+ pwd +'" where main_id = "'+ userId +'"'
	let query = db.query(updateQuery, (err, result)=>{
		if(err) throw err;
		res.redirect('employeegrid')
	})
});
	  });

router.post('/search', (req,res)=>{
		var empId = req.body.employeeval;
		console.log(empId);
	var searchQuery = 'SELECT * FROM employee_data where first_name LIKE "'+ empId +'";'
	var resultQuery = db.query(searchQuery, (err, result)=>{
		if(err) throw err;
		res.render('employeedata',{ result : result})
	})
});



module.exports = router;