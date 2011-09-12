$(function() {
	var tableCells = $('tbody td').not('.notes');
	
	var removeHighlights = function() {
		var el = $(this);
		el.replaceWith(el.html());
	};
	
	var highlightRecursively = function(parent, searchString) {
		searchString = searchString.toLowerCase();
		parent.contents().each(function() {
			var child = $(this);
			if (!child.contents().length) {
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
			$('tbody').addClass('highlighted');
		} else {
			$('tbody').removeClass('highlighted').find('tr.highlighted').removeClass('highlighted');
		}
	};
	
	var scrollSet;
	var scrollIndex;
	
	var scrollToNext = function() {
		if (!scrollSet) {
			scrollSet = $('.highlight');
			scrollIndex = 0;
		}
		if (scrollIndex + 1 < scrollSet.length) {
			scrollIndex++;
		} else {
			scrollIndex = 0;
		}
		var before = window.scrollY;
		$.scrollTo(scrollSet.eq(scrollIndex), {
			offset: -($('table').offset().top + 20),
			duration: 250,
			onAfter: function() {
				var after = window.scrollY;
				if (before === after) {
					scrollToNext();
				}
			}
		});
	};
	
	var lastSearch;
	
	$('#search').keyup(function(e) {
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
			scrollToNext();
		}
	}).focus();
	
	$('body').bind('keyup', function(e) {	
		if (e.keyCode === 191 && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
			$('#search').focus();
		}
	});
})