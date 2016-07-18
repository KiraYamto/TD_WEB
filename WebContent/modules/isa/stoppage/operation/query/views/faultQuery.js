define([
    	'text!modules/isa/stoppage/operation/query/templates/faultQuery.html',
    	'i18n!modules/isa/stoppage/operation/query/i8n/query.i18n',
    	'modules/common/cloud-utils',
    	'css!modules/isa/stoppage/operation/query/styles/faultQuery.css'
    ], function(ViewTpl, i18n,utils,css) {
    	return fish.View.extend({
    		template: fish.compile(ViewTpl),
    		i18nData: fish.extend({}, i18n),
    		
    		events: {
    			"click #isa_fault_query_detailBtn": "detailBtn",
    			"click #isa_fault_query_queryBtn":"queryBtn",
    			"click #isa_fault_query_exportBtn":"exportBtn",
    			"click #isa_sto_ope_qry_advSearchBtn":"advSearchBtn",
    		},

    		initialize: function () {
                this.once('afterRender', $.proxy(this.init, this));
            },

    		init:function(){
    			var me=this;
    			//隐藏高级查询条件
				$(".isa-advSearchFields-row").hide();
				$("#isaQry-panel-body").attr("style","padding-bottom: 0px;");
    			
    			//开始时间 结束时间
    			$("#isa_fault_query_beginTime, #isa_fault_query_endTime").datetimepicker({
    				
    		    }); 
    			
    			//产品分类
    			utils.ajax('isaCommonService','getStaticData',"FAULT_KIND", "FAULT_KIND_NAME", "FAULT_KIND_ID").done(function(ret){
	    			$('#isa_fault_query_faultKindId').combobox({
				        dataTextField: 'name',
				        dataValueField: 'value',
				        dataSource: ret
				    });
    			});
    			
    			//故障分类
    			utils.ajax('isaCommonService','getStaticData',"FAULT_PHENOMENA", "FAULT_PHENOMENA_NAME", "FAULT_PHENOMENA_ID").done(function(ret){
	    			$('#isa_fault_query_faultPhenomenaId').combobox({
				        dataTextField: 'name',
				        dataValueField: 'value',
				        dataSource: ret
				    });
    			});
    			
    			
    			//受理渠道
    			utils.ajax('isaCommonService','getStaticData',"fault_source", "FAULT_SOURCE_NAME", "FAULT_SOURCE_ID").done(function(ret){
        			$('#isa_fault_query_faultSourceId').combobox({
        				editable : 'false',
    			        dataTextField: 'name',
    			        dataValueField: 'value',
    			        dataSource: ret
    			    });
        		});
    			
    			/*//告警源
    			utils.ajax('isaCommonService','getStaticData',"FAULT_ALARM_SOURCE", "ALARM_SOURCE_NAME", "ALARM_SOURCE_ID").done(function(ret){
        			$('#isa_fault_query_alarmSourceId').combobox({
        				editable : 'false',
    			        dataTextField: 'name',
    			        dataValueField: 'value',
    			        dataSource: ret
    			    });
        		});*/
    			
    			//处理状态
    			utils.ajax('isaCommonService','getStaticData',"OM_ORDER_EXT_STATE", "EXT_STATE_NAME", "EXT_STATE").done(function(ret){
    				ret.push({name:'全部',value:''});
    				$('#isa_fault_query_extState').combobox({
    					placeholder: '全部',
        				editable : 'false',
    			        dataTextField: 'name',
    			        dataValueField: 'value',
    			        dataSource: ret
    			    });
        		});
    			
    			this.$("#isa_fault_query_queryGrid").grid({
    				datatype: "json",
    				//height: 400,
    				height: $('#main-tabs-panel').height() - $('#isaQry-panel-body').height() - 18,
    				colModel: [{
    					name: 'ORDER_TITLE',
    					label: '故障标题',
    					sortable:false,
    					width: 160
    				}, {
    					name: 'ORDER_CODE',
    					width: 140,
    					sortable:false,
    					label: '故障编号'
    				}, {
    					name: 'FAULT_KIND_NAME',
    					label: '产品分类',
    					sortable:false,
    					width: 80
    				},  {
    					name: 'FAULT_PHENOMENA_NAME',
    					label: '故障分类',
    					sortable:false,
    					width: 80
    				},  {
    					name: 'FAULT_SOURCE_NAME',
    					label: '受理渠道',
    					sortable:false,
    					width: 80
    				/*},  {
    					name: 'ALARM_SOURCE_NAME',
    					label: '告警源',
    					width: 80*/
    				},  {
    					name: 'CREATE_DATE',
    					label: '创建时间',
    					sortable:false,
    					width: 80
    				}, {
    					name: 'EXT_STATE_NAME',
    					width: 100,
    					sortable:false,
    					label: '处理状态',
    				}, {
    					name: 'id',
    					width: 100,
    					sortable:false,
    					label: '定单id',
    					hidden:true,
    				}, {
    					name: 'processinstanceid',
    					width: 100,
    					sortable:false,
    					label: '流程实例id',
    					hidden:true,
    				}],
    				rowNum: 10,
    				pager: true,
    				cached: true, 
    				showColumnsFeature: true, //允许用户自定义列展示设置
    				pageData: this.qryFault,
    				onDblClickRow: function (e, rowid, iRow, iCol) {//双击行事件
					 	me.detailDb();
				    },
    			});
    			
    		},
            detailBtn:function(){
            	var rowData = this.$("#isa_fault_query_queryGrid").grid("getSelection");//返回所有被选中的行
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
            detailDb:function(){
            	var rowData = this.$("#isa_fault_query_queryGrid").grid("getSelection");//返回所有被选中的行
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
            queryBtn:function(){
            	this.qryFault(1, 10);
            },
            
            exportBtn:function(){
            	alert('export btn');
            },
            
            qryFault:function(page,rowNum){
    			var paramMap = $('#isa_fault_query_queryForm').form('value');
    			utils.ajax('isaFaultService','qryFault',paramMap, page, rowNum).done(function(ret){
    				$("#isa_fault_query_queryGrid").grid("reloadData", ret);
    				
        		});
    		},
    		
    		
    		//高级查询按钮事件
			advSearchBtn:function(){
				var expand = $("#isa_sto_ope_qry_advSearchBtn").attr("expand");
				if (expand == "false") { //展开
					$(".isa-advSearchFields-row").show("fast");
					$("#isa_sto_ope_qry_advSearchBtn").attr("expand","true");
					$("#isa_sto_ope_qry_advSearchBtn").html('  收起  <span class="glyphicon glyphicon-chevron-up"></span>');
					$("#isa_fault_query_queryGrid").grid("setGridHeight", $('#main-tabs-panel').height() - 194);
					$("#isaQry-panel-body").removeAttr("style");
				} else { //收起
					$(".isa-advSearchFields-row").hide("fast");
					$("#isa_sto_ope_qry_advSearchBtn").attr("expand","false");
					$("#isa_sto_ope_qry_advSearchBtn").html('高级查询 <span class="glyphicon glyphicon-chevron-down"></span>');
					$("#isa_fault_query_queryGrid").grid("setGridHeight", $('#main-tabs-panel').height() - 90);
					$("#isaQry-panel-body").attr("style","padding-bottom: 0px;");
				}
			},
			
			//浏览器窗口大小改变事件
			resize: function() { 
				var expand = $("#isa_sto_ope_qry_advSearchBtn").attr("expand");
				if (expand == "false") { //收起状态
					$("#isa_fault_query_queryGrid").grid("setGridHeight", $('#main-tabs-panel').height() - 90);
				} else { //展开状态
					$("#isa_fault_query_queryGrid").grid("setGridHeight", $('#main-tabs-panel').height() - 194);
				}
				$("#isa_fault_query_queryGrid").grid("resize",true);
			},
    	});
    });