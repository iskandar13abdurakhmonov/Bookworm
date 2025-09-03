import express from 'express'
import Book from '../models/Book.js'
import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'
import protectedRoute from '../middleware/auth.middleware.js'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const router = express.Router()
const upload = multer({ dest: 'uploads/' })

router.post('/', protectedRoute, upload.single('image'), async (req, res) => {
    try {
        console.log("User ID: ", req.user._id.toString())
        console.log("Request body: ", req.body)
        console.log("Uploaded file: ", req.file)
        
        const { title, caption, rating } = req.body
        
        if (!req.file) {
            return res.status(400).json({ message: "Please upload an image file" })
        }
        
        if (!title || !caption || !rating) {
            return res.status(400).json({ message: "Please provide title, caption, and rating" })
        }
        
        const result = await cloudinary.uploader.upload(req.file.path)
        const imageUrl = result.secure_url
        
        const newBook = new Book({
            title,
            caption,
            rating: Number(rating), 
            image: imageUrl,
            user: req.user._id 
        })
        
        await newBook.save()
        
        const response = {
            ...newBook.toObject(),
            _id: newBook._id.toString(),
            user: newBook.user.toString()
        }
        
        res.status(201).json(response)
        
    } catch (error) {
        console.log("Error: ", error)
        res.status(500).json({ message: error.message })
    }
})

router.get('/', protectedRoute, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 5
        const skip = (page - 1) * limit
        
        const books = await Book.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("user", "username profileImage")
            
        const total = await Book.countDocuments()
        
        res.status(200).json({
            books,
            currentPage: page,
            totalBooks: total,
            totalPages: Math.ceil(total / limit) 
        })
    } catch (error) {
        console.log("Error in get all books route", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.delete('/:id', protectedRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        if(!book) 
            return res.status(404).json({ message: "Book not found"})

        if(book.user.toString() !== req.user._id.toString())
            return res.status(401).json({ message: "Unauthorized" })

        if(book.image && book.image.includes("cloudinary")) {
            try {
                const publicId = book.image.split('/').pop().split('.')[0]
                await cloudinary.uploader.destroy(publicId)
            } catch(err) {
                console.log("Error deleting image from cloudinary", err)
            }
        }

        await book.deleteOne()

        res.json({ message: "Book deleted successfully"})

    } catch (error) {
        console.log("Error deleting book", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

export default router