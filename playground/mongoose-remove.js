const {ObjectID} = require('mongodb');

const {mongoose} = require('../server/db/mongoose');
const {Todo} = require('../server/models/todo');
const {User} = require('../server/models/user');


// Todo.remove({}).then(result =>{
//   console.log(result);
// })

Todo.findByIdAndRemove('5b7cc54b21c9d90fabd67700').then(result => {
  console.log('Remove: ', result);
})