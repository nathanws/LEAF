/************************
    Form Search Widget
    Author: Michael Gao (Michael.Gao@va.gov)
    Date: January 15, 2015
*/

var LeafFormSearch = function(containerID) {
	var containerID = containerID;
	var prefixID = 'LeafFormSearch' + Math.floor(Math.random()*1000) + '_';
	var localStorageNamespace = 'LeafFormSearch' + getLocalStorageHash();
	var orgchartPath = '';
	var timer = 0;
	var q = '';
	var intervalID = null;
	var currRequest = null;
	var numResults = 0;
	var searchFunc = null;
	var leafFormQuery = new LeafFormQuery();
	var widgetCounter = 0;
	var interval_advSearch = null;
	var rootURL = '';

	// constants
	var ALL_DATA_FIELDS = '0';
	var ALL_OC_EMPLOYEE_DATA_FIELDS = '0.0';

	function renderUI() {
		$('#' + containerID).html('<div>\
			    <img id="'+prefixID+'searchIcon" class="searchIcon" alt="search" style="vertical-align: middle; padding-right: 4px; display: inline;" src="'+ rootURL +'../libs/dynicons/?img=search.svg&w=16">\
			    <img id="'+prefixID+'searchIconBusy" class="searchIcon" alt="loading" style="vertical-align: middle; padding-right: 4px; display:none" src="'+ rootURL +'images/indicator.gif">\
			    <input style="border: 1px solid black; padding: 4px" type="text" id="'+prefixID+'searchtxt" name="searchtxt" size="50" title="Enter your search text" value="" />\
			    <span class="buttonNorm" id="'+prefixID+'advancedSearchButton">Advanced Options</span>\
			    <fieldset id="'+prefixID+'advancedOptions" style="display: none; margin: 0px; border: 1px solid black; background-color: white">\
		        <legend>Advanced Search Options</legend>\
		        <img id="'+prefixID+'advancedOptionsClose" src="'+ rootURL +'../libs/dynicons/?img=process-stop.svg&w=16" tabindex="0" style="position: absolute; display: none; cursor: pointer" alt="Close advanced search" />\
		        <div style="width: 550px">Find items where...</div>\
		        <table id="'+prefixID+'searchTerms"></table>\
		        <span class="buttonNorm" id="'+prefixID+'addTerm" style="float: left">And...</span>\
		        <br /><br />\
		        <div id="'+prefixID+'advancedSearchApply" class="buttonNorm" style="text-align: center">Apply Filters</div>\
		    </fieldset>\
		    </div>\
		    <div id="'+prefixID+'_result" style="margin-top: 8px" aria-label="Search Results">\
		    </div>');

	    var searchOrigWidth = 0;
	    $('#' + prefixID + 'advancedOptionsClose').on('click', function() {
	    	clearInterval(interval_advSearch);
	    	localStorage.setItem(localStorageNamespace + '.search', '');
	    	$('#' + prefixID + 'searchtxt').val('');
	    	search('');
	    	$('#' + prefixID + 'advancedOptionsClose').css('display', 'none');
	        $('#' + prefixID + 'advancedOptions').slideUp(function() {
	        	$('#' + prefixID + 'advancedSearchButton').fadeIn();
	        	$('#' + prefixID + 'searchtxt').css('display', 'inline');
	            $('#' + prefixID + 'searchtxt').animate({'width': searchOrigWidth}, 400, 'swing');
	            $('#' + prefixID + 'searchtxt').focus();
	        });
	    });
			//added for keyboard navigation and accessibility to close advanced search options
			var searchOrigWidth = 0;
	    $('#' + prefixID + 'advancedOptionsClose').on('keydown', function(e) {
				if(e.keyCode == 13){
	    	localStorage.setItem(localStorageNamespace + '.search', '');
	    	$('#' + prefixID + 'searchtxt').val('');
	    	search('');
	    	$('#' + prefixID + 'advancedOptionsClose').css('display', 'none');
	        $('#' + prefixID + 'advancedOptions').slideUp(function() {
	        	$('#' + prefixID + 'advancedSearchButton').fadeIn();
	        	$('#' + prefixID + 'searchtxt').css('display', 'inline');
	            $('#' + prefixID + 'searchtxt').animate({'width': searchOrigWidth}, 400, 'swing');
	            $('#' + prefixID + 'searchtxt').focus();
	        });
				}
	    });

	    $('#' + prefixID + 'advancedSearchButton').on('click', function() {
	    	searchOrigWidth = $('#' + prefixID + 'searchtxt').width();
	    	$('#' + prefixID + 'advancedSearchButton').fadeOut();
	    	$('#' + prefixID + 'searchtxt').animate({'width': '0px'}, 400, 'swing', function() {
	    		$('#' + prefixID + 'searchtxt').css('display', 'none');
	        	$('#' + prefixID + 'advancedOptions').slideDown(function() {
	                updateCloseIconPosition();
	                $('#' + prefixID + 'advancedOptionsClose').fadeIn();
	                interval_advSearch = setInterval(function() { updateCloseIconPosition(); }, 500);
	        	});
	            $('#' + prefixID + 'advancedOptions').css('display', 'inline');
	            $('.chosen').chosen({disable_search_threshold: 6}); // needs to be here due to chosen issue with display:none
	            renderPreviousAdvancedSearch();
	    	});
	    });

	    $('#' + prefixID + 'advancedSearchApply').on('click', function() {
	    	showBusy();
	    	generateSearchQuery();
	    });
	    $('#' + prefixID + 'addTerm').on('click', function() {
	    	newSearchWidget();
	    	$('.chosen').chosen({disable_search_threshold: 6}); // needs to be here due to chosen issue with display:none
	    });

		$('#' + prefixID+ 'searchtxt').on('keydown', function(e) {
			showBusy();
			timer = 0;
			if(e.keyCode == 13) { // enter key
				search($('#' + prefixID+ 'searchtxt').val());
			}
		});

		newSearchWidget();
	}

	/**
	 * @memberOf LeafFormSearch
	 */
	function init() {
		renderUI();

		intervalID = setInterval(function(){inputLoop();}, 200);
		if(!(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ) {
			focus();
		}
	    if(getLastSearch() == null) {
	    	search('*');
	    }
	    else {
	    	var lastSearch = getLastSearch();

	        var isJSON = true;
	        var advSearch = {};
	        try {
	            advSearch = JSON.parse(lastSearch);
	        }
	        catch(err) {
	            isJSON = false;
	        }

	        if(lastSearch.substr(0, 1) != '[') {
	        	isJSON = false;
	        }

	        if(isJSON) {
	        	$('#' + prefixID + 'advancedSearchButton').click();
	        	search(lastSearch);
	        }
	        else {
	        	if(lastSearch == '') {
	        		search('*');
	        	}
	        	$('#' + prefixID+ 'searchtxt').val(lastSearch);
	        }
	    }
	}

	/**
	 * @memberOf LeafFormSearch
	 * prevQuery - optional JSON object
	 */
	function renderPreviousAdvancedSearch(prevQuery) {
        var isJSON = true;
        var advSearch = {};
        try {
        	if(prevQuery != undefined) {
        		advSearch = prevQuery;
        	}
        	else {
        		advSearch = JSON.parse(getLastSearch());
        	}
        }
        catch(err) {
            isJSON = false;
        }
        if(isJSON && advSearch != null && widgetCounter <= advSearch.length) {
        	for(var i = 1; i < advSearch.length; i++) {
        		newSearchWidget();
        	}
        	for(var i = 0; i < advSearch.length; i++) {
        		$('#' + prefixID + 'widgetTerm_' + i).val(advSearch[i].id);
        		$('#' + prefixID + 'widgetTerm_' + i).trigger('chosen:updated');
        		if(advSearch[i].indicatorID != undefined
        			|| advSearch[i].id == 'serviceID'
        			|| advSearch[i].id == 'categoryID'
        			|| advSearch[i].id == 'stepID') {
            		renderWidget(i, function(widgetID, indicatorID, operator, match) {
            			return function() {
            				$('#' + prefixID + 'widgetIndicator_' + widgetID).val(indicatorID);
            				$('#' + prefixID + 'widgetIndicator_' + widgetID).trigger('chosen:updated');
                    		$('#' + prefixID + 'widgetCod_' + widgetID).val(operator);
                    		$('#' + prefixID + 'widgetCod_' + widgetID).trigger('chosen:updated');
                    		$('#' + prefixID + 'widgetMat_' + widgetID).val(match.replace(/\*/g, ''));
                    		$('#' + prefixID + 'widgetMat_' + widgetID).trigger('chosen:updated');
            			};
            		}(i, advSearch[i].indicatorID, advSearch[i].operator, advSearch[i].match));
        		}
        		else {
            		renderWidget(i);
        		}
        		$('#' + prefixID + 'widgetCod_' + i).val(advSearch[i].operator);
        		if(typeof advSearch[i].match == 'string') {
        			$('#' + prefixID + 'widgetMat_' + i).val(advSearch[i].match.replace(/\*/g, ''));
        		}
        	}
        }
	}

	/**
	 * @memberOf LeafFormSearch
	 * From: http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
	 */
	function getLocalStorageHash() {
	  var hash = 0, i, chr, len;
	  if (document.URL.length == 0) return hash;
	  for (i = 0, len = document.URL.length; i < len; i++) {
	    chr   = document.URL.charCodeAt(i);
	    hash  = ((hash << 5) - hash) + chr;
	    hash |= 0; // Convert to 32bit integer
	  }
	  return hash;
	}

	/**
	 * @memberOf LeafFormSearch
	 */
	function updateCloseIconPosition() {
		$('#' + prefixID + 'advancedOptionsClose').css({'top': $('#' + prefixID + 'advancedOptions').position().top,
            'left': $('#' + prefixID + 'advancedOptions').position().left + $('#' + prefixID + 'advancedOptions').width() + 4});
	}

	/**
	 * @memberOf LeafFormSearch
	 */
	function setOrgchartPath(path) {
		orgchartPath = path;
	}

	/**
	 * @memberOf LeafFormSearch
	 */
	function getLastSearch() {
		return localStorage.getItem(localStorageNamespace + '.search');
	}

	/**
	 * @memberOf LeafFormSearch
	 */
	function setSearchFunc(func) {
		searchFunc = func;
	}

	/**
	 * @memberOf LeafFormSearch
	 */
	function search(txt) {
		if(txt != '*') {
			localStorage.setItem(localStorageNamespace + '.search', txt);
		}
		return searchFunc(txt);
	}

	/**
	 * @memberOf LeafFormSearch
	 */
	function inputLoop() {
		if($('#' + prefixID + 'searchtxt') == null) {
			clearInterval(intervalID);
			return false;
		}
		timer += (timer > 5000) ? 0 : 200;
		if(timer > 400) {
		    var txt = $('#' + prefixID + 'searchtxt').val();

		    if(txt != "" && txt != q) {
		    	q = txt;

		    	if(currRequest != null) {
		    		currRequest.abort();
		    	}

		    	currRequest = search(txt);
		    }
		    else if(txt == "") {
		    	if(txt != q) {
		    		search('');
		    	}
		    	q = txt;
		    	$('#' + this.prefixID + '_result').html('');
		    	numResults = 0;
		        showNotBusy();
		    }
		    else {
		    	showNotBusy();
		    }
		}
	}

	/**
	 * @memberOf LeafFormSearch
	 */
	function focus() {
		$('#' + prefixID + 'searchtxt').focus();
	}

	/**
	 * @memberOf LeafFormSearch
	 */
	function showBusy() {
		$('#' + prefixID + 'searchIcon').css("display", "none");
        $('#' + prefixID + 'searchIconBusy').css("display", "inline");
	}

	/**
	 * @memberOf LeafFormSearch
	 */
	function showNotBusy() {
		$('#' + prefixID + 'searchIcon').css("display", "inline");
        $('#' + prefixID + 'searchIconBusy').css("display", "none");
	}

	/**
	 * @memberOf LeafFormSearch
	 */
	function createEmployeeSelectorWidget(widgetID, type) {
		if(type == undefined) {
			type = 'userName';
		}
        if(typeof employeeSelector == 'undefined') {
            $('head').append('<link type="text/css" rel="stylesheet" href="'+ orgchartPath +'/css/employeeSelector.css" />');
            $.ajax({
                type: 'GET',
                url: orgchartPath + "/js/employeeSelector.js",
                dataType: 'script',
                success: function() {
                    empSel = new employeeSelector(prefixID + 'widgetEmp_' + widgetID);
                    empSel.apiPath = orgchartPath + '/api/';
                    empSel.rootPath = orgchartPath + '/';
                    empSel.outputStyle = 'micro';

                    empSel.setSelectHandler(function() {
                    	if(empSel.selectionData[empSel.selection] != undefined) {
                    		selection = type == 'empUID' ? empSel.selection : empSel.selectionData[empSel.selection].userName;
                    		$('#' + prefixID + 'widgetMat_' + widgetID).val(selection);
                    	}
                    });
                    empSel.setResultHandler(function() {
                    	if(empSel.selectionData[empSel.selection] != undefined) {
                    		selection = type == 'empUID' ? empSel.selection : empSel.selectionData[empSel.selection].userName;
                    		$('#' + prefixID + 'widgetMat_' + widgetID).val(selection);
                    	}
                    });
                    empSel.initialize();
                }
            });
        }
        else {
            empSel = new employeeSelector(prefixID + 'widgetEmp_' + widgetID);
            empSel.apiPath = orgchartPath + '/api/';
            empSel.rootPath = orgchartPath + '/';
            empSel.outputStyle = 'micro';

            empSel.setSelectHandler(function() {
            	if(empSel.selectionData[empSel.selection] != undefined) {
            		selection = type == 'empUID' ? empSel.selection : empSel.selectionData[empSel.selection].userName;
            		$('#' + prefixID + 'widgetMat_' + widgetID).val(selection);
            	}
            });
            empSel.setResultHandler(function() {
            	if(empSel.selectionData[empSel.selection] != undefined) {
            		selection = type == 'empUID' ? empSel.selection : empSel.selectionData[empSel.selection].userName;
            		$('#' + prefixID + 'widgetMat_' + widgetID).val(selection);
            	}
            });
            empSel.initialize();
        }
	}

	/**
	 * @memberOf LeafFormSearch
	 */
	function createPositionSelectorWidget(widgetID) {
        if(typeof positionSelector == 'undefined') {
            $('head').append('<link type="text/css" rel="stylesheet" href="'+ orgchartPath +'/css/positionSelector.css" />');
            $.ajax({
                type: 'GET',
                url: orgchartPath + "/js/positionSelector.js",
                dataType: 'script',
                success: function() {
                    posSel = new positionSelector(prefixID + 'widgetPos_' + widgetID);
                    posSel.apiPath = orgchartPath + '/api/';
                    posSel.rootPath = orgchartPath + '/';

                    posSel.setSelectHandler(function() {
                    	$('#' + prefixID + 'widgetMat_' + widgetID).val(posSel.selection);
                    });
                    posSel.setResultHandler(function() {
                    	$('#' + prefixID + 'widgetMat_' + widgetID).val(posSel.selection);
                    });
                    posSel.initialize();
                }
            });
        }
        else {
        	posSel = new positionSelector(prefixID + 'widgetPos_' + widgetID);
        	posSel.apiPath = orgchartPath + '/api/';
        	posSel.rootPath = orgchartPath + '/';

        	posSel.setSelectHandler(function() {
            	$('#' + prefixID + 'widgetMat_' + widgetID).val(posSel.selection);
            });
        	posSel.setResultHandler(function() {
            	$('#' + prefixID + 'widgetMat_' + widgetID).val(posSel.selection);
            });
        	posSel.initialize();
        }
	}

	/**
	 * @memberOf LeafFormSearch
	 */
	function createGroupSelectorWidget(widgetID) {
        if(typeof groupSelector == 'undefined') {
            $('head').append('<link type="text/css" rel="stylesheet" href="'+ orgchartPath +'/css/groupSelector.css" />');
            $.ajax({
                type: 'GET',
                url: orgchartPath + "/js/groupSelector.js",
                dataType: 'script',
                success: function() {
                    grpSel = new groupSelector(prefixID + 'widgetGrp_' + widgetID);
                    grpSel.apiPath = orgchartPath + '/api/';
                    grpSel.rootPath = orgchartPath + '/';

                    grpSel.setSelectHandler(function() {
                    	$('#' + prefixID + 'widgetMat_' + widgetID).val(grpSel.selection);
                    });
                    grpSel.setResultHandler(function() {
                    	$('#' + prefixID + 'widgetMat_' + widgetID).val(grpSel.selection);
                    });
                    grpSel.initialize();
                }
            });
        }
        else {
        	grpSel = new groupSelector(prefixID + 'widgetGrp_' + widgetID);
        	grpSel.apiPath = orgchartPath + '/api/';
        	grpSel.rootPath = orgchartPath + '/';

        	grpSel.setSelectHandler(function() {
            	$('#' + prefixID + 'widgetMat_' + widgetID).val(grpSel.selection);
            });
        	grpSel.setResultHandler(function() {
            	$('#' + prefixID + 'widgetMat_' + widgetID).val(grpSel.selection);
            });
        	grpSel.initialize();
        }
	}

	/**
	 * @memberOf LeafFormSearch
	 */
	function renderWidget(widgetID, callback) {
		switch($('#' + prefixID + 'widgetTerm_' + widgetID).val()) {
			case 'title':
				$('#' + prefixID + 'widgetCondition_' + widgetID).html('<select id="'+prefixID+'widgetCod_'+widgetID+'" class="chosen" style="width: 120px">\
						<option value="LIKE">CONTAINS</option>\
						<option value="NOT LIKE">DOES NOT CONTAIN</option>\
	            		<option value="=">=</option>\
						<option value="!=">!=</option>\
	            	</select>');
				$('#' + prefixID + 'widgetMatch_' + widgetID).html('<input type="text" id="'+prefixID+'widgetMat_'+widgetID+'" style="width: 250px" />');
				break;
			case 'serviceID':
				$('#' + prefixID + 'widgetCondition_' + widgetID).html('<input type="hidden" id="'+prefixID+'widgetCod_'+widgetID+'" value="=" /> IS');
				$.ajax({
					type: 'GET',
					url: './api/?a=system/services',
					dataType: 'json',
					success: function(res) {
						var services = '<select id="'+prefixID+'widgetMat_'+widgetID+'" class="chosen" style="width: 250px">';
						for(var i in res) {
							services += '<option value="'+ res[i].groupID +'">'+ res[i].groupTitle +'</option>';
						}
						services += '</select>';
						$('#' + prefixID + 'widgetMatch_' + widgetID).html(services);
						$('.chosen').chosen({disable_search_threshold: 6});
						if(callback != undefined) {
							callback();
						}
					}
				});
				break;
			case 'date':
				$('#' + prefixID + 'widgetCondition_' + widgetID).html('<select id="'+prefixID+'widgetCod_'+widgetID+'" style="width: 140px" class="chosen">\
	            		<option value="=">ON</option>\
	            		<option value=">=">ON AND AFTER</option>\
	            		<option value="<=">ON AND BEFORE</option>\
	            	</select>');
				$('#' + prefixID + 'widgetMatch_' + widgetID).html('<input type="text" id="'+prefixID+'widgetMat_'+widgetID+'" style="width: 200px" />');
				if(!jQuery.ui) {
					$.getScript('../libs/js/jquery/jquery-ui.custom.min.js', function() {
						$('#' + prefixID + 'widgetMat_' + widgetID).datepicker();
					});
				}
				else {
					$('#' + prefixID + 'widgetMat_' + widgetID).datepicker();
				}
				break;
			case 'categoryID':
				$('#' + prefixID + 'widgetCondition_' + widgetID).html('<select id="'+prefixID+'widgetCod_'+widgetID+'" style="width: 140px" class="chosen">\
	            		<option value="=">IS</option>\
	            		<option value="!=">IS NOT</option>\
	            	</select>');
				$.ajax({
					type: 'GET',
					url: './api/?a=workflow/categoriesUnabridged',
					dataType: 'json',
					success: function(res) {
						var categories = '<select id="'+prefixID+'widgetMat_'+widgetID+'" class="chosen" style="width: 250px">';
						for(var i in res) {
							categories += '<option value="'+ res[i].categoryID +'">'+ res[i].categoryName +'</option>';
						}
						categories += '</select>';
						$('#' + prefixID + 'widgetMatch_' + widgetID).html(categories);
						$('.chosen').chosen({disable_search_threshold: 6});
						if(callback != undefined) {
							callback();
						}
					}
				});
				break;
			case 'userID':
				$('#' + prefixID + 'widgetCondition_' + widgetID).html('<input type="hidden" id="'+prefixID+'widgetCod_'+widgetID+'" value="=" /> IS');
				$('#' + prefixID + 'widgetMatch_' + widgetID).html('<div id="'+prefixID+'widgetEmp_'+widgetID+'" style="width: 280px"></div><input type="hidden" id="'+prefixID+'widgetMat_'+widgetID+'" />');
				createEmployeeSelectorWidget(widgetID);
				break;
			case 'dependencyID':
				$('#' + prefixID + 'widgetCondition_' + widgetID).html('<input type="hidden" id="'+prefixID+'widgetCod_'+widgetID+'" value="=" /> =');
				$.ajax({
					type: 'GET',
					url: './api/?a=workflow/dependencies',
					dataType: 'json',
					success: function(res) {
						var dependencies = '<select id="'+prefixID+'widgetIndicator_'+widgetID+'" class="chosen" style="width: 250px">';
						for(var i in res) {
							dependencies += '<option value="'+ res[i].dependencyID +'">'+ res[i].description +'</option>';
						}
						dependencies += '</select>';
						$('#' + prefixID + 'widgetTerm_' + widgetID).after(dependencies);

						var options = '<select id="'+prefixID+'widgetMat_'+widgetID+'" class="chosen" style="width: 250px">';
						options += '<option value="1">Signed</option>';
						options += '<option value="0">Pending Signature</option>';
						options += '<option value="-1">Returned to a previous step</option>';
						options += '</select>';
						$('#' + prefixID + 'widgetMatch_' + widgetID).html(options);

						$('.chosen').chosen({disable_search_threshold: 6});
						$('#' + prefixID + 'widgetTerm_' + widgetID + '_chosen').css('display', 'none');
						if(callback != undefined) {
							callback();
						}
					}
				});
				break;
			case 'stepID':
				$('#' + prefixID + 'widgetCondition_' + widgetID).html('<input type="hidden" id="'+prefixID+'widgetCod_'+widgetID+'" value="=" /> IS');
				$.ajax({
					type: 'GET',
					url: './api/?a=workflow/steps',
					dataType: 'json',
					success: function(res) {
						var categories = '<select id="'+prefixID+'widgetMat_'+widgetID+'" class="chosen" style="width: 250px">';
						categories += '<option value="submitted">Submitted</option>';
						categories += '<option value="notSubmitted">Not Submitted</option>';
						//categories += '<option value="deleted">Cancelled</option>';
						categories += '<option value="notDeleted">Not Cancelled</option>';
						for(var i in res) {
							categories += '<option value="'+ res[i].stepID +'">'+ res[i].description + ': ' + res[i].stepTitle +'</option>';
						}
						categories += '</select>';
						$('#' + prefixID + 'widgetMatch_' + widgetID).html(categories);
						$('.chosen').chosen({disable_search_threshold: 6});
						if(callback != undefined) {
							callback();
						}
					}
				});
				break;
			case 'data':
				$.ajax({
					type: 'GET',
					url: './api/?a=form/indicator/list',
					dataType: 'json',
					success: function(res) {
						var indicators = '<select id="'+prefixID+'widgetIndicator_'+widgetID+'" class="chosen" style="width: 250px">';
						indicators += '<option value="'+ ALL_DATA_FIELDS +'">Any standard data field</option>';
						indicators += '<option value="'+ ALL_OC_EMPLOYEE_DATA_FIELDS +'">Any Org. Chart employee field</option>';
						for(var i in res) {
							indicators += '<option value="'+ res[i].indicatorID +'">' + res[i].categoryName + ': '+ res[i].name +'</option>';
						}
						indicators += '</select><br />';
						$('#' + prefixID + 'widgetTerm_' + widgetID).after(indicators);
						$('.chosen').chosen({disable_search_threshold: 6});
						$('#' + prefixID + 'widgetIndicator_' + widgetID).css('float', 'right');
						$('#' + prefixID + 'widgetIndicator_' + widgetID).on('change chosen:updated', function() {
							iID = $('#' + prefixID + 'widgetIndicator_' + widgetID).val();

							// set default conditions for "any data field"
							if(iID == ALL_DATA_FIELDS) {
								$('#' + prefixID + 'widgetCondition_' + widgetID).html('<select id="'+prefixID+'widgetCod_'+widgetID+'" class="chosen" style="width: 120px">\
										<option value="LIKE">CONTAINS</option>\
										<option value="NOT LIKE">DOES NOT CONTAIN</option>\
					            		<option value="=">=</option>\
										<option value="!=">!=</option>\
					            	</select>');
								$('#' + prefixID + 'widgetMatch_' + widgetID).html('<input type="text" id="'+prefixID+'widgetMat_'+widgetID+'" style="width: 200px" />');
								$('.chosen').chosen({disable_search_threshold: 6});
							}
							else if(iID == ALL_OC_EMPLOYEE_DATA_FIELDS) { // set conditions for orgchart employee fields
								$('#' + prefixID + 'widgetCondition_' + widgetID).html('<input type="hidden" id="'+prefixID+'widgetCod_'+widgetID+'" value="=" /> IS');
								$('#' + prefixID + 'widgetMatch_' + widgetID).html('<div id="'+prefixID+'widgetEmp_'+widgetID+'" style="width: 280px"></div><input type="hidden" id="'+prefixID+'widgetMat_'+widgetID+'" />');
								createEmployeeSelectorWidget(widgetID, 'empUID');
							}

							for(var i in res) {
								if(res[i].indicatorID == iID) {
									var format = '';
									var tIdx = res[i].format.indexOf("\n");
									if(tIdx == -1) {
										format = res[i].format;
									}
									else {
										format = res[i].format.substr(0, tIdx).trim();
									}
									switch(format) {
										case 'number':
										case 'currency':
											$('#' + prefixID + 'widgetCondition_' + widgetID).html('<select id="'+prefixID+'widgetCod_'+widgetID+'" class="chosen" style="width: 55px">\
								            		<option value="=">=</option>\
								            		<option value=">">></option>\
								            		<option value=">=">>=</option>\
								            		<option value="<"><</option>\
								            		<option value="<="><=</option>\
								            	</select>');
											$('.chosen').chosen({disable_search_threshold: 6});
											break;
										case 'date':
                            				$('#' + prefixID + 'widgetCondition_' + widgetID).html('<select id="'+prefixID+'widgetCod_'+widgetID+'" style="width: 140px" class="chosen">\
                            	            		<option value="=">ON</option>\
                            	            		<option value=">=">ON AND AFTER</option>\
                            	            		<option value="<=">ON AND BEFORE</option>\
                            	            	</select>');
                            				$('#' + prefixID + 'widgetMatch_' + widgetID).html('<input type="text" id="'+prefixID+'widgetMat_'+widgetID+'" style="width: 200px" />');
                            				if(!jQuery.ui) {
                            					$.getScript('../libs/js/jquery/jquery-ui.custom.min.js', function() {
                            						$('#' + prefixID + 'widgetMat_' + widgetID).datepicker();
                            					});
                            				}
                            				else {
                            					$('#' + prefixID + 'widgetMat_' + widgetID).datepicker();
                            				}
											$('.chosen').chosen({disable_search_threshold: 6});
										    break;
										case 'orgchart_employee':
											$('#' + prefixID + 'widgetCondition_' + widgetID).html('<input type="hidden" id="'+prefixID+'widgetCod_'+widgetID+'" value="=" /> IS');
											$('#' + prefixID + 'widgetMatch_' + widgetID).html('<div id="'+prefixID+'widgetEmp_'+widgetID+'" style="width: 280px"></div><input type="hidden" id="'+prefixID+'widgetMat_'+widgetID+'" />');
											createEmployeeSelectorWidget(widgetID, 'empUID');
											break;
										case 'orgchart_position':
											$('#' + prefixID + 'widgetCondition_' + widgetID).html('<input type="hidden" id="'+prefixID+'widgetCod_'+widgetID+'" value="=" /> IS');
											$('#' + prefixID + 'widgetMatch_' + widgetID).html('<div id="'+prefixID+'widgetPos_'+widgetID+'" style="width: 280px"></div><input type="hidden" id="'+prefixID+'widgetMat_'+widgetID+'" />');
											createPositionSelectorWidget(widgetID, 'empUID');
											break;
										case 'orgchart_group':
											$('#' + prefixID + 'widgetCondition_' + widgetID).html('<input type="hidden" id="'+prefixID+'widgetCod_'+widgetID+'" value="=" /> IS');
											$('#' + prefixID + 'widgetMatch_' + widgetID).html('<div id="'+prefixID+'widgetGrp_'+widgetID+'" style="width: 280px"></div><input type="hidden" id="'+prefixID+'widgetMat_'+widgetID+'" />');
											createGroupSelectorWidget(widgetID);
											break;
										case 'dropdown':
										case 'radio':
											$('#' + prefixID + 'widgetCondition_' + widgetID).html('<input type="hidden" id="'+prefixID+'widgetCod_'+widgetID+'" value="=" /> IS');
											var resOptions = res[i].format.split("\n");
											resOptions.shift();
											var options = '<select id="'+prefixID+'widgetMat_'+widgetID+'" class="chosen" style="width: 250px">';
											for(var i in resOptions) {
												var currOption = resOptions[i].indexOf("default:") == -1 ? resOptions[i].trim() : resOptions[i].substr(8).trim();
												options += '<option value="'+ currOption +'">'+ currOption +'</option>';
											}
											options += '</select>';
											$('#' + prefixID + 'widgetMatch_' + widgetID).html(options);
											$('.chosen').chosen({disable_search_threshold: 6});
											break;
										default:
											$('#' + prefixID + 'widgetCondition_' + widgetID).html('<select id="'+prefixID+'widgetCod_'+widgetID+'" class="chosen" style="width: 120px">\
													<option value="LIKE">CONTAINS</option>\
													<option value="NOT LIKE">DOES NOT CONTAIN</option>\
								            		<option value="=">=</option>\
													<option value="!=">!=</option>\
								            	</select>');
											$('#' + prefixID + 'widgetMatch_' + widgetID).html('<input type="text" id="'+prefixID+'widgetMat_'+widgetID+'" style="width: 200px" />');
											$('.chosen').chosen({disable_search_threshold: 6});
											break;
									}
								}
							}
						});
						$('#' + prefixID + 'widgetTerm_' + widgetID + '_chosen').css('display', 'none');
						if(callback != undefined) {
							callback();
						}
					}
				});
				break;
			default:
				$('#' + prefixID + 'widgetCondition_' + widgetID).html('<select id="'+prefixID+'widgetCod_'+widgetID+'" class="chosen" style="width: 55px">\
		            		<option value="=">=</option>\
		            		<option value=">">></option>\
		            		<option value=">=">>=</option>\
		            		<option value="<"><</option>\
		            		<option value="<="><=</option>\
		            		<option value="LIKE">CONTAINS</option>\
		            	</select>');
				$('#' + prefixID + 'widgetMatch_' + widgetID).html('<input type="text" id="'+prefixID+'widgetMat_'+widgetID+'" style="width: 200px" />');
				break;
		}
	}

	/**
	 * @memberOf LeafFormSearch
	 */
	function newSearchWidget() {
		var widget = '<tr id="'+prefixID+'widget_'+widgetCounter+'">\
						<td id="'+prefixID+'widgetRemove_'+widgetCounter+'"><button id="widgetRemoveButton"><img src="'+ rootURL +'../libs/dynicons/?img=list-remove.svg&w=16" style="cursor: pointer" alt="remove search term" /></button></td>\
						<td><select id="'+prefixID+'widgetTerm_'+widgetCounter+'" style="width: 150px" class="chosen">\
            				<option value="title">Title</option>\
            				<option value="serviceID">Service</option>\
            				<option value="date">Date Initiated</option>\
            				<option value="categoryID">Type</option>\
            				<option value="userID">Initiator</option>\
            				<option value="dependencyID">Requirement</option>\
            				<option value="stepID">Current Status</option>\
            				<option value="data">Data Field</option>\
            				</select></td>\
			            <td id="'+prefixID+'widgetCondition_'+widgetCounter+'"></td>\
						<td id="'+prefixID+'widgetMatch_'+widgetCounter+'"></td>\
					  </tr>';
		$(widget).appendTo('#' + prefixID + 'searchTerms');
		renderWidget(widgetCounter);

		$('#' + prefixID + 'widgetTerm_' + widgetCounter).on('change', '', widgetCounter, function(e) {
			renderWidget(e.data);
			$('.chosen').chosen({disable_search_threshold: 6}); // needs to be here due to chosen issue with display:none
		});
		$('#' + prefixID + 'widgetRemove_' + widgetCounter).on('click', '', widgetCounter, function(e) {
			$('#' + prefixID + 'widget_' + e.data).remove();
		});

		widgetCounter++;
	}

	/**
	 * @memberOf LeafFormSearch
	 */
	function generateSearchQuery() {
		leafFormQuery.clearTerms();
		for(var i = 0; i < widgetCounter; i++) {
			if($('#' + prefixID + 'widgetTerm_' + i).val() != undefined) {
				term = $('#' + prefixID + 'widgetTerm_' + i).val();
				if(term != 'data'
					&& term != 'dependencyID') {
					id = $('#' + prefixID + 'widgetTerm_' + i).val();
					cod = $('#' + prefixID + 'widgetCod_' + i).val();
					match = $('#' + prefixID + 'widgetMat_' + i).val();
					if(cod == 'LIKE') {
						match = '*' + match + '*';
					}
					leafFormQuery.addTerm(id, cod, match);
				}
				else {
					id = $('#' + prefixID + 'widgetTerm_' + i).val();
					indicatorID = $('#' + prefixID + 'widgetIndicator_' + i).val();
					cod = $('#' + prefixID + 'widgetCod_' + i).val();
					match = $('#' + prefixID + 'widgetMat_' + i).val();
					if(cod == 'LIKE') {
						match = '*' + match + '*';
					}
					leafFormQuery.addDataTerm(id, indicatorID, cod, match);
				}
			}
		}
		if(leafFormQuery.getQuery().terms.length > 0) {
			$('#' + prefixID + 'searchtxt').val(JSON.stringify(leafFormQuery.getQuery().terms));
		}
		else {
			$('#' + prefixID + 'searchtxt').val('*');
		}
	}

	return {
		init: init,
		renderUI: renderUI,
		setOrgchartPath: setOrgchartPath,
		focus: focus,
		getPrefixID: function() { return prefixID; },
		getSearchInput: function() { return $('#' + prefixID + 'searchtxt').val(); },
		getResultContainerID: function() { return prefixID + '_result'; },
		getLastSearch: getLastSearch,
		generateQuery: generateSearchQuery,
		getLeafFormQuery: function() {
			return leafFormQuery;
		},
		renderPreviousAdvancedSearch: renderPreviousAdvancedSearch,
		setSearchFunc: setSearchFunc,
		search: search,
		showBusy: showBusy,
		showNotBusy: showNotBusy,
		setRootURL: function(url) { rootURL = url; }
	}
};
