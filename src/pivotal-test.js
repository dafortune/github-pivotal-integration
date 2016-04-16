'use strict'
const Promise = require('bluebird')
  // const tracker = require('pivotaltracker');
  // Promise.promisifyAll(tracker.Client)

var PT_TOKEN = process.env.PT_TOKEN
var PROJECT_ID = process.env.PROJECT_ID
if (!PT_TOKEN) {
  console.log('Missing env PT_TOKEN')
  process.exit()
}
// Promise.promisifyAll()
// var client = new tracker.Client(PT_TOKEN)

// var request = require('superagent');

// request
//   .post('https://www.pivotaltracker.com/services/v5/projects/' + PROJECT_ID +'/stories')
//   .send({"name":"A NEW COOL story"})
//   .set('X-TrackerToken', PT_TOKEN)
//   .set('Content-Type', 'application/json')
//   .end(function(err, res){
//     console.log(err)
//     console.log(res.body)
//   });

var request = require('request-promise')
Promise.promisifyAll(request);

// // Create Request
// var createOptions = {
//   method: 'POST',
//   url: 'https://www.pivotaltracker.com/services/v5/projects/' + PROJECT_ID + '/stories',
//   headers: {
//     'X-TrackerToken': PT_TOKEN
//   },
//   json: { "name": "A NEW HOT story" }
// }
// request.post(createOptions)
//   .then(d => {
//     console.log(d)
//   })
//   .catch(e => console.log)



// // Search Request
// let extid = 'astanciu/Points-WT/issues/9'
// var searchOptions = {
//     method: 'GET',
//     url: 'https://www.pivotaltracker.com/services/v5/projects/' + PROJECT_ID + '/stories?filter=external_id:"' + extid + '"',
//     headers: {
//       'X-TrackerToken': PT_TOKEN
//     },
//     json: true
//   }
//   //external_id:"astanciu/Points-WT/issues/9"
// return request.get(searchOptions)
//   .then(res => {
//     console.log('Search Res:')
//     console.log(res)
//     console.log(res.length)
//   })


// // Get Story by id
// let sid = '117758877'
// var searchOptions = {
//     method: 'GET',
//     url: 'https://www.pivotaltracker.com/services/v5/projects/' + PROJECT_ID + '/stories?filter=external_id:"' + extid + '"',
//     headers: {
//       'X-TrackerToken': PT_TOKEN
//     },
//     json: true
//   }
//   //external_id:"astanciu/Points-WT/issues/9"
// return request.get(searchOptions)
//   .then(res => {
//     console.log('Search Res:')
//     console.log(res)
//     console.log(res.length)
//   })

// Get Story by ExternalID
getPTStoryByPath('astanciu/Points-WT/issues/10')
  .then(s => {
    console.log(s.length)
  })

function getPTStoryByPath(extid) {
  var searchOptions = {
      method: 'GET',
      url: 'https://www.pivotaltracker.com/services/v5/projects/' + PROJECT_ID + '/stories?filter=external_id:"' + extid + '"',
      headers: {
        'X-TrackerToken': PT_TOKEN
      },
      json: true
    }
  return request.get(searchOptions)
}