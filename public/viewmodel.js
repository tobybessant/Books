// and here's the trick (works everywhere)
function r(f){/in/.test(document.readyState)?setTimeout('r('+f+')',9):f()}
// use like

r(function(){
    render_all();

    add_state_button = document.getElementById('add-state');
    add_state_button.addEventListener('click', switch_state);

    search_state_button = document.getElementById('search-state');
    search_state_button.addEventListener('click', switch_state);

    add = document.getElementById('add-button');
    add.addEventListener('click', add_book);

    search = document.getElementById('search-button');
    search.addEventListener('click', run_search);

    clear_search = search = document.getElementById('clear-button');
    clear_search.addEventListener('click', clear_search_results);

});

function set_error(status, message){
    error = document.getElementById('error');
    error.innerHTML = status + ": " +  message;
}

function clear_error(){
    error = document.getElementById('error');
    error.innerHTML = "";
}

function render_all(){
    var request = new XMLHttpRequest();
    request.open('GET', '/library', true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // success - parse resp data as map
        var data = JSON.parse(request.responseText);
        render(data, "keyvalue");
      } else {
        // reached server, but it returned an error
      }
    };

    request.onerror = function() {
      // There was a connection error of some sort
    };

    request.send();
}

function clear_search_results(){
    clear_error();
    render_all();
    document.getElementById('search').value = "";
}

function add_book(){
    title = document.getElementById('title').value;
    score = document.getElementById('score').value;

    var request = new XMLHttpRequest();
    params = '/' + title + '/' + score;
    request.open('GET', 'library/add' + params, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // inject success msg into label somewhere
        // success - re-render all books and reset form fields
        render_all();
        document.getElementById('title').value = "";
        document.getElementById('score').value = "";
      } else {
        // reached server, but it returned an error
      }
    };

    request.onerror = function() {
      // There was a connection error of some sort
    };

    request.send();

}

function switch_state(){
    var search_state = document.getElementById('search-books');
    var add_state = document.getElementById('add-books');

    search_state.classList.toggle('hidden');
    add_state.classList.toggle('hidden');
}

function run_search(){
    search_value = document.getElementById('search').value;

    // check if searching by score / title
    if(search_value == "" || search_value == null){
        console.log('Search reset');
        render_all();
    } else if(isNaN(search_value)){
        console.log('Title search initiated: ' + search_value);
        search_title(search_value);
    } else {
        console.log('Score search initiated: ' + search_value);
        search_score(search_value);
    }
}

function search_title(title){
    var request = new XMLHttpRequest();
    route = '/library/search/title/' + title;
    request.open('GET', route, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        var data = JSON.parse(request.responseText);
        if(data.status == "success"){
            var title = data.title;
            var score = data.score;

            results = {
                [title]: score
            };
            clear_error();
            render(results, "keyvalue");
        } else {
            set_error(data.status, data.message);
        }
      } else {
        // We reached our target server, but it returned an error
      }
    };

    request.onerror = function() {
      // There was a connection error of some sort
    };

    request.send();
}

function search_score(score){
    var request = new XMLHttpRequest();
    route = '/library/search/score/' + score;
    request.open('GET', route, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        var data = JSON.parse(request.responseText);
        if(data.status == "success"){
            clear_error();
            render(data.result, "list");
        }
      } else {
        // We reached our target server, but it returned an error
      }
    };

    request.onerror = function() {
      // There was a connection error of some sort
    };

    request.send();
}

function render(books, type){
    if(type == "keyvalue"){
        var html_injection = "";
        var keys = Object.keys(books);

        for(var i = 0; i < keys.length; i++){
            book = keys[i];
            score = books[book];

            html_injection += "<div id='" + i + "' class='book'><div class='book-title'><h3>" + book + "</h3><p class='remove-button'>Remove</p></div><p>" + score + "</p></div>";
        }
        document.getElementById('book-list').innerHTML = html_injection;
    } else if(type == "list"){
        var html_injection = "";

        for(var i = 0; i < books.length; i++){
            book = books[i];
            title = book.title;
            score = book.score;

            html_injection += "<div id='" + i + "' class='book'><div class='book-title'><h3>" + title + "</h3><p class='remove-button'>Remove</p></div><p>" + score + "</p></div>";
        }
        document.getElementById('book-list').innerHTML = html_injection;
    }
}
