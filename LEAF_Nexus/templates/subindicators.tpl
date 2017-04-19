    <!--{if !isset($depth)}-->
    <!--{assign var='depth' value=0}-->
    <!--{/if}-->

    <!--{if $depth == 0}-->
    <!--{assign var='color' value='#e0e0e0'}-->
    <!--{else}-->
    <!--{assign var='color' value='white'}-->
    <!--{/if}-->

    <!--{if $form}-->
    <div class="formblock">
    <!--{foreach from=$form item=indicator}-->

                <!--{if $indicator.format == null || $indicator.format == 'textarea'}-->
                <!--{assign var='colspan' value=2}-->
                <!--{else}-->
                <!--{assign var='colspan' value=1}-->
                <!--{/if}-->

                <!--{if $depth == 0}-->
        <div class="mainlabel">
            <div>
            <span>
                <b><!--{$indicator.name}--></b><br />
            </span>
            </div>
                <!--{else}-->
        <div class="sublabel">
            <span>
                    <!--{if $indicator.format == null}-->
                        <br /><b><!--{$indicator.name|indent:$depth:""}--></b>
                    <!--{else}-->
                        <br /><!--{$indicator.name|indent:$depth:""}-->
                    <!--{/if}-->
            </span>
                <!--{/if}-->
        </div>
        <div class="response">
        <!--{if $indicator.isMasked == 1 && $indicator.data != ''}-->
            <span class="text">
                [protected data]
            </span>
        <!--{/if}-->
        <!--{if $indicator.format == 'textarea' && ($indicator.isMasked == 0 || $indicator.data == '')}-->
            <span class="text">
                <br /><textarea rows="10" style="width: 99%" id="<!--{$indicator.indicatorID}-->" name="<!--{$indicator.indicatorID}-->"><!--{$indicator.data}--></textarea>
            </span>
        <!--{/if}-->
        <!--{if $indicator.format == 'radio' && ($indicator.isMasked == 0 || $indicator.data == '')}-->
                <span id="parentID_<!--{$indicator.parentID}-->">
                <!--{counter assign='ctr' print=false}-->
            <!--{foreach from=$indicator.options item=option}-->
                <!--{if is_array($option)}-->
                    <!--{assign var='option' value=$option[0]}-->
                    <!--{if $option == $indicator.data}-->
                        <br /><input type="radio" id="<!--{$indicator.indicatorID}-->_radio<!--{$ctr}-->" class="icheck<!--{$indicator.indicatorID}-->" name="<!--{$indicator.indicatorID}-->" value="<!--{$option}-->" checked="checked" />
                        <label class="checkable" for="<!--{$indicator.indicatorID}-->_radio<!--{$ctr}-->"><!--{$option}--></label>
                    <!--{else}-->
                        <br /><input type="radio" id="<!--{$indicator.indicatorID}-->_radio<!--{$ctr}-->" class="icheck<!--{$indicator.indicatorID}-->" name="<!--{$indicator.indicatorID}-->" value="<!--{$option}-->" />
                        <label class="checkable" for="<!--{$indicator.indicatorID}-->_radio<!--{$ctr}-->"><!--{$option}--></label>
                    <!--{/if}-->
                <!--{elseif $option == $indicator.data}-->
                    <br /><input type="radio" id="<!--{$indicator.indicatorID}-->_radio<!--{$ctr}-->" class="icheck<!--{$indicator.indicatorID}-->" name="<!--{$indicator.indicatorID}-->" value="<!--{$option}-->" checked="checked" />
                    <label class="checkable" for="<!--{$indicator.indicatorID}-->_radio<!--{$ctr}-->"><!--{$option}--></label>
                <!--{else}-->
                    <br /><input type="radio" id="<!--{$indicator.indicatorID}-->_radio<!--{$ctr}-->" class="icheck<!--{$indicator.indicatorID}-->" name="<!--{$indicator.indicatorID}-->" value="<!--{$option}-->" />
                    <label class="checkable" for="<!--{$indicator.indicatorID}-->_radio<!--{$ctr}-->"><!--{$option}--></label>
                <!--{/if}-->
                <!--{counter print=false}-->
            <!--{/foreach}-->
                </span>
                <script>
                $(function() {
//                    $('.icheck<!--{$indicator.indicatorID}-->').icheck({checkboxClass: 'icheckbox_square-blue', radioClass: 'iradio_square-blue'});
                });
                </script>
        <!--{/if}-->
        <!--{if $indicator.format == 'dropdown' && ($indicator.isMasked == 0 || $indicator.data == '')}-->
                <span><select id="<!--{$indicator.indicatorID}-->" name="<!--{$indicator.indicatorID}-->" style="width: 50%">
            <!--{foreach from=$indicator.options item=option}-->
                <!--{if is_array($option)}-->
                    <!--{assign var='option' value=$option[0]}-->
                    <!--{if $option == $indicator.data}-->
                        <option value="<!--{$option}-->" selected="selected"><!--{$option}--></option>
                    <!--{else}-->
                        <option value="<!--{$option}-->"><!--{$option}--></option>
                    <!--{/if}-->
                <!--{elseif $option == $indicator.data}-->
                    <option value="<!--{$option}-->" selected="selected"><!--{$option}--></option>
                    <!--{$option}-->
                <!--{else}-->
                    <option value="<!--{$option}-->"><!--{$option}--></option>
                <!--{/if}-->
            <!--{/foreach}-->
                </select></span>
                <script type="text/javascript">
                $('#<!--{$indicator.indicatorID}-->').chosen({disable_search_threshold: 5, allow_single_deselect: true, width: '80%'});
                </script>
        <!--{/if}-->
        <!--{if $indicator.format == 'text' && ($indicator.isMasked == 0 || $indicator.data == '')}-->
            <span class="text">
                <br /><input type="text" id="<!--{$indicator.indicatorID}-->" name="<!--{$indicator.indicatorID}-->" value="<!--{$indicator.data}-->" style="width: 50%" <!--{$indicator.html}--> />
            </span>
        <!--{/if}-->
        <!--{if $indicator.format == 'number' && ($indicator.isMasked == 0 || $indicator.data == '')}-->
            <span class="text">
                <br /><input type="text" id="<!--{$indicator.indicatorID}-->" name="<!--{$indicator.indicatorID}-->" value="<!--{$indicator.data}-->" <!--{$indicator.html}--> />
            </span>
            <script type="text/javascript">
            orgchartForm.dialog.setValidator(<!--{$indicator.indicatorID}-->, function() {
                return ($.isNumeric($('#<!--{$indicator.indicatorID}-->').val()) || $('#<!--{$indicator.indicatorID}-->').val() == '');
            });
            orgchartForm.dialog.setValidatorError(<!--{$indicator.indicatorID}-->, function() {
                alert('Data must be numeric.');
            });
            </script>
        <!--{/if}-->
        <!--{if $indicator.format == 'numberspinner' && ($indicator.isMasked == 0 || $indicator.data == '')}-->
            <span class="text">
                <br /><input type="text" id="<!--{$indicator.indicatorID}-->" name="<!--{$indicator.indicatorID}-->" value="<!--{$indicator.data}-->" <!--{$indicator.html}--> />
            </span>
            <script type="text/javascript">
            $('#<!--{$indicator.indicatorID}-->').spinner();
            </script>
        <!--{/if}-->
        <!--{if $indicator.format == 'date' && ($indicator.isMasked == 0 || $indicator.data == '')}-->
            <span class="text">
                <br /><input type="text" id="<!--{$indicator.indicatorID}-->" name="<!--{$indicator.indicatorID}-->" value="<!--{$indicator.data}-->" <!--{$indicator.html}--> />
                <script type="text/javascript">
                $('#<!--{$indicator.indicatorID}-->').datepicker();
                </script>
            </span>
        <!--{/if}-->
        <!--{if $indicator.format == 'time' && ($indicator.isMasked == 0 || $indicator.data == '')}-->
            <span class="text">
                <br /><input disabled="disabled" type="text" name="<!--{$indicator.indicatorID}-->" value="<!--{$indicator.data}-->" <!--{$indicator.html}--> />
            </span>
        <!--{/if}-->
        <!--{if $indicator.format == 'currency' && ($indicator.isMasked == 0 || $indicator.data == '')}-->
            <span class="text">
                <br /><input type="text" id="<!--{$indicator.indicatorID}-->" name="<!--{$indicator.indicatorID}-->" value="<!--{$indicator.data}-->" <!--{$indicator.html}--> /> (Amount in USD)
                <script type="text/javascript">
                orgchartForm.dialog.setValidator(<!--{$indicator.indicatorID}-->, function() {
                    return ($.isNumeric($('#<!--{$indicator.indicatorID}-->').val()) || $('#<!--{$indicator.indicatorID}-->').val() == '');
                });
                </script>
            </span>
        <!--{/if}-->
        <!--{if $indicator.format == 'checkbox' && ($indicator.isMasked == 0 || $indicator.data == '')}-->
                <span id="parentID_<!--{$indicator.parentID}-->">
                    <input type="hidden" name="<!--{$indicator.indicatorID}-->" value="no" /> <!-- dumb workaround -->
            <!--{foreach from=$indicator.options item=option}-->
                <!--{if $option == $indicator.data}-->
                    <br /><input dojoType="dijit.form.CheckBox" type="checkbox" name="<!--{$indicator.indicatorID}-->" value="<!--{$option}-->" checked="checked" />
                    <!--{$option}-->
                <!--{else}-->
                    <br /><input dojoType="dijit.form.CheckBox" type="checkbox" name="<!--{$indicator.indicatorID}-->" value="<!--{$option}-->" />
                    <!--{$option}-->
                <!--{/if}-->
            <!--{/foreach}-->
                </span>
        <!--{/if}-->
        <!--{if $indicator.format == 'checkboxes' && ($indicator.isMasked == 0 || $indicator.data == '')}-->
                <span id="parentID_<!--{$indicator.parentID}-->">
            <!--{assign var='idx' value=0}-->
            <!--{foreach from=$indicator.options item=option}-->
                    <input type="hidden" name="<!--{$indicator.indicatorID}-->[<!--{$idx}-->]" value="no" /> <!-- dumb workaround -->
                    <!--{if $option == $indicator.data[$idx]}-->
                        <br /><input dojoType="dijit.form.CheckBox" type="checkbox" name="<!--{$indicator.indicatorID}-->[<!--{$idx}-->]" value="<!--{$option}-->" checked="checked" />
                        <!--{$option}-->
                    <!--{else}-->
                        <br /><input dojoType="dijit.form.CheckBox" type="checkbox" name="<!--{$indicator.indicatorID}-->[<!--{$idx}-->]" value="<!--{$option}-->" />
                        <!--{$option}-->
                    <!--{/if}-->
                    <!--{assign var='idx' value=$idx+1}-->
            <!--{/foreach}-->
                </span>
        <!--{/if}-->
        <!--{if $indicator.format == 'fileupload' && ($indicator.isMasked == 0 || $indicator.data == '')}-->
            <fieldset>
                <legend>File Attachment</legend>
                <span class="text">
                <!--{if $indicator.data[0] != ''}-->
                <!--{assign "counter" 0}-->
                <!--{foreach from=$indicator.data item=file}-->
                <div style="background-color: #b7c5ff; padding: 4px"><img src="../libs/dynicons/?img=mail-attachment.svg&amp;w=16" /> <b>File Attached:</b> <a href="file.php?categoryID=<!--{$categoryID}-->&amp;UID=<!--{$UID}-->&amp;indicatorID=<!--{$indicator.indicatorID}-->&amp;file=<!--{$file|urlencode}-->" target="_blank"><!--{$file}--></a>
                    <div style="float: right; padding: 4px">
                    [ <span class="link" onclick="$('#fileDeleteIframe_<!--{$UID}-->_<!--{$indicator.indicatorID}-->_<!--{$categoryID}-->_<!--{$counter}-->').css('display', 'inline'); $('#fileDeleteIframe_<!--{$UID}-->_<!--{$indicator.indicatorID}-->_<!--{$categoryID}-->_<!--{$counter}-->').css('visibility', 'visible');">Delete</span> ]
                    </div>
                    <iframe id="fileDeleteIframe_<!--{$UID}-->_<!--{$indicator.indicatorID}-->_<!--{$categoryID}-->_<!--{$counter}-->" style="visibility: hidden; display: none" src="ajaxIframe.php?a=getdeleteprompt&amp;categoryID=<!--{$categoryID}-->&amp;UID=<!--{$UID}-->&amp;indicatorID=<!--{$indicator.indicatorID}-->&amp;file=<!--{$file|urlencode}-->" frameborder="0" width="440px" height="85px"></iframe>
                </div>
                <!--{assign "counter" $counter+1}-->
                <!--{/foreach}-->
                <iframe id="fileIframe_<!--{$UID}-->_<!--{$indicator.indicatorID}-->_<!--{$categoryID}-->" style="visibility: hidden; display: none" src="ajaxIframe.php?a=getuploadprompt&amp;categoryID=<!--{$categoryID}-->&amp;UID=<!--{$UID}-->&amp;indicatorID=<!--{$indicator.indicatorID}-->" frameborder="0" width="440px" height="85px"></iframe>
                <br />
                <span id="fileAdditional" class="buttonNorm" onclick="$('#fileIframe_<!--{$UID}-->_<!--{$indicator.indicatorID}-->_<!--{$categoryID}-->').css('display', 'inline'); $('#fileIframe_<!--{$UID}-->_<!--{$indicator.indicatorID}-->_<!--{$categoryID}-->').css('visibility', 'visible'); $('#fileAdditional').css('visibility', 'hidden')"><img src="../libs/dynicons/?img=document-open.svg&amp;w=32" /> Attach Additional File</span>
                <!--{else}-->
                    <iframe src="ajaxIframe.php?a=getuploadprompt&amp;categoryID=<!--{$categoryID}-->&amp;UID=<!--{$UID}-->&amp;indicatorID=<!--{$indicator.indicatorID}-->" frameborder="0" width="440px" height="85px"></iframe><br />
                <!--{/if}-->
                </span>
            </fieldset>
        <!--{/if}-->
        <!--{if $indicator.format == 'image' && ($indicator.isMasked == 0 || $indicator.data == '')}-->
            <fieldset>
                <legend>Photo Attachment</legend>
                <span class="text">
                <!--{if $indicator.data != ''}-->
                <div style="background-color: #b7c5ff; padding: 4px"><img src="../libs/dynicons/?img=mail-attachment.svg&amp;w=16" /> <b>Photo Attached:</b> <img src="image.php?categoryID=<!--{$categoryID}-->&amp;UID=<!--{$UID}-->&amp;indicatorID=<!--{$indicator.indicatorID}-->" style="max-width: 150px" alt="<!--{$indicator.data}-->" /></div>
                <div style="float: right; padding: 4px">
                [ <span class="link" onclick="$('#fileIframe_<!--{$UID}-->_<!--{$indicator.indicatorID}-->_<!--{$categoryID}-->').css('display', 'inline'); $('#fileIframe_<!--{$UID}-->_<!--{$indicator.indicatorID}-->_<!--{$categoryID}-->').css('visibility', 'visible');">Replace</span> | <span class="link" onclick="$('#fileDeleteIframe_<!--{$UID}-->_<!--{$indicator.indicatorID}-->_<!--{$categoryID}-->').css('display', 'inline'); $('#fileDeleteIframe_<!--{$UID}-->_<!--{$indicator.indicatorID}-->_<!--{$categoryID}-->').css('visibility', 'visible');">Delete</span> ]</div>
                <iframe id="fileDeleteIframe_<!--{$UID}-->_<!--{$indicator.indicatorID}-->_<!--{$categoryID}-->" style="visibility: hidden; display: none" src="ajaxIframe.php?a=getdeleteprompt&amp;categoryID=<!--{$categoryID}-->&amp;UID=<!--{$UID}-->&amp;indicatorID=<!--{$indicator.indicatorID}-->&amp;file=<!--{$indicator.data}-->" frameborder="0" width="440px" height="85px"></iframe>
                <iframe id="fileIframe_<!--{$UID}-->_<!--{$indicator.indicatorID}-->_<!--{$categoryID}-->" style="visibility: hidden; display: none" src="ajaxIframe.php?a=getuploadprompt&amp;categoryID=<!--{$categoryID}-->&amp;UID=<!--{$UID}-->&amp;indicatorID=<!--{$indicator.indicatorID}-->" frameborder="0" width="440px" height="85px"></iframe>
                <!--{else}-->
                    <iframe src="ajaxIframe.php?a=getuploadprompt&amp;categoryID=<!--{$categoryID}-->&amp;UID=<!--{$UID}-->&amp;indicatorID=<!--{$indicator.indicatorID}-->" frameborder="0" width="440px" height="85px"></iframe><br />
                <!--{/if}-->
                </span>
            </fieldset>
        <!--{/if}-->
        <!--{if $indicator.format == 'table' && ($indicator.isMasked == 0 || $indicator.data == '')}-->
            <!--{foreach from=$indicator.options item=option}-->
                <!--{if is_array($option)}-->
                    <!--{assign var='option' value=$option[0]}-->
                    <!--{$option}--> <input type="checkbox" name="<!--{$indicator.indicatorID}-->[]" value="<!--{$option}-->" checked="checked" /><br />
                <!--{else}-->
                    <!--{$option}--> <input type="checkbox" name="<!--{$indicator.indicatorID}-->[]" value="<!--{$option}-->" /><br />
                <!--{/if}-->
            <!--{/foreach}-->
        <!--{/if}-->
        <!--{if $indicator.format == 'orgchart_position' && ($indicator.isMasked == 0 || $indicator.data == '')}-->
            <!--{if $indicator.data != ''}-->
            <div dojoType="dijit.layout.ContentPane" id="indata_<!--{$indicator.indicatorID}-->_<!--{$indicator.series}-->" style="padding: 0px">
            <script type="dojo/method">
                dojo.xhrGet({
                    url: "<!--{$orgchartPath}-->/api/?a=position/<!--{$indicator.data}-->",
                    handleAs: 'json',
                    load: function(data, args) {
                        // IE7 workaround requires anchors to be manually created through DOM...
                        dojo.byId('indata_<!--{$indicator.indicatorID}-->_<!--{$indicator.series}-->').innerHTML = '<b>' + data.title + '</b>'
                            /* Pay Plan, Series, Pay Grade */ + '<br />' + data[2].data + '-' + data[13].data + '-' + data[14].data;

                        if(data[3].data != '') {
                            for(var i in data[3].data) {
                                var pdLink = document.createElement('a');
                                pdLink.innerHTML = data[3].data[i];
                                pdLink.setAttribute('href', '<!--{$orgchartPath}-->/file.php?categoryID=2&UID=<!--{$indicator.data}-->&indicatorID=3&file=' + encodeURIComponent(data[3].data[i]));
                                pdLink.setAttribute('class', 'printResponse');
                                pdLink.setAttribute('target', '_blank');

                                dojo.byId('indata_<!--{$indicator.indicatorID}-->_<!--{$indicator.series}-->').innerHTML += '<br />Position Description: ';
                                dojo.byId('indata_<!--{$indicator.indicatorID}-->_<!--{$indicator.series}-->').appendChild(pdLink);
                            }
                        }

                        br = document.createElement('br');
                        dojo.byId('indata_<!--{$indicator.indicatorID}-->_<!--{$indicator.series}-->').appendChild(br);

                        var ocLink = document.createElement('div');
                        ocLink.innerHTML = '<img src="../libs/dynicons/?img=preferences-system-windows.svg&w=32" alt="View Position Details" /> View Details in Org. Chart';
                        ocLink.setAttribute('onclick', "window.open('<!--{$orgchartPath}-->/?a=view_position&positionID=<!--{$indicator.data}-->','Resource_Request','width=870,resizable=yes,scrollbars=yes,menubar=yes');");
                        ocLink.setAttribute('class', 'buttonNorm');
                        ocLink.setAttribute('style', 'margin-top: 8px');
                        dojo.byId('indata_<!--{$indicator.indicatorID}-->_<!--{$indicator.series}-->').appendChild(ocLink);
                    },
                    preventCache: true
                });
            </script>
            Loading...
            </div>
            <!--{else}-->
            Unassigned
            <div id="posSel_<!--{$indicator.indicatorID}-->"></div>
            <div dojoType="dijit.form.TextBox" id="<!--{$indicator.indicatorID}-->" name="<!--{$indicator.indicatorID}-->" style="visibility: hidden">
            <script type="dojo/method">
                if(typeof positionSelector == 'undefined') {
                    // I am so upset with IE7
                    if(document.createStyleSheet) {
                        document.createStyleSheet('<!--{$orgchartPath}-->/css/positionSelector.css');
                        dojo.xhrGet({
                            url: "<!--{$orgchartPath}-->/js/positionSelector.js",
                            handleAs: 'text',
                            load: function(response) {
                                eval(response);
                                posSel = new positionSelector('posSel_<!--{$indicator.indicatorID}-->');
                                posSel.apiPath = '<!--{$orgchartPath}-->/api/';
                                posSel.enableEmployeeSearch();

                                posSel.setSelectHandler(function() {
                                    dojo.byId('<!--{$indicator.indicatorID}-->').value = posSel.selection;
                                });

                                posSel.initialize();
                            }
                        });                        
                    }
                    else {
                        dojo.create('style', {type: 'text/css', media: 'screen', innerHTML: '@import "<!--{$orgchartPath}-->/css/positionSelector.css";'}, document.getElementsByTagName('head')[0]);
                        dojo.xhrGet({
                            url: "<!--{$orgchartPath}-->/js/positionSelector.js",
                            handleAs: 'javascript',
                            load: function() {
                                posSel = new positionSelector('posSel_<!--{$indicator.indicatorID}-->');
                                posSel.apiPath = '<!--{$orgchartPath}-->/api/';
                                posSel.enableEmployeeSearch();

                                posSel.setSelectHandler(function() {
                                    dojo.byId('<!--{$indicator.indicatorID}-->').value = posSel.selection;
                                });

                                posSel.initialize();
                            }
                        });
                    }
                }
                else {
                    posSel = new positionSelector('posSel_<!--{$indicator.indicatorID}-->');
                    posSel.apiPath = '<!--{$orgchartPath}-->/api/';
                    posSel.enableEmployeeSearch();

                    posSel.setSelectHandler(function() {
                        dojo.byId('<!--{$indicator.indicatorID}-->').value = posSel.selection;
                    });

                    posSel.initialize();
                }
            </script>
            
            </div>

            <!--{/if}-->
        <!--{/if}-->
        <!--{if $indicator.format == 'orgchart_employee' && ($indicator.isMasked == 0 || $indicator.data == '')}-->
            <div id="empSel_<!--{$indicator.indicatorID}-->"></div>
            <div dojoType="dijit.form.TextBox" id="<!--{$indicator.indicatorID}-->" name="<!--{$indicator.indicatorID}-->" style="visibility: hidden">
            
            <script type="dojo/method">
                if(typeof employeeSelector == 'undefined') {
                    // I am so upset with IE7
                    if(document.createStyleSheet) {
                        document.createStyleSheet('<!--{$orgchartPath}-->/css/employeeSelector.css');
                        dojo.xhrGet({
                            url: "<!--{$orgchartPath}-->/js/employeeSelector.js",
                            handleAs: 'text',
                            load: function(response) {
                                eval(response);
                                empSel = new employeeSelector('empSel_<!--{$indicator.indicatorID}-->');
                                empSel.apiPath = '<!--{$orgchartPath}-->/api/';
                                empSel.rootPath = '<!--{$orgchartPath}-->/';

                                empSel.setSelectHandler(function() {
                                    dojo.byId('<!--{$indicator.indicatorID}-->').value = empSel.selection;
                                });

                                empSel.initialize();
                            }
                        });                        
                    }
                    else {
                        dojo.create('style', {type: 'text/css', media: 'screen', innerHTML: '@import "<!--{$orgchartPath}-->/css/employeeSelector.css";'}, document.getElementsByTagName('head')[0]);
                        dojo.xhrGet({
                            url: "<!--{$orgchartPath}-->/js/employeeSelector.js",
                            handleAs: 'javascript',
                            load: function() {
                                empSel = new employeeSelector('empSel_<!--{$indicator.indicatorID}-->');
                                empSel.apiPath = '<!--{$orgchartPath}-->/api/';
                                empSel.rootPath = '<!--{$orgchartPath}-->/';

                                empSel.setSelectHandler(function() {
                                    dojo.byId('<!--{$indicator.indicatorID}-->').value = empSel.selection;
                                });

                                empSel.initialize();
                            }
                        });
                    }
                }
                else {
                    empSel = new employeeSelector('empSel_<!--{$indicator.indicatorID}-->');
                    empSel.apiPath = '<!--{$orgchartPath}-->/api/';
                    empSel.rootPath = '<!--{$orgchartPath}-->/';

                    empSel.setSelectHandler(function() {
                        dojo.byId('<!--{$indicator.indicatorID}-->').value = empSel.selection;
                    });

                    empSel.initialize();
                }
            </script>
            </div>
        <!--{/if}-->
        <!--{if $indicator.format == 'json'}-->
            <span class="text">
                This field is reserved for programmer use.<br /><br />
                <pre><!--{$indicator.data}--></pre>
            </span>
        <!--{/if}-->
        <div>
            <br />
            <fieldset><legend>Access Permissions</legend>
            <iframe src="ajaxIframe.php?a=permission&amp;categoryID=<!--{$categoryID}-->&amp;UID=<!--{$UID}-->&amp;indicatorID=<!--{$indicator.indicatorID}-->" frameborder="0" width="440px" height="140px"></iframe>
            </fieldset>
        </div>
        <!--{include file="subindicators.tpl" form=$indicator.child depth=$depth+4 recordID=$recordID}-->

        </div>
    <!--{/foreach}-->
    </div>
    <!--{/if}-->