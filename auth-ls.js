

const echoPostRequest = {
  url: pm.environment.get("Host-Authentication") + 'login',
  method: 'POST',
  header: 'Content-Type:application/json',
  body: {
    mode: 'application/json',
    raw: JSON.stringify(
        {
        	username: pm.environment.get("Auth-Username"),
          password: pm.environment.get("Auth-Password")
        })
  }
};

  var getToken = true;

  if (!pm.environment.get('accessTokenExpiry') || 
      !pm.environment.get('currentAccessToken')) {
      console.log('Token or expiry date are missing')
  } else if (pm.environment.get('accessTokenExpiry') <= (new Date()).getTime()) {
      console.log('Token is expired')
  } else {
      getToken = false;
      console.log('Token and expiry date are all good');
  }


  if (getToken === true) {
      pm.sendRequest(echoPostRequest, function (err, res) {
      console.log(err ? err : res.json());
          if (err === null) {
              console.log('Saving the token and expiry date')
              var responseJson = res.json();
              if (responseJson.message === "success") {                
                  postman.setEnvironmentVariable("Cognito-Access-Token", responseJson.data.access_token);
                  postman.setEnvironmentVariable("Cognito-Refresh-Token", responseJson.data.refresh_token);
                  postman.setEnvironmentVariable("Cognito-Id-Token", responseJson.data.id_token);

                  var expiryDate = new Date();
                  expiryDate.setSeconds(expiryDate.getSeconds() + responseJson.data.expires_in);
                  pm.environment.set('accessTokenExpiry', expiryDate.getTime());
              } else {
                  throw new Error("Authentication error"); 
              }

          }
      });
  }
