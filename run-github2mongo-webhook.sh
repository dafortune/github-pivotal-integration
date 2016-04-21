source ./env.sh
wt create \
--watch \
--secret PT_TOKEN=$PT_TOKEN \
--secret INTEGRATION_ID=$INTEGRATION_ID \
--secret PROJECT_ID=$PROJECT_ID \
--secret DB_URL=$DB_URL \
src/github-to-mongo.js