const express = require('express');
const router = express.Router();
var session = require('express-session');
const url = require('url');
const db = require('../db_config/database');
const mysql = require('mysql');
const path = require('path');
var bcryptNodejs = require('bcrypt-nodejs');
var bcrypt = require('bcrypt');
const {check, validationResult} = require('express-validator');
var saltRounds = 10;
var passport = require('passport');

var MySQLStore = require('express-mysql-session')(session);
var LocalStrategy = require('passport-local').Strategy;

/*router.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));*/


router.get('/registration', (req,res) => res.render('registration'));
router.get('/login', (req,res) => res.render('login'));
/*router.get('/editEmployee', (req,res)=> res.render('employeeEdit'));*/
router.get('/editEmployee', (req,res)=>{
	var editSql = 'SELECT * FROM marvel.employee_data where main_id = "'+ req.query.uid +'"';
	var editquery = db.query(editSql, (err, empResult)=>{
	
		if(err) throw err;
		res.render("employeeEdit", {entities : empResult});
	})
});

router.get('/', function(req,res, next){
	console.log(req.user);
	console.log(req.isAuthenticated());
	res.render('home', { title: 'Home' });
})

router.post('/employeeRegistration',function(req,res){

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
	  bcrypt.hash(pwd, salt, function(err, hash){
            /*if(err) throw err;*/
            pwd = hash;
            console.log("pwd is hashed here"); //shows hashed password
            console.log(pwd); //shows hashed password

            var insertQuery = 'INSERT INTO employee_data(first_name,last_name,role,emp_id,email,mob_no,user_name,password) VALUES ("'+ firstName +'","'+ lastName +'","'+ role +'","'+ empId +'","'+ email +'","'+ mobNumber +'","'+ username +'","'+ pwd +'")'

            var query= db.query(insertQuery, function(err, result){
            	if(err) throw err;

            	db.query('SELECT LAST_INSERT_ID() as user_id', function(err, result, fields){
            		if(err) throw err;
            		const user_id = result[0];
            		console.log(result[0]);
            		req.login(user_id, function(err){
            			res.redirect('login');
            		})

            		/*res.redirect('registration')*/
            	})


            })

        });	
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

/*router.get('/profile', authenticationMiddleware(), function(req,res){
	res.render('profile', {title: 'Profile'})
});*/

router.post('/loginpage', passport.authenticate('local',{

	successRedirect: 'employeegrid',
	failureRedirect: 'login'
}));

router.get('/logout', (req,res) => {
	req.logout();
	req.session.destroy();
	res.render('login');
});



/*router.post('/loginpage', (req,res)=>{
	var username = req.body.loginuser;
	var password = req.body.loginpwd;
	if(username && password){
		db.query('SELECT * FROM employee_data WHERE user_name = ? and password = ?', [username,password], function(err, results, fields){
			if(results.length > 0){
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

router.get('/employeegrid', (req,res)=>{
	/*	for(var i=0; i < 90; i++){}*/
	var getQuery = 'SELECT `main_id`,`first_name`,`role` FROM `employee_data`;';
	var resultQuery = db.query(getQuery, (err, result)=>{
		if(err) throw err;
			res.render('employeedata',{ result : result})
		
	}); 
});

router.post('/delete', (req,res)=>{
	var deleteId = req.body.id;
	let sql = 'DELETE FROM employee_data where main_id = "'+ req.body.id +'";'
	let query = db.query(sql, (err, result)=>{
		if(err) throw err;
		res.redirect('employeegrid')
	})
});

router.post('/employeeEdit', (req,res)=>{
	var firstname = req.body.firstname;
	var lastName = req.body.lastname;
	var role = req.body.rolval;
	var empId = req.body.employeeval;
	var username = req.body.username;
	var pwd = req.body.password;
	var mobNumber = req.body.mobnumber;
	var email = req.body.email;
	var userId = req.body.userid;
/*	var updateQuery = 'INSERT INTO employee_data(first_name,last_name,role,emp_id,email,mob_no,user_name,password) VALUES ("'+ firstName +'","'+ lastName +'","'+ role +'","'+ empId +'","'+ email +'","'+ mobNumber +'","'+ username +'","'+ pwd +'")'*/
	var updateQuery = 'UPDATE employee_data SET first_name="'+ firstname +'",last_name="'+ lastName +'",role="'+ role +'",emp_id="'+ empId +'",email="'+ email +'",mob_no="'+ mobNumber +'",user_name="'+ username +'",password="'+ pwd +'" where main_id = "'+ userId +'"'
	let query = db.query(updateQuery, (err, result)=>{
		if(err) throw err;
		res.redirect('employeegrid')
	})
});

router.post('/search', (req,res)=>{
		var empId = req.body.employeeval;
	var searchQuery = 'SELECT * FROM employee_data where first_name LIKE "'+ empId +'";'
	var resultQuery = db.query(searchQuery, (err, result)=>{
		if(err) throw err;
		res.render('employeedata',{ result : result})
	})
});

module.exports = router;