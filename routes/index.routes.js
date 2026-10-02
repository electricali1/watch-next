const router = require('express').Router()
const List = require('../models/List')

router.get('/', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.render('index.ejs', { userLists: [] })
        }

        const userLists = await List.find({ user_id: req.session.user._id })
            .sort({ isMainWatchlist: -1 })
            .populate('movies.movie_id')

        for (let list of userLists) {
            list.watchNextMovies = list.movies.filter(function (item) {
                return item.priority === 1
            })
            list.watchNextMovies.sort(function (a, b) {
                return a.order - b.order
            })
        }

        res.render('index.ejs', { userLists: userLists })
    } catch (error) {
        console.log(error)
        res.render('index.ejs', { userLists: [] })
    }
})

module.exports = router
