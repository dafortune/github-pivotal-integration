source ./env.sh
wt create \
--watch \
--secret PT_TOKEN=$PT_TOKEN \
--secret PROJECT_ID=$PROJECT_ID \
--secret INTEGRATION_ID=$INTEGRATION_ID \
src/github-to-pivotal.js