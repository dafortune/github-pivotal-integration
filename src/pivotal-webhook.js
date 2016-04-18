'use latest'
'use strict'

const Promise = require('bluebird')
var request = require('request-promise')
// Promise.promisifyAll(request);
var GitHubApi = require("github")
var github = new GitHubApi({
  version: "3.0.0",
  debug: false,
  protocol: "https",
  host: "api.github.com",
  pathPrefix: "",
  timeout: 5000,
  headers: {
    "user-agent": "node-github app"
  }
})

let PT_TOKEN = null
let PROJECT_ID = null
let GITHUB_TOKEN = null

module.exports = handleHook

function handleHook(ctx, req, res) {
  PT_TOKEN = ctx.data.PT_TOKEN
  PROJECT_ID = ctx.data.PROJECT_ID
  GITHUB_TOKEN = ctx.data.GITHUB_TOKEN

  github.authenticate({
    type: "oauth",
    token: GITHUB_TOKEN
  })

  let operation = ctx.data.highlight
  let changes = ctx.data.changes

  changes.forEach(handleChange)


  respond({ done: 'ok' }, res)
}

function handleChange(change) {
  console.log('handleChange()')
  console.log(change)
  if (change.kind === 'story' && change.change_type === 'create')
    handleNewStory(change)
  if (change.kind === 'story' && change.change_type === 'update')
    handleUpdateStory(change)
  if (change.kind === 'story' && change.change_type === 'delete')
    handleDeleteStory(change)
}

function handleNewStory(change) {
  console.log('handleNewStory()')
  let story = change.new_values
    // console.log(story)
  if (story) {
    console.log('Adding NEXT tag in GitHub')
    getGitHubIssueFromStory(story)
      .then(addRemoveLabels('next'))
  }
}

function handleUpdateStory(change) {
  console.log('handleUpdateStory()')
  let story = change.new_values
  if (story.current_state) {
    updateState(change)
  }
}

// function handleDeleteStory(change) {
//   console.log('handleUpdateStory()')
//   getPTStory(change.id)
//     .then(getGitHubIssueFromStory)
//     .then(addRemoveLabels(null, ['in progress', 'next', 'ready', 'on hold']))
//     .catch(console.log)
// }

function updateState(change) {
  if (change.new_values.current_state === 'started') {
    getPTStory(change.id)
      .then(getGitHubIssueFromStory)
      .then(addRemoveLabels('in progress', ['next', 'ready', 'on hold']))
      .catch(console.log)
  } else if (change.new_values.current_state === 'finished') {
    getPTStory(change.id)
      .then(getGitHubIssueFromStory)
      .then(addRemoveLabels('ready', ['next', 'in progress', 'on hold']))
      .catch(console.log)
  } else if (change.new_values.current_state === 'unscheduled') {
    getPTStory(change.id)
      .then(getGitHubIssueFromStory)
      .then(addRemoveLabels('on hold', ['next', 'ready', 'in progress']))
      .catch(console.log)
  } else if (change.new_values.current_state === 'unstarted') {
    getPTStory(change.id)
      .then(getGitHubIssueFromStory)
      .then(addRemoveLabels('next', ['on hold', 'ready', 'in progress']))
      .catch(console.log)
  } else if (change.new_values.current_state === 'delivered') {
    getPTStory(change.id)
      .then(getGitHubIssueFromStory)
      .then(addRemoveLabels(null, ['next', 'on hold', 'ready', 'in progress']))
      .then(setGitHubIssueState('closed'))
      .catch(console.log)
  } else if (change.new_values.current_state === 'rejected') {
    getPTStory(change.id)
      .then(getGitHubIssueFromStory)
      .then(addRemoveLabels('in progress', ['next', 'on hold', 'ready']))
      .then(setGitHubIssueState('opened'))
      .catch(console.log)
  }
}

function getGitHubIssueFromStory(story) {
  let p = story.external_id.split('/')
  let options = {
    user: p[0],
    repo: p[1],
    number: p[3]
  }
  return new Promise((resolve, reject) => {
    github.issues.getRepoIssue(options, function(err, issue) {
      if (err) reject(err)
      resolve(issue)
    })
  })
}

function addRemoveLabels(label, labelsToremove) {
  labelsToremove = labelsToremove || []
  if (!Array.isArray(labelsToremove)) labelsToremove = [labelsToremove]

  return function(issue) {
    if (hasLabel(issue, label)) resolve(issue)
    let options = {
        user: issue.user.login,
        repo: issue.repository_url.split('/').pop(),
        number: issue.number,
        labels: issue.labels.map(l => l.name),
        state: 'open'
      }
    
    // Add new label
    if (label)
      options.labels.push(label)

    // Remove labels
    labelsToremove.forEach(l => {
      let idx = options.labels.indexOf(l)
      if (idx > -1) options.labels.splice(idx, 1);
    })

    // Push to GH
    return updateGitHubIssue(options)
  }
}

function setGitHubIssueState(state){
  return function(issue){
    let options = {
        user: issue.user.login,
        repo: issue.repository_url.split('/').pop(),
        number: issue.number,
        state: state
      }
    return updateGitHubIssue(options)
  }
}

function updateGitHubIssue(options) {
  return new Promise((resolve, reject) => {
    github.issues.edit(options, function(err, issue) {
      if (err) reject(err)
      resolve(issue)
    })
  })
}

function getPTStory(id) {
  var searchOptions = {
      method: 'GET',
      url: 'https://www.pivotaltracker.com/services/v5/projects/' + PROJECT_ID + '/stories/' + id,
      headers: {
        'X-TrackerToken': PT_TOKEN
      },
      json: true
    }
    //external_id:"astanciu/Points-WT/issues/9"
  return request.get(searchOptions)
}

function hasLabel(issue, label) {
  let hasLabel = false
  issue.labels.forEach(l => {
    if (l.name.toLowerCase().indexOf(label) >= 0) hasLabel = true
  })
  return hasLabel
}



function respond(msg, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(msg))
}

// function handleErr(res) {
//   return function(err) {
//     respond(err.message, res)
//   }
// }
