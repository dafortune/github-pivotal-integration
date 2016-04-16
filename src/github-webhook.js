'use latest'
'use strict'

const Promise = require('bluebird')
const MongoDB = require('mongodb')
Promise.promisifyAll(MongoDB)
const MongoClient = MongoDB.MongoClient

let dbURL = null
let PT_TOKEN = null

module.exports = handleHook

function handleHook(ctx, req, res) {
  dbURL = ctx.data.DBURL
  PT_TOKEN = ctx.data.PT_TOKEN
  var issue = ctx.body.issue
  var repo = ctx.body.repository
  var sender = ctx.body.sender

  issue.repo = {
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name
  }

  console.log(issue)

  connectToDB()
    .then(pushToMongo(issue))
    .then(pushToPivotal(issue))
    .then(() => respond({done: 'ok'}, res))
    .catch(handleErr(res))

  // respond({ done: 'ok' }, res)
}

function pushToPivotal(issue){
  return function(){
    let story = {
      name: issue.title,
      description: issue.body,
      story_type:  'feature', // feature, bug, chore, release
      external_id: issue.id
    }

    var p = new Promise((resolve, reject) => {
      var request = require('superagent');
      request
        .post('https://www.pivotaltracker.com/services/v5/projects/' + PROJECT_ID +'/stories')
        .send({"name":"A NEW COOL story"})
        .set('X-TrackerToken', PT_TOKEN)
        .set('Content-Type', 'application/json')
        .end(function(err, res){
          if (err) return reject(err)
          resolve(res.body)
        });
    })
    return p
    
  }
}

// Connects to Mongo and returns a promise
function connectToDB() {
  return MongoClient.connect(dbURL)
}

function respond(msg, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(msg))
}

function handleErr(res) {
  return function(err) {
    respond(err.message, res)
  }
}
