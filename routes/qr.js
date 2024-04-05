import express from 'express'
import * as QRCode from 'qrcode'

const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('qr/index', { title: 'QR Code Generator'})
});

router.get('/:text', async function (req, res, next) {
  const type = req.query.type
  const text = req.params.text

  res.contentType('image/png')

  if (type === 'url') {
    const decodedText = decodeURIComponent(text)
    const dataUrl = await QRCode.toDataURL(decodedText)

    res.send(dataUrl)
  } else {
    QRCode.toFileStream(res, text)
  }
});

export default router
