source ./env.sh
wt create \
--watch \
--secret DB_URL=$DB_URL \
src/issue-list.js