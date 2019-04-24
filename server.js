// reqiure packages
var express = require('express');
var fs = require('fs');

// retrieve library data
var data = fs.readFileSync('library.json');
var library = JSON.parse(data);
console.log('data retrieved. . .');

// create and start server
var app = express();
var server = app.listen(3000, () => console.log('listening. . . '));

// host splashpage
app.use(express.static('public'));

// define get request routes
app.get('/library', fetchAll);
app.get('/library/search/title/:title?', searchTitle);
app.get('/library/search/score/:score?', searchScore);
app.get('/library/add/:title/:score?', addBook);

// -- REQUEST FUNCTIONS -- //
// all books
function fetchAll(request, response){
    response.send(library);
}

// search using title
function searchTitle(request, response){
    // get search query
    var title = request.params.title;
    if(!title){
        var result = {
            status:"failure",
            message: "Invalid or null search parameter",
            title: title,
            score: library[title]
        }
    } else {
        // if existing then return data
        if(library[title]){
            var result = {
                status:"success",
                title: title,
                score: library[title]
            }
        } else {
            // if title does not exist return not found
            var result = {
                status:"failure",
                message :"Book does not exist in the library.",
                title: title
            }
        }
    }
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
    // parse paramters
    title = request.params.title;
    score = request.params.score ? Number(request.params.score) : null;

    // if valid input received add book
    if(title && score){
        if(!library[title]){
            // book does not exist, add
            library[title] = score;
            var data = JSON.stringify(library);
            fs.writeFile('library.json', data, function(){
                console.log('Add operation complete.');

                // create result
                var result = {
                    status:"success",
                    message: "Book added",
                    title: title,
                    score: score
                }

                response.send(result);
            });
        } else {
            // book exists, update score
            library[title] = score;
            var data = JSON.stringify(library, null, 2);
            fs.writeFile('library.json', data, function() {

                console.log('Update operation complete.')

                // create result
                var result = {
                    status:"success",
                    message: "Book score updated",
                    title: title,
                    new_score: score
                }

                response.send(result);});
        }
    } else {
        var result = {
            status:"failure",
            message: "Invalid or null parameter"
        }
        response.send(result);
    }
}
