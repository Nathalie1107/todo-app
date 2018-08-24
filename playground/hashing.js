const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var password = '123abc!';

// bcrypt.genSalt(12, (err, salt) => {
//     bcrypt.hash(password, salt, (err, hash) => {
//         console.log(hash);
//     })
// } )

var hashedPassword = '$2a$12$C0kVhcW8EQOScnfoROjOW.aa3Lwne3KSQjgvcPa8EE3DiHqC9SJTq';
bcrypt.compare(password, hashedPassword, (err, success) => {
    console.log(success);
})

// var data = {
//     id: 10
// }

// var token = jwt.sign(data, '123abc');
// console.log(token);

// var decoded = jwt.verify(token, '123abc');
// console.log(decoded);

// var message = 'adminpw';
// var hash = SHA256(message).toString();
// console.log(`Message: ${message}`);
// console.log(`Hash: ${hash}`);

// var data = {
//     id: 4
// };

// var token = {
//     data,
//     hash: SHA256(JSON.stringify(data) + 'some secret').toString()
// }

// var resultHash = SHA256(JSON.stringify(token.data) + 'some secrete').toString();

// if (resultHash === token.hash){
//     console.log('Data was not changed');
// } else {
//     console.log('Data was changed. Don\'t trust it');
// }