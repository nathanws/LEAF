/************************
    Employee Selector (Org Chart)
    Author: Michael Gao (Michael.Gao@va.gov)
    Date: March 2, 2012
*/

function employeeSelector(containerID) {
	this.apiPath = './api/?a=';
	this.rootPath = '';
	this.useJSONP = 0;
	this.selection = '';

	this.containerID = containerID;
	this.prefixID = 'empSel' + Math.floor(Math.random()*1000) + '_';
	this.timer = 0;
	this.q = '';
	this.isBusy = 1;
	this.backgroundImage = 'images/indicator.gif';
	this.intervalID = null;
	this.selectHandler = null;
	this.resultHandler = null;
	this.selectLink = null;
	this.selectionData = new Object();
	this.optionNoLimit = 0;
	this.currRequest = null;
	this.outputStyle = 'standard'; // standard / micro
	this.emailHref = false; // create link for email

	this.numResults = 0;
};

employeeSelector.prototype.initialize = function() {
    var t = this;
	$('#' + this.containerID).html('<div id="'+this.prefixID+'border" class="employeeSelectorBorder">\
			<div style="float: left"><img id="'+this.prefixID+'icon" src="'+ t.rootPath +'../libs/dynicons/?img=search.svg&w=16" class="employeeSelectorIcon" alt="search" />\
			<img id="'+this.prefixID+'iconBusy" src="'+ t.rootPath +'images/indicator.gif" style="display: none" class="employeeSelectorIcon" alt="busy" /></div>\
			<input id="'+this.prefixID+'input" type="search" class="employeeSelectorInput" aria-label="search input"></input></div>\
			<div id="'+this.prefixID+'result" aria-label="search results"></div>');

	$('#' + this.prefixID+ 'input').on('keydown', function(e) {
		t.showBusy();
		t.timer = 0;
		if(e.keyCode == 13) { // enter key
			t.search();
		}
	});

	this.showNotBusy();
    this.intervalID = setInterval(function(){t.search();}, 200);
};

employeeSelector.prototype.showNotBusy = function() {
	if(this.isBusy == 1) {
		$('#' + this.prefixID + 'icon').css('display', 'inline');
		$('#' + this.prefixID + 'iconBusy').css('display', 'none');
		this.isBusy = 0;
	}
};

employeeSelector.prototype.showBusy = function() {
	$('#' + this.prefixID + 'icon').css('display', 'none');
	$('#' + this.prefixID + 'iconBusy').css('display', 'inline');
	this.isBusy = 1;
};

employeeSelector.prototype.select = function(id) {
	this.selection = id;

	$.each($('.employeeSelected'), function(key, item) {
		$('#' + item.id).removeClass('employeeSelected');
		$('#' + item.id).addClass('employeeSelector');
	});

	$('#' + this.prefixID + 'emp' + id).removeClass('employeeSelector');
	$('#' + this.prefixID + 'emp' + id).addClass('employeeSelected');

	if(this.selectHandler != null) {
		this.selectHandler();
	}
};

employeeSelector.prototype.setSelectHandler = function(func) {
	this.selectHandler = func;
};

employeeSelector.prototype.setResultHandler = function(func) {
	this.resultHandler = func;
};

employeeSelector.prototype.setSelectLink = function(link) {
	this.selectLink = link;
};

employeeSelector.prototype.clearSearch = function() {
	$('#' + this.prefixID+ 'input').val('');
};

employeeSelector.prototype.forceSearch = function(query) {
	$('#' + this.prefixID + 'input').val(query.replace(/<[^>]*>/g, ''));
};

employeeSelector.prototype.hideInput = function() {
	$('#' + this.prefixID + 'border').css('display', 'none');
};

employeeSelector.prototype.showInput = function() {
	$('#' + this.prefixID + 'border').css('display', 'block');
};

employeeSelector.prototype.hideResults = function() {
	$('#' + this.prefixID + 'result').css('display', 'none');
};

employeeSelector.prototype.showResults = function() {
	$('#' + this.prefixID + 'result').css('display', 'inline');
};

employeeSelector.prototype.getSelectorFunction = function(empUID) {
	var t = this;
	return function() {
		t.select(empUID);
	};
};

employeeSelector.prototype.enableNoLimit = function() {
	this.optionNoLimit = 1;
};

