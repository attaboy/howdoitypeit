$(function() {

	var doc = $(document);
	var searchInput = $('#searchInput');
	var searchButton = $('#searchButton');	
	var tableCells = $('tbody td').not('.notes');
	var glossaryLink = $('#glossaryLink');
	
	var removeHighlights = function() {
		var el = $(this);
		el.replaceWith(el.html());
	};
	
	var highlightRecursively = function(parent, searchString) {
		searchString = searchString.toLowerCase();
		parent.contents().each(function() {
			var child = $(this);
			if (!child.contents().length) {
				var nodeName = child[0] && child[0].nodeName;
				if (nodeName && nodeName !== '#text') {
					return;
				}
				var immediateParent = child.parent();
				var html = immediateParent.text();
				if (!html) { return; }
				var lowered = html.toLowerCase();
				var result = '';
				var lastIndex = 0;
				var nextIndex = 0;
				var match;
				while (lastIndex !== -1) {
					nextIndex = lowered.indexOf(searchString, lastIndex);
					if (nextIndex !== -1) {
						result += html.substring(lastIndex, nextIndex);
						match = html.substr(nextIndex, searchString.length);
						if (match.search(/^&.+;$/) !== -1) {
							match = '&amp;' + match.substr(1);
						}
						result += '<span class="highlight">' + match + '</span>';
						lastIndex = nextIndex + searchString.length;
					} else {
						result += html.substring(lastIndex);
						lastIndex = nextIndex;
					}
				}
				if (result !== html) {
					immediateParent.html(result);
				}
			} else {
				highlightRecursively(child, searchString);
			}
		});
	};
	
	var filterToHighlighted = function() {
		$('.highlighted').removeClass('highlighted');
		var highlighted = $('.highlight').parents('tr').addClass('highlighted');
		if (highlighted.length > 0) {
			$('#searchButton').attr('disabled', false);
			$('tbody').addClass('highlighted');
		} else {
			$('#searchButton').attr('disabled', true);
			$('tbody').removeClass('highlighted').find('tr.highlighted').removeClass('highlighted');
		}
	};
	
	var scrollSet;
	var scrollIndex;
	var timesScrolled = 0;
	doc.bind('ht.scrollToNextItem', function(e, suppressFlash) {
		e.stopPropagation();
		if (!suppressFlash) {
			searchButton.trigger('flash');
		}
		if (!scrollSet) {
			scrollSet = $('.highlight');
			scrollIndex = 0;
			timesScrolled = 0;
		}
		var before = window.scrollY;
		var item = scrollSet.eq(scrollIndex);
		if (scrollIndex + 1 < scrollSet.length) {
			scrollIndex++;
		} else {
			scrollIndex = 0;
			timesScrolled++;
		}
		if (!item) { return; }
		$.scrollTo(item, {
			offset: -($('table').offset().top + 20),
			duration: 150,
			onAfter: function() {
				var after = window.scrollY;
				if (before === after && timesScrolled < 1) {
					doc.trigger('ht.scrollToNextItem', true);
				}
			}
		});
	});
	
	var lastSearch;
	
	searchInput.keyup(function(e) {
		var search;
		if (e.keyCode === 27) {
			this.value = '';
			this.blur();
		}
		search = this.value;
		if (search !== lastSearch) {
			$('.highlight').each(removeHighlights);
			if (search) {
				highlightRecursively(tableCells, search);
			}
			filterToHighlighted();
			lastSearch = search;
			scrollSet = null;
		}
		if (e.keyCode === 13) {
			this.select();
			doc.trigger('ht.scrollToNextItem');
		}
	}).focus();
	
	var searchButtonTimer;
	searchButton.bind({
		'click': function() { doc.trigger('ht.scrollToNextItem'); },
		'flash': function() {
		    window.clearTimeout(searchButtonTimer);
		    searchButton.css({ background: '#fc993c' });
		    searchButtonTimer = window.setTimeout(function() { searchButton.css({ background: '' }); }, 100);
		}
	});
	
	glossaryLink.click(function(e) {
		e.preventDefault();
		e.stopPropagation();
		$('.glossaryBox').toggleClass('open');
	});
	
	$('body').keyup(function(e) {	
		if (e.keyCode === 191 && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
			searchInput.focus();
		}
	}).click(function(e) {
		$('.glossaryBox').removeClass('open');
	});
})