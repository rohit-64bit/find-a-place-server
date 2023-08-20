const jwt = require('jsonwebtoken');
require('dotenv').config()
const env = process.env;

jwtSecret = env.JWT_SECRET;

const fetchUser = (req, res, next) => {

    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ error: "Please authenticate using a valid token" });
    }
    try {

        const data = jwt.verify(token, jwtSecret);
        
        req.user = data.user;

        next();

    } catch (error) {
        return res.status(401).send({ error: "Please authenticate using a valid token" });
    }

}

module.exports = fetchUser;