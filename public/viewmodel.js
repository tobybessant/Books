// jquery-less html onready event
function r(f){/in/.test(document.readyState)?setTimeout('r('+f+')',9):f()}
r(function(){
    // render all saved books on load of page
    render_all();

    // initialise all button event listeners
    add_state_button = document.getElementById('add-state');
    add_state_button.addEventListener('click', switch_state);

    search_state_button = document.getElementById('search-state');
    search_state_button.addEventListener('click', switch_state);

    add = document.getElementById('add-button');
    add.addEventListener('click', add_book);

    search = document.getElementById('search');
    search.addEventListener('keyup', run_search);

    clear_search = search = document.getElementById('clear-button');
    clear_search.addEventListener('click', clear_search_results);

});

// helper function to set the error message should one be return
function set_error(status, message){
    // fetch and inject html
    error = document.getElementById('error');
    error.innerHTML = status + ": " +  message;
}

// helper function to wipe error message if it is no longer needed
function clear_error(){
    // fetch and inject html
    error = document.getElementById('error');
    error.innerHTML = "";
}

// function to fetch every book in the library
function render_all(){
    // set up new request with route
    var request = new XMLHttpRequest();
    request.open('GET', '/library', true);

    // setup callback to process request
    request.onload = function() {
        // check successful request
        if (request.status >= 200 && request.status < 400) {
            // parse data as json and render to view
            var data = JSON.parse(request.responseText);
            render(data.books);
        } else {
            // reached server, but it returned an error
            set_error("failure", "Internal servor error.");
        }
    };

    // setup callback to process connection error
    request.onerror = function() {
        set_error("failure", "Failed to connect to data store.");
    };

    // send request to route
    request.send();
}

// function to reset search components
function clear_search_results(){
    // clear errors
    clear_error();
    // re-fetch all books
    render_all();
    // clear search field
    document.getElementById('search').value = "";
}

// function to add book to the data store
function add_book(){
    // fetch input values
    title = document.getElementById('title').value;
    score = document.getElementById('score').value;

    // setup new data object to post
    new_book = {
        "title": title,
        "author": "testing placeholder",
        "score": score
    };

    $.post("library/add", new_book, function( data ) {
        render_all();
    });
}

// function to manage the switching of input state
function switch_state(){
    // fetch state components
    var search_state = document.getElementById('search-books');
    var add_state = document.getElementById('add-books');

    // toggle hidden class to show/hide components respectively
    search_state.classList.toggle('hidden');
    add_state.classList.toggle('hidden');
}

// function to run the search and determnine search type
function run_search(){
    // fetch search value
    search_value = document.getElementById('search').value;

    // check if searching by score / title or if search is empty
    if(search_value == "" || search_value == null){
        // if empty then fetch all books
        render_all();
    } else if(isNaN(search_value)){
        // if search is not a number then search by title
        search_title(search_value);
    } else {
        // if search is a number then search by score
        search_score(search_value);
    }
}

function search_title(query){
    if(query){
        route = '/library/search/title/';
        params = {
            "query": query
        };

        $.get(route, params, function(data){
            render(data.books);
        });
    }
}

// make search by score request
function search_score(score){
    // set up request to specified search route using input parameter
    var request = new XMLHttpRequest();
    route = '/library/search/score/' + score;
    request.open('GET', route, true);

    // setup request callback
    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            // successful response will parse the response
            var data = JSON.parse(request.responseText);
            // check for error in the response
            if(data.status == "success"){
                // clear any pre-existing errors
                clear_error();
                // render results
                render(data.result);
            }
        } else {
            // throw internal server error
            set_error("failure", "Internal servor error.");
        }
    };

    request.onerror = function() {
        // throw connection error
        set_error("failure", "Failed to connect to data store.");
    };

    request.send();
}

// function to render books to view
// NOTE: currently this function takes a parameter 'type' to identify what format
// the response should be rendered. This is due to an inconsistency in return
// format of the search functions.
function render(books){
    // initialise injection string
    var html_injection = "";

    // iterate books json list and extract the properties
    for(var i = 0; i < books.length; i++){
        book = books[i];
        id = book.id;
        title = book.title;
        score = book.score;

        // build injection string
        html_injection += "<div class='book'><div class='book-title'><h3>" + title + "</h3><p id='" + id + "' class='remove-button'>Remove</p></div><p>" + score + "</p></div>";
    }
    // post injection string to the books list view
    document.getElementById('book-list').innerHTML = html_injection;
}
