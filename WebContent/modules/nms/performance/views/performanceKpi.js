define([ 'text!modules/nms/performance/templates/performanceKpi.html',
	'i18n!modules/nms/performance/i18n/performance.i18n', 'modules/common/cloud-utils',
	'css!modules/nms/performance/styles/performance.css' ], function(
	viewTpl, i18n, utils, css) {
var currentObj;
var rowNum = 20;
var $gridlist;

return fish.View.extend({
    template:fish.compile(viewTpl),
    i18nData:fish.extend({},i18n),

    initialize:function(){
    	currentObj=this;
    	fish.setLanguage("zh");
    	console.log("initialize");
    },

    events:{
    	"click #searchBtn": "searchBtnEven",
        "click #addBtn":"openPerformanceKpiEditFormDialog",
        "click #modifyBtn":"modifyBtnEvent",
        "click #deleteBtn":"deleteBtnEvent"
        //"click #resetBtn":"resetBtnEvent"
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
		
		return this;
	},
	
/*		afterRender:function(){
		console.log("afterRender");
	},*/
	
	//这里用来初始化页面上要用到的fish组件
	_afterRender: function() {
		this.initSearchForm();
		this.initList();
		this.loadperformanceData(1, rowNum);			
		this.layout();
		console.log("_afterRender");
	},
	
    layout:function(){
        var availableHeight=$(document.body).height()-135;
        var leftTreeHeight=availableHeight-39;
        $('#leftTree').height(leftTreeHeight);
        
    },

    resize:function(){

    },

	initSearchForm:function(){
		
		//初始化指标类型
		utils.ajax('typesService','queryKpiType').done(function(data){
			$('#kpiTypeId').combobox({
		        dataTextField: 'name',
		        dataValueField: 'id',
		        dataSource: data
		    });
		});
		
		//初始化指标目录
		utils.ajax('catalogService','queryCatalog').done(function(data){
			$('#catalogId').combobox({
		        dataTextField: 'name',
		        dataValueField: 'id',
		        dataSource: data
		    });
		});		
		
		
	},
	

	
	//初始化告警列表
	initList:function(){
		var opt={
			datatype: "json",
			height: $(document.body).height()-$("#nms_kpi_search").height()-$('#nms_kpi_actionDiv').height()-130,
			colModel: [{
				name: 'kpiName',
				label: '指标名称',
				width: 220
			},{
				name : "catalogName",
				label : '指标目录',
				width : 150
			}, {
				name:"kpiTypeName",
				label:"指标类型",
				width:100
								
			}, {
				name : "kpiCode",
				label : "指标编码",
				width : 100
			}, {
				name : "prewarnValue",
				label : "预警门限值",
				width : 100
			}, {
				name : "thresholdValue",
				label : "告警门限值",
				width : 100
			},{
				name:"unitName",
				label:"指标单位",
				width:100
			} ],
			caption:"性能指标列表",
			rowNum: rowNum,
			pager: true,
			server: true,
			multiselect:true,
			pageData: this.loadperformanceData
		};
		$gridlist=$("#performanceKpiList").grid(opt);
	},

	
	loadperformanceData:function(page, rowNum, sortname, sortorder, params){
	
		var formData = $('#searchForm').form('value');
		params=formData;
		utils.ajax('performanceKpiService','loadKPIConfigurationData',params, page,rowNum).done(function(data){
			var result = {
					"rows": data.objects,
					"page": page,
					"total": data.totalPage,
					"records":data.totalNumber,
					"id": "kpiConfigId"
			};
			$("#performanceKpiList").grid("reloadData", result);
		});
	},
	
	/**
	 * 查询按钮事件
	 */
	searchBtnEven:function(){
		//var resultValid=$('#searchForm').isValid();
		var formData = $('#searchForm').form('value');
		currentObj.loadperformanceData(1, rowNum, undefined, undefined, formData);

	},

	resetBtnEvent:function(){
        $('#searchForm').form('clear');
	},
	
	/**
	 * 打开新增或编辑对话框
	 */
	openPerformanceKpiEditFormDialog:function(){		
        var paramRow={modalTitle:'新增性能指标配置'};

		var pop =fish.popupView({
			url: 'modules/nms/performance/views/performanceKpiEdit',
			width: "35%",			
			modal: true,
			draggable: true,
			autoResizable: true,
			viewOption:paramRow, //参数
			close:function(){//关闭事件
			},
			dismiss:function(){//dismiss事件
				currentObj.loadperformanceData(1,rowNum,undefined, undefined);
			}
		});
	},
	
	/**
	 * 修改指标对话框
	 */
	modifyBtnEvent:function(){
		//var selectedRow = this.$el.find("#performanceKpiList").grid("getSelection");//单选模式
		var selectedRows = $gridlist.grid("getCheckRows");//返回所有被选中的行
		if(selectedRows.length == 1){
			var paramRow;
			var selected=selectedRows[0];
			if(!selected||!selected.kpiConfigId){
				fish.info({title:'温馨提醒', message:'请选择1条需要修改的"性能指标配置"数据!'});
				return;
			}
			else{
				paramRow={kpiConfigId:selected["kpiConfigId"],modalTitle:'修改性能指标配置'};
			}
			var pop =fish.popupView({
				url: 'modules/nms/performance/views/performanceKpiEdit',
				width: "35%",
				modal: true,
				draggable: true,
				autoResizable: true,
				viewOption:paramRow, //参数
				close:function(){//关闭事件
					//currentObj.loadperformanceData(1,rowNum,undefined, undefined);
				},
				dismiss:function(){//dismiss事件
					currentObj.loadperformanceData(1,rowNum,undefined, undefined);
				}
			});
		}else if (selectedRows.length > 1) {
			fish.info({title:'提示',message:'一次只能操作一条记录！'});
		} else {
			fish.info({title:'提示',message:'请勾选一条记录！'});
		}
	},

    deleteBtnEvent:function(){
    	// var selectedRow=this.$el.find("performanceKpiList").grid("getSelection");
    	//var selectedRow=$gridlist.grid("getSelection");
    	var selectedRows =$gridlist.grid("getCheckRows");//返回所有被选中的行
    	if(selectedRows.length==1){
    		var selectedRow=selectedRows[0];
            fish.confirm({title:"温馨提醒", message:"您确定要删除选中的“" + selectedRow['kpiName']
			+ "”性能指标配置么?"}).result.then(function() {
				currentObj.deleteKpi(selectedRow);
			   });
    	}
    	else if (selectedRows.length > 1){
            fish.confirm({title:"温馨提醒", message:"您确定要删除所有选中的性能指标配置么?"}).result.then(function() {
					$.each(selectedRows,function(i,selectedRow){
						 currentObj.deleteKpi(selectedRow);
					});            	 
			 });    		
    	}
    	else{
    		fish.info({title:'温馨提醒', message:'请选择需要删除的"性能指标配置"数据!'});
    	}
    },
    
    deleteKpi:function(selectedRow){
		    var param=selectedRow['kpiConfigId'];
	        utils.ajax('performanceKpiService','deleteKPIConfiguration',param).done(function(data){
	        	try {
	        		var result = data.toString().split(';');
	        		if (result[1] == 200) {
	        			fish.info({title:'温馨提醒', message:result[0]});                				
	        			currentObj.loadperformanceData(1,rowNum,undefined, undefined);
	        			
	        		} else {
	        			fish.info({title:'温馨提醒',message: result[0]});
	        		}
	        	} catch (e) {
	        		fish.info({title:'温馨提醒', message:'删除失败，解析数据异常！'});
	        	}
	             
	        });        	
     }

});
});
