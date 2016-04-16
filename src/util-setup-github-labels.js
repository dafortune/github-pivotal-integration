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

unifyRepo('astanciu','Points-WT')

function unifyRepo(user, repo){
  createLabel('next', 'F0CC00', user, repo)
  createLabel('on hold', '16214D', user, repo)
  updateLabel('bug', 'FF3E00', user, repo)  
  updateLabel('in progress', '44C7F4', user, repo)  
  updateLabel('later', '54658E', user, repo)  
  updateLabel('ready', '7ED321', user, repo)  
}



function updateLabel(name, color, user, repo){
  let nextLabel = {
    user: user,
    repo: repo,
    name: name,
    color: color
  }
  github.issues.updateLabel(nextLabel, function(err, issue) {
    if (err) console.log(err)
  })
}

function createLabel(name, color, user, repo){
  let nextLabel = {
    user: user,
    repo: repo,
    name: name,
    color: color
  }
  github.issues.createLabel(nextLabel, function(err, issue) {
    if (err) console.log(err)
  })
}