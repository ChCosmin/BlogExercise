const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

/**
 * GET /
 * HOME
*/
router.get('', async (req, res) => {
    try {
        const locals = {
            title: "NodeJs Blog",
            description: "Simple blog created with NodeJs, Express & MongoDb."
        }

        let perPage = 5;
        let page = parseInt(req.query.page) || 1;

        const data = await Post.aggregate([ { $sort: { createdAt: -1 } }])
            .skip(perPage * (page-1))
            .limit(perPage);
            
        const count = await Post.countDocuments();
        const totalPages = Math.ceil(count/perPage);
    

        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.render('index', { 
            locals, 
            data,
            current: page,
            currentRoute: '/',
            nextPage: hasNextPage ? page + 1 : null,
            prevPage: hasPrevPage ? page - 1 : null
        });

    } catch (error) {
        console.log(error)
    }
});

/**
 * GET /
 * Post :id
*/
router.get('/post/:id', async (req, res) => {
    try {
        let slug = req.params.id;
        const data = await Post.findById({ _id: slug });

        const locals = {
            title: data.title,
            description: "Simple blog created with NodeJs, Express & MongoDb.",
        };

        res.render("post", {
            locals, 
            data,
            currentRoute: `/post/${slug}`
        })
    } catch (error) {
        console.log(error)
    }
})

/**
 * POST /
 * Post searchTerm
*/
router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: "Search",
            description: "Simple blog created with NodeJs, Express & MongoDb."
        };
        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");
        
        const data = await Post.find({ 
            $or: [
                {title: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
                {body: { $regex: new RegExp(searchNoSpecialChar, 'i') }}
            ]
         });

        res.render("search", {data, locals, currentRoute: '/search'})
    } catch (error) {
        console.log(error)
    }
})

router.get('/about', (req, res) => {
    res.render('about', {
        currentRoute: '/about'
    });
});

module.exports = router;
