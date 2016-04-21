'use strict'
var GitHubApi = require("github")
const Promise = require('bluebird')

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

github.authenticate({
  type: "oauth",
  token: process.env.GITHUB_TOKEN
})

getIssue('auth0', 'manage', 330)
  // .then(addLabel('next'))
  .then(x => {
    // console.log(x)
    var a = x.repository_url.split('/')
    var repo = a.pop()
    var owner = a.pop()
    console.log(owner)
    console.log(repo)
  })
  .catch(console.log)


function addLabel(label) {
  console.log('Testing1: ' + label)
  return function(issue) {
    return new Promise((resolve, reject) => {
      console.log('Testing: ' + issue.title)
      if (hasLabel(issue, label)) resolve(issue)
      let options = {
        user: issue.user.login,
        repo: issue.repository_url.split('/').pop(),
        number: issue.number,
        labels: issue.labels.map(l => l.name)
      }
      options.labels.push(label)
      github.issues.edit(options, function(err, issue) {
        if (err) reject(err)
        resolve(issue)
      })
    })
  }
}

function hasLabel(issue, label) {
  let hasLabel = false
  issue.labels.forEach(l => {
    if (l.name.toLowerCase().indexOf(label) >= 0) hasLabel = true
  })
  return hasLabel
}

function getIssue(user, repo, number) {
  let options = {
    user: user,
    repo: repo,
    number: number
  }
  return new Promise((resolve, reject) => {
    github.issues.getRepoIssue(options, function(err, issue) {
      if (err) reject(err)
      resolve(issue)
    })
  })
}
