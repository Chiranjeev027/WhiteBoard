const{ getAllCanvases,createCanvas,loadCanvas, updateCanvas, shareCanvas } = require('../controllers/canvasController');
const authenticationMiddleware = require('../middlewares/authenticationMiddleware'); 

const express = require('express');
const router = express.Router();

router.get('/',authenticationMiddleware , getAllCanvases);
router.post('/', authenticationMiddleware, createCanvas);

router.get('/load/:canvasId', authenticationMiddleware,loadCanvas);
// router.put('/update/:canvasId', authenticationMiddleware, updateCanvas);
router.put('/:canvasId', authenticationMiddleware, updateCanvas);

router.put('/share/:canvasId', authenticationMiddleware, shareCanvas);


module.exports = router;
