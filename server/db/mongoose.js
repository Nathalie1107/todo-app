var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }, 
                replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };       
 
//var mongodbUri = 'mongodb://saphira:happy2018@ds125362.mlab.com:25362/todo-app-1111';
 
mongoose.connect(process.env.MONGODB_URI, options);

//mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp');
//mongoose.connect('mongodb://nathalie1107:nhuylatoi1107@ds125362.mlab.com:25362/todo-app-1111');

module.exports = {mongoose};

