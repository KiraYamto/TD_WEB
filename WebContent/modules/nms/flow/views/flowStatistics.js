define([
	'text!modules/nms/flow/templates/flowStatistics.html',
	'i18n!modules/nms/flow/i18n/flow.i18n',
	'modules/common/cloud-utils',
	'css!modules/nms/flow/styles/flowManage.css'
], function(viewTpl, i18n,utils,css) {
	var currentObj;
	var rowNum = 10;
	var availableHeight;
	var currBtn = '';
	var currData;
	var hisData;
	
	return fish.View.extend({
		template: fish.compile(viewTpl),
		i18nData: fish.extend({}, i18n),
		
		initialize:function(){
			currentObj = this;
			console.log("initialize");
		},
		
		
		events: {
			"click #nms_flow_curr_port": "portFlowBtnEven",
			"click #nms_flow_week_his_port":"hisPortFlowBtnEven",
			"click #nms_flow_statistics_searchBtn": "searchBtnEven",
			"click #nms_flow_statistics_resetBtn": "resetBtnEven"
		},
		
		_beforeRender:function(){
			console.log("_beforeRender");	
		},
		
		beforeRender:function(){
			console.log("beforeRender");
		},

		//这里用来进行dom操作
		_render: function() {
			console.log("_render");
			this.$el.html(this.template(this.i18nData));
			
			return this;
		},
		
		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this.layout();
			this.initSearchForm();
			this.initAlarmGrid();
			this.loadPortFlowStatistics({});			
			console.log("_afterRender");
		},	
		
		layout:function(){
			//计算屏幕高度
			availableHeight = $(document.body).height() - 190; //页面可用高度
			$("#nms_flow_port_statistics").height(availableHeight);
		},
		
		initSearchForm:function(){
			
			//初始化日期控件
			$("#nms_flow_statistics_beginTime,#nms_flow_statistics_endTime").datetimepicker({
	            format: 'yyyy/mm/dd hh:ii:ss'
	        });
		},
		
		//初始化告警列表
		initAlarmGrid:function(){
			$("#nms_flow_port_statistics").grid({
				colModel: [{
					name: 'id',
					label: '序号',
					width: 60
				},{
					name: 'me_name',
					label: '网元名称',
					width: 160
				},{
					name: 'port_name',
					label: '端口名称',
					width: 160
				},{
					name: 'all_flow',
					label: '总流量（G）',
					width: 160,
					formatter:function(cellval, opts, rwdat, _act) {
						return (cellval/1024/1024/1024).toFixed(2);
					}
				},{
					name: 'all_out_flow',
					label: '总出流量（G）',
					width: 160,
					formatter:function(cellval, opts, rwdat, _act) {
						return (cellval/1024/1024/1024).toFixed(2);
					}
				},{
					name: 'all_in_flow',
					label: '总入流量（G）',
					width: 160,
					formatter:function(cellval, opts, rwdat, _act) {
						return (cellval/1024/1024/1024).toFixed(2);
					}
				},{
					name: '',
					width: 40,
					formatter:function(cellval, opts, rwdat, _act) {
						//window.console.log(rwdat);
						var objId = rwdat.object_id;
						var meName = rwdat.me_name;
						var portName = rwdat.port_name;
						if (meName == '查无数据')return "";
						objId = currentObj.replaceUrlParma(objId);
						meName = currentObj.replaceUrlParma(meName);
						portName = currentObj.replaceUrlParma(portName);						
						return '<a href="#/straManagement/nms_net_data_manage/nms_port_data_monitor?'
						+'portObjId='+objId
						+'&meName='+meName
						+'&portName='+portName
						+'" '
						+'title="查看最近出入流量"'
						+'>'+
						'<span class="glyphicon glyphicon glyphicon-eye-open"></span></a>';
/*						return '<a href="javasrcipt:void();" id="nms_port_eye_id_'+objId+'">'+
						'<span class="glyphicon glyphicon glyphicon-eye-open"></span></a>';*/
					}
				}],
				rowNum: 10
				//data:this.loadPortFlowStatistics('currKpi')
				//pageData: this.loadAlarmGridData
			});						
		},
		
		replaceUrlParma:function(str) {
			if (!str)return "";
			str=str.replace(/\%/g,"%25");
			str=str.replace(/\#/g,"%23");
			str=str.replace(/\&/g,"%26");
			str=str.replace(/\+/g,"%2B");
			str=str.replace(/\ /g,"%20");
			str=str.replace(/\//g,"%2F");
			str=str.replace(/\?/g,"%3F");
			str=str.replace(/\=/g,"%3D");
			return str;
		},
		
		bindPortEyeClick:function() {
			var arrs = document.getElementsByTagName("a");
			for(var i=0;i<arrs.length;i++){
				if (arrs[i].id.indexOf("nms_port_eye_id_")!=-1){
					//alert(arrs[i].id);
					var aId = arrs[i].id;
					//alert(portObjId);
					document.getElementById(aId).onclick = function(){
						var portObjId = aId.substring("nms_port_eye_id_".length, aId.length);
						var currhref = "#/requManagement/flowManage/flowStatisticsView";
						location.hash=currhref;
						var href = "#/requManagement/flowManage/flowManageView?portObjId="+portObjId;
				        //window.open(href);
						location.hash=href;
					}
				}
			}
		},
		
		/**
		 * 查询按钮事件
		 */
		searchBtnEven:function(){
			var formData = $('#nms_flow_statistics_searchForm').form('value');
			var newFormData = {
					beginTime:formData.nms_flow_statistics_beginTime,
					endTime:formData.nms_flow_statistics_endTime
			}
			if ((""!=formData.nms_flow_statistics_beginTime&&""!=formData.nms_flow_statistics_endTime)
					&& (formData.nms_flow_statistics_beginTime > formData.nms_flow_statistics_endTime)) {
				fish.info('开始时间比结束时间晚，请调整。');
				return;
			}
			//window.console.log(formData);
			if (currBtn == 'current') {
				currBtn = "";
				currData = null;
				currentObj.loadPortFlowStatistics(newFormData);
				if (""==formData.nms_flow_statistics_beginTime && ""==formData.nms_flow_statistics_endTime) {
					currentObj.initCurrModeDateBtn();
				}			
			}else if (currBtn == 'history') {
				currBtn = "";
				hisData = null;
				currentObj.loadHisPortFlowStatistics(newFormData);
				if (""==formData.nms_flow_statistics_beginTime && ""==formData.nms_flow_statistics_endTime) {
					currentObj.initHisModeDateBtn();
				}					
			}
		},
		
		/**
		 * 重置按钮事件
		 */
		resetBtnEven:function() {	
			if (currBtn == 'current') {
				currentObj.initCurrModeDateBtn();
			}else if (currBtn == 'history') {
				currentObj.initHisModeDateBtn();
			}
		},
		
		initCurrModeDateBtn:function() {
			var formdeal= document.getElementById("nms_flow_statistics_searchForm");
			formdeal.reset();
		},
		
		initHisModeDateBtn:function() {
	        var currTime = new Date();
	        $("#nms_flow_statistics_endTime").datetimepicker("value", currTime);

	        var WeekFirstDay = new Date(currTime-currTime.getDay()*24*60*60*1000);
	        WeekFirstDay.setHours("0");
	        WeekFirstDay.setMinutes("0");
	        WeekFirstDay.setSeconds("0");
	        $("#nms_flow_statistics_beginTime").datetimepicker("value", WeekFirstDay);
		},
		
		
		portFlowBtnEven:function() {
			currentObj.initCurrModeDateBtn();
			currentObj.loadPortFlowStatistics({});			
		},
		
		hisPortFlowBtnEven:function() {
			currentObj.initHisModeDateBtn();
			var formData = $('#nms_flow_statistics_searchForm').form('value');
			var newFormData = {
					beginTime:formData.nms_flow_statistics_beginTime,
					endTime:formData.nms_flow_statistics_endTime
			}
			currentObj.loadHisPortFlowStatistics(newFormData);			
		},
		
		
		loadPortFlowStatistics:function(params){
			if (currBtn == 'current') return;
			document.getElementById('nms_flow_week_his_port').style.backgroundColor="rgb(217,217,217)";  
			document.getElementById('nms_flow_week_his_port').style.borderColor="rgb(217,217,217)";  
			document.getElementById('nms_flow_curr_port').style.backgroundColor="rgb(92,184,92)";  
			document.getElementById('nms_flow_curr_port').style.borderColor="rgb(92,184,92)";  
			currBtn = 'current';
			if (false) {
				$("#nms_flow_port_statistics").grid("reloadData", currData);
				currBtn = 'current';
			} else {
				if(!params.beginTime && !params.beginTime){
					params = {};
				} 
				utils.ajax('kpiInfoService','loadPortFlowStatisticsTopList', params, 'Kpi_info', 10).done(function(data){
					if (data && data.length > 0) {
						$("#nms_flow_port_statistics").grid("reloadData", data);	
						window.console.log(data);
						currData = data;
					}else {
						var nullDataList = [];
						var nulldata = {
								id:0,
								me_name:'查无数据',
								port_name:'-',
								all_flow:'-',
								all_in_flow:'-',
								all_out_flow:'-',
								object_id:"-"
						}
						nullDataList.push(nulldata);
						$("#nms_flow_port_statistics").grid("reloadData", nullDataList);	
					}
				});
			}		
			//document.getElementById('nms_flow_curr_port').disabled = true;
			//document.getElementById('nms_flow_week_his_port').disabled = false;	
		},
		
		loadHisPortFlowStatistics:function(params){
			if (currBtn == 'history') return;
			document.getElementById('nms_flow_curr_port').style.backgroundColor="rgb(217,217,217)";  
			document.getElementById('nms_flow_curr_port').style.borderColor="rgb(217,217,217)";  
			document.getElementById('nms_flow_week_his_port').style.backgroundColor="rgb(91,192,222)";  
			document.getElementById('nms_flow_week_his_port').style.borderColor="rgb(91,192,222)";  
			currBtn = 'history';  
			if (false) {
				$("#nms_flow_port_statistics").grid("reloadData", hisData);		
				currBtn = 'history';  		
			} else {
				if(!params.beginTime && !params.beginTime){
					params = {};
				}
				utils.ajax('kpiInfoService','loadPortFlowStatisticsTopList', params, 'kpi_info_his', 10).done(function(data){
					if (data && data.length > 0) {
						$("#nms_flow_port_statistics").grid("reloadData", data);						
						hisData = data;
					}else {
						var nullDataList = [];
						var nulldata = {
								id:0,
								me_name:'查无数据',
								port_name:'-',
								all_flow:'-',
								all_in_flow:'-',
								all_out_flow:'-',
								object_id:"-"
						}
						nullDataList.push(nulldata);
						$("#nms_flow_port_statistics").grid("reloadData", nullDataList);	
					}
				});
			}
		}
	});
});