const router = require('express').Router()
const axios = require('axios')
const List = require('../models/List')
const isSignedIn = require('../middleware/is-signed-in')

router.get('/', isSignedIn, async (req, res) => {
    try {
        const searchQuery = req.query.q
        let searchResults = []

        if (searchQuery) {
            const tmdbResponse = await axios.get('https://api.themoviedb.org/3/search/movie', {
                params: {
                    query: searchQuery,
                    include_adult: false,
                    language: 'en-US',
                    page: 1
                },
                headers: {
                    Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`
                }
            })
            searchResults = tmdbResponse.data.results
        }

        const userLists = await List.find({ user_id: req.session.user._id }).sort({ isMainWatchlist: -1 })

        res.render('search.ejs', {
            movies: searchResults,
            searchQuery: searchQuery,
            userLists: userLists,
            error: null
        })
    } catch (error) {
        console.log(error)
        res.render('search.ejs', {
            movies: [],
            searchQuery: req.query.q,
            userLists: [],
            error: 'Failed to search movies. Please try again.'
        })
    }
})

module.exports = router
