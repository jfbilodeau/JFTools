import express from 'express'
import * as QRCode from 'qrcode'

const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('qr/index', { title: 'QR Code Generator'})
});

router.get('/:text', function(req, res, next) {
  const text = req.params.text

  res.contentType('image/png')

  QRCode.toFileStream(res, text)
});

export default router
