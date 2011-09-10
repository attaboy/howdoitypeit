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
				while (lastIndex !== -1) {
					nextIndex = lowered.indexOf(searchString, lastIndex);
					if (nextIndex !== -1) {
						result += html.substring(lastIndex, nextIndex);
						result += '<span class="highlight">' + html.substr(nextIndex, searchString.length) + '</span>';
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
	}
	
	var lastSearch;
	
	$('#search').keyup(function(e) {
		var search;
		if (e.keyCode === 27) {
			this.value = '';
		}
		search = this.value;
		if (search === lastSearch) { return; }
		$('.highlight').each(removeHighlights);
		if (search) {
			highlightRecursively(tableCells, search);
		}
		filterToHighlighted();
		lastSearch = search;
	}).focus();
})