// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'ne5hwke005'
export const apiEndpoint = `https://${apiId}.execute-api.eu-central-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-c7kofl0p.us.auth0.com',            // Auth0 domain
  clientId: 'AzAWAPFp6NAyQslCJ5scsmhRELWIutc8',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
