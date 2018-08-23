const _ = require('lodash')
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

const PORT = process.env.PORT || 3000;

const app = express();

const isValidId = (id) => {
  return ObjectID.isValid(id);
}

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  const todo = new Todo({
    text: req.body.text
  });

  todo.save()
      .then(todo => res.send({todo}))
      .catch(e => res.status(400).send(e));
})

app.get('/todos', (req, res) => {
  Todo.find({})
    .then(todos => res.send({todos}))
    .catch(e => res.status(400).send(e));
});

app.get('/todos/:id', (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) {
    return res.status(400).send({error: 'Invalid id'});
  }

  Todo.findById(id).then(todo => {
    if (!todo) {
      return res.status(400).send({});
    }
    res.send({todo}); // future-proofing, use object so you could add more properties in the future. Imagine the front-end was already built then you add a new property? Everything that uses this route will have to be changed.
  }).catch(e => res.status(400).send({}));

});

app.delete('/todos/:id', (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) {
    return res.status(400).send();
  }
  Todo.findByIdAndRemove(id).then(todo => {
    if (!todo) {
      return res.status(400).send();
    }
    res.send({todo});
  }).catch(e => res.status(400).send());
});

app.patch('/todos/:id', (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) {
    return res.status(400).send();
  }
  const body = _.pick(req.body, ['text', 'completed']); 
  if(_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }
  
  Todo.findByIdAndUpdate(id, {$set: body}, {new: true})
      .then(todo => {
        if (!todo) {
          return res.status(400).send();
        }
        res.send({todo});
      })
      .catch(e => res.status(400).send());

})

app.listen(PORT, () => {
  console.log(`Started on port ${PORT}`);
});

module.exports = {app}