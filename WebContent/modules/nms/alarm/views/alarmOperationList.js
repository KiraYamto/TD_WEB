define([
	'text!modules/nms/alarm/templates/alarmOperationList.html',
	'i18n!modules/nms/alarm/i18n/alarm.i18n',
	'modules/common/cloud-utils',
	'css!modules/nms/alarm/styles/alarmOperationList.css'
], function(viewTpl, i18n,utils,css) {
	var currentObj;
	var rowNum = 20;
	var moreSearchFormInitialed = false;
	var resizeLock = false; //窗口resize事件lock
	
	return fish.View.extend({
		template: fish.compile(viewTpl),
		i18nData: fish.extend({}, i18n),
		
		initialize:function(){
			currentObj = this;
			this.alarmGridId = "alarmGrid";
			console.log("initialize");
		},
		
		events: {
			"click #nms-alarm-alarmOperation-search": "searchBtnEven",
			"click #alarmConfirm":"openAlarmConfirmDialog",
			"click #nms_alarm_operation_redefineBtn":"openAlarmRedefineDialog",
			"click #nms_alarm_operation_sendOrderBtn":"openAlarmSendOrderDialog",
			"click #nms-alarm-operation-searchform-expand":'toggoleMoreSearchForm',
			"click #nms-alarm-operation-searchform-collapse":'toggoleMoreSearchForm',
			"click #alarmDetail":"toggoleAlarmDetail"		
		},
		
		_beforeRender:function(){
			console.log("_beforeRender");	
		},
		
		beforeRender:function(){
			console.log("beforeRender");
		},
		
	/*	render:function(){
			console.log("render");
		},*/
		//这里用来进行dom操作
		_render: function() {
			console.log("_render");
			this.$el.html(this.template(this.i18nData));
			this.$el.css({
				"height" : "100%"
			});
			var emsInfo = _.find(utils.getHash().params,function(o){
				return o.key=='emsId'
			});
			if(emsInfo){
				this.emsId = emsInfo.value;
			}
			return this;
		},
		
/*		afterRender:function(){
			console.log("afterRender");
		},*/
		
		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
		
			this.initAlarmGrid();
			this.loadAlarmGridData(1, rowNum, undefined, undefined);
			
			//初始化EMS
			this.$("#nms_alarm_operation_searchForm_emsId").combobox({
		        dataTextField: 'name',
		        dataValueField: 'id',
		        editable:true
		    });
			utils.ajax('emsService','queryEMS', {}).done($.proxy(function(data){
				this.$("#nms_alarm_operation_searchForm_emsId").combobox('option', 'dataSource', data);				
    		}, this));
			console.log("_afterRender");
		},
		
		getGridHeight:function(){
			//availableHeight = $(document.body).height() - utils.getHeadHeight(); //页面可用高度
			availableHeight = this.$el.height() - 1;
			
			 var searchFormHeight = this.$el.find("#nms_alarm_operation_toolbar").outerHeight(true);
			 var isVisible = this.$el.find("#" + this.moreSearchFormId).is(":visible");
			 var toolbarHeight = 0;
			 if(isVisible){
				 toolbarHeight = this.$el.find("#nms_alarm_operation_moreSearch_block").outerHeight(true);
			 }
			 return availableHeight - toolbarHeight - searchFormHeight;
		},
		
		toggoleMoreSearchForm:function(){
			this.moreSearchFormId = "nms_alarm_operation_moreSearch_block";
			var expandBtnId = "nms-alarm-operation-searchform-expand";
			var collapseBtnId = "nms-alarm-operation-searchform-collapse";
			
			var isVisible = this.$el.find("#" + this.moreSearchFormId).is(":visible");
			if(!isVisible){
				this.$el.find("#" + this.moreSearchFormId).show();
				this.$el.find("#" + expandBtnId).hide();
				this.$el.find("#" + collapseBtnId).show();
				$("#" + this.alarmGridId).grid('setGridHeight', this.getGridHeight());
				this.initMoreSearchForm();
			}else{
				this.$el.find("#" + this.moreSearchFormId).hide();
				this.$el.find("#" + expandBtnId).show();
				this.$el.find("#" + collapseBtnId).hide();
				$("#" + this.alarmGridId).grid('setGridHeight', this.getGridHeight());
			}
		},
		
		initMoreSearchForm:function(){
			if(moreSearchFormInitialed){
				return;
			}
			
			//初始化日期控件
			this.$el.find("#nms_alarm_operation_searchForm_beginTime,#nms_alarm_operation_searchForm_endTime").datetimepicker({
	            format: 'yyyy/mm/dd hh:ii:ss'
	        });
			
			//初始化告警级别
			this.$el.find("#nms_alarm_operation_searchForm_alarmLevelId").combobox({
		        dataTextField: 'name',
		        dataValueField: 'id',
		        editable:true
		    });
			utils.ajax('alarmService','queryAlarmLevel').done($.proxy(function(data){
				this.$("#nms_alarm_operation_searchForm_alarmLevelId").combobox('option', 'dataSource', data);		
		    }, this));
			
			//初始化告警大类
			this.$el.find("#nms_alarm_operation_searchForm_alarmBigTypeId").combobox({
		        dataTextField: 'name',
		        dataValueField: 'id',
		        editable:true
		    });
			utils.ajax('catalogService','queryCatalog', 2, 11).done($.proxy(function(data){
				this.$("#nms_alarm_operation_searchForm_alarmBigTypeId").combobox('option', 'dataSource', data);		
    		} ,this));		
			
			//初始化区域Combotree
			this.initAreaCombotree();
			moreSearchFormInitialed = true;
		},
		
		initAreaCombotree:function(){
			var options = {
				check: {
					enable: true,
					chkStyle:'radio',
					radioType: "all"
				},
				view: {
					dblClickExpand: false
				},
				data: {
					simpleData: {
						enable: true
					}
				},
				callback: {
					onCheck: onCheck
				}
			};
			
			$("#nms_alarm_operation_searchForm_areaTree").tree(options);
			$("#nms_alarm_operation_searchForm_area_label").click(function(){
				showMenu();
			});
			$("#menuBtn").click(function() {
				var isShowed = $('#nms_alarm_operation_searchForm_area_label').data('showed');
				if(isShowed && isShowed == 1){
					hideMenu();
					$('#nms_alarm_operation_searchForm_area_label').data('showed',-1);
				}else{
					$('#nms_alarm_operation_searchForm_area_label').data('showed',1);
					showMenu();
					return false;
				}
			});
			var areaId =this.$el.find("#nms_alarm_operation_searchForm_area_label");
			$("#tree_select_menu_checkbox_html").position({
				of: areaId,
				my: "left bottom",
				at: "left top"
			}).hide();
			$("#nms_alarm_operation_searchForm_areaTree").width($("#nms_alarm_operation_areaTree_group").width() - 10);
			
			function onCheck(e, treeNode) {
				var nodes = $("#nms_alarm_operation_searchForm_areaTree").tree("getCheckedNodes",true);
					var label = "";
					var value = "";
					
				for (var i=0, l=nodes.length; i<l; i++) {
					label += nodes[i].name + ",";
					value += nodes[i].id + ",";
				}
				if (label.length > 0 ) label = label.substring(0, label.length-1);
				if (value.length > 0 ) value = value.substring(0, value.length-1);
				if(value){
					value = value.split("_")[1];
				}	
				var cityObj = $("#nms_alarm_operation_searchForm_area_label").val(label);
				var cityObj = $("#nms_alarm_operation_searchForm_area_id").val(value);			
				hideMenu();
			}
			
			function showMenu() {
				$("#tree_select_menu_checkbox_html").show();
				$("body").on("mousedown", onBodyDown);
			}
			function hideMenu() {
				$("#tree_select_menu_checkbox_html").fadeOut();
				$("body").off("mousedown", onBodyDown);
			}
			function onBodyDown(event) {
				if (!(event.target.id == "menuBtn" || event.target.id == "nms_alarm_operation_searchForm_area_label" || $(event.target).find('#nms_alarm_operation_searchForm_areaTree').length>0 
					|| $(event.target).parents("#menuContent").length>0 || event.target.id.indexOf("nms_alarm_operation_searchForm_areaTree") != -1)) {				
					hideMenu();
				}
			}			
			$("#nms_alarm_operation_searchForm_area_label").bind('change', function(){			
				if($(this).val() == ""){
					$("#nms_alarm_operation_searchForm_area_id").val(undefined);
				}
			})
			
			//加载数据
			utils.ajax('resourceTreeService','loadResourceTreeByEMSPath',null,null,null,null,null).done($.proxy(function(data){					 
				this.$el.find("#nms_alarm_operation_searchForm_areaTree").tree('reloadData', data);				
				var allNodes= $("#nms_alarm_operation_searchForm_areaTree").tree("instance").getNodes();
				$("#nms_alarm_operation_searchForm_areaTree").tree('expandNode',allNodes[0],true);
			},this));
		},
		
		//初始化告警列表
		initAlarmGrid:function(){
			$("#" + this.alarmGridId).grid({
				datatype: "json",
				height: this.getGridHeight(),
				multiselect: false,
				rownumbers:false,
				colModel: [{
					name: 'areaName',
					label: '区域',
					width: 80
				},{
					name: 'title',
					label: '告警名称',
					width: 200
				},{
					name: 'alarmBigTypeValue',
					label: '告警大类',
					width: 100,
					align:'center'
				},{
					name: 'alarmLevelName',
					label: '告警级别',
					width: 100,
					align:'center',
					formatter: function(cellval, opts, row, _act){
						var bgColor = "";
						if (row.alarmLevelId == 5){
							bgColor = 'background-color:#FF0000;';
						}else if(row.alarmLevelId == 4){
							bgColor = 'background-color:#FFA500;';
						}else if(row.alarmLevelId == 3){
							bgColor = 'background-color:#FFFF00;';
						}else if(row.alarmLevelId == 2){
							bgColor = 'background-color:#00FFFF;';
						}else if(row.alarmLevelId == 1){
							bgColor = 'background-color:#800080;';
						}else if(row.alarmLevelId == 6){
							bgColor = 'background-color:#00FF00;';
						}
						return 	'<div style="width:100%;height:80%;text-align:center; line-height:25px; vertical-align:middel; color:#000000;'+bgColor+'" title='+cellval+'>'+cellval+'</div>';
						//return cellval;
					}
				},{
					name: 'objectName',
					label: '告警对象',
					width: 160
				},{
					name: 'dealWithStatusValue',
					label: '告警状态',
					width: 70,
					align:'center'
				},{
					name: 'meAlarmNo',
					label: '告警流水',
					width: 180
				},{
					name: 'emsName',
					label: 'EMS',
					width: 100
				},{
					name: 'firstAlarmTime',
					label: '告警时间',
					width: 135
				}],
				rowNum: rowNum,
				pager: true,
				server: true,
				pageData: $.proxy(this.loadAlarmGridData, this),
				onDblClickRow: function (e, rowid, iRow, iCol) {//双击行事件
					currentObj.openAlarmDetailDialog($(this).grid("getRowData")[iRow-1]);
				}
			});
		},
		
		initTabs:function(){
			 
		},
		
		loadAlarmGridData:function(page, rowNum, sortname, sortorder){
			this.$("#" + this.alarmGridId).blockUI({message: '加载中'}).data('blockui-content', true);
			
			var params = {emsId:this.emsId};
			var  searchFormParams =   $('#nms_alarm_operation_searchForm').form('value');
			$.extend(params, searchFormParams);
			
			utils.ajax('alarmService','queryAlarmInfoByQuery',params, page,rowNum).done(function(data){
				var result = {
						"rows": data.objects,
						"page": page,
						"total": data.totalPage,
						"records":data.totalNumber,
						"id": "id"
				};
				$("#alarmGrid").grid("reloadData", result);
				currentObj.$("#" + currentObj.alarmGridId).unblockUI().data('blockui-content', false);
			});
		},
		
		/**
		 * 查询按钮事件
		 */
		searchBtnEven:function(){
			currentObj.loadAlarmGridData(1, rowNum, undefined, undefined);
		},
		
		/**
		 * 打开告警确认对话框
		 */
		openAlarmConfirmDialog:function(){
			var selectedRow = this.$el.find("#alarmGrid").grid("getSelection");
			if(!selectedRow || !selectedRow.id){
				fish.info('请选择告警数据！');
				return;
			}
			var pop =fish.popupView({
				url: 'modules/nms/alarm/views/alarmConfirm',
				width: "45%",
				modal: true,
				draggable: true,
				autoResizable: true,
				viewOption:{alarmInstanceId:selectedRow["id"]}, //参数
				close:function(){//关闭事件
				},
				dismiss:$.proxy(function(data){//dismiss事件
					if(data && data.action && data.action == 'loadData'){
						this.loadAlarmGridData(1, rowNum, undefined, undefined);
					}
				},this)
			});
		},
		
		/**
		 * 打开告警重定义对话框
		 */
		openAlarmRedefineDialog:function(){
			var selectedRow = this.$el.find("#alarmGrid").grid("getSelection");
			if(!selectedRow || !selectedRow.id){
				fish.info('请选择告警数据！');
				return;
			}
			var pop =fish.popupView({
				url: 'modules/nms/alarm/views/alarmRedefineView',
				width: "45%",
				modal: true,
				draggable: true,
				autoResizable: true,
				viewOption:{alarmInstanceId:selectedRow["id"]}, //参数
				close:function(){//关闭事件
				},
				dismiss:$.proxy(function(data){//dismiss事件
					if(data && data.action && data.action == 'loadData'){
						this.loadAlarmGridData(1, rowNum, undefined, undefined);
					}
				},this)
			});
		},
		
		/**
		 * 打开告警派单对话框
		 */
		openAlarmSendOrderDialog:function(){
			var selectedRow = this.$el.find("#alarmGrid").grid("getSelection");
			if(!selectedRow || !selectedRow.id){
				fish.info('请选择告警数据！');
				return;
			}
			var pop =fish.popupView({
				url: 'modules/nms/alarm/views/alarmSendOrderView',
				width: "45%",
				modal: true,
				draggable: true,
				autoResizable: true,
				viewOption:{alarmInstanceId:selectedRow["id"], dealWithStatusId:selectedRow["dealWithStatusId"]}, //参数
				close:function(){//关闭事件
				},
				dismiss:$.proxy(function(data){//dismiss事件
					if(data && data.action && data.action == 'loadData'){
						this.loadAlarmGridData(1, rowNum, undefined, undefined);
					}
				},this)
			});
		},
		
		toggoleAlarmDetail:function(){
			var selectedRow = this.$el.find("#alarmGrid").grid("getSelection");
			if(!selectedRow || !selectedRow.id){
				fish.info('请选择告警数据！');
				return;
			}	
			currentObj.openAlarmDetailDialog(selectedRow);
		},		
		
		openAlarmDetailDialog:function(selectRow){
			var pop =fish.popupView({url: 'modules/nms/alarm/views/alarmDetailsList',
				viewOption:{rowData:selectRow},
				width: "75%",
				callback:function(popup,view){
					popup.result.then(function (e) {
						console.log(e);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
		},
		
		resize:function(){
			console.log("info:resize...");
			if(!resizeLock){
				resizeLock = true;
				currentObj.relayout();
				
				setTimeout(function(){
					resizeLock = false;
				} , 500);
			}
		},
		
		relayout:function(){
			this.$("#" + this.alarmGridId).grid('setGridHeight', this.getGridHeight());
			console.log("info:relayout...");
		}
	});
});