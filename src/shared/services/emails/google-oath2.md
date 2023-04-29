See https://developers.google.com/identity/protocols/oauth2/web-server#httprest

--get OAtuh code from google
https://accounts.google.com/o/oauth2/v2/auth?scope=https://mail.google.com&access_type=offline&include_granted_scopes=true&state=state_parameter_passthrough_value&redirect_uri=http://localhost&response_type=code&client_id=929187004481-5s77n5d3cu2u1tqiggvnl46ktrsgclpa.apps.googleusercontent.com

-- result
http://localhost/?state=state_parameter_passthrough_value&code=4/0AbUR2VOlgjJXosZ3Ifp3rAMvMHvugLd8clxuYD4qZvj5Em1wDoX9wOsD0lAc543jTlbhkw&scope=https://mail.google.com/

--exchange code to access_refresh token
