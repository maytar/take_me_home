function hover() {
    var content = $(this).find(".content").eq(0);
    var title = $(this).find(".title").eq(0);
    
    $(this).data('_opened', true);
    content.text($(this).data('_data').post.content);
    title.text($(this).data('_data').post.title);
}

function unhover() {
    var content = $(this).find(".content").eq(0);
    var title = $(this).find(".title").eq(0);

    $(this).data('_opened', false);
    content.text($(this).data('_data').post.content.slice(0,20) + '...');
    title.text($(this).data('_data').post.title.slice(0,20) + '...');
}

function do_render(scores)
{
    $('#posts').html('');

    if (scores.length == 0)
        return;
    
    scores.sort( (a,b) => {
        return b.score - a.score;
    });

	for (let i = 0; i < scores.length; i++) {
        let post = scores[i].post;
        let score = scores[i].score;

        let p = $("<p></p>");
        let a = $("<a></a>");

        //a.click(post_click);
		a.attr("href", post.url);
		a.click( function() {
			chrome.tabs.create({url: $(this).attr('href'), active:false});
		    return false;
		});
		a.hover( hover, unhover );
        a.data('_opened', false);
        a.data('_data', scores[i]);
		a.css('textDecoration', 'none');

        a.html('<span class="score"><b>' + score + ': </b></span><u><span class="title">' + post.title.slice(0, 20) + '...</span></u>  ' + post.time_str
            + '<br><span class="content">' + post.content.slice(0, 20) + '</span>');
        p.append(a);

		$('#posts').append(p);
    }
}

document.addEventListener("DOMContentLoaded", function() { 
    $('#click').click(e => {
        chrome.runtime.sendMessage({from:'popup', type:'init'});
        window.close();
    });

    $('#close').click(e => {
        chrome.runtime.sendMessage({from:'popup', type:'close'});
    });

    chrome.runtime.sendMessage({from:'popup', type:'get_state'}, (res) => {
        if (!res) return;

        if (res.state == 1) {
            $('#click').attr("disabled", true);
            $('#posts').text('Still loading..');
        }

        else if (res.state == 2) {
            $('#click').attr("disabled", true);
            chrome.runtime.sendMessage({from:'popup', type:'get_scores'}, (res) => {
                do_render(res.scores);
            });
        }
    });
});
