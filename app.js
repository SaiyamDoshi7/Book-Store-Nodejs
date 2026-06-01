const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 8080;

const Book = require('./models/BookModel');

app.set('view engine','ejs');

app.use(express.urlencoded());

app.use('/uploads',express.static(path.join(__dirname,'uploads')));
app.use('/assets',express.static(path.join(__dirname,'assets')));

mongoose.connect('mongodb://127.0.0.1:27017/bookDB')

.then(()=>{
    console.log("MongoDB Connected");
})

.catch((err)=>{
    console.log(err);
});

const storage = multer.diskStorage({

    destination : (req,file,cb)=>{
        cb(null,'uploads');
    },

    filename : (req,file,cb)=>{
        cb(null,Date.now() + file.originalname);
    }

});

const upload = multer({storage : storage});

app.get('/',async(req,res)=>{

    const books = await Book.find({});

    return res.render('index',{
        books
    });

});

app.get('/addBook',(req,res)=>{

    return res.render('add');

});

app.post('/insertBook',upload.single('image'),async(req,res)=>{

    const {title,author,category,price,quantity,description} = req.body;

    await Book.create({

        title,
        author,
        category,
        price,
        quantity,
        description,
        image : req.file.path

    });

    return res.redirect('/');

});

app.get('/singleBook/:id',async(req,res)=>{

    let single = await Book.findById(req.params.id);

    return res.render('view',{
        single
    });

});

app.get('/deleteBook/:id',async(req,res)=>{

    let single = await Book.findById(req.params.id);

    fs.unlinkSync(single.image);

    await Book.findByIdAndDelete(req.params.id);

    return res.redirect('/');

});

app.get('/editBook/:id',async(req,res)=>{

    let single = await Book.findById(req.params.id);

    return res.render('edit',{
        single
    });

});

app.get('/viewBook',async(req,res)=>{

    const books = await Book.find({});

    return res.render('viewBook',{
        books
    });

});

app.post('/updateBook',upload.single('image'),async(req,res)=>{

    const {editId,title,author,category,price,quantity,description,oldImage} = req.body;

    let imagePath = oldImage;

    if(req.file){

        fs.unlinkSync(oldImage);

        imagePath = req.file.path;
    }

    await Book.findByIdAndUpdate(editId,{

        title,
        author,
        category,
        price,
        quantity,
        description,
        image : imagePath

    });

    return res.redirect('/');

});

app.listen(port,(err)=>{

    if(err){
        console.log(err);
        return false;
    }
    else{
        console.log("Server Starting On 8080")
        console.log("")
    }
});