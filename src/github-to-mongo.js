'use latest'
'use strict'

const Promise = require('bluebird')
const MongoDB = require('mongodb')
Promise.promisifyAll(MongoDB)
const MongoClient = MongoDB.MongoClient

let DB_URL = null
let PT_TOKEN = null

module.exports = handleHook

function handleHook(ctx, req, res) {
  console.log('\n----------\ngithub-to-mongo-webhook\n----------n')
  DB_URL = ctx.data.DB_URL
  var issue = ctx.body.issue
  var repo = ctx.body.repository
  var sender = ctx.body.sender

  issue.repo = {
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name
  }

  connectToDB()
    .then(pushToMongo(issue))
    .then(() => respond({ done: 'ok' }, res))
    .catch(handleErr(res))

  // respond({ done: 'ok' }, res)
}

function pushToMongo(issue) {
  console.log('pushToMongo()')
  return function(db) {

    console.log('Upserting... ' + issue.title)
    return db.collection('Issues').update({ id: issue.id }, { $set: issue }, { upsert: true })
  }
}

// Connects to Mongo and returns a promise
function connectToDB() {
  console.log('connectToDB()')
  return MongoClient.connect(DB_URL)
}

function respond(msg, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(msg))
}

function handleErr(res) {
  return function(err) {
    console.log(err)
    respond(err.message, res)
  }
}
