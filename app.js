const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())

// initialize db and server
const dbPath = path.join(__dirname, 'todoApplication.db')
let db = null
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server started!!')
    })
  } catch (e) {
    console.log(`ERROR : ${e.message}`)
  }
}
initializeDbAndServer()

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const insertTodo = `
  insert into todo(id,todo,priority,status)
  values(${id},'${todo}','${priority}','${status}');
  `
  await db.run(insertTodo)
  response.send('Todo Successfully Added')
})

// api 1
app.get('/todos/', async (request, response) => {
  const {priority, status, search_q} = request.query
  let Query
  if (status === 'TO DO') {
    Query = `
    select
      *
    from
      todo
    where
      status like '${status}';
    ` //whose status is to do
  } else if (priority === 'HIGH') {
    Query = `
    select
      *
    from
      todo
    where
      priority like '${priority}';
    ` //    Returns a list of all todos whose priority is 'HIGH'
  } else if (priority === 'HIGH' && status === 'IN PROGRESS') {
    Query = `
    select
      *
    from
      todo
    where
      priority like '${priority}' and 
      status like '${status}';
    ` //    Returns a list of all todos whose priority is 'HIGH' and status is 'IN PROGRESS'
  } else if (search_q === 'Play') {
    Query = `
    select
      *
    from
      todo
    where
    todo like '%${search_q}%';
    `
  } //Returns a list of all todos whose todo contains 'Play' text

  const res = await db.all(Query)
  response.send(res)
}) //api 1 completed

//api 2
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodoQuery = `
  select
    *
  from
    todo
  where
    id = ${todoId};
  `
  const todo = await db.get(getTodoQuery)
  response.send(todo)
}) // api 2 completed

// api 3 create a todo in todo table
app.post('/todos/', async (request, response) => {
  const todoDetails = request.body
  const {id, todo, priority, status} = todoDetails
  const addTodoQuery = `
  insert into todo(id,todo,priority,status)
  values(${id},'${todo}','${priority}','${status}');
  `
  await db.run(addTodoQuery)
  response.send('Todo Successfully Added')
}) //api 3 completed

// api 4 Updates the details of a specific todo based on the todo ID
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const todoDetails = request.body
  let updateQuery = ''
  switch (true) {
    case todoDetails.todo !== undefined:
      updateQuery = 'Todo'
      break

    case todoDetails.priority !== undefined:
      updateQuery = 'Priority'
      break

    case todoDetails.status !== undefined:
      updateQuery = 'Status'
      break
  }

  const getPreviousTodoQuery = `
  select
    *
  from
    todo
  where
    id = ${todoId};
  `
  const previousTodo = await db.get(getPreviousTodoQuery)
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body

  const updateTodoQuery = `
  update todo set 
    todo = '${todo}',
    priority = '${priority}',
    status = '${status}'
  where
    id = ${todoId}
    ;`

  await db.run(updateTodoQuery)
  response.send(`${updateQuery} Updated`)
}) //api 4 completed

//api 5 Deletes a todo from the todo table based on the todo ID
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteTodoQuery = `
  delete from
    todo
  where
    id = ${todoId};
  `
  await db.run(deleteTodoQuery)
  response.send('Todo Deleted')
})

module.exports = app;