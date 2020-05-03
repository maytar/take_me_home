var scores = [];
var scoring_state = 0;

function handle_posts(posts) {
	for (let i = 0; i < posts.length; i++) {
		let post = posts[i];
		let score = score_post(post);

        if (post.content == '' && post.title == '')
            continue;

        let dup = false;
        for (let j = 0; j < scores.length; j++) {
            let post2 = scores[j].post;

            if (post.title == post2.title && post.content == post2.content) {
                dup = true;
                break;
            }
        }
        if (dup)
            continue;

        scores.push( { post: post, score: score } );
	}
}

var my_tabs = [];
//var awaiting_tabs = [];
var current_tab_i = 0;

/*function get_posts_from_tabs(tabs) {
    var temp_tabs = tabs.slice();
    if (tabs != my_tabs) while (tabs.length > 0) tabs.pop();

    for (let i = 0; i < temp_tabs.length; i++)
        chrome.tabs.sendMessage(temp_tabs[i].id, {from:'popup', subject:'get_posts'}, function(res) {
            if (res == undefined)
                    return;

            console.log(res);
            console.log(this.tab);
            if (res.data) {
                handle_posts(res.data);
                //do_render(); 
            }
            else {
                awaiting_tabs.push(this.tab);
                if (awaiting_tabs.length == 1)
                    setTimeout( () => { get_posts_from_tabs(awaiting_tabs); }, 2000 );
                console.log(awaiting_tabs);
            }
        }.bind( {tab:temp_tabs[i]} ));
}*/

function get_posts_from_tabs(tabs) {

}

var init_scoring_first_tab = true;
function init_scoring(response) {
    var links = ["https://www.facebook.com/groups/423017647874807/", "https://www.facebook.com/groups/101875683484689/", "https://www.facebook.com/groups/665278950172707/", "https://www.facebook.com/groups/1427929940815001/", "https://www.facebook.com/groups/telavivroommates/", "https://www.facebook.com/groups/718718724880874/", "https://www.facebook.com/groups/665278950172707/", "https://www.facebook.com/groups/1785602401768304/", "https://www.facebook.com/groups/jaffarent/", "https://www.facebook.com/groups/1940191366228982/"];
    //var links = ["https://www.facebook.com/groups/423017647874807/"];
    
    scoring_state = 1;

    if (my_tabs.length != 0) {
        console.log('removing tabs');
        for (let i = 0; i < my_tabs.length; i++)
            chrome.tabs.remove(my_tabs[i].id);
        my_tabs = [];
        scores = [];
        //do_render();
    }

    links.forEach(link => {
        chrome.tabs.create( {url: link, active: false}, tab => {
            console.log(my_tabs);
            my_tabs.push({tab:tab, ready:false});
            if (init_scoring_first_tab) {
                chrome.tabs.update(my_tabs[0].tab.id, {active:true}, function(tab){ });
                init_scoring_first_tab = false;
            }
        } );
    });

    //setTimeout(() => { get_posts_from_tabs(my_tabs); }, 25000);

    // go to first tab and wait for a ready message and that go to the next one
}

function get_state(response) {
    response( { state: scoring_state });
}

function close_tabs(response) {
    console.log('closing tabs');
    /*for (let i = 0; i < my_tabs.length; i++)
        chrome.tabs.remove(my_tabs[i].tab.id);*/
    my_tabs = [];
    scores = [];
    scoring_state = 0;
    //do_render();
}

function send_scores(response) {
    // the popup ask for scores and we should send them back so it will be able to render them
    response( { scores:scores });
}

function tab_ready(tabId, response) {
    // called when tab is ready, should then go to the next tab
    console.log('tab_ready');
    chrome.tabs.sendMessage(tabId, {from:'bg', subject:'get_posts'}, function(res) {
        if (res == undefined) {
            console.log('content script not ready yet.');
            return;
        }

        console.log(res);
        console.log(this.tab);
        if (res.data) {
            handle_posts(res.data);
            scoring_state = 2;
            //do_render(); 
        }
        else {
            response('unknown');
        }
    });

    console.log(my_tabs[current_tab_i]);
    console.log(my_tabs);
    chrome.tabs.remove(my_tabs[current_tab_i].tab.id);
    if (current_tab_i + 1 != my_tabs.length)
        chrome.tabs.update(my_tabs[++current_tab_i].tab.id, {active:true}, function(tab){ });
}

chrome.runtime.onMessage.addListener((msg, sender, response) => {
    if (msg.from == 'popup') {
        if (msg.type == 'init')
            init_scoring(response);
        else if (msg.type == 'close')
            close_tabs(response);
        else if (msg.type == 'get_scores')
            send_scores(response);
        else if (msg.type == 'get_state')
            get_state(response);
        else
            response('unknown');
    }
    else if (msg.from == 'content') {
        if (msg.type == 'tab_ready')
            tab_ready(sender.tab.id, response);
        else
            response('unknown');
    }
    else
        response('unknown');
});
