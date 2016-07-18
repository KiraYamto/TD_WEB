define([ 'text!modules/nms/jobInfo/templates/jobInfoManage.html',
	'i18n!modules/nms/jobInfo/i18n/jobInfo.i18n', 'modules/common/cloud-utils',
	'css!modules/nms/jobInfo/styles/jobInfo.css' ], function(
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
    	"click #nms_jobinfo_searchBtn": "searchBtnEven",
        "click #nms_jobinfo_addBtn":"openEditFormDialog",
        "click #nms_jobinfo_modifyBtn":"modifyBtnEvent",
        "click #nms_jobinfo_deleteBtn":"deleteBtnEvent",
        
        "click #nms_jobinfo_startBtn":"activeJob",
        "click #nms_jobinfo_stopBtn":"suspendJob"
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
		
		//初始化任务类型
		$('#nms_jobinfo_jobTypeName').popedit({
		        dataTextField :'name',
	            dataValueField :'id',
                dialogOption:{
                    width: 350,
                    height: 350
                },
                url:"js!modules/nms/common/popeditviews/jobTypeTree/views/SelectjobTypeView"
        });		       
		
		//初始化采集器
		utils.ajax('jobInfoService','loadAllCollector').done(function(data){
			$('#nms_jobinfo_collector').combobox({
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
			height: $(document.body).height()-$('#nms_actionDiv').height()-$('#nms_jobinfo_searchForm').height()-135,
			colModel: [{
				name: 'name',
				label: '任务名称',
				width: 200
			},{
				name : "emsName",
				label : '所属EMS',
				width : 150
			}, {
				name:"typeName",
				label:"任务类型",
				width:180
								
			},{
				name:"collectModeName",
				label:"采集方式",
				width:150
								
			}, {
				name : "resourceName",
				label : "采集资源",
				width : 160
			}, {
				name : "collectorName",
				label : "采集器",
				width : 150
			},{
				name : "listenPort",
				label : "监听端口",
				width : 90
				
			}, {
				name : "statusName",
				label : "任务状态",
				width : 90
			}, {
				name : "scheduleCron",
				label : "任务执行计划",
				width : 150
			},{
				name : "timeRange",
				label : "时间范围",
				width : 200
			}],
			caption:"任务列表",
			autowidth: true,
			autoResizable: true,
			rowNum: rowNum,
			pager: true,
			server: true,
			multiselect:true,
			pageData: this.loadData
		};
		$gridlist=$("#jobInfoGrid").grid(opt);
	},

	
	loadData:function(page, rowNum, sortname, sortorder, params){

		var formData = $('#nms_jobinfo_searchForm').form('value');
		params=formData;
		utils.ajax('jobInfoService','loadJobInfo',params, page,rowNum).done(function(data){
			var result = {
					"rows": data.objects,
					"page": page,
					"total": data.totalPage,
					"records":data.totalNumber,
					"id": "id"
			};
			$("#jobInfoGrid").grid("reloadData", result);
		});
	},
	
	/**
	 * 查询按钮事件
	 */
	searchBtnEven:function(){
		var formData = $('#nms_jobinfo_searchForm').form('value');
		currentObj.loadData(1, rowNum, undefined, undefined, formData);
	},


	/**
	 * 打开新增或编辑对话框
	 */
	openEditFormDialog:function(){		
        var paramRow={modalTitle:'新增采集任务'};

		var pop =fish.popupView({
			url: 'modules/nms/jobInfo/views/jobInfoConfigure',
			width: "75%",			
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
		var selectedRows = $gridlist.grid("getCheckRows");//返回所有被选中的行 
		if(selectedRows.length == 1){
			var paramRow;
			var selected=selectedRows[0];
			if(!selected||!selected.id){
				fish.info({title:'温馨提醒', message:'请选择1条需要修改的"采集任务"数据!'});
				return;
			}
			else{
				paramRow={id:selected["id"],modalTitle:'修改采集任务'};
			}
			var pop =fish.popupView({
				url: 'modules/nms/jobInfo/views/jobInfoConfigure',
				width: "78%",
				modal: true,
				draggable: true,
				autoResizable: true,
				viewOption:paramRow, //参数
				close:function(){//关闭事件
					//currentObj.loadData(1,rowNum,undefined, undefined);
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
    	var selectedRows =$gridlist.grid("getCheckRows");//返回所有被选中的行
    	if(selectedRows.length==1){
    		var selectedRow=selectedRows[0];
            fish.confirm({title:"温馨提醒", message:"您确定要删除选中的“" + selectedRow['name']
			+ "”采集任务么?"}).result.then(function() {
				currentObj.deleteJobInfo(selectedRow);
			   });
    	}
    	else if (selectedRows.length > 1){
            fish.confirm({title:"温馨提醒", message:"您确定要删除所有选中的采集任务么?"}).result.then(function() {
					$.each(selectedRows,function(i,selectedRow){
						 currentObj.deleteJobInfo(selectedRow);
					});            	 
			 });    		
    	}
    	else{
    		fish.info({title:'温馨提醒', message:'请选择需要删除的"采集任务"数据!'});
    	}

    },

    deleteJobInfo:function(selectedRow){
		    var param=selectedRow['id'];
	        utils.ajax('jobInfoService','deleteById',param).done(function(data){
	        	try {	        		
	        		if (data == '1') {
	        			fish.info({title:'温馨提醒', message:'删除成功'});                				
	        			currentObj.loadData(1,rowNum,undefined, undefined);
	        		}
	        	} catch (e) {
	        		fish.info({title:'温馨提醒', message:'删除失败！'});
	        	}
	             
	        });        	
     },

    activeJob:function(){
    	var selectedRows =$gridlist.grid("getCheckRows");//返回所有被选中的行
    	var ids='';
		$.each(selectedRows,function(i,selectedRow){
			 if(i==0){
                ids=ids+selectedRow.id;
			 }else{
			 	ids=","+selectedRow.id;
			 }
		}); 
    	if(selectedRows.length==1){
    		var selectedRow=selectedRows[0];
            fish.confirm({title:"温馨提醒", message:"您确定要激活选中的“" + selectedRow['name']
			+ "”采集任务么?"}).result.then(function() {
				currentObj.activeJobInfo(ids,1);
			   });
    	}
    	else if (selectedRows.length > 1){
            fish.confirm({title:"温馨提醒", message:"您确定要激活所有选中的采集任务么?"}).result.then(function() {
					
					 currentObj.activeJobInfo(ids,1);
					          	 
			 });    		
    	}
    	else{
    		fish.info({title:'温馨提醒', message:'请选择需要激活的"采集任务"数据!'});
    	}
    },

    suspendJob:function(){
    	var selectedRows =$gridlist.grid("getCheckRows");//返回所有被选中的行
     	var ids='';
		$.each(selectedRows,function(i,selectedRow){
			 if(i==0){
                ids=ids+selectedRow.id;
			 }else{
			 	ids=","+selectedRow.id;
			 }
		});    	
    	if(selectedRows.length==1){
    		var selectedRow=selectedRows[0];
            fish.confirm({title:"温馨提醒", message:"您确定要挂起选中的“" + selectedRow['name']
			+ "”采集任务么?"}).result.then(function() {
				currentObj.activeJobInfo(ids,0);
			   });
    	}
    	else if (selectedRows.length > 1){
            fish.confirm({title:"温馨提醒", message:"您确定要挂起所有选中的采集任务么?"}).result.then(function() {
			    currentObj.activeJobInfo(ids,0);
			 });    		
    	}
    	else{
    		fish.info({title:'温馨提醒', message:'请选择需要删除的"采集任务"数据!'});
    	}
    },

    activeJobInfo:function(ids,status){
		utils.ajax('jobInfoService','changeState',ids, status).done(function(result){
             if(result=='success'){
                  fish.info({title:'温馨提醒', message:'操作成功!'});
                  currentObj.loadData(1, rowNum, undefined, undefined, null);
             }else if(result=='error'){
                  fish.info({title:'温馨提醒', message:'操作失败!'});
             }
		});
    }   

});
});
