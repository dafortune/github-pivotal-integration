'use strict'
var tracker = require('pivotaltracker');
var pivotalToken = process.env.PT_TOKEN
if (!pivotalToken){
  console.log('Missing env PT_TOKEN')
  process.exit()
}
var client = new tracker.Client()


// client.projects.all(function(error, projects) {
//   console.log(projects)
// });

let story = {"name":"Exhaust ports are ray shielded"}
client.project(1563515).stories.create(story, function(err, data) {
 console.log(err)
 console.log(data)
});