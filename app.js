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

