'use latest'
'use strict'

// This WebTask is used as a Pivotal Tracker Custom Integration.
// It simply returns all issues from mongodb. Without this, PT
// Would not have a custom integration, and thus the attribute
// "external_id" used to link to GH issues, would not be available

const Promise = require('bluebird')
const MongoDB = require('mongodb')
Promise.promisifyAll(MongoDB)
const MongoClient = MongoDB.MongoClient
let DB_URL = null

if (!String.prototype.encodeHTML) {
  String.prototype.encodeHTML = function() {
    return this.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };
}



module.exports = (context, req, res) => {
  handleHook(context, req, res)
}

function handleHook(ctx, req, res) {
  DB_URL = ctx.data.DB_URL
  connectToDB()
    .then(getIssues)
    .then(makeXMLIssues)
    .then(sendResults(res))
    .catch(handleErr(res))
}

function sendResults(res) {
  return function(issues) {
    console.log('sending..')
    res.writeHead(200, { 'Content-Type': 'text/javascript' })
    res.write('<?xml version="1.0" encoding="UTF-8"?>\n')
    res.write('<external_stories type="array">\n')
    issues.forEach(i => {
      res.write(i)
    })
    res.end('</external_stories>')
  }
}

function makeXMLIssues(issues) {
  console.log('making xml')
  return issues.map(i => {
    return `  <external_story>
    <external_id>${i.repo.full_name + '/issues/' + i.number}</external_id>
    <name>${i.title.encodeHTML()}</name>
    <description>${i.body.encodeHTML()}</description>
    <requested_by>${i.user.login}</requested_by>
    <created_at type="datetime">${i.created_at}</created_at>
    <story_type>${getType(i)}</story_type>
  </external_story>\n`
  })
}

function getType(i) {
  var type = 'feature'
  i.labels.forEach(l => {
    console.log(l.name.toLowerCase().indexOf('bug'))
    if (l.name.toLowerCase().indexOf('bug') >= 0)
      type = 'bug'
  })
  return type
}

function getIssues(db) {
  return db.collection('Issues').find({ state: "open" }).toArrayAsync()

}

// Connects to Mongo and returns a promise
function connectToDB() {
  return MongoClient.connect(DB_URL)
}

function handleErr(res) {
  return function(err) {
    console.log('error:')
    console.log(err)
    respond(err.message, res)
  }
}

function respond(msg, res) {
  res.writeHead(200, { 'Content-Type': 'text/javascript' })
  res.end(msg)
}
