'use strict'
const Promise = require('bluebird')
const request = require('request-promise')
let PT_TOKEN = process.env.PT_TOKEN
let PROJECT_ID = process.env.PROJECT_ID
let INTEGRATION_ID = parseInt(process.env.INTEGRATION_ID)


link(118175547, 'crew-2/issues/47')


function link(pid, ghid) {
  getPTStory(pid)
    .then(story => {
      var update = {
        id: story.id,
        integration_id: INTEGRATION_ID,
        external_id: ghid
      }
      return updatePTStory(update)
    })
    .catch(e => {
      console.log(e)
    })
}


function getPTStory(id) {
  console.log('getPTStory()')
  var searchOptions = {
    method: 'GET',
    url: 'https://www.pivotaltracker.com/services/v5/projects/' + PROJECT_ID + '/stories/' + id,
    headers: {
      'X-TrackerToken': PT_TOKEN
    },
    json: true
  }
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
