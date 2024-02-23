import createError from 'http-errors'
import express from 'express'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import path from 'path'
import cors from 'cors'
import session from 'express-session'
import * as auth from './auth.js'

// Routes
import indexRouter from './routes/index.js'
import authRouter from './routes/auth.js'
import kcRouter from "./routes/kc.js"
import qrRouter from "./routes/qr.js"

const app = express()

// view engine setup
const __dirname = path.resolve()
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(cors({
  origin: `*`
}))
app.use(session({
  secret: process.env["JFTOOLS_SESSION_SECRET"],
  resave: false,
  saveUninitialized: false,
}))

app.use((req, res, next) => {
  res.locals.auth = auth.status(req)
  res.locals.url = req.originalUrl
  res.locals.encodedUrl = encodeURIComponent(req.originalUrl)

  next()
})

app.use('/', indexRouter)
app.use('/auth', authRouter)
app.use('/kc', kcRouter)
app.use('/qr', qrRouter)

// Register locals
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500);
  res.render('error')
});

export default app

