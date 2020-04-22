# Application server that prints a message at a given time in the future

## Prerequisites
* Installed Node.js `version >= 12.0.0`
* Redis server running on `localhost:6379`
* Dependencies installed by `npm install`

## Running application

`PORT=<port> npm start`

Default port is `3000`

## API

`POST` `/echoAtTime`

Headers:
`Content-Type: application/json`

Body:

```
{ 
  time: <timestamp in milliseconds>,
  message: <string>
}
``` 

Server responds with:
 * HTTP status 202 if message have been stored successfully.
 * HTTP status 400 and validation error message in body if validations failed.
 * HTTP status 500 if unexpected error happened.


### Request example using curl:
```
curl --header "Content-Type: application/json" \
   --data '{"time":"1587545487776","message":"xyz"}' \
   http://localhost:3000/echoAtTime -v
```


