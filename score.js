
words_scoring = {
    "@דרום העיר": 10,
    "@שוק הפשפשים": 10,
    "@יפו": 10,
    "@שפירא": 10,
    "@פלורנטין": 10,
    "@לוינסקי": 10,
	"@כרם התימנים": 10,
	"~כרם": 10,
    "~צפון הישן": -25,
    "~צפון השקט": -25,
    "@רמת אביב": -25,
    "@צפון העיר": -25,
    "@כיכר המדינה": -25,
    "@עזריאלי": -25,
    "@בבלי": -25,
    "@בזל": -25,
    "@באזל": -25,
    "@פארק הירקון": -25,
    "~אוניברסיטה": -25,
    "משה שרת": -25,
    "שותף": -15,
    "שותפה": -10,
    "שותפות": -20,
    "שותפים": -10,
    "סאבלט": -40,
    "סבלט": -40,
    "מסבלט": -40,
    "מסבלטת": -40,
    "@ז'בוטינסקי": -20,
    "@ארלוזרוב": -2,
    "@דיזינגוף": 4,
    "@בארי": -20,
/*    "מחפש": -3,
    "מחפשת": -3,
    "מחפשים": -3,
    "שמחפשים": -3,*/
	"מחפשים שותפ ה": -40,
	"מחפשים שותף ה": -40,
	"מחפשים שותף": -40,
	"מחפשים שותפה": -40,
	"מחפשים 2 שותפים": -40,
	"מחפשים שני שותפים": -40,
	"דרוש שותף": -40,
	"דרוש שותפ ה": -40,
	"דרושה שותפה": -40,
    "דרוש מחליף": -40,
    "מחליפה": -40,
    "סטודיו": -40,
    "גלריה": -40,
    "דירת גג": 10,
    "מרפסת": 10,
 "מרפסת": 15,
    "חצר": 10,
    "חדר בדירת *": -25,
    "חדר בדירה": -25,
	"חדר להשכרה": -25,
    "מתפנה חדר": -25,
    "מפנים את הדירה": 10,
    "מפנים דירה": 10,
    "מפנים דירת": 10,
    "דירת יחיד": -50,
    "@בן גוריון": 2,
   "3 חדרים": -50,
    "שלושה חדרים": -50,
    "שלוש חדרים": -50,
    "3 חד'": -50,
    "3 חד": -50,
    "2 חדרים": -50,
    "שני חדרים": -50,
    "2 חד'":  -50,	
    "2 חד":  -50,
    "4 חדרים": 50,
    "ארבעה חדרים": 50,
    "ארבע חדרים": 50,
    "4 חד'": 50,
    "5 חדרים": 50,
    "חמישה חדרים": 50,
    "חמש חדרים": 50,
    "5 חד'": 50,
    "5 חד": 50,
    "6 חדרים": 50,
    "שישה חדרים": 50,
    "שש חדרים": 50,
    "6 חד'": 50,
    "6 חד": 50,
    "@שוק הכרמל": 5,
    "@רוטשילד": 7,
	"@שינקין": 7,
    "@נווה צדק": 5,
    "דירה להחלפה": -20,
    "@כיכר רבין": 4,
    "@כיכר הבימה": 8,
    "~סנטר": 8,
    "מתאימה ליחיד": -30,
    "מתאימה ליחיד או לזוג": -30,
	"מתאימה לזוג": -30,
	"מתאימה לזוג או ליחיד": -30,
    "לבנות בלבד": -35,
/*    "לא מתיווך": 5,
    "ללא תיווך": 5,*/
	"לא מתיווך": 15,
	"ללא תיווך": 15,
	"תיווך חלקי": 30,
	"להשכרה לא מתיווך": 30,
	"תיווך": -30,
	"מודעה מתיווך": -30,
	"דירה להשכרה": 20,
	"להשכרה דירה": 20,
	"מתפנה דירת שותפים": 20,
	"מחפשים מחליפים": 20,
	"מתפנה דירה": 10,
    "@תיווך": 10,
    "@גבעתיים": -25,
    "@נמל יפו": 10,
    "~נמל": -35
};

