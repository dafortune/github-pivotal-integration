'use strict'
const Promise = require('bluebird')
const request = require('request-promise')
let PT_TOKEN = process.env.PT_TOKEN
let PROJECT_ID = process.env.PROJECT_ID
let INTEGRATION_ID = process.env.INTEGRATION_ID


getPTAllStories()
  .then(processStories)
  .then(x => {
    console.log('\n\n\ndone')
    // console.log(x)
  })
  .catch(e => {
    console.log(e)
  })




function processStories(stories){
  console.log(stories.length)
  var s = stories.filter(s => s.description)
  console.log(s.length)
  return Promise.mapSeries(s, updateLink)

}  

function updateLink(story){
  if (story.description){
    let desc = story.description  
    // let urlRegex = /\[https:\/\/github\.com\/(.*)\]/g
    
    // let url = desc.match(urlRegex)
    let url
    if (desc.indexOf('https://github.com') === 0) {
      url = desc
      console.log(url)
    }

    if (url){
      // let path = url[0].replace('[','').replace(']','')
      let path = url.replace('https://github.com/','')
      
      let update = {
        id: story.id,
        integration_id: parseInt(INTEGRATION_ID),
        external_id: path
      }
      console.log('Updating: ' + update.id + ' : ' + path)
      return updatePTStory(update)
    }
  }
}

function getPTAllStories() {
  let searchOptions = {
      method: 'GET',
      url: 'https://www.pivotaltracker.com/services/v5/projects/' + PROJECT_ID + '/stories?limit=300',
      headers: {
        'X-TrackerToken': PT_TOKEN
      },
      json: true
    }
    //external_id:"astanciu/Points-WT/issues/9"
  return request.get(searchOptions)
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