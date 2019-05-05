// reqiure packages
var express = require('express');
var bodyparser = require('body-parser');
var fs = require('fs');

// retrieve library data store
var data = fs.readFileSync('library.json');
var library = JSON.parse(data);
console.log('data retrieved. . .');

// create and start express server
var app = express();
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
var server = app.listen(3000, () => console.log('listening. . . '));

// host public contents
app.use(express.static('public'));

// define get request routes
app.get('/library', fetchAll);
app.get('/library/search/title?', searchTitle);
app.get('/library/search/score/:score?', searchScore);

// define post route to add books
app.post('/library/add', addBook);

// define delete route to delete books
app.delete('/library/delete', deleteBook);

// fetch all books
function fetchAll(request, response){
    response.send(library);
}

// search using title
function searchTitle(request, response){
    // get search query
    var query = request.param('query');

    if(!query){
        var result = {
            status:"failure",
            message: "Invalid or null search parameter",
            query: query
        }
    } else {
        // if existing then setup success response
        result = {
            status: "success",
            query: query,
            books: []
        };

        // perform search
        for(var i = 0; i < library.books.length; i++){
            title = library.books[i].title.toLowerCase();
            matching = title.includes(query);
            if(matching){
                result.books.push(library.books[i]);
            }
        }
    }

    // send response to client
    response.send(result);
}

// search using score
function searchScore(request, response){
    // get search query
    var search_score = request.params.score;
    if(!search_score){
        var result = {
            status:"failure",
            message: "Invalid or null search parameter"
        }
    } else {
        // if valid then search data
        var result = {
            status:"success",
            score: search_score,
            result:[]
        }
        books = Object.keys(library);
        for(var i = 0; i < books.length; i++){
            if(library[books[i]] == search_score){
                book = {
                    "title":books[i],
                    "score": library[books[i]]
                }
                result.result.push(book);
            }
        }
    }
    response.send(result);
}

//add book
function addBook(request, response){
    console.log('addbook route');
    // parse paramters
    title = request.param('title');
    author = request.param('author');
    score = request.param('score') ? Number(request.param('score')) : null;

    if(title && author){
        // fetch and update id index
        var id = ++library.id_index;
        id = id.toString();

        // construct new book
        let new_book = {
            "id": id.toString(),
            "title": title,
            "author": author,
            "score": score
        };

        // add book to library
        library.books.push(new_book);

        // stringify to access writefile stream
        var data = JSON.stringify(library);
        fs.writeFile('library.json', data, function(){
            console.log('Book added with ID:' + id);

            // create return success result
            var result = {
                status:"success",
                message: "Book added",
                title: title,
                score: score,
                id: id
            }

            // return result to client
            response.send(result);
        });
    } else {
        var result = {
            status:"failure",
            message: "Invalid or null parameter"
        }
        response.send(result);
    }
}

function deleteBook(request, response){
    var id=$(this).attr('id');

    // locate and delete book

}
