
const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed');


beforeEach(populateUsers);
beforeEach(populateTodos);

describe('PATCH /todos', () => {
  it('should update a todo', done => {
    var hexId = todos[0]._id.toHexString();
    var text = 'This should be a new text';
    console.log('------------', process.env.JWT_SECRET);
    console.log('------------', process.env.PORT);
    console.log('------------', process.env.MONGODB_URI);

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({
        completed: true,
        text
      })
      .expect(200)
      .end((err, res) => {
        if (err){
          return done(err);
        }
        Todo.findById(hexId).then(todo => {
          expect(todo.completed).toBe(true);
          expect(todo.completedAt).toBeA('number');
          done()
        }).catch(e => done(e));
      })
  })

  it('should clear completedAt when todo is not completed', done => {
      var hexId = todos[0]._id.toHexString();

      request(app)
        .patch(`/todos/${hexId}`)
        .set('x-auth', users[0].tokens[0].token)
        .send({
          completed: false,
        })
        .expect(200)
        .end((err, res) => {
          if (err){
            return done(err);
          }
          Todo.findById(hexId).then(todo => {
            expect(todo.completed).toBe(false);
            expect(todo.completedAt).toBe(null);
            done();
          })
        })
  })

  it('should not update todo created by other user', done => {
    var hexId = todos[0]._id.toHexString();

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        completed: false,
      })
      .expect(404)
      .end(done)
    })

})

describe('DELETE /todos', () => {
  it('should remove a todo', (done) => {
    var hexId = todos[1]._id.toHexString();   
    
    request(app)
        .delete(`/todos/${hexId}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(200)
        .expect((res) => {
          expect(res.body.todo._id).toBe(hexId);
        })
        .end((err, res) => {
          if(err) {
            return done(err);
          }
           Todo.findById(hexId).then((todo) => {
             expect(todo).toNotExist();
             done();
           }).catch((e) => done(e));
        });
  });

  it('should not remove a todo created by other users', (done) => {
    var hexId = todos[1]._id.toHexString();   
    
    request(app)
        .delete(`/todos/${hexId}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    var hexId = '5b7d745dea54e925ba8c6cc1';   
    
    request(app)
        .delete(`/todos/${hexId}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(404)
        .end(done);
  })

  it('should return 404 if objectID is invalid', (done) => {
    var hexId = '5b7d745dea54e925ba8c6cc1233';   
    
    request(app)
        .delete(`/todos/${hexId}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(404)
        .end(done);
  })
})

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token) 
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token) 
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should not return todo doc created by other user', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .get(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get('/todos/123abc')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });
  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  })
})

describe('POST /users', () => {
  it('should create a user', (done) => {
    var email = 'nathalie2@test.com';
    var password = '123456';
    
    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect(res => {
        expect(res.body.email).toEqual(email);
        expect(res.body._id).toExist();
        expect(res.headers['x-auth']).toExist();
      })
      .end(err => {
        if(err) {
          return done(err);
        }

        User.findOne({email}).then(user => {
          expect(user).toExist();
          expect(user.password).toNotBe(password);
          done();
        })
      });
  });

  it('should return validation errors if request invalid', done => {
    var email = 'nathali';
    var password = '123';
    
    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done);
  })

  it('should not create user if email is in use', done => {
    var email = 'nathalie@test.com';
    var password = '123456';
    
    request(app)
      .post('/users')
      .send({ email, password})
      .expect(400)
      .end(done);

  })
})

describe('POST /users/login', () => {
  it('should login and return auth token', done => {
    
    request(app)
      .post('/users/login')
      .send({ 
        email: users[0].email,
        password: users[0].password})
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toExist();

      }).end((err, res) => {
        if(err)
        {return done(err)};


        User.findById(users[0]._id).then(user => {
        });
        User.findById(users[0]._id).then(user => {
          expect(user.tokens[1]).toInclude({
            access:'auth',
            token:res.headers['x-auth']
          })
          done();
        }).catch(e => done(e));
      })
  })

  it('should reject invalid login', done => {
    request(app)
    .post('/users/login')
    .send({ 
      email: 'excellence@test.com',
      password: users[0].password})
    .expect(400)
    .end(done);
    
  })
})

describe('DELETE /users/logout', () => {
  it('should delete the token', done => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if(err){
          return done(err)
        } 
        User.findById(users[0]._id).then(user => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch(e => done(e));
      })
  })
})
