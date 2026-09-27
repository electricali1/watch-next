const router = require("express").Router()
const List = require('../models/List')
const isSignedIn = require('../middleware/is-signed-in')

router.get('/new', isSignedIn, (req, res) => {
    res.render('create-list.ejs')
})

router.post('/', isSignedIn, async (req, res) => {
    try {
        const createdList = await List.create({
            title: req.body.title,
            description: req.body.description,
            user_id: req.session.user._id
        })
        res.redirect('/lists')
    } catch (error) {
        console.error(error)
        res.redirect('/lists/new')
    }
})


router.get('/', async (req, res) => {
    const lists = await List.find()
    res.render('all-lists.ejs', { lists: lists })
})

router.get('/:listId', async (req, res) => {
    try {
        const foundList = await List.findById(req.params.listId).populate('user_id')
        if (!foundList) {
            return res.redirect('/lists')
        }
        res.render('list-details.ejs', { list: foundList })
    } catch (error) {
        console.error(error)
        res.redirect('/lists')
    }
})

router.delete('/:listId', isSignedIn, async (req, res) => {
    try {
        const foundList = await List.findById(req.params.listId)
        if (!foundList.user_id.equals(req.session.user._id)) {
            return res.send('You are not the owner')
        }
        await List.findByIdAndDelete(req.params.listId)
        res.redirect('/lists')
    } catch (error) {
        console.error(error)
        res.redirect('/lists')
    }
})


router.get('/:listId/edit', isSignedIn, async (req, res) => {
    try {
        const foundList = await List.findById(req.params.listId)
        if (!foundList.user_id.equals(req.session.user._id)) {
            return res.send('You are not the owner')
        }
        res.render('update-list.ejs', { list: foundList })
    } catch (error) {
        console.error(error)
        res.redirect('/lists')
    }
})

router.put('/:listId', isSignedIn, async (req, res) => {
    try {
        const foundList = await List.findById(req.params.listId)
        if (!foundList.user_id.equals(req.session.user._id)) {
            return res.send('You are not the owner')
        }
        await List.findByIdAndUpdate(req.params.listId, {
            title: req.body.title,
            description: req.body.description
        })
        res.redirect(`/lists/${req.params.listId}`)
    } catch (error) {
        console.error(error)
        res.redirect('/lists')
    }
})

module.exports = router;
