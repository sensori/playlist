const express = require('express')  
const app = express()  
const path = require('path')  
const exphbs = require('express-handlebars')
var https = require('https');
var cors = require('cors'); 
app.use(cors());
var disciplesId = "509631155753788"
var fbExchangeToken = "EAAGarDuZA1w0BADwYQDqao5ZAUReW7qZBxFBkBmtI76oMSwCitHnZBHJ1bSmoAPTMSrRXZCO3Ng5Nfd8hhBNP8bjIkKZAvqEeMLwBdeuCYGtPAeWrUXPnrhKb2okfeUYDI2vhZA5yl0HP2oyNEcIYXhj379bLPI4z5V9HQobhmKylgVU57wTn7n8ou0IVQGmyIZD"
var accessToken = "EAAGarDuZA1w0BAJju7hRGYjJkDZCktAoQeXSHZApnZBNThOZBhjDZAElAFdAJ9RiLlM5j0WoTqbJwYebKIzTBNWoJGyHvAdC1lI6DrWBswPL4Kv4zqI3lpXvpJcdOWjLQpZAjbtLvl5sEcMF2B2WLwf"
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

app.get('/getPosts'
, (request, response) => {
    // defaults
    var since = new Date();
    since.setFullYear(2016);
    since = since.toISOString();
    var until = new Date().toISOString();

    // parse request for params    
    if (request.query.since != null){
      since = request.query.since;
    }
    if (request.query.until != null){
      until = request.query.until;
    }
    
    // build feed parameter
    var feedParams = "feed" + ".since(" + since + ").until(" + until + ").limit(100){link,message}"
    callFacebookApi(response, feedParams);
})

function callFacebookApi(response, params){
      FB.api('/'+ disciplesId,'GET',
      {
        "fields":params, 
        access_token:accessToken    
      },
      function(res) {
        // TODO handle errors here
          //console.log('Successful login for: ' + res.feed.data);
          // if (res.error != null && res.error.message) {
          //   return response.status(500).send(err.error);
          // }          
          if (res != null && res.feed != null && res.feed.data != null){
            response.json(res.feed.data);
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