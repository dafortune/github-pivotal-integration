# GitHub <-> Pivotal Tracker Integration
A collection of webtasks and scripts to setup integration between GitHub and Pivotal Tracker

## Demo:
![Demo Gif](http://i.imgur.com/dy0c9L3.gif)


## Setup
1. Make sure the GitHub repo has the correct labels. Use the `util-setup-github-labels.js` scripts to auto configure the repo(s).
2. Create a Custom Integration in Pivotal and save the PROJECTID and INTEGRATIONID
3. Create the `env.sh` script based on the template `env.sh.txt`
4. Create the GitHub webhook with `run-github2pivotal-webhook.sh`
5. Create the Pivotal webhook with `run-pivotal-webhook.sh`


### Other
There is also a github-to-mongo webhook. This will simply mirror your github repo(s) to a mongo DB. If you do this, you can then enable the `issue-list.js` webhook, which will give you an endpoint to enter into Pivotal Tracker custom integration. This will add a GitHub column to Pivotal, and you can drag and drop issues from it.

