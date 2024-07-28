//installing packages
const express = require('express')
let app = express()

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const {format, isValid} = require('date-fns')
const path = require('path')
//
let cat = ['WORK', 'HOME', 'LEARNING']
let stat = ['TO DO', 'IN PROGRESS', 'DONE']
let prior = ['HIGH', 'MEDIUM', 'LOW']
//middleware function
let checkingData = (request, response, next) => {
  let {category = '', priority = '', status = '', dueDate = ''} = request.query

  let condition = true
  switch (true) {
    case priority !== '':
      if (prior.includes(priority)) {
        condition = true
      } else {
        condition = false
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break

    case status !== '':
      console.log(status)
      if (stat.includes(status)) {
        condition = true
      } else {
        condition = false
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break

    case category !== '':
      if (cat.includes(category)) {
        condition = true
      } else {
        condition = false
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break

    case dueDate !== '':
      let validate = isValid(new Date(dueDate))
      // console.log(validate);
      if (validate) {
        condition = true
      } else {
        condition = false
        response.status(400)
        response.send('Invalid Due Date')
      }
      break
  }
  if (condition) {
    next()
  }
}

let checkingDatapost = (request, response, next) => {
  let {category = '', priority = '', status = '', dueDate = ''} = request.body

  let condition = true

  if (priority !== '') {
    if (prior.includes(priority)) {
      condition = true
    } else {
      condition = false
      response.status(400)
      response.send('Invalid Todo Priority')
    }
  }
  if (status !== '') {
    console.log(status)
    if (stat.includes(status)) {
      condition = true
    } else {
      condition = false
      response.status(400)
      response.send('Invalid Todo Status')
    }
  }

  if (category !== '') {
    if (cat.includes(category)) {
      condition = true
    } else {
      condition = false
      response.status(400)
      response.send('Invalid Todo Category')
    }
  }

  if (dueDate !== '') {
    let validate = isValid(new Date(dueDate))
    // console.log(validate);
    if (validate) {
      condition = true
    } else {
      condition = false
      response.status(400)
      response.send('Invalid Due Date')
    }
  }

  if (condition) {
    next()
  }
}
//

//const jwt = require("jsonwebtoken");
//const bcrypt = require("bcrypt");

// getting instance of server and creating path

app.use(express.json())
let DBpath = path.join(__dirname, 'todoApplication.db')
let dp = null
//opening connection with db and staring server

let initialize = async () => {
  try {
    db = await open({filename: DBpath, driver: sqlite3.Database})
    app.listen(3000, () => {
      console.log('Sever is started')
    })
  } catch (err) {
    console.log(err.message)
    process.exit(1)
  }
}

initialize()

//getting data from server

app.get('/todos/', checkingData, async (request, response) => {
  try {
    let {
      search_q = '',
      category = '',
      priority = '',
      status = '',
      due_date = '',
    } = request.query

    //console.log(status);
    let query = `select * from todo
        where todo LIKE '%${search_q}%' and category LIKE '%${category}%' and priority LIKE '%${priority}%' and status LIKE '%${status}%' and due_date LIKE '%${due_date}%';`
    let prom = await db.all(query)
    let new_ = prom.map(obj => {
      return {
        id: obj.id,
        todo: obj.todo,
        priority: obj.priority,
        status: obj.status,
        category: obj.category,
        dueDate: obj.due_date,
      }
    })
    response.send(new_)
  } catch (err) {
    console.log(err.message)
  }
})

//getting specific todo

app.get('/todos/:todoId/', async (request, response) => {
  try {
    let {todoId} = request.params
    let query = `SELECT * 
        FROM todo 
        WHERE id = ${todoId};`
    let obj = await db.get(query)
    if (obj === undefined) {
      response.status(400)
      response.send('Invalid todo id')
    } else {
      let new_ = {
        id: obj.id,
        todo: obj.todo,
        priority: obj.priority,
        status: obj.status,
        category: obj.category,
        dueDate: obj.due_date,
      }
      response.send(new_)
    }
  } catch (err) {
    console.log(err.message)
  }
})

//getting for specific date

app.get('/agenda/', async (request, response) => {
  try {
    let {date} = request.query

    let new_date = new Date(date)
    let valid = isValid(new_date)
    if (valid) {
      //console.log(typeof new Date());
      //console.log(new_date.getFullYear());
      let query = `select 
    *  from todo 
    where cast(strftime("%Y", due_date) AS INT) = ${new_date.getFullYear()} and cast(strftime("%m", due_date) AS INT) = ${
      new_date.getMonth() + 1
    } and cast(strftime("%d", due_date) AS INT) = ${new_date.getDate()}`
      let prom = await db.all(query)
      if (prom !== []) {
        response.send(
          prom.map(obj => {
            return {
              id: obj.id,
              todo: obj.todo,
              priority: obj.priority,
              status: obj.status,
              category: obj.category,
              dueDate: obj.due_date,
            }
          }),
        )
      } else {
        response.status(400)
        response.send('Invalid Due Date')
      }
    } else {
      response.status(400)
      response.send('Invalid Due Date')
    }
  } catch (err) {
    console.log(err.message)
  }
})

//posting todo

app.post('/todos/', checkingDatapost, async (request, response) => {
  try {
    let {todo, category, priority, status, dueDate} = request.body
    let date = format(new Date(dueDate), 'yyyy-MM-dd')
    let query = `INSERT INTO todo 
        (todo, category, priority, status, due_date)
        VALUES 
        ('${todo}', '${category}', '${priority}', '${status}', '${date}');`
    let prom = await db.run(query)
    response.send('Todo Successfully Added')
  } catch (err) {
    console.log(err.message)
  }
})

//updating the data

app.put('/todos/:todoId/', checkingDatapost, async (request, response) => {
  try {
    let {todoId} = request.params
    let query = `SELECT * 
        FROM todo 
        WHERE id = ${todoId};`
    let obj = await db.get(query)
    if (obj === undefined) {
      response.status(400)
      response.send('Invalid todo id')
    } else {
      let {todoId} = request.params
      let obj = request.body
      let array = ['status', 'priority', 'category', 'dueDate', 'todo']
      let updated
      let value
      let sending
      for (let i of array) {
        if (obj[i] !== undefined) {
          value = obj[i]
          if (i === 'dueDate') {
            value = format(new Date(value), 'yyyy-MM-dd')
            updated = 'due_date'
            sending = 'Due Date Updated'
          } else {
            updated = i
            sending = i[0].toUpperCase() + i.slice(1, i.length) + ' Updated'
          }
        }
      }
      let query = `
    UPDATE todo 
    SET ${updated} = '${value}'
    WHERE id = ${todoId};`
      let prom = await db.run(query)
      response.send(sending)
    }
  } catch (err) {
    console.log(err.message)
  }
})

// deleting

app.delete('/todos/:todoId/', async (request, response) => {
  try {
    let {todoId} = request.params
    let query = `SELECT * 
        FROM todo 
        WHERE id = ${todoId};`
    let obj = await db.get(query)
    if (obj === undefined) {
      response.status(400)
      response.send('Invalid todo id')
    } else {
      let query = `DELETE FROM todo 
        WHERE id = ${todoId};`
      let prom = await db.run(query)
      response.send('Todo Deleted')
    }
  } catch (err) {
    console.log(err.message)
  }
})


