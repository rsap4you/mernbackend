const express = require('express')

const router = express.Router()
const postController = require('../controller/post_controllers');

router.post('/add-post', postController.add_post);

router.post('/upload-post-file', postController.upload_postFile);

router.post('/post-feed-list', postController.post_feed_list);

module.exports = router;