employeeSelector.prototype.search = function() {
	if($('#' + this.prefixID + 'input').val() == undefined
		|| $('#' + this.prefixID + 'input') == null) {
		clearInterval(this.intervalID);
		return false;
	}
	this.timer += (this.timer > 5000) ? 0 : 200;

	if(this.timer > 300) {
	    var txt = $('#' + this.prefixID + 'input').val().replace(/<[^>]*>/g, '');

	    if(txt != "" && txt != this.q) {
	    	this.q = txt;

	    	if(this.currRequest != null) {
	    		this.currRequest.abort();
	    	}

	    	var ajaxOptions = {
		            url: this.apiPath + "employee/search",
		            dataType: 'json',
			    	data: {q: this.q,
			    			noLimit: this.optionNoLimit},
		            success: function(response) {
		            	t.currRequest = null;
		            	t.numResults = 0;
		            	t.selection = '';
		            	$('#' + t.prefixID + 'result').html('');
		            	var buffer = '';
		            	if(t.outputStyle == 'micro') {
		            		buffer = '<table class="employeeSelectorTable"><tr><th>Name</th><th>Contact</th></tr><tbody id="' + t.prefixID + 'result_table"></tbody></table>';
		            	}
		            	else {
		            		buffer = '<table class="employeeSelectorTable"><tr><th>Name</th><th>Location</th><th>Contact</th></tr><tbody id="' + t.prefixID + 'result_table"></tbody></table>';
		            	}

		            	$('#' + t.prefixID + 'result').html(buffer);

		            	if(response.length == 0) {
		            		$('#' + t.prefixID + 'result_table').append('<tr id="' + t.prefixID + 'emp0"><td style="font-size: 120%; background-color: white; text-align: center" colspan=3>No results for &quot;<span style="color: red">'+ txt +'</span>&quot;</td></tr>');
		            	}

		            	t.selectionData = new Object();
		            	for(var i in response) {
		                	t.selectionData[response[i].empUID] = response[i];

		                	var photo = response[i].data[1] != undefined && response[i].data[1].data != '' ? '<img class="employeeSelectorPhoto" src="' + t.rootPath + 'image.php?categoryID=1&amp;UID='+response[i].empUID+'&amp;indicatorID=1" alt="photo" />' : '';
		                	var positionTitle = response[i].positionData != undefined ? response[i].positionData.positionTitle : '';
		                	var groupTitle = '';

		                	if(response[i].serviceData != undefined
		                	    && response[i].serviceData[0] != undefined
		                	    && response[i].serviceData[0].groupTitle != null) {
		                		var counter = 0;
		                		var divide = '';
		                		for(var j in response[i].serviceData) {
		                			if(counter > 0) {
		                				divide = ' - ';
		                			}
		                			groupTitle += divide + (response[i].serviceData[j].groupAbbreviation == null ? response[i].serviceData[j].groupTitle : response[i].serviceData[j].groupAbbreviation) + '<br />';
		                			counter++;
		                		}
		                	}

		                	room = '';
		                	if(response[i].data[8] != undefined) {
		                		if(response[i].data[8].data != '') {
		                			room = response[i].data[8].data;
		                		}
		                	}
		                	var email = '';
		                	if(t.emailHref) {
		                		email = response[i].data[6] != undefined ? '<b>Email:</b> <a href="mailto:' + response[i].data[6].data + '" onclick="event.stopPropagation();">' + response[i].data[6].data + '</a><br />' : '';
		                	}
		                	else {
		                		email = response[i].data[6] != undefined ? '<b>Email:</b> ' + response[i].data[6].data + '<br />' : '';
		                	}

		                	var phone = response[i].data[5].data != '' ? '<b>Phone:</b> ' + response[i].data[5].data + '<br />' : '';
		                	var mobile = response[i].data[16].data != '' ? '<b>Phone:</b> ' + response[i].data[16].data + '<br />' : '';

		                	midName = response[i].middleName == '' ? '' : '&nbsp;' + response[i].middleName + '.';
		                	linkText = response[i].lastName + ', ' + response[i].firstName + midName;
		                	if(t.selectLink != null) {
		                		linkText = '<a href="'+ t.selectLink +'&empUID='+ response[i].empUID +'">' + linkText + '</a>';
		                	}

		                	if(t.outputStyle == 'micro') {
			                	$('#' + t.prefixID + 'result_table').append('<tr id="'+ t.prefixID + 'emp' + response[i].empUID +'">\
			                			<td class="employeeSelectorName" title="' + response[i].empUID + ' - ' + response[i].userName + '">' + photo + linkText + '<br /><span class="employeeSelectorTitle">'+ positionTitle +'</span></td>\
			                			<td class="employeeSelectorContact">'+ email + phone + mobile +'</td>\
			                			</tr>');
		                	}
		                	else {
			                	$('#' + t.prefixID + 'result_table').append('<tr id="'+ t.prefixID + 'emp' + response[i].empUID +'">\
			                			<td class="employeeSelectorName" title="' + response[i].empUID + ' - ' + response[i].userName + '">' + photo + linkText + '<br /><span class="employeeSelectorTitle">'+ positionTitle +'</span></td>\
		                    			<td class="employeeSelectorService">'+ groupTitle + '<span>' +  room + '</span></td>\
		                    			<td class="employeeSelectorContact">'+ email + phone + mobile +'</td>\
			                			</tr>');
		                	}

		                	$('#' + t.prefixID + 'emp' + response[i].empUID).addClass('employeeSelector');

		                	$('#' + t.prefixID + 'emp' + response[i].empUID).on('click', t.getSelectorFunction(response[i].empUID));
		                	t.numResults++;
		            	}

		            	if(t.numResults == 1) {
		            		t.selection = response[i].empUID;
		            	}

		            	if(t.numResults >= 5) {
		            		var resultColSpan = 3;
		                	if(t.outputStyle == 'micro') {
		                		resultColSpan = 2;
		                	}

		                	$('#' + t.prefixID + 'result_table').append('<tr id="'+ t.prefixID + 'tip">\
		                			<td class="employeeSelectorName" colspan="'+ resultColSpan +'" style="background-color: white; text-align: center; font-weight: normal">&#x1f4a1; Can&apos;t find someone? Trying searching their Email address</td>\
		                			</tr>');
		            	}

		            	if(t.resultHandler != null) {
		            		t.resultHandler();
		            	}

		                t.showNotBusy();
		            },
		            cache: false
		        };
	    	var t = this;
	    	if(this.useJSONP == 1) {
	    		ajaxOptions.url += '&format=jsonp';
	    		ajaxOptions.dataType = 'jsonp';
	    	}
	        this.currRequest = $.ajax(ajaxOptions);
	    }
	    else if(txt == "") {
	    	this.q = txt;
	    	$('#' + this.prefixID + 'result').html('');
	    	this.numResults = 0;
	    	this.selection = '';
	    	if(this.resultHandler != null) {
        		this.resultHandler();
        	}
	        this.showNotBusy();
	    }
	    else {
	    	this.showNotBusy();
	    }
	}
};
