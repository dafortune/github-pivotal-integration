'use strict'
var tracker = require('pivotaltracker');
var client = new tracker.Client('526e21d9841ac9fef72ed06924195b3f');


// client.projects.all(function(error, projects) {
//   console.log(projects)
// });

let story = {"name":"Exhaust ports are ray shielded"}
client.project(1563515).stories.create(story, function(err, data) {
 console.log(err)
 console.log(data)
});