const dns = require('node:dns')
dns.setServers(['8.8.8.8', '8.8.4.4'])

require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const session = require('express-session')
const methodOverride = require('method-override')
const { MongoStore } = require('connect-mongo')
const connectToDB = require('./db.js')

const passUserToView = require('./middleware/pass-user-to-view.js')

const authRoutes = require('./routes/auth.routes.js')
const indexRoutes = require('./routes/index.routes.js')
const listsRoutes = require('./routes/lists.routes.js')
const moviesRoutes = require('./routes/movies.routes.js')

const app = express()

app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(morgan('dev'))
app.use(methodOverride('_method'))
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            collectionName: 'sessions'
        }),
        cookie: {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24
        }
    })
)
app.use(passUserToView)

app.use('/auth', authRoutes)
app.use('/lists', listsRoutes)
app.use('/movies', moviesRoutes)
app.use('/', indexRoutes)

app.use(function (req, res) {
    res.status(404).render('404.ejs')
})

async function startServer() {
    const PORT = process.env.PORT || 3000
    await connectToDB()

    app.listen(PORT, function () {
        console.log(`App is running on port ${PORT}`)
    })
}

startServer()
