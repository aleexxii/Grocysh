const { generateJWT } = require("./setJwtToken");
const User = require("../model/userModel");
const jwt = require("jsonwebtoken");

const getGoogleURL = (req, res) => {
  if (req.cookies.userToken) {
    return res.redirect("/home"); // Redirect to home if already authenticated
  }
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID, // It must correspond to what we declared earlier in the backend
    scope: "email profile ", // This is the user data you have access to, in our case its just the mail.
    redirect_uri: process.env.GOOGLE_URL, // This is the uri that will be redirected to if the user signs into his google account successfully
    auth_type: "rerequest", // This tells the consent screen to reappear if the user initially entered wrong credentials into the google modal
    display: "popup", //It pops up the consent screen when the anchor tag is clicked
    response_type: "code",
    prompt: "consent",
  });
  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  res.redirect(url);
};

const getUserFromGoogle = async (req, res) => {
  try {
    if (req.query.error == "access_denied") {
      res.json({ redirect: "/" });
    } else {
      const code = req.query.code;
  
      const data = await getGoogleToken(code);
  
      const urlForGettingUserInfo =
        "https://www.googleapis.com/oauth2/v3/userinfo";
      const response = await fetch(urlForGettingUserInfo, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Network response was not ok");
      } else {
        const googleUser = await response.json();
  
        const email = googleUser.email;
        res.cookie("email", email);
        const existingUser = await User.findOne({ email: email });
  
        if (existingUser != null) {
          await generateJWT(existingUser, res);
          res.redirect("/home");
        } else {
          const user = new User({
            fname: googleUser.given_name,
            lname: googleUser.family_name,
            email: email,
            googleId: googleUser.sub,
          });
          const newUser = await user.save();
  
          await generateJWT(user, res);
          res.redirect("/home");
        }
      }
    }
  } catch (error) {
    console.log('google' , error);
  }
};



module.exports = {
  getGoogleURL,
  getUserFromGoogle,
};

//google
function getGoogleToken(code) {
  const query = new URLSearchParams({
    code: code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: "http://localhost:8080/google/callback",
    grant_type: "authorization_code",
  });
  const url = `https://oauth2.googleapis.com/token?${query}`;

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .catch((error) => {
      console.log(error);
    });
}
