define([
    	'text!modules/isa/stoppage/operation/monitor/templates/monitor.html',
    	'i18n!modules/isa/stoppage/operation/monitor/i18n/monitor.i18n',
    	'modules/common/cloud-utils',
    	'css!modules/isa/stoppage/operation/monitor/styles/monitor.css'
    ], function(ViewTpl, i18n,utils,css) {
    	return fish.View.extend({
    		template: fish.compile(ViewTpl),
    		i18nData: fish.extend({}, i18n),
    		
    		events: {
    			"click #isa-sto-ope-mon-submitBtn": "qryFaultMonitorBtn",
    			"click #iso_sto_ope_mon_applyHangWorkOrder": "qryApplyHangOrder",
    			"click #isa_sto_ope_mon_hangUpBtn":"hangUpBtn",
    			"click #isa_sto_ope_mon_unPauseBtn":"unPauseBtn",
    			"click #isa_sto_ope_mon_UrgeBtn":"urgeBtn",
    			"click #isa_sto_ope_mon_detailBtn": "detailBtn",
    			"click #isa_sto_ope_mon_advSearchBtn":"advSearchBtn",
    			"click #isa_sto_ope_mon_cancleBtn":"cancleBtn",
    		},

    		initialize: function () {
                this.once('afterRender', $.proxy(this.init, this));
            },

    		init:function(){
    			var me=this;
    			//隐藏高级查询条件
				$(".isa-advSearchFields-row").hide();
				$("#isaMon-panel-body").attr("style","padding-bottom: 0px;");
    			
    			var qryFaultMonitorBtn = $.proxy(this.qryFaultMonitorBtn, this),me=this;
    			
    			//定时查询申请挂起的单子
    			this.autoQryApplyHangUpOrder();
    			//初始化
    			utils.ajax('isaOperationFaultService','qryCount4ApplyHangUpOrder').done(function(ret){
    				$('#iso_sto_ope_mon_applyHangWorkOrder').text('申请挂起工单数：'+ret);
        		});
        		
    			var isaMonAutoQuery;
    			//定时扫描监控单子
				$("#isa-sto-ope-mon-autoQryOrder").change(function() { 
					if($('#isa-sto-ope-mon-autoQryOrder').is(':checked')) {
						var minute = $('#isa-sto-mon-minuteRefresh').val();
						//非法字符校验
						if(isNaN(minute)){
							fish.info('请输入数字');
							 $("#isa-sto-ope-mon-autoQryOrder").attr("checked", false);
							return;
						}
						//不能少于2分钟
						if(minute < 2){
							fish.info('自动刷新不能少于2分钟');
							 $("#isa-sto-ope-mon-autoQryOrder").attr("checked", false);
							return;
						}
						isaMonAutoQuery = window.setInterval(qryFaultMonitorBtn,minute*60*1000); 
						me.registerThread(isaMonAutoQuery);
					}else{
						//去掉定时器的方法 
						window.clearInterval(isaMonAutoQuery);						
					}
				});
    			
    			//隐藏按钮
    			//$('#isa_sto_ope_mon_detailBtn').hide();
    			//$('#isa_sto_ope_mon_hangUpBtn').hide();
    			//$('#isa_sto_ope_mon_unPauseBtn').hide();
    			//$('#isa_sto_ope_mon_UrgeBtn').hide();
    			
    			
    			
    			//开始时间、结束时间
    			$('#isa_sto_ope_mon_startTime, #isa_sto_ope_mon_endTime').datetimepicker({
    	            //format: 'yyyy/mm/dd hh:ii:ss'
    	        });
    			
    			//产品分类
    			utils.ajax('isaCommonService','getStaticData','fault_kind', 'FAULT_KIND_NAME', 'FAULT_KIND_ID').done(function(ret){
        			$('#isa_sto_ope_mon_faultKind').combobox({
    			        dataTextField: 'name',
    			        dataValueField: 'value',
    			        dataSource: ret
    			    });
        		});
    			
    			//故障分类
        		$('#isa_sto_ope_mon_faultPhenomena').popedit({
					dataTextField :'text',
    				dataValueField :'faultPhenomenaId',
    				dialogOption: {
    					height: 400,
    					width: 500,
//    					width: '45%',
    					viewOptions:{
        					title:'选择故障分类',
        					orgId:'1',
        				},
    				},
    				
					url:'js!modules/isa/stoppage/operation/common/views/FaultPhenomenaTree',
    				showClearIcon:false
    			});
    			
    			//受理渠道
    			utils.ajax('isaCommonService','getStaticData',"fault_source", "FAULT_SOURCE_NAME", "FAULT_SOURCE_ID").done(function(ret){
        			$('#isa_sto_ope_mon_faultSource').combobox({
        				editable : 'false',
    			        dataTextField: 'name',
    			        dataValueField: 'value',
    			        dataSource: ret
    			    });
        		});
    			
    			
    			//告警源
    			utils.ajax('isaCommonService','getStaticData',"FAULT_GRADE", "FAULT_GRADE_NAME", "FAULT_GRADE_ID").done(function(ret){
        			$('#isa_sto_ope_mon_alarmSource').combobox({
        				editable : 'false',
    			        dataTextField: 'name',
    			        dataValueField: 'value',
    			        dataSource: ret
    			    });
        		});
    			
    			//处理人员
    			$('#isa_sto_ope_mon_handlePerson').popedit({
    				dataTextField :'text',
    				dataValueField :'id',
    				dialogOption: {
    					height: 400,
    					width: 500,
//    					width: '45%',
    					viewOptions:{
        					title:'选择处理人',
        					orgId:currentJob.orgPathCode.split('.')[0],
        				},
    				},
    				
					url:'js!modules/common/popeditviews/stafforg/views/OrgJobStaffsByOrg',
    				showClearIcon:false
    			});
    			
    			//时限状态
        		$('#isa_sto_ope_mon_timeState').combobox({
        		
    			});
    			
    			this.$("#isa_sto_ope_mon_monitorGrid").grid({
    				datatype: "json",
    				height: $('#main-tabs-panel').height() - $('#isaMon-panel-body').height() - 18,
    				//height: 400,
    				colModel: [{
    					name: 'alertStatus', 
    					label: '告警状态', 
    					width: 35, 
    					sortable:false,
    					title: false
    				},{
    					name: 'ORDER_TITLE',
    					label: '故障标题',
    					sortable:false,
    					width: 100
    				},{
    					name: 'faultGradeName',
    					label: '故障级别',
    					sortable:false,
    					width: 60
    				}, {
    					name: 'ORDER_CODE',
    					width: 80,
    					sortable:false,
    					label: '故障编号'
    				}, {
    					name: 'CURRENT_TACHE_NAME',
    					label: '当前环节',
    					sortable:false,
    					width: 60
    				},  {
    					name: 'PARTYNAME',
    					label: '当前环节处理人',
    					sortable:false,
    					width: 60
    				},  {
    					name: 'PARTYID',
    					label: '当前环节处理人ID',
    					width: 60,
    					sortable:false,
    					hidden:true
    				},  {
    					name: 'EXT_STATE_NAME',
    					label: '故障单状态',
    					sortable:false,
    					width: 60
    				},  {
    					name: 'CREATE_DATE',
    					label: '创建时间',
    					sortable:false,
    					width: 60
    				},  {
    					name: 'ALERT_DATE',
    					label: '告警时间',
    					sortable:false,
    					width: 60
    				}, {
    					name: 'LIMIT_DATE',
    					width: 60,
    					sortable:false,
    					label: '截至时间',
    				}, {
    					name: 'id',
    					width: 100,
    					sortable:false,
    					label: '障碍单ID',
    					hidden:true,
    				}, {
    					name: 'processinstanceid',
    					width: 100,
    					sortable:false,
    					label: '流程实例id',
    					hidden:true,
    				}, {
    					name: 'timeState',
    					width: 100,
    					sortable:false,
    					label: '时效状态',
    					hidden:true,
    				}],
    				//multiselect: true,
    				rowNum: 10,
    				pager: true,
    				pageData: this.qryFaultMonitor,
    				gridview:false,
    				cached: true, 
    				showColumnsFeature: true, //允许用户自定义列展示设置
    				onDblClickRow: function (e, rowid, iRow, iCol) {//双击行事件
					 	var data=$("#isa_sto_ope_mon_monitorGrid").grid("getSelection");
					 	me.detailDb(data);
				    },
    				afterInsertRow: function(e, rowid, aData){
    					var alertStatus = aData.timeState;
			            if (alertStatus == "正常") {
			            	$("#isa_sto_ope_mon_monitorGrid").jqGrid('setCell',rowid,'alertStatus',
			            			'<span class="fa fa-square" style="font-size:16px;margin-left:0px;color:#0085FF"></span>',{});
			            }else if (alertStatus == "预警") {
			            	$("#isa_sto_ope_mon_monitorGrid").jqGrid('setCell',rowid,'alertStatus',
			            			'<span class="fa fa-square" style="font-size:16px;margin-left:0px;color:#abca02" title="预警"></span>',{});
			            }else if (alertStatus == "超时") {
			            	$("#isa_sto_ope_mon_monitorGrid").jqGrid('setCell',rowid,'alertStatus',
			            			'<span class="fa fa-square" style="font-size:16px;margin-left:0px;color:#DBAA00" title="超时"></span>',{});
			            }else if (alertStatus == "严重超时") {
			            	$("#isa_sto_ope_mon_monitorGrid").jqGrid('setCell',rowid,'alertStatus',
			            			'<span class="fa fa-square" style="font-size:16px;margin-left:0px;color:#ea421b" title="严重超时"></span>',{});
			            }
			            
    				},
    				onSelectRow: function( e, rowid, oldrowid ){
    					
    					var rowData = $("#isa_sto_ope_mon_monitorGrid").grid("getSelection");//返回所有被选中的行
    					//根据单子情况显示不同的按钮
    					if(rowData.EXT_STATE_NAME == '挂起'){
    						$('#isa_sto_ope_mon_detailBtn').show();
    						$('#isa_sto_ope_mon_hangUpBtn').hide();
    						$('#isa_sto_ope_mon_unPauseBtn').show();
    						$('#isa_sto_ope_mon_UrgeBtn').hide();
    					}else{
    						$('#isa_sto_ope_mon_detailBtn').show();
    						$('#isa_sto_ope_mon_hangUpBtn').show();
    						$('#isa_sto_ope_mon_unPauseBtn').hide();
    						$('#isa_sto_ope_mon_UrgeBtn').show();
    					}
    				},
    			});
    			
    			//添加状态标注
				$("#isa_sto_ope_mon_monitorGrid").grid("navButtonAdd",[
				    {
				        caption:" 严重超时",
				        buttonicon:"glyphicon glyphicon-stop monitor-timeout-icon"
				    },
				    {
				        caption:" 超时",
				        buttonicon:"glyphicon glyphicon-stop monitor-overtime-icon"
				    },
				    {
				        caption:" 预警",
				        buttonicon:"glyphicon glyphicon-stop monitor-warming-icon"
				    },
				    {
				        caption:" 正常",
				        buttonicon:"glyphicon glyphicon-stop monitor-normal-icon"
				    }
				]);
    			
    			//默认查询第一页数据
        		this.qryFaultMonitorBtn();
    		},
    		
    		qryFaultMonitor:function(page,rowNum){
    		
    			var paramMap = $('#isa-sto-ope-mon-queryForm').form('value');
    			
    			//选择处理人处理,若选择组织或职位需要将partyId转换
    			var handle = $('#isa_sto_ope_mon_handlePerson').data('uiPopedit').getValue();
	        	if(typeof(handle) != 'undefined'){
	        		switch(handle.type){
		       			case 0:{ //组织
							paramMap.partyType = "ORG";
							paramMap.partyId = handle.orgId;
							break;
		       			}case 1:{ //职位
		       				paramMap.partyType = "JOB";
							paramMap.partyId = handle.id.split('_')[1];    							
		       				break;
		       			}case 2:{ //人员
		       				paramMap.partyType = "STA";
							paramMap.partyId = handle.id;
		       			}
		       		}
	        	}
    			
    			utils.ajax('isaOperationFaultService','qryOperationFault',paramMap, page, rowNum).done(function(ret){
    				if($("#isa_sto_ope_mon_monitorGrid").is(':visible')){
    					$("#isa_sto_ope_mon_monitorGrid").grid("reloadData", ret);
                    }
        		});
    		},
    		
    		
    		//查询按钮
    		qryFaultMonitorBtn:function(){
				var rowNum = $('#isa_sto_ope_mon_monitorGrid').grid("getGridParam", "rowNum");
    			this.qryFaultMonitor(1, rowNum);
    		},
    		
    		//弹出挂起工单页面
    		qryApplyHangOrder:function(){
    			var qryFaultMonitorBtn = $.proxy(this.qryFaultMonitorBtn, this);
    			var pop =fish.popupView({url: 'modules/isa/stoppage/operation/monitor/views/applyHangOrder',
    				width: "55%",
    				dismiss: function(){
    					qryFaultMonitorBtn();
    					utils.ajax('isaOperationFaultService','qryCount4ApplyHangUpOrder').done(function(ret){
		    				$('#iso_sto_ope_mon_applyHangWorkOrder').text('申请挂起工单数：'+ret);
		        		});
    				} 
    			});
    			
    		},
    		
    		//挂起按钮
    		hangUpBtn:function(){
    			var rowData = this.$("#isa_sto_ope_mon_monitorGrid").grid("getSelection");//返回所有被选中的行
    			if(null == rowData.ORDER_CODE){
    				fish.info('请选择行！');
    				return;
    			}
    			var qryFaultMonitorBtn = $.proxy(this.qryFaultMonitorBtn, this);
    			var pop =fish.popupView({
    				url: 'modules/isa/stoppage/operation/monitor/views/hangUp',
    				width: "45%",
    				viewOption:{rowData:rowData},
    				close:function(){
    					qryFaultMonitorBtn();
    					$('#isa_sto_ope_mon_detailBtn').hide();
		    			$('#isa_sto_ope_mon_hangUpBtn').hide();
		    			$('#isa_sto_ope_mon_unPauseBtn').hide();
		    			$('#isa_sto_ope_mon_UrgeBtn').hide();
    				},
    			});
    		},
    		
    		//解挂按钮
    		unPauseBtn:function(){
    			
    			var rowData = this.$("#isa_sto_ope_mon_monitorGrid").grid("getSelection");//返回所有被选中的行
    			if(null == rowData.ORDER_CODE){
    				fish.info('请选择行！');
    				return;
    			}
    			var qryFaultMonitorBtn = $.proxy(this.qryFaultMonitorBtn, this);
    			var pop =fish.popupView({
    				url: 'modules/isa/stoppage/operation/monitor/views/unPause',
    				width: "45%",
    				viewOption:{rowData:rowData},
    				close:function(){
    					qryFaultMonitorBtn();
    					$('#isa_sto_ope_mon_detailBtn').hide();
		    			$('#isa_sto_ope_mon_hangUpBtn').hide();
		    			$('#isa_sto_ope_mon_unPauseBtn').hide();
		    			$('#isa_sto_ope_mon_UrgeBtn').hide();
    				},
    			});
    		},
    		
    		urgeBtn:function(){
    			var rowData = this.$("#isa_sto_ope_mon_monitorGrid").grid("getSelection");//返回所有被选中的行
    			if(null == rowData.ORDER_CODE){
    				fish.info('请选择行！');
    				return;
    			}
    			var pop =fish.popupView({
    				url: 'modules/isa/stoppage/operation/monitor/views/urgeOrder',
    				width: "45%",
    				viewOption:{rowData:rowData},
    			});
    		},
			
			
			autoQryApplyHangUpOrder:function(){
				var int= window.setInterval(this.qryApplyHangUpOrder,30000); 
				this.registerThread(int);
			},
			
			//查询申请挂起的单子数量
			qryApplyHangUpOrder:function(){
				utils.ajax('isaOperationFaultService','qryCount4ApplyHangUpOrder').done(function(ret){
    				$('#iso_sto_ope_mon_applyHangWorkOrder').text('申请挂起工单数：'+ret);
        		});
			},
			
			//详情按钮
			detailBtn:function(){
				var rowData = this.$("#isa_sto_ope_mon_monitorGrid").grid("getSelection");//返回所有被选中的行
    			if(null == rowData.id){
    				fish.info('请选择行！');
    				return;
    			}
    			var pop =fish.popupView({
    				url: 'modules/isa/stoppage/operation/OrderDetails/views/OrderDetailsView',
    				width: "70%",
    				viewOption:{rowData:rowData},
    			});			
			},
			detailDb:function(rowData){
				if(null == rowData.id){
    				return;
    			}
				var pop =fish.popupView({
    				url: 'modules/isa/stoppage/operation/OrderDetails/views/OrderDetailsView',
    				width: "70%",
    				viewOption:{rowData:rowData},
    			});
			},
			hideBtn:function(){
				$('#isa_sto_ope_mon_detailBtn').hide();
    			$('#isa_sto_ope_mon_hangUpBtn').hide();
    			$('#isa_sto_ope_mon_unPauseBtn').hide();
    			$('#isa_sto_ope_mon_UrgeBtn').hide();
			},
			
			//高级查询按钮事件
			advSearchBtn:function(){
				var expand = $("#isa_sto_ope_mon_advSearchBtn").attr("expand");
				if (expand == "false") { //展开
					$(".isa-advSearchFields-row").show("fast");
					$("#isa_sto_ope_mon_advSearchBtn").attr("expand","true");
					$("#isa_sto_ope_mon_advSearchBtn").html('  收起  <span class="glyphicon glyphicon-chevron-up"></span>');
					$("#isa_sto_ope_mon_monitorGrid").grid("setGridHeight", $('#main-tabs-panel').height() - 194);
					$("#isaMon-panel-body").removeAttr("style");
				} else { //收起
					$(".isa-advSearchFields-row").hide("fast");
					$("#isa_sto_ope_mon_advSearchBtn").attr("expand","false");
					$("#isa_sto_ope_mon_advSearchBtn").html('高级查询 <span class="glyphicon glyphicon-chevron-down"></span>');
					$("#isa_sto_ope_mon_monitorGrid").grid("setGridHeight", $('#main-tabs-panel').height() - 90);
					$("#isaMon-panel-body").attr("style","padding-bottom: 0px;");
				}
			},
			
			//浏览器窗口大小改变事件
			resize: function() { 
				var expand = $("#isa_sto_ope_mon_advSearchBtn").attr("expand");
				if (expand == "false") { //收起状态
					$("#isa_sto_ope_mon_monitorGrid").grid("setGridHeight", $('#main-tabs-panel').height() - 90);
				} else { //展开状态
					$("#isa_sto_ope_mon_monitorGrid").grid("setGridHeight", $('#main-tabs-panel').height() - 194);
				}
				$("#isa_sto_ope_mon_monitorGrid").grid("resize",true);
			},
			
			//撤单按钮
			cancleBtn: function(){
				var rowData = this.$("#isa_sto_ope_mon_monitorGrid").grid("getSelection");//返回所有被选中的行
    			if(null == rowData.id){
    				fish.info('请选择行！');
    				return;
    			}
				var qryFaultMonitorBtn = $.proxy(this.qryFaultMonitorBtn, this);
				var paramMap = new Object();
				paramMap.orderId = rowData.id;
				paramMap.trackOrgId = currentJob.orgId;
				paramMap.trackOrgName = currentJob.orgName;
				paramMap.trackStaffId = currentUser.staffId;
				paramMap.trackStaffName = currentUser.staffName;
				paramMap.trackStaffPhone = currentUser.mobileTel;
				paramMap.trackStaffEmail = currentUser.email;
			
				fish.confirm('是否撤单?', function(){
					utils.ajax('isaOperationFaultService','cancleOrder', paramMap).done(function(ret){
		        		if(ret == '1'){
		        			fish.info('撤单成功');
		        			qryFaultMonitorBtn();
		        		}else if(ret == '0'){
		        			fish.error('撤单失败');
		        		}
		        	});
				});
			},
			
    	});
    });