
var posts = [];
var ready = false;

function see_more(post) {
	try {
        var see_more = post.querySelectorAll('[role="button"]')[0];
        see_more.click();
    }
    catch (e) {
    	return;
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
	for (const i of ind_list)
		elem = elem.children[i];
	return elem;
}

function get_post_data(elem) {
	elem = get_dom_tree_succesor(elem, [0, 0, 0, 0, 0, 0, 0, 1]);
    let post, title, username, time;
	let url = '';
    for (let i = 1; i <= 3; i++) {
        try {
            username = get_dom_tree_succesor(elem, [i, 0, 1, 0, 0, 0]);

            time = get_dom_tree_succesor(elem, [i, 0, 1, 0, 1, 0, 1]);
            console.log(time);

            let post_title_elem = get_dom_tree_succesor(elem, [i+1, 0, 0, 0, 0]); 
            title = get_dom_tree_succesor(post_title_elem, [0, 0, 0, 0]); 
            post = get_dom_tree_succesor(post_title_elem, [1]); 

            try {
                url = get_dom_tree_succesor(elem, [i+1, 0, 2]).querySelectorAll('[role="link"]')[0].href;
                url = url.match(/(.*\/listing\/[0-9]+).*/)[1];
            }
            catch (e) {
                continue;
            }
            break;
        }
        catch (e) {
            continue;
        }
    }
    if (post == undefined) {
    	post = document.createElement('p');
		username = document.createElement('p');
    }
    if (title == undefined) {
        title = document.createElement('p');
    }
    see_more(post);
	
	let time_delta;
	try {
		post = post.innerText;
		title = title.innerText;
		username = username.innerText;
		time_delta = get_time_from_str(time.innerText);
		time = time.innerText;
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

async function timer_func () {
    var feed = document.querySelectorAll('[role="feed"]')[0];
    var res;

	if (feed == undefined) {
		console.log('feed is undefined reinitiating timer');
		timer = setTimeout(timer_func, 15000);
		return;
	}

    res = get_posts(feed, 1); // posts in the feed element start from children 1
    posts = posts.concat(res.posts);

	console.log(res);
    while (res.index < 100) {
        load_more_items();
        while (feed.children.length-1 == res.index)
            await sleep(1000);

        res = get_posts(feed, res.index);
		console.log(res);
        posts = posts.concat(res.posts);
    }

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

