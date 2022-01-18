
var posts = [];
var ready = false;

function see_more(feed) {
	try {
        var buttons = feed.querySelectorAll('[role="button"]');
        buttons.forEach(function(node) {
            if (node.innerText == 'See More') node.click();
        });
    }
    catch (e) {
        console.log("Failed in pressing the see more buttons");
    }
}

function get_time_from_str(time_str) {
    let m, d = new Date(), time = d.getTime();
    let cur_time = time;

    if ((m = time_str.match(/([0-9]+) hrs?/)) != null) {
        time = m[1] * 3600 * 1000;
    }
    else if ((m = time_str.match(/([0-9]+) mins?/)) != null) {
        time = m[1] * 60 * 1000;
    }
    else if ((m = time_str.match(/Yesterday at (.+)$/)) != null) {
        d.setDate(d.getDate() - 1);
        let month = d.getUTCMonth() + 1;
        let day = d.getUTCDate();
        let year = d.getUTCFullYear();

        time = cur_time - Date.parse(time_str.replace('Yesterday at', month + ' ' + day + ' ' + year));
    }
    else {
        time = cur_time - Date.parse(time_str.replace('at', '2018'));
    }

    if (isNaN(time))
        time = 3;

    return time;
}

function get_dom_tree_succesor(elem, ind_list) {
    let res = elem;
    let k = 0;

    for (const i of ind_list) {
        res = res.children[i];

        if (res == undefined)
            return res;
    }

	return res;
}

// Helper functionn to use from the browser to get the path to the different elements
function getpath(anc, suc) {
    let indices = [];
    do {
        let parent = suc.parentElement;
        let i  = Array.prototype.indexOf.call(parent.children, suc);
        indices.push(i);
        console.log(i);
        suc = parent;
    } while(suc.parentElement != anc);
    return indices.reverse();
}

PATH_TO_BASE_ELEM = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0];
PATH_FROM_BASE_TO_USERNAME = [ 1, 0, 1, 0, 0, 0, 0, 0 ];
PATH_FROM_BASE_TO_TIME = [ 1, 0, 1, 0, 1, 0, 0, 1];
PATH_FROM_BASE_TO_POST_ELEM = [ 2, 0, 0, 0, 0, 0, 0];
//PATH_FROM_POST_TO_TITLE = ;
//PATH_FROM_POST_TO_DATA = ;
//PATH_FROM_BASE_TO_URL = [];

function get_post_data(elem) {
    console.log(elem);
	elem = get_dom_tree_succesor(elem, PATH_TO_BASE_ELEM);
    if (elem == undefined)
        return undefined;
    console.log(elem);

    let post, title, username, time;
	let url = '';
    try {
        username = get_dom_tree_succesor(elem, PATH_FROM_BASE_TO_USERNAME);
        console.log("Got username ", username);

        console.log("Getting time");
        time = get_dom_tree_succesor(elem, PATH_FROM_BASE_TO_TIME);
        console.log(time);

        let time_link = time.querySelectorAll('[role="link"]')[0];
        time_link.focus();

        //console.log("Getting title");
        //title = get_dom_tree_succesor(post_title_elem, [0, 0, 0, 0]); 
        post = get_dom_tree_succesor(elem, PATH_FROM_BASE_TO_POST_ELEM); 
        console.log("Got post", post);

        url = time.querySelectorAll('[role="link"]')[0].href;
        console.log("Got url", url);
        //url = url.match(/(.*\/listing\/[0-9]+).*/)[1];
    }
    catch (e) {
    }
    if (post == undefined) {
    	post = document.createElement('p');
		username = document.createElement('p');
    }
    if (title == undefined) {
        title = document.createElement('p');
    }
	
	let time_delta;
	try {
		post = post.innerText;
		title = title.innerText;
		username = username.innerText;
        let time_str = time.innerText.replaceAll('-', '');
		time_delta = get_time_from_str(time_str);
		time = time_str;
	}
	catch(e) {
        console.log('returns undeinged');
		return undefined;
	}

    d = {content:post, title:title, username:username, url:url, time_delta:time_delta, time_str:time };
    console.log(d);
    return d;
}

function get_posts(all_posts, index) {
    let _posts = [];
    let i;
    for (i = index; i < all_posts.children.length-1; i++) {
        let elem = all_posts.children[i];
        //if (elem.id.includes("mall_post") == false)
        //    continue;
        let res = get_post_data(elem);
        if (res != undefined)
            _posts.push(res);
    }
    return {"index":i, "posts":_posts}
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function load_more_items() {
    window.scrollTo(0,document.body.scrollHeight);
}

async function jitter_scrolling() {
    window.scrollTo(0,0);
    await sleep(500);
    window.scrollTo(0,document.body.scrollHeight);
}

async function timer_func () {
    var feed = document.querySelectorAll('[role="feed"]')[0];
    var res;

    //load_more_items();
    //await sleep(2000);

	if (feed == undefined) {
		console.log('feed is undefined reinitiating timer');
		timer = setTimeout(timer_func, 15000);
		return;
	}

    console.log(feed);
    //res = get_posts(feed, 1); // posts in the feed element start from children 1
    //posts = posts.concat(res.posts);

    let cur_children_num = feed.children.length;
    while (cur_children_num < 50) {
        cur_children_num = feed.children.length;
        load_more_items();
        let count = 0;
        while (feed.children.length-1 <= cur_children_num) {
            await sleep(1000);
            count += 1;
            if (count == 10) {
                count = 0;
                jitter_scrolling();
            }
        }
    }
    await sleep(3000);
    see_more(feed);
    await sleep(1000);

    res = get_posts(feed, 1);
    console.log(res);
    posts = posts.concat(res.posts);

    console.log('done');

    ready = true;
	chrome.runtime.sendMessage({from:'content', type:'tab_ready'});
}

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    if (msg.from == 'bg') {
        if (msg.subject == 'get_posts') {
            console.log(sender);
            console.log(ready);
            if (!ready) {
                response({data:undefined});
            }
            else {
                console.log(posts);
                response({data:posts});
            }
        }
    }
});

var extension_url = window.location.toString();

var timer = setTimeout(timer_func, 15000);

