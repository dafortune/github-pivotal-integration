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
unifyRepo('auth0','manage')
// unifyRepo('auth0','api2')
// unifyRepo('auth0','pricing-formula')
// unifyRepo('auth0','pricing-widget')
// unifyRepo('auth0','visual-cues-widget')
// unifyRepo('auth0','feature-widget')
// unifyRepo('auth0','auth0-stats')
// unifyRepo('auth0','auth0-licensing')
// unifyRepo('auth0', 'crew-2')
// unifyRepo('auth0','Points-WT')

function unifyRepo(user, repo){
  createLabel('next', 'F0CC00', user, repo)
  createLabel('on hold', '16214D', user, repo)
  updateLabel('bug', 'FF3E00', user, repo) 
  createLabel('bug', 'F0CC00', user, repo) 
  createLabel('in progress', '44C7F4', user, repo)  
  updateLabel('in progress', '44C7F4', user, repo) 
  createLabel('later', '44C7F4', user, repo)  
  updateLabel('later', '54658E', user, repo)  
  createLabel('ready', '44C7F4', user, repo)  
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
    if (err.message.indexOf('already_exists') > -1) return
    if (err) console.dir(err)
  })
}