window.onload = function() {
	MyBlog.select(1);
	PRouter.route('/posts', function() {
		MyBlog.hidePage();
		MyBlog.select(1);
	}, 'show');
	PRouter.route('/posts/', function() {
		MyBlog.hidePage();
		MyBlog.select(1);
	}, 'show');
	PRouter.route('/project', function() {
		MyBlog.hidePage();
		MyBlog.select(2);
	})
	PRouter.route('/project/', function() {
		MyBlog.hidePage();
		MyBlog.select(2);
	})
	PRouter.route('/featured_posts', function() {
		MyBlog.hidePage();
		MyBlog.select(3);
	})
	PRouter.route('/featured_posts/', function() {
		MyBlog.hidePage();
		MyBlog.select(3);
	})
	PRouter.route('/about', function() {
		MyBlog.hidePage();
		MyBlog.select(4);
	})
	PRouter.route('/about/', function() {
		MyBlog.hidePage();
		MyBlog.select(4);
	})
	PRouter.queryRoute('pid', function(value){
		MyBlog.showPage(value);
	});
	PRouter.queryRoute('cat', function(value) {
		value = decodeURI(value);
		MyBlog.closePage();
		MyBlog.sortWithKV('cat', value);
	});
	PRouter.queryRoute('tag', function(value) {
		value = decodeURI(value);
		MyBlog.closePage();
		MyBlog.sortWithKV('tag', value);
	});
	PRouter.queryRoute('date', function(value) {
		value = decodeURI(value);
		MyBlog.closePage();
		MyBlog.sortWithKV('date', value);
	});
	MyBlog.addListener4Click();
	MyBlog.loadList(function() {
		PRouter.start();
	});
	$('.page').scroll(function() {
		if ($(this).scrollTop() > 200) {
			$('.go-top').fadeIn(200);
		} else {
			$('.go-top').fadeOut(200);
		}
	});
	$('.go-top').click(function(event) {
		event.preventDefault();
		if (location.pathname.split('/').length > 2) {
			$('#showPage').animate({
				scrollTop: 0
			}, 600);
		} else $('#page' + MyBlog.selected).animate({
			scrollTop: 0
		}, 600);
	});
};

function _(id) {
	return document.getElementById(id);
}
window.MyBlog = {
	BlogName: 'I\'m Sun - 孙士权的个人博客',
	staticHost: 'http://imsum.sinaapp.com/',
	pCount: 0,
	pList: {},
	sortCount: {
		cat: {},
		tag: {},
		date: {}
	},
	selected: '',
	addListener4Click: function() {
		PRouter.bindForTag();
		MyBlog._bind4Click('.close', function() {
			MyBlog.closePage('back');
		});
		MyBlog._bind4Click('.cat-label', function() {
			PRouter.push('?cat=' + this.innerHTML);
		});
		MyBlog._bind4Click('.tag-label', function() {
			PRouter.push('?tag=' + this.innerHTML);
		});
		MyBlog._bind4Click('.date-label', function() {
			PRouter.push('?date=' + this.innerHTML.substring(0, 7));
		});
		MyBlog._bind4Click('.all-p-btn', function() {
			MyBlog._listAllP();
		});
	},
	select: function(count) {
		var n = count || 1;
		_('container').style.left = 100 * (1 - n) + '%';
		if (MyBlog.selected) {
			_('page' + MyBlog.selected).style.overflowY = 'hidden';
			_('tab' + MyBlog.selected).className = 'tab';
			setTimeout(function() {
				_('page' + n).style.overflowY = 'auto';
			}, 500);
		} else {
			_('page' + n).style.overflowY = 'auto';
			setTimeout(function() {
				_('container').className += ' animation';
			}, 1);
		}

		_('tab' + n).className += ' selected';
		MyBlog.selected = n;
	},
	loadList: function(callback) {
		_('indexList').innerHTML = '列表加载中...';
		// _('featuredList').innerHTML = '列表加载中...';
		if (window.pList) {
			MyBlog.pList = pList;
			MyBlog.initWithContent();
			if (callback) callback();
		} else {
			$.getJSON(MyBlog.staticHost + 'p.php', function(data) {
				MyBlog.pList = data;
				MyBlog.initWithContent();
				if (callback) callback();
			});
		}
		$('#projectList').load('/project.html');
		$('#featuredList').load('/featured.html');
		$('#aboutMe').load('/about-me.html');
	},
	initWithContent: function() {
		_('indexList').innerHTML = '';
		// _('featuredList').innerHTML = '';
		for (var item in MyBlog.pList) {
			var cat = MyBlog._generateLabel(MyBlog.pList[item].cat, 'cat', 'init'); // true for count
			var tag = MyBlog._generateLabel(MyBlog.pList[item].tag, 'tag', 'init');
			var inner = MyBlog._generateSummary(item);
			_('indexList').innerHTML += inner;
			MyBlog.pCount++;

			if (!MyBlog.sortCount['date'][MyBlog.pList[item].date.substring(0, 7)]) MyBlog.sortCount['date'][MyBlog.pList[item].date.substring(0, 7)] = 0;
			MyBlog.sortCount['date'][MyBlog.pList[item].date.substring(0, 7)]++;
		};
		_('pCountInfo').innerHTML = '<b><a class="all-p-btn">全部文章</a></b>(' + MyBlog.pCount + ')';
		_('catInfo').innerHTML = MyBlog._generateLabelInfo('cat');
		_('tagInfo').innerHTML = MyBlog._generateLabelInfo('tag');
		_('listKey').innerHTML = '全部文章：';
		MyBlog.addListener4Click();
	},
	_listAllP: function() {
		_('indexList').innerHTML = '';
		PRouter.push('?');
		for (var item in MyBlog.pList) {
			var inner = MyBlog._generateSummary(item);
			_('indexList').innerHTML += inner;
		};
		_('listKey').innerHTML = '全部文章：';
		_('listValue').innerHTML = '';
		MyBlog.addListener4Click();
	},
	sortWithKV: function(key, value) {
		// MyBlog.select(1);
		switch (key) {
			case 'cat':
				_('listKey').innerHTML = '分类：';
				break;
			case 'tag':
				_('listKey').innerHTML = '标签：';
				break;
			case 'date':
				_('listKey').innerHTML = '日期：';
				value = value.substring(0, 7);
				break;
			default:
				_('listKey').innerHTML = key;
		}
		_('listValue').innerHTML = value;
		_('indexList').innerHTML = '';

		for (var item in MyBlog.pList) {
			if (MyBlog._inArray(MyBlog.pList[item][key], value) || (typeof(MyBlog.pList[item][key]) == 'string' && value == MyBlog.pList[item][key].substring(0, 7))) {
				var inner = MyBlog._generateSummary(item);
				_('indexList').innerHTML += inner;
			}
		};
		MyBlog.addListener4Click();
	},
	showPage: function(item) {
		document.title = MyBlog.pList[item].title + ' | ' + MyBlog.BlogName;
		var cat = MyBlog._generateLabel(MyBlog.pList[item].cat, 'cat');
		var tag = MyBlog._generateLabel(MyBlog.pList[item].tag, 'tag');
		var inner = '\
			<a class="close">&lt;&lt;返回</a>\
			<div class="text-left">\
				<p><b>标题:</b></p>\
				<p>' + MyBlog.pList[item].title + '</p>\
				<p><b>日期：</b></pre>\
				<a class="date-label">' + MyBlog.pList[item].date + '</a>\
				<p><b>分类:</b></p>' + cat + '\
				<p><b>标签:</b></p>' + tag + '\
			</div>';
		_('pInfo').innerHTML = inner;
		MyBlog.addListener4Click();

		var title = MyBlog.pList[item].title;
		var pId = item;
		var url = 'http://www.imsun.net/posts/?pid=' + pId;

		$('#dark').fadeIn();
		_('showContainer').style.left = 0;
		_('pContent').innerHTML = '文章加载中...';
		_('pComment').innerHTML = '评论加载中...';

		var el = document.createElement('div');
		el.setAttribute('data-thread-key', pId);
		el.setAttribute('data-url', url);
		try {
			DUOSHUO.EmbedThread(el);
			setTimeout(function() {
				_('pComment').innerHTML = '';
				$('#pComment').append(el);
				el = null;
			}, 500);
		} catch (e) {
			_('pComment').innerHTML = '<p style="color:red">评论加载失败</p>';
		}
		if (sessionStorage.getItem('p=' + item)) {
			_('pContent').innerHTML = sessionStorage.getItem('p=' + item);
			$('pre code').each(function(i, e) {
				hljs.highlightBlock(e)
			});
		} else {
			$.get(MyBlog.pList[item].url, function(data) {
				var inner = '<h2>' + MyBlog.pList[item].title + '</h2><p>日期：' + MyBlog.pList[item].date + ' 作者：<a href="http://www.imsun.net/" target="_blank">Trevor Sun</a></p>' + data + '<h5 class="text-center">—— 原文来自<a href="http://www.imsun.net/posts/?pid=' + item + '" target="_blank">孙士权的博客</a>，转载请注明作者及出处 ——</h5>';
				_('pContent').innerHTML = inner;
				sessionStorage.setItem('p=' + item, inner);
				$('pre code').each(function(i, e) {
					hljs.highlightBlock(e)
				});
			});
		}
	},
	closePage: function(target) {
		document.title = MyBlog.BlogName;
		if(target === 'back') history.go(-1);
		_('showContainer').style.left = '100%';
		setTimeout(function() {
			$('#dark').fadeOut();
		}, 300);
		setTimeout(function() {
			_('pContent').innerHTML = '';
			_('pComment').innerHTML = '';
		}, 500);
	},
	hidePage: function() {
		document.title = MyBlog.BlogName;
		_('showContainer').style.left = '100%';
		setTimeout(function() {
			$('#dark').fadeOut();
		}, 300);
	},
	_inArray: function(a, element) {
		for (var i = 0; i < a.length; i++) {
			if (a[i] == element) return true;
		};
		return false;
	},
	_generateSummary: function(item) {
		var cat = MyBlog._generateLabel(MyBlog.pList[item].cat, 'cat'); // true for count
		var tag = MyBlog._generateLabel(MyBlog.pList[item].tag, 'tag');
		var inner =
			'<div>\
				<h2><a title="' + MyBlog.pList[item].title + '" href="/posts/?pid=' + item + '" href-opt="push" target="_blank">' + MyBlog.pList[item].title + '</a></h2>\
				<p>\
					By: Trevor Date: \
					<a class="date-label">' + MyBlog.pList[item].date + '</a> \
					<b>分类: </b><a class="cat-label">' + cat + '</a> \
					<b>标签: </b>' + tag +
			'</p>\
			</div>';
		return inner;
	},
	_generateLabel: function(a, key, count) {
		var ans = '';
		if (a == 'none') return '无';
		for (var i = 0; i < a.length; i++) {
			if (count == 'init') {
				if (!MyBlog.sortCount[key][a[i]]) MyBlog.sortCount[key][a[i]] = 0;
				MyBlog.sortCount[key][a[i]]++;
			}
			if (count == 'count') {
				ans += '<a class="' + key + '-label">' + a[i] + '</a>(' + MyBlog.sortCount[key][a[i]] + ') ';
			} else ans += '<a class="' + key + '-label">' + a[i] + '</a> ';
		};
		return ans;
	},
	_generateLabelInfo: function(key) {
		var ans = '';
		for (var item in MyBlog.sortCount[key]) {
			ans += '<a class="' + key + '-label">' + item + '</a>(' + MyBlog.sortCount[key][item] + ') ';
		}
		return ans;
	},
	_bind4Click: function(selector, callback) {
		$(selector).each(function(i, e) {
			if (!e.onclick) {
				e.onclick = callback;
			};
		})
	}
}