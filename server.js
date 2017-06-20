const express = require('express')  
const app = express()  
const path = require('path')  
const exphbs = require('express-handlebars')
var https = require('https');
var cors = require('cors'); 
app.use(cors());
var disciplesId = "509631155753788"
var fbExchangeToken = "EAAGarDuZA1w0BAHsYmGUOaJz2O0xZBmhZA0WEV1EZA1kRwsx1ZBcZCSA6Oq4fRYLp57zMiZCqwXnECtg1NZCIXkvtUOm3LqqBNXrZBU8AWBEZAVZBTA0n12gmBAohJNh2HzX5fPXMcFyMrlqqVYIIXG2b05pnpzVySfrveJm4oUWQfCkqZBbJeFqS3hglZCWvrOuMvs8ZD"
var accessToken = "EAAGarDuZA1w0BALbgdXbzclNyUeK7RaO7ZCEAXgY1ngYMougRFzdpOHs3VDxEJ46Q4QblHcvjcBm7dhnaCyIMgN76vehywZAjEAE0ptnTP89qFK7vU7B8m7VNlSwSQZAZC4VFRmoaMTZC1UZBTY9aZCC4ZC6V6W277cbxM3yhgzFTwgZDZD"
app.engine('.hbs', exphbs({  
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts')
}))

app.set('view engine', '.hbs')  
app.set('views', path.join(__dirname, 'views'))  
app.set('port', (process.env.PORT || 3000));
// app.use((request, response, next) => {  
//   console.log(request.headers)
//   next()
// })

// app.use((request, response, next) => {  
//   request.chance = Math.random()
//   next()
// })

var FB = require('fb'),
fb = new FB.Facebook({
                      version: 'v2.8', 
                      appId: '451539501700877',                       
                      xfbml: true  
                    });
 
//     var accessToken = res.access_token;
// });
app.get('/facebookLogin', (request, response) => {
  response.render('home');
})

app.get('/checkFacebookLogin', (request, response) => {  
    FB.api('/me', {access_token : accessToken}, function(res)  {
      console.log('Successful login for: ' + res.name);
      response.send('succesful login');
    });        
})

app.get('/', (request, response) => {
  response.send('home')       
})

app.get('/getMembers'
, (request, response) => {

    // build feed parameter
    var feedParams = "members.limit(1000){name,id}";
    callFacebookApi(response, feedParams);
})

app.get('/getPosts', (request, response) => {
    // build feed parameter
    var feedParams = "";          
    // defaults
    var since = new Date();
    since.setFullYear(2016);
    since = since.toISOString();
    var until = new Date().toISOString();
    var member = false;
    var limit = "500";
    var pageToken = "";

    if (request.query.nextpage != null) {
      // this is the exact graph API request we want to use, as returned (presumably)
      // earlier from facebook            
      // we should have since, until, and a page token;
      // TODO - funky parsing going on probably due to sending a full URL as a params

      // parse the nextpage param as a URL to get its params
      var url = require('url');
      var url_parts = url.parse(request.query.nextpage, true);
      since = url_parts.query.since;

      // these two are parsed already by node
      until = request.query.until;
      pageToken = request.query.__paging_token;
    }
    else {
      // parse request for params    
      if (request.query.since != null){
        since = request.query.since;
      }
      if (request.query.until != null){
        until = request.query.until;
      }
      // for now we always ask for member(from) and message data, 
      // at some point when all this is in database we can change that
      if (request.query.member != null){ // TODO - take member ID?? can we specify this in facebook graphi api call?
        member = true;        
      }      
    }  
    feedParams = "feed" + ".since(" + since + ").until(" + until + ").limit(" + limit + "){link,message,from}"     
    callFacebookApi(response, feedParams, pageToken);
  })

function callFacebookApi(response, params, pageToken){
      var fbParams = {};
      if (pageToken != null){
        fbParams = 
        {
          "fields":params, 
          access_token:accessToken,
          __paging_token:pageToken   
        };
      }
      else{
        fbParams = 
        {
          "fields":params, 
          access_token:accessToken    
        };
       }      
      FB.api('/'+ disciplesId,'GET', fbParams,
        function(res) {
          // TODO handle errors here
          //console.log('Successful login for: ' + res.feed.data);
          // if (res.error != null && res.error.message) {
          //   return response.status(500).send(err.error);
          // }          
          if (res != null && res.feed != null && res.feed.data != null){
            response.json(res.feed);
          }
          else if (res!= null && res.members != null && res.members.data != null){
            response.json(res.members.data);
          }
          else {
            response.json('');
          }
        }
    );
}

app.get('/longAccessToken', (request, response) => {
  theUrl = "https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=451539501700877&client_secret=6876aa6703814e84894e945f46f317b5&fb_exchange_token=" + fbExchangeToken;  
  var request = https.get(theUrl, getLongLivedCallback)
})

app.use((err, request, response, next) => {  
  // log the error, for now just console.log
  console.log(err);
  response.status(500).send('Something broke!');
})

app.listen(app.get('port'), function () {
  console.log('Example app listening on port', app.get('port'));
}) 

function getLongLivedCallback(res){
   console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));

  // Buffer the body entirely for processing as a whole.
  var bodyChunks = [];
  res.on('data', function(chunk) {
    // You can process streamed parts here...
    bodyChunks.push(chunk);
  }).on('end', function() {
    var body = Buffer.concat(bodyChunks);
    console.log('BODY: ' + body);
    // ...and/or process the entire body here.
    console.log('Long-lived token: ' + JSON.parse(body).access_token);    
  })
  // console.log('Long-lived token: ' + response);
}