const router = require('express').Router()
const List = require('../models/List')
const Movie = require('../models/Movie')
const isSignedIn = require('../middleware/is-signed-in')

function sortByPriority(a, b) {
    if (a.priority !== b.priority) {
        return a.priority - b.priority
    }
    return a.order - b.order
}

router.get('/', isSignedIn, async (req, res) => {
    try {
        const lists = await List.find({ user_id: req.session.user._id }).sort({ isMainWatchlist: -1 })
        res.render('all-lists.ejs', { lists: lists })
    } catch (error) {
        console.log(error)
        res.redirect('/')
    }
})

router.post('/', isSignedIn, async (req, res) => {
    try {
        await List.create({
            title: req.body.title,
            description: req.body.description,
            user_id: req.session.user._id
        })
        res.redirect('/lists')
    } catch (error) {
        console.log(error)
        res.redirect('/lists')
    }
})

router.post('/add-movie', isSignedIn, async (req, res) => {
    try {
        const foundList = await List.findById(req.body.listId)
        if (!foundList.user_id.equals(req.session.user._id)) {
            return res.send('You are not the owner')
        }

        let movie = await Movie.findOne({ tmdbId: req.body.tmdbId })
        if (!movie) {
            movie = await Movie.create({
                tmdbId: req.body.tmdbId,
                title: req.body.title,
                overview: req.body.overview,
                posterPath: req.body.posterPath
            })
        }

        let alreadyInList = false
        for (let item of foundList.movies) {
            if (item.movie_id.equals(movie._id)) {
                alreadyInList = true
            }
        }

        if (!alreadyInList) {
            foundList.movies.push({
                movie_id: movie._id,
                priority: req.body.priority,
                order: req.body.order
            })
            await foundList.save()
        }

        res.redirect(req.get('Referer') || '/movies')
    } catch (error) {
        console.log(error)
        res.redirect('/movies')
    }
})

router.get('/:listId', isSignedIn, async (req, res) => {
    try {
        const foundList = await List.findById(req.params.listId)
            .populate('user_id')
            .populate('movies.movie_id')
        if (!foundList) {
            return res.redirect('/lists')
        }

        foundList.movies.sort(sortByPriority)

        res.render('list-details.ejs', { list: foundList })
    } catch (error) {
        console.log(error)
        res.redirect('/lists')
    }
})

router.get('/:listId/edit', isSignedIn, async (req, res) => {
    try {
        const foundList = await List.findById(req.params.listId).populate('movies.movie_id')
        if (!foundList.user_id.equals(req.session.user._id)) {
            return res.send('You are not the owner')
        }

        foundList.movies.sort(sortByPriority)

        res.render('update-list.ejs', { list: foundList })
    } catch (error) {
        console.log(error)
        res.redirect('/lists')
    }
})

router.put('/:listId', isSignedIn, async (req, res) => {
    try {
        const foundList = await List.findById(req.params.listId)
        if (!foundList.user_id.equals(req.session.user._id)) {
            return res.send('You are not the owner')
        }

        foundList.title = req.body.title
        foundList.description = req.body.description
        await foundList.save()

        res.redirect(`/lists/${req.params.listId}`)
    } catch (error) {
        console.log(error)
        res.redirect('/lists')
    }
})

router.delete('/:listId', isSignedIn, async (req, res) => {
    try {
        const foundList = await List.findById(req.params.listId)
        if (!foundList.user_id.equals(req.session.user._id)) {
            return res.send('You are not the owner')
        }
        if (foundList.isMainWatchlist) {
            return res.send('You cannot delete your Main Watchlist')
        }

        await List.findByIdAndDelete(req.params.listId)
        res.redirect('/lists')
    } catch (error) {
        console.log(error)
        res.redirect('/lists')
    }
})

router.put('/:listId/movies/:movieSubId', isSignedIn, async (req, res) => {
    try {
        const foundList = await List.findById(req.params.listId)
        if (!foundList.user_id.equals(req.session.user._id)) {
            return res.send('You are not the owner')
        }

        const movieItem = foundList.movies.id(req.params.movieSubId)
        movieItem.priority = req.body.priority
        movieItem.order = req.body.order
        movieItem.watchDate = req.body.watchDate
        movieItem.watchTime = req.body.watchTime
        movieItem.isWatched = req.body.isWatched === 'true'
        await foundList.save()

        res.redirect(`/lists/${req.params.listId}/edit`)
    } catch (error) {
        console.log(error)
        res.redirect(`/lists/${req.params.listId}/edit`)
    }
})

router.delete('/:listId/movies/:movieSubId', isSignedIn, async (req, res) => {
    try {
        const foundList = await List.findById(req.params.listId)
        if (!foundList.user_id.equals(req.session.user._id)) {
            return res.send('You are not the owner')
        }

        foundList.movies.pull(req.params.movieSubId)
        await foundList.save()

        res.redirect(`/lists/${req.params.listId}/edit`)
    } catch (error) {
        console.log(error)
        res.redirect(`/lists/${req.params.listId}/edit`)
    }
})

module.exports = router
