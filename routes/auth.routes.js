const router = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/User')
const List = require('../models/List')

router.get('/sign-up', (req, res) => {
    try {
        res.render('auth/sign-up.ejs', { error: null })
    } catch (error) {
        console.log(error)
        res.redirect('/')
    }
})

router.post('/sign-up', async (req, res) => {
    try {
        const userInDatabase = await User.findOne({ username: req.body.username })
        if (userInDatabase) {
            return res.render('auth/sign-up.ejs', { error: 'Username already taken.' })
        }

        if (req.body.password.length <= 6) {
            return res.render('auth/sign-up.ejs', { error: 'Password must be more than 6 characters.' })
        }

        if (req.body.password !== req.body.confirmPassword) {
            return res.render('auth/sign-up.ejs', { error: 'Password and Confirm Password must match.' })
        }

        const hashedPassword = bcrypt.hashSync(req.body.password, 10)

        const user = await User.create({
            username: req.body.username,
            password: hashedPassword
        })

        await List.create({
            title: 'Main Watchlist',
            description: 'My main watchlist',
            isMainWatchlist: true,
            user_id: user._id
        })

        res.redirect('/auth/sign-in')
    } catch (error) {
        console.log(error)
        res.redirect('/auth/sign-up')
    }
})

router.get('/sign-in', (req, res) => {
    try {
        res.render('auth/sign-in.ejs', { error: null })
    } catch (error) {
        console.log(error)
        res.redirect('/')
    }
})

router.post('/sign-in', async (req, res) => {
    try {
        const userInDatabase = await User.findOne({ username: req.body.username })
        if (!userInDatabase) {
            return res.render('auth/sign-in.ejs', { error: 'Login failed. Please try again.' })
        }

        const validPassword = bcrypt.compareSync(req.body.password, userInDatabase.password)
        if (!validPassword) {
            return res.render('auth/sign-in.ejs', { error: 'Login failed. Please try again.' })
        }

        const mainWatchlist = await List.findOne({ user_id: userInDatabase._id, isMainWatchlist: true })
        if (!mainWatchlist) {
            await List.create({
                title: 'Main Watchlist',
                description: 'My main watchlist',
                isMainWatchlist: true,
                user_id: userInDatabase._id
            })
        }

        req.session.user = {
            username: userInDatabase.username,
            _id: userInDatabase._id
        }

        res.redirect('/')
    } catch (error) {
        console.log(error)
        res.redirect('/auth/sign-in')
    }
})

router.get('/sign-out', (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/')
    } catch (error) {
        console.log(error)
        res.redirect('/')
    }
})

module.exports = router