var _keys = Object.keys(words_scoring);
var scoring_dict = {};
for (let ki = 0; ki < _keys.length; ki++) {
	let k = _keys[ki];
    let cur_p = undefined;
    
    let f = (keys, s, score) => {
    	keys.push(s);
    	words_scoring[s] = score;
    }
    
    if (k[0] == '@') {
        let score = words_scoring[k];
    	f(_keys, 'מ' + k.substring(1), score);
    	f(_keys, 'ב' + k.substring(1), score);
    	f(_keys, 'ו' + k.substring(1), score);
    	f(_keys, 'ומ' + k.substring(1), score);
    	f(_keys, 'ל' + k.substring(1), score);
    	k = k.substring(1);
        words_scoring[k] = score;
    }
    
    if (k[0] == '~') {
        let score = words_scoring[k];
    	f(_keys, 'מה' + k.substring(1), score);
    	f(_keys, 'ב' + k.substring(1), score);
    	f(_keys, 'וה' + k.substring(1), score);
    	f(_keys, 'ומה' + k.substring(1), score);
    	f(_keys, 'ל' + k.substring(1), score);
    	k = k.substring(1);
        words_scoring[k] = score;
    }
    
    let ws = k.split(" ");
    
    for(let i = 0; i < ws.length; i++) {
        let cur = cur_p;
        let w = ws[i];
        if (!cur_p) cur = scoring_dict;
        if (!cur[w]) cur[w] = {p:cur};
        if (i == ws.length - 1) {
            cur[w].score = words_scoring[k];
            cur[w].already_used = false;
        }
        cur_p = cur[w];
    }
}
console.log(scoring_dict);
console.log('ahhhhh');

function score_words(words, cur_word_i, scoring_seq) {
	var w = words[cur_word_i];
	var sq = scoring_seq[w];
	var res;

	if (w == undefined)
		return undefined;

	if (sq == undefined)
		sq = scoring_seq['*'];
		if (sq == undefined)	
			return undefined;

	res = score_words(words, cur_word_i+1, sq);
	if (res == undefined && !sq.already_used) {
		res = { score: sq.score ? sq.score : 0, len: 0 };
        sq.already_used = true;
    }
    else if (sq.already_used)
        return undefined;
	else
		res.len++;

	return res;
}

function copy_scoring_dict(sq)  {
    let d = {};
    Object.keys(sq).forEach(k => {
        if (k != 'p' && typeof(sq[k]) == 'object') {
            d[k] = copy_scoring_dict(sq[k]);
        }
        else
        	d[k] = sq[k];
    });
    return d;
}

function score_text(text, temp_dict) {
    let score = 0;

    //text = text.replace(/,|\\.|\\(|\\)|!|?|\\/|\n|-|\\+/g, "");
    text = text.replace(/,/g, " ");
    text = text.replace(/\./g, " ");
    text = text.replace(/\(/g, " ");
    text = text.replace(/\)/g, " ");
    text = text.replace(/!/g, " ");
    text = text.replace(/\?/g, " ");
    text = text.replace(/\//g, " ");
    text = text.replace(/\n/g, " ");
    text = text.replace(/-/g, " ");
    text = text.replace(/\+/g, " ");
    text = text.replace(/\*/g, " ");

    text = text.replace(/ +/g, " ");
    let words = text.split(" ");
	// need to filter here empty strings
    words.push("dummydummydummy");

    var cur_e = undefined;
    for (let i = 0; i < words.length; i++) {
        /*let w = words[i];
        let go_back = 0;
        console.log(w);
        let entry;
        if (cur_e) entry = cur_e;
        else entry = scoring_dict;			
        console.log(entry);

        // This here needs to be solved. It causes problem with giving the right scoring when a phrase is aborted.
        if (!entry) {
            if (cur_e && cur_e.score)
                score += cur_e.score;
            // Added while drunk need to reconsider 
            else if (cur_e) {
                while (cur_e.p) {
                    cur_e = cur_e.p;
                    if (cur_e && cur_e.score) {
                        score += cur_e.score;
                        break;
                    }
                    else {
                        go_back++;
                    }
                }
                i -= go_back;
                //w = words[i];
                continue;
            }
            // ====================================
            cur_e = undefined;
            entry = scoring_dict[w];
            if (!entry)
                continue;
        }
        let keys = Object.keys(entry);
        if (keys.length == 1 && keys[0] == "score") {
            score += entry.score;
            cur_e = undefined;
        }
        else {
            cur_e = entry;
        }*/
		let res = score_words(words, i, temp_dict);
		if (res != undefined) {
			score += res.score;
			i += res.len;
		}
    }
    return score;
}

function score_post(post) {
	let total = 0;
	
    let temp_dict = copy_scoring_dict(scoring_dict);
    total += score_text(post.title, temp_dict);
    total += score_text(post.content, temp_dict);

    let normalized_time = (post.time_delta) / (24 * 3600 * 1000);
    total *= Math.pow(Math.E, -0.5 * normalized_time);
    total = Math.round(total);
    
    console.log(post);
    console.log(total);
    
    return total;
}
