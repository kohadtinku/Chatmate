import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/util.js"
import User from "../models/user.model.js"
import bcrypt from 'bcryptjs'
export const signup = async (req, res) => {
    const { fullname, email, password } = req.body;
    if (!fullname || !email || !password) {
        return res.status(400).json({ message: "All FIelds Are Required" })
    }
    try {
        if (password.length < 6) {
            return res.status(400).json({ message: "password must be at least 6 characters" })
        }
        const user = await User.findOne({ email })
        if (user) return res.status(400).json({ message: "Email aleredy exists" })

        const salt = await bcrypt.genSalt(12)
        const hashedpassword = await bcrypt.hash(password, salt)
        const newUser = new User({
            fullname,
            email,
            password: hashedpassword
        })
        if (newUser) {
            generateToken(newUser._id, res)
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                profilepic: newUser.profilepic
            })
        } else {
            res.status(400).json({ message: "Invalid User Data" })
        }
    } catch (error) {
        console.log("error in signup controller", error.message);
        res.status(500).json({ message: "Internal Server Error" })

    }
}
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email })
        if (!user) {
            res.status(400).json({ message: "Invalid Credentials" })

        }
        const isPassCorrect = await bcrypt.compare(password, user.password)
        if (!isPassCorrect) {
            res.status(400).json({ message: "Invalid Credentials" })

        }
        generateToken(user._id, res)
        res.status(200).json({
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            profilepic: user.profilepic
        })
    } catch (error) {
        console.log("error in login controller", error.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}
export const logout = async (req, res) => {

    try {
        res.cookie("jwt", "", { maxAge: 0 })
        res.status(200).json({ message: "LOGGED OUT SUCCESSFULLY" })
    } catch (error) {
        console.log("error in Logout controller", error.message);
        res.status(500).json({ message: "Internal Server Error" })
    }

}

export const updateProfile = async (req, res) => {
    try {
        const { profilepic } = req.body;
        const userId = req.user._id;

        if (!profilepic) {
            return res.status(400).json({ message: "Profile pic must required" })
        }
        const uploadResponse = await cloudinary.uploader.upload(profilepic)
        const updateUser = await User.findByIdAndUpdate(userId, { profilepic: uploadResponse.secure_url }, { new: true })
        res.status(200).json(updateUser)
    } catch (error) {
        console.log("error in Update Profile", error.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export const checkAuth = async (req, res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("error in checkauth controller", error.message);
        res.status(500).json({ message: "Internal Server Error" })

    }
}