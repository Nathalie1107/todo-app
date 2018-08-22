var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

//mongoose.connect('mongodb://localhost:27017/TodoApp');
mongoose.connect('mongodb://nathalie:080192@ds125362.mlab.com:25362/todo-app-1111');

module.exports = {mongoose};
