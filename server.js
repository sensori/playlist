const express = require('express')  
const app = express()  
const path = require('path')  
const exphbs = require('express-handlebars')
var https = require('https');
var accessToken = "EAAGarDuZA1w0BAJPhKXHb2hA949AkKHjkQRRbQC9Ln7rrBMeMBQ9oSlL6qMTahp3pAZClM0XIZB3rulYXcWs7H7pMy1ftF06CvYtIymKZC4ZCZBpU9QwxZCZBQ6tFy3cewFaCJL1BdfJvfd77o62AgcJHL43RjYvMXTkogSEYaELtG1vADlIWL2X"
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
app.use(allowCrossDomain)
app.get('/', (request, response) => {
  // response.send('home')
    // FB.api('/me', {access_token : accessToken}, function(res)  {
    //   console.log('Successful login for: ' + res.name);
    // });
    FB.api('/1828449210706834','GET',{"fields":"feed", access_token:accessToken},
      function(res) {
          console.log('Successful login for: ' + res.feed.data);
          response.json(res.feed.data)
      }
    );
})

app.get('/longAccessToken', (request, response) => {
    // Login()
  // response.json({
  //   // chance: request.chance
  //   chance: Math.random()
  // })
  // response.render('home', {})
  theUrl = "https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=451539501700877&client_secret=6876aa6703814e84894e945f46f317b5&fb_exchange_token=EAAGarDuZA1w0BAJPhKXHb2hA949AkKHjkQRRbQC9Ln7rrBMeMBQ9oSlL6qMTahp3pAZClM0XIZB3rulYXcWs7H7pMy1ftF06CvYtIymKZC4ZCZBpU9QwxZCZBQ6tFy3cewFaCJL1BdfJvfd77o62AgcJHL43RjYvMXTkogSEYaELtG1vADlIWL2X"
  // httpGetAsync(theUrl, getLongLivedCallback)

  //var request = https.get(theUrl, getLongLivedCallback)
})

app.use((err, request, response, next) => {  
  // log the error, for now just console.log
  console.log(err)
  response.status(500).send('Something broke!')
})

app.listen(app.get('port'), function () {
  console.log('Example app listening on port', app.get('port'))
}) 

function httpGetAsync(theUrl, callback)
{  
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

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