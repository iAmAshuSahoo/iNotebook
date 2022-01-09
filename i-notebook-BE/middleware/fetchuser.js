var jwt = require('jsonwebtoken');

const JWT_SECRET = "WowNodeJ$isGreat";

const fetchuser = (req, res, next) => {
    // Get user from jwt token add id to req object
    const token = req.header("auth-token");
    if (!token) {
        return res.status(401).json({error: "Authenticate using valid token"});
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user
        next();
    } catch (error) {
        return res.status(401).json({error: "Authenticate using valid token"});
    }
}

module.exports = fetchuser;