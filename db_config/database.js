var mysql = require('mysql');

var db_connection = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : 'root',
	database : 'testdb'
});

db_connection.connect(function(err){
	if(err) throw err;
});

module.exports = db_connection;