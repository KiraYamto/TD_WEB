define([ 'text!modules/nms/jobType/templates/jobTypeList.html',
	'i18n!modules/nms/jobType/i18n/jobType.i18n', 'modules/common/cloud-utils',
	'css!modules/nms/jobType/styles/jobType.css' ], function(
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
        "click #addBtn":"openEditFormDialog",
        "click #modifyBtn":"modifyBtnEvent",
        "click #deleteBtn":"deleteBtnEvent",
        "click #resetBtn":"resetBtnEvent"
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
		this.loadData(1, rowNum);			
		
		console.log("_afterRender");
	},
	
	initSearchForm:function(){
		
		//初始化采集方式
		utils.ajax('dictionaryService','getDictionaryOfJSONArray',"MD_JOB_TYPE_INFO","COLLECT_MODE").done(function(data){
			$('#collectMode').combobox({
			    dataTextField: 'value',
				dataValueField:'dictionaryId' ,
		        dataSource: data
		    });
		});
		
		//初始化采集类型
		utils.ajax('dictionaryService','getDictionaryOfJSONArray',"MD_JOB_TYPE_INFO","COLLECT_TYPE").done(function(data){
			$('#collectType').combobox({
		        dataTextField: 'value',
		        dataValueField: 'dictionaryId',
		        dataSource: data
		    });
		});		
		
		
	},
	

	
	//初始化列表
	initList:function(){
		var opt={
			datatype: "json",
			height: 400,
			colModel: [{
				name: 'name',
				label: '任务类型名称',
				width: 220
			},{
				name : "collectTypeName",
				label : '采集类型',
				width : 150
			}, {
				name:"collectModeName",
				label:"采集方式",
				width:100
								
			}, {
				name : "implClass",
				label : "JOB实现类",
				width : 368
			}, {
				name : "priorityRange",
				label : "优先级范围",
				width : 100
			}, {
				name : "description",
				label : "描述",
				width : 300
			}],
			caption:"任务列表",
			rowNum: rowNum,
			pager: true,
			server: true,
			multiselect:true,
			pageData: this.loadData
		};
		$gridlist=$("#jobTypeList").grid(opt);
	},

	
	loadData:function(page, rowNum, sortname, sortorder, params){
		
		var formData = $('#searchForm').form('value');
		params=formData;
	
		utils.ajax('jobTypeService','loadJobTypeData',params, page,rowNum).done(function(data){
			var result = {
					"rows": data.objects,
					"page": page,
					"total": data.totalPage,
					"records":data.totalNumber,
					"id": "id"
			};
			$("#jobTypeList").grid("reloadData", result);
		});
	},
	
	/**
	 * 查询按钮事件
	 */
	searchBtnEven:function(){
		var formData = $('#searchForm').form('value');
		currentObj.loadData(1, rowNum, undefined, undefined, formData);	
	},

	resetBtnEvent:function(){
        $('#searchForm').form('clear');
	},
	
	/**
	 * 打开新增或编辑对话框
	 */
	openEditFormDialog:function(){		
        var paramRow={modalTitle:'配置任务类型'};

		var pop =fish.popupView({
			url: 'modules/nms/jobType/views/jobTypeEdit',
			width: "40%",			
			modal: true,
			draggable: true,
			autoResizable: true,
			viewOption:paramRow, //参数
			close:function(){//关闭事件
			},
			dismiss:function(){//dismiss事件
				currentObj.loadData(1,rowNum,undefined, undefined);
			}
		});
	},
	
	/**
	 * 修改指标对话框
	 */
	modifyBtnEvent:function(){
		//var selectedRow = this.$el.find("#jobTypeList").grid("getSelection");
		var selectedRows= $gridlist.grid("getCheckRows");//返回所有被选中的行
		if(selectedRows.length == 1){
			var paramRow;
			var selected=selectedRows[0];
			if(!selected||!selected.id){
				fish.info({title:'温馨提醒', message:'请选择1条需要修改的"任务类型配置"数据!'});
				return;
			}
			else{
				paramRow={jobTypeId:selected["id"],modalTitle:'修改任务类型配置'};
			}
			var pop =fish.popupView({
				url: 'modules/nms/jobType/views/jobTypeEdit',
				width: "40%",
				modal: true,
				draggable: true,
				autoResizable: true,
				viewOption:paramRow, //参数
				close:function(){//关闭事件
					//currentObj.loadperformanceData(1,rowNum,undefined, undefined);
				},
				dismiss:function(){//dismiss事件
					currentObj.loadData(1,rowNum,undefined, undefined);
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
    	var selectedRows =$gridlist.grid("getCheckRows");//返回所有被选中的行
    	if(selectedRows.length==1){
    		var selectedRow=selectedRows[0];
            fish.confirm({title:"温馨提醒", message:"您确定要删除选中的“" + selectedRow['name']
			+ "”任务类型配置么?"}).result.then(function() {
				currentObj.deleteJobType(selectedRow);
			   });
    	}
    	else if (selectedRows.length > 1){
            fish.confirm({title:"温馨提醒", message:"您确定要删除所有选中的任务类型配置么?"}).result.then(function() {
					$.each(selectedRows,function(i,selectedRow){
						 currentObj.deleteJobType(selectedRow);
					});            	 
			 });    		
    	}
    	else{
    		fish.info({title:'温馨提醒', message:'请选择需要删除的"任务类型配置"数据!'});
    	}

    },
    
    deleteJobType:function(selectedRow){
	    var param=selectedRow['id'];
        utils.ajax('jobTypeService','deleteJobType',param).done(function(data){
        	try {
        		var result = data.toString().split(';');
        		if (result[1] == 200) {
        			fish.info({title:'温馨提醒', message:result[0]});                				
        			currentObj.loadData(1,rowNum,undefined, undefined);
        			
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
