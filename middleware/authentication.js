const jwt = require("jsonwebtoken");
const userModel = require("../server/model/userModel");
// Function to verify a JWT

const verifyJWT = (req, res, next) => {
  const token = req.cookies.userToken;

  if (!token) {
    return res.redirect("/login");
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden: Invalid token" });
    }
    req.user = user;
    let customer = await userModel.findById(user.userId)
    if(customer.status == 'Blocked'){
      res.clearCookie("userToken")
      return res.redirect('/login')
    }
    next();
  });
};

const verifyAdminJWT = (req,res,next) =>{
  const adminToken = req.cookies.adminToken
  if(!adminToken){
    return res.redirect('./login')
  }
  jwt.verify(adminToken, process.env.JWT_SECRET_KEY, async (err, admin) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden: Invalid token" });
    }
    req.admin = admin
    next()
  }
)}

const checkAuthenticated = (req, res, next) => {
  const token = req.cookies.userToken;

  if (token) {
    return res.redirect("/home");
  } else {
    next();
  }
};

const isBlocked = async (req, res, next) => {
  const userid = req.user.userId;
  const user = await userModel.findById(userid);
  if (user.status == "Blocked") {
    res.redirect("/login");
  } else {
    next();
  }
};

module.exports = { verifyJWT, checkAuthenticated, isBlocked, verifyAdminJWT };
