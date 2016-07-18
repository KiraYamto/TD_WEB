define([
        'text!modules/nms/alarm/templates/alarmDetailList.html',
        'i18n!modules/nms/alarm/i18n/alarm.i18n',
        'modules/common/cloud-utils',
        'css!modules/nms/alarm/styles/alarmDetailList.css'
        ], function(ViewTpl, i18n,utils,css) {
       
       var currentObj;
       var $gridList;
       var $OperationgridList;

	return fish.View.extend({
		
		template: fish.compile(ViewTpl),
		i18nData: fish.extend({}, i18n),

	    initialize:function(){
	    	currentObj=this;
	  
	    },

		events: {
		},
		
		_beforeRender:function(){
			console.log("_beforeRender");	
		},
		
		beforeRender:function(){
			console.log("beforeRender");
		},
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {

			//初始化scrollspy
			$('#nms_alarm_alarmDetail_scrollspy').scrollspy({
				target:".navbar-collapse"
			});			


			currentObj.initDetailInfo();
            currentObj.initAlarmDispatchInfo();

            currentObj.initAlarmExtendInfo();
            currentObj.loadData(1, 20, null, null, null);

            currentObj.initOperationLog();
            currentObj.loadOperationLog(1, 20, null, null, null);

            currentObj.initAlarmInfo();
		},

        initAlarmInfo:function(){
 			utils.ajax('alarmService','queryAlarmInfoById',this.options.rowData.id).done(function(alarmInfo){
				$('#nms_alarm_alarmDetail_alarmInfoform').form('value',alarmInfo);
			});	       	
        }, 
    

		initDetailInfo:function(){
            if(this.options.rowData.objectTypeId=='7'){//端口
	            $('#nms_alarm_alarmDetail_resourceform').hide();
				$('#nms_alarm_alarmDetail_tpform').show();
				utils.ajax('terminalPortService','queryTerminalPort',this.options.rowData.objectId).done(function(tp){
					$('#nms_alarm_alarmDetail_tpform').form('value',tp);
				});					
            }
            else if(this.options.rowData.objectTypeId=='2'){//网元
                $('#nms_alarm_alarmDetail_resourceform').show();
			    $('#nms_alarm_alarmDetail_tpform').hide(); 
				utils.ajax('elementService','queryElementByObjId',this.options.rowData.objectId).done(function(element){
					$('#nms_alarm_alarmDetail_resourceform').form('value',element);
				});	
            }			
		},

		initAlarmDispatchInfo:function(){
			utils.ajax('alarmGroupService','queryAlarmGroupByInstanceId',this.options.rowData.id).done(function(alarmGroup){
				$('#nms_alarm_alarmDetail_groupform').form('value',alarmGroup);
			});	
		},

		initAlarmExtendInfo:function(){
    		var opt={
				datatype: "json",
				height:300,
				colModel: [{
					name: 'paraName',
					label: '告警参数',
					width: 200
				},{
					name : "paraValue",
					label : '告警参数值',
					width : 150
				}],			
				rowNum: 20,
				pager: true,
				server: true,
				pageData: currentObj.loadData
		   };

			$gridList=$('#nms_alarm_alarmDetail_extInfo').grid(opt);
		},

         initOperationLog:function(){
         	 var Operation_opt={
				datatype: "json",
				height:300,
				colModel: [{
					name: 'logId',
					label: '日志序号',
					width: 150,
					hidden :true
				},{
					name : "operationTypeName",
					label : '操作类型名称',					
					width : 200
				},{
					name : "logTimeStr",
					label : '日志时间',
					width : 300
				},{
					name : "operationInfo",
					label : '操作内容',
					resizable:true,
					width : 500
				},{
					name : "operatorName",
					label : '操作人',
					width : 200
				},{
					name : "comments",
					label : '备注',
					width : 250
				}],			
				rowNum: 20,
				pager: true,
				server: true,
				shrinkToFit: false,
				pageData: currentObj.loadOperationLog
		    };

			$OperationgridList=$('#nms_alarm_alarmDetail_operationLog').grid(Operation_opt);
         
         
         },


		loadData:function(page, rowNum, sortname, sortorder, params){
			utils.ajax('alarmExtendInfoService','loadAlarmDetail',this.options.rowData.emsId,this.options.rowData.meAlarmNo,false).done(function(alarmExtendInfo){
				var result = {
						"rows": alarmExtendInfo.objects,
						"page": page,
						"total": alarmExtendInfo.totalPage,
						"records":alarmExtendInfo.totalNumber,
						"id": "id"
				};				
				$gridList.grid("reloadData", result);
			});				
		},

		loadOperationLog:function(page, rowNum, sortname, sortorder, params){
			params={
                 alarmInstanceId:this.options.rowData.id,
                 isHistory:false
			};
			utils.ajax('alarmOperationLogService','loadAlarmOperationLog',params,page,rowNum).done(function(log){
				var logResult = {
						"rows": log.objects,
						"page": page,
						"total": log.totalPage,
						"records":log.totalNumber,
						"id": "id"
				};				
				$OperationgridList.grid("reloadData", logResult);
			});	
	    }
	});
});