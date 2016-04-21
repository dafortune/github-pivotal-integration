'use latest'
'use strict'

const Promise = require('bluebird')
const request = require('request-promise')
const MongoDB = require('mongodb')

Promise.promisifyAll(MongoDB)
const MongoClient = MongoDB.MongoClient

let PT_TOKEN = null
let PROJECT_ID = null
let INTEGRATION_ID = null

module.exports = handleHook

function handleHook(ctx, req, res) {
  console.log('\n----------\ngithub-to-pivotal-webhook\n----------n')
  PT_TOKEN = ctx.data.PT_TOKEN
  PROJECT_ID = ctx.data.PROJECT_ID
  INTEGRATION_ID = parseInt(ctx.data.INTEGRATION_ID)
  let issue = ctx.body.issue
  let action = ctx.body.action
  let repo = ctx.body.repository

  issue.repo = {
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name
  }

  pushToPivotal(issue, action)
    .then(() => respond({ done: 'ok' }, res))
    .catch(handleErr(res))
}

function pushToPivotal(i, a) {
  console.log('pushToPivotal()')
  let issue = i
  let action = a
  console.log('Action: ' + action)
  if ((action === 'opened' || action === 'labeled') && hasLabel(issue, 'next')) {
    console.log('Sending to PT')
    return createPTStoryFromIssue(issue)
  } else if (action === 'closed') {
    console.log('GitHub closed')
    let extid = issue.repo.full_name + '/issues/' + issue.number
    return getPTStoryByPath(extid)
      .then(story => {
        if (story) {
          
          let update = {
            id: story[0].id,
            current_state: 'delivered'
          }
          if (!story.estimate)
              update.estimate = 0
          return updatePTStory(update)
        } else {
          console.log(`This issue [${extid}] does not have a matching story in PT`)
          return
        }
      })
  } else if (action === 'reopened') {
    console.log('GitHub reopened')
    let extid = issue.repo.full_name + '/issues/' + issue.number
    return getPTStoryByPath(extid)
      .then(story => {
        if (story) {
          let update = {
            id: story[0].id,
            current_state: 'started'
          }
          return updatePTStory(update)
        } else {
          console.log(`This issue [${extid}] does not have a matching story in PT`)
          return
        }
      })
  } else {
    return new Promise.resolve()
  }
}

function hasLabel(issue, label) {
  let hasLabel = false
  issue.labels.forEach(l => {
    if (l.name.toLowerCase().indexOf(label) >= 0) hasLabel = true
  })
  return hasLabel
}

function createPTStoryFromIssue(issue) {
  console.log('createPTStoryFromIssue()')
  let extid = issue.repo.full_name + '/issues/' + issue.number
  let story = {
    name: issue.title,
    description: issue.body,
    story_type: getType(issue), // feature, bug
    current_state: 'unstarted',
    integration_id: INTEGRATION_ID,
    external_id: extid
  }

  return getPTStoryByPath(extid)
    .then(searchResults => {
      if (searchResults.length == 0) {
        console.log(`Issue [${extid}] does NOT exist in PT, adding..`)
        return createPTStory(story)
      } else {
        console.log(`Issue [${extid}] already exists in PT, updating..`)
        
        var update = {
          id: searchResults[0].id,
          current_state: 'unstarted'
        }
        return updatePTStory(update)
      }
    })

  // return request.post(createOptions)    
}

function getType(i) {
  var type = 'feature'
  i.labels.forEach(l => {
    if (l.name.toLowerCase().indexOf('bug') >= 0)
      type = 'bug'
  })
  return type
}

function getPTStoryByPath(extid) {
  console.log('getPTStoryByPath()')
  let searchOptions = {
    method: 'GET',
    url: 'https://www.pivotaltracker.com/services/v5/projects/' + PROJECT_ID + '/stories?filter=external_id:"' + extid + '"',
    headers: {
      'X-TrackerToken': PT_TOKEN
    },
    json: true
  }
  return request.get(searchOptions)
}

function createPTStory(story) {
  console.log('createPTStory()')
  let createOptions = {
    method: 'POST',
    url: 'https://www.pivotaltracker.com/services/v5/projects/' + PROJECT_ID + '/stories',
    headers: {
      'X-TrackerToken': PT_TOKEN
    },
    json: story
  }
  return request.post(createOptions)
}

function updatePTStory(story) {
  let updateOptions = {
    method: 'PUT',
    url: 'https://www.pivotaltracker.com/services/v5/projects/' + PROJECT_ID + '/stories/' + story.id,
    headers: {
      'X-TrackerToken': PT_TOKEN
    },
    json: story
  }
  return request.put(updateOptions)
}


function respond(msg, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(msg))
  return
}

function handleErr(res) {
  return function(err) {
    console.log('error:')
    console.log(err.error)
    respond(err.message, res)
  }
}
