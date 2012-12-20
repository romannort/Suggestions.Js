(function( $ ){
$.fn.suggestions = function(params) {
  var _this = this; 
	var settings = $.extend( {
    	'top'     : _this.position().top + _this.height() + 10,
    	'left'	: _this.position().left + 5, 
    	'height'  : "auto",
    	'count' : 10,
    	"width"	: _this.width(),
    	'background' : 'white',
     	"foreground" : "black",
     	"minSuggestLen" : 1,
    	"source" : ["1aaa", "1bbb", "1ccc"],
    	"ajax" : {
    		type : "POST",
    		url : "",
    		varname : "q" // name for variable on server side 
    	}
    }, params);
	var suggestions; // filled from array or ajax response
	var navKeys = [13,38,40];

	_this.parent().append( $("<div></div>").attr({
				class:"autocomplete-list",
				style:"width:" + settings.width + "px;" +
				" position:absolute;top:" + settings.top +"px;" +
				" left:"+ settings.left + "px;" +
				"display:block;overflow:auto;z-index:1;background-color:" + settings.background + ";" +
				"color:" + settings.foreground + ";"
			}));
	var list = $("div.autocomplete-list");

	function elementChoosen(args){
		_this.val(args.target.textContent);
		clearSuggestions();
	};

	function getAjaxData(input){
		var results;
		var dataobj = 
		$.ajax({
			type : settings.ajax.type,
			url : settings.ajax.url,
			data : jQuery.parseJSON("{'"+settings.ajax.varname+"':'" + input +"''}")
		}).done(function(msg){
			results = msg;
		});
		return results.slice(0,settings.count);
	};

	function searchLocalData(input){
		var results = [];
		for (var i = 0; i < settings.source.length; ++i){
			if ( settings.source[i].search(input) != -1){
				results.push(settings.source[i]);
			}
		}
		return results.slice(0, settings.count);
	};

	function createSuggestionsList(input){
		var results = [];
		if (settings.ajax.url != ""){
			results = getAjaxData(input);
		}
		else{
			results = searchLocalData(input);
		}
		var resultsMarkup = [];
		for (var i = 0; i < results.length; ++i){
			resultsMarkup.push($("<div></div>").text(results[i]).attr({
					style:"position:relative;"	
			}).click(elementChoosen));
		}
		return resultsMarkup;
	};

	function clearSuggestions(){
		list.css("display", "none").empty();
	};

	var liSelected;
	function arrowKeyPressed(e){
		var li = list.children();
		if(e.which === 40){
	        if(liSelected){
	            liSelected.removeClass('selected');
	            next = liSelected.next();
	            if(next.length > 0){
	                liSelected = next.addClass('selected');
	            }else{
	                liSelected = li.eq(0).addClass('selected');
	            }
	        }else{
	            liSelected = li.eq(0).addClass('selected');
	        }
	    }else if(e.which === 38){
	        if(liSelected){
	            liSelected.removeClass('selected');
	            next = liSelected.prev();
	            if(next.length > 0){
	                liSelected = next.addClass('selected');
	            }else{
	                liSelected = li.last().addClass('selected');
	            }
	        }else{
	            liSelected = li.last().addClass('selected');
	        }
    	}
    	else if(e.which === 13){
    		elementChoosenWithKb();
    	}
	};

	function elementChoosenWithKb(){
		var element = $("div.selected");
		_this.val(element[0].textContent);
		clearSuggestions();	
	};

	function suggest(){
		list.empty();
		var resultsMarkup = createSuggestionsList(_this.val());
		for (var i = 0; i < resultsMarkup.length; ++i){
			list.append( resultsMarkup[i] );
		}
		list.css("display", "block");
	}		

	return this.each(function(e){
		_this.keyup(function(args){
			if ( navKeys.indexOf(args.which) != -1 ){
				arrowKeyPressed(args);	
				args.preventDefault();
				return;
			}
			else{
				if (_this.val().length < settings.minSuggestLen){
					clearSuggestions();
					return;
				}
				suggest();			
			}
		});
		
		_this.focusout(function(e){
			clearSuggestions();
		});
	});
  };
})( jQuery );
