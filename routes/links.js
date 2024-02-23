import express from 'express'
import options from '../options.js'

const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('links', { title: `Links` })
});

export default router
