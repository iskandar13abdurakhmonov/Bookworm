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

router.post("/", protectedRoute, async (req, res) => {
    try {
        const { title, caption, rating, image } = req.body;

        if (!image || !title || !caption || !rating) {
            return res.status(400).json({ message: "Please provide all fields" });
        }

        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url;

        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id,
        });

        await newBook.save();

        res.status(201).json(newBook);
    } catch (error) {
        console.log("Error creating book", error);
        res.status(500).json({ message: error.message });
    }
});

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