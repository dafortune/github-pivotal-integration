'use latest'
'use strict'

const Promise = require('bluebird')
const MongoDB = require('mongodb')
Promise.promisifyAll(MongoDB)
const MongoClient = MongoDB.MongoClient
let dbURL = null


module.exports = (context, req, res) => {
  handleHook(context, req, res)
}

function handleHook(ctx, req, res){
  console.log(ctx)
  // console.log(issue)


  respond({done: 'ok'}, res)
}



// Connects to Mongo and returns a promise
function connectToDB() {
  return MongoClient.connect(dbURL)
}

function respond(msg, res) {
  res.writeHead(200, { 'Content-Type': 'application/json'})
  res.end(JSON.stringify(msg))
}


