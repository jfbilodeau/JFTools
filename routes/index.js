import express from 'express'
import options from '../options.js'

const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: `J-F Tools Home` })
});

export default router
