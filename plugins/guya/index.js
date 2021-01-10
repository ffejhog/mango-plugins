var chapter;
var slug;
var currentPage;
var selectedGroup;

function listChapters(url) {
    var json = {};

    var urlMatch = /\/read\/manga\/([a-zA-Z0-9\-]+)/.exec(url);
	slug = urlMatch[1];

    var chapterApiUrl = 'https://guya.moe/api/series/'+ slug + '/';

	try {
		json = JSON.parse(mango.get(chapterApiUrl).body);
	} catch (e) {
		mango.raise('Failed to get JSON from ' + chapterApiUrl);
	}

	if (json.slug !== slug)
		mango.raise('JSON status: Slug did not match: ' + json.slug + ' : ' + slug);

    var chapters = [];
    


	Object.keys(json.chapters).forEach(function(id) {
        var groups = [];
        var obj = json.chapters[id];

        // Grab each of the group ids for the chapter
        Object.keys(obj['groups']).forEach(function(groupid) {
            groups.push(json.groups[groupid]); // Push the original group name(contained in the parent json) to the group array
        });
        
        groups = groups.join(', ');

        var time = new Date(obj['release_date']['1'] * 1000);
        
        var slimObj = {};
		slimObj['id'] = slug.replace(/-/g, '_') + "_" + id.replace('.', 'DOT'); 
		slimObj['volume'] = obj['volume'];
		slimObj['chapter'] = id;
		slimObj['title'] = obj['title'];
		slimObj['lang'] = 'en';
		slimObj['groups'] = groups;
		slimObj['time'] = time;
		chapters.push(slimObj);
	});

	return JSON.stringify({
		title: json.title,
		chapters: chapters
	});
}

function selectChapter(id) {
    var json = {};
    slug = id.substring(0,id.lastIndexOf('_')).replace(/_/g, '-');
    var chapterId = id.substring(id.lastIndexOf('_') + 1).replace('DOT', '.')
    var chapterApiUrl = 'https://guya.moe/api/series/'+ slug + '/';

    try {
		json = JSON.parse(mango.get(chapterApiUrl).body);
	} catch (e) {
		mango.raise('Failed to get JSON from ' + chapterApiUrl);
	}

	if (json.slug !== slug)
		mango.raise('JSON status: Slug did not match: ' + json.slug + ' : ' + slug);

	chapter = json.chapters[chapterId];


    currentPage = 0;

    // ---- This is manually selecting group priority for now. There is an array in the json called preferred_sort that would be better to use ----
    selectedGroup = Object.keys(chapter['groups'])[0]; 
    // ---------------------------

    maxPages = chapter['groups'][selectedGroup].length;
	var info = {
		title: chapter['title'].trim() || ('Ch.' + chapterId),
		pages: chapter['groups'][selectedGroup].length
	};
	return JSON.stringify(info);
}

function nextPage() {
	if (currentPage >= maxPages)
		return JSON.stringify({});

    var fn = chapter.groups[selectedGroup][currentPage];

    var folder = chapter['folder'];
	var info = {
		filename: fn,
		url: 'https://guya.moe/media/manga/'+ slug + '/chapters/' + folder + '/' + selectedGroup + '/' + fn
	};

	currentPage += 1;
	return JSON.stringify(info);
}
