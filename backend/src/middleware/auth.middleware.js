import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const protectedRoute = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization")
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No authentication token, access denied" })
        }
        
        const token = authHeader.substring(7) 
        
        if (!token) {
            return res.status(401).json({ message: "No authentication token, access denied" })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        const user = await User.findById(decoded.userId).select("-password")
        
        if (!user) {
            return res.status(401).json({ message: "Token is not valid" })
        }
        
        req.user = user
        next()
        
    } catch (error) {
        console.log("Authentication error: ", error.message)
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token format" })
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token has expired" })
        }
        
        res.status(401).json({ message: "Token is not valid" })
    }
}

export default protectedRoute