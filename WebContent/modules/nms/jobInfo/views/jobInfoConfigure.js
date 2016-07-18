define([ 'text!modules/nms/jobInfo/templates/jobInfoConfigure.html',
	'i18n!modules/nms/jobInfo/i18n/jobInfo.i18n', 'modules/common/cloud-utils',
	'css!modules/nms/jobInfo/styles/jobInfo.css' ], function(
		viewTpl, i18n, utils, css) {
	    var rowNum = 200;	
        var currentObj;
        var $collectorGrid;
        var $kpiGrid;
        var start;
        var end;

		return fish.View.extend({
			template : fish.compile(viewTpl),
			i18nData : fish.extend({}, i18n),

			initialize : function() {			
				console.log("initialize");
				
			},

			events : {
				"click #nms_jobInfo_saveBtn": "saveBtnEvent",
				"click #nms_jobInfo_closeBtn":"closeBtnEvent",
				"click #nms_jobInfo_searchEmsBtn":"searchEms",
				"click #nms_jobInfo_searchElementBtn":"searchElement",
				"click #nms_jobInfo_searchKpiBtn":"searchKpi"
			},

			_beforeRender : function() {
				console.log("_beforeRender");
			},

			beforeRender : function() {
				console.log("beforeRender");
			},

			_render : function() {
				console.log("_render");
				
				this.$el.html(this.template(this.i18nData));
				return this;
			},

		// 这里用来初始化页面上要用到的fish组件
		_afterRender : function() {
			$("#headtitle").html(this.options.modalTitle);
			currentObj=this;
			currentObj.layout();
			currentObj.initparam();
			console.log("_afterRender");
		},
		
		layout:function(){
			var availableHeight=$('#nms_jobInfo_rightForm').height();
			$('#nms_jobInfo_leftdiv').height(availableHeight);
			$('#nms_jobInfo_leftPanel').height(availableHeight);
		},
		
		resize:function(){
			currentObj.layout();
		},

		initparam:function(){		    
             //初始化任务类型
			$('#nms_jobInfo_baseInfo_jobType').popedit({
			        dataTextField :'name',
		            dataValueField :'id',
		            dialogOption:{
		                width: 350,
		                height: 350
		            },
		            url:"js!modules/nms/common/popeditviews/jobTypeTree/views/SelectjobTypeView",
		            change:function(e, data){//可以绑定change事件改变初始值
                        if(data.id){
                           currentObj.loadPriority(data.id);//加载任务优先级
                           //选定任务类型就确定了采集方式,直采或网管采
                           currentObj.getjobType(data.id);
                        }
                    }
		    });	
			$('#nms_jobInfo_catalogId').popedit({
			        dataTextField :'name',
		            dataValueField :'id',
		            dialogOption:{
		                width: 350,
		                height: 350
		            },
		            url:"js!modules/nms/common/popeditviews/CatalogTree/views/SelectCatalogView"

		    });	
			$('#nms_jobInfo_kpiTypeId').popedit({
			        dataTextField :'name',
		            dataValueField :'id',
		            dialogOption:{
		                width: 350,
		                height: 350
		            },
		            url:"js!modules/nms/common/popeditviews/TypesTree/views/SelectTypesTreeView"
		    });			    
			//初始化采集器
			utils.ajax('jobInfoService','loadAllCollector').done(function(data){
				$('#nms_jobInfo_baseInfo_collectorId').combobox({
			        dataTextField: 'name',
			        dataValueField: 'id',
			        dataSource: data
			    });
			});			
			utils.ajax('dictionaryService','getDictionaryOfJSONArray',"MD_EMS", "VENDOR_ID").done(function(data){
				$('#nms_jobInfo_vendorId').combobox({
			        dataTextField: 'value',
			        dataValueField: 'dictionaryId',
			        dataSource: data
			    });
			});	
			utils.ajax('dictionaryService','getDictionaryOfJSONArray',"MD_EMS", "VENDOR_ID").done(function(data){
				$('#nms_jobInfo_emsvendorId').combobox({
			        dataTextField: 'value',
			        dataValueField: 'dictionaryId',
			        dataSource: data
			    });
			});									
			//初始化起始时间
			$("#nms_jobInfo_baseInfo_starTime").datetimepicker({
				changeDate: function (e, value){
				    start = value;
				 }
			});
			$("#nms_jobInfo_baseInfo_endTime").datetimepicker({
				changeDate: function (e, value){
				    end = value;
					if(start.date.getFullYear()>end.date.getFullYear()||start.date.getMonth()>end.date.getMonth()||start.date.getDate()>end.date.getDate()){
						fish.info({title:"系统提醒", message:"结束时间不能小于开始时间！"});
						$('#nms_jobInfo_baseInfo_endTime').datetimepicker('value', '');
					}						       
				 }
			});

			currentObj.initElementGrid();
			currentObj.initKpiGrid();
			currentObj.loadjobInfo();
			//currentObj.loadElementData(1, rowNum, null, null, null);  

		},
        loadjobInfo:function(){
        	var jobId=this.options.id;
            utils.ajax('jobInfoService','queryJobInfoById',jobId).done(function(jobinfo){
            	 $('#nms_jobInfo_baseInfo_id').val(jobId);
            	 $('#nms_jobInfo_baseInfo_collectorId').combobox('value',jobinfo.collectorId);
                 $("#nms_jobInfo_baseInfo_starTime").datetimepicker("value",jobinfo.startTimeStr);
                 $("#nms_jobInfo_baseInfo_endTime").datetimepicker("value",jobinfo.endTimeStr);
                 $("#nms_jobInfo_baseInfo_name").val(jobinfo.name);
                // $("#nms_jobInfo_baseInfo_listenPort").val(jobinfo.listenPort);
                 if(jobinfo.status=="1"){
                     $("#nms_jobInfo_status1").attr("checked",true);

                 }
                 else{
                 	$("#nms_jobInfo_status0").attr("checked",true);
                 };
                 $("#nms_jobInfo_baseInfo_scheduleCron").val(jobinfo.scheduleCron);
                 $("#nms_jobInfo_baseInfo_jobParams").val(jobinfo.jobParams);
                 $("#nms_jobInfo_baseInfo_mark").val(jobinfo.mark);

                 $("#nms_jobInfo_baseInfo_jobType").popedit('setValue',{id:jobinfo.typeId,name:jobinfo.typeName});
                 $("#nms_jobInfo_baseInfo_priority").combobox('value',jobinfo.priority);
                 //currentObj.$el.find("#nms_jobInfo_baseInfo").form("value",jobinfo);

            });
        },

		loadPriority:function(jobTypeId){
			//初始化优先级
			utils.ajax('jobInfoService','loadPriority',{jobTypeId:jobTypeId}).done(function(priority){
				if(priority.length<1){
                   return ;
				}
				var max=eval(priority[0].priorityMax);
				var min=eval(priority[0].priorityMin);
				var prioritylist=new Array();
				for(var i=min;i<=max;i++){ 
        				prioritylist.push({value:i,text:i});
            	}
				$('#nms_jobInfo_baseInfo_priority').combobox({
			        dataTextField: 'text',
			        dataValueField: 'value',
			        dataSource: prioritylist
			    });

		    });	
		},

        getjobType:function(jobTypeId){
			utils.ajax('jobTypeService', 'getJobTypeById',jobTypeId).done($.proxy(function(jobType) {
               	if(jobType){
               		if(jobType.collectMode=='1'){//直采
               			 $("#nms_jobInfo_elementForm").show();
               			 $("#nms_jobInfo_emsForm").hide();
               			 currentObj.initElementGrid();
               			 if(this.options.id){
                            currentObj.getElementByjobId();
               			 }else{
               			 	currentObj.loadElementData(1, rowNum, null, null, null); 
               			 }
                                                 
               		}else{
               			 $("#nms_jobInfo_elementForm").hide();
               			 $("#nms_jobInfo_emsForm").show();
               			 currentObj.initEmsGrid();
               			 if(this.options.id){
                             currentObj.getEmsByjobId();
               			 }else{
                             currentObj.loadEmsData(1, rowNum, null, null, null);
               			 }                        
                         
               		}
               		currentObj.getKpiByjobId();
               	}
			},this));
        },

        initElementGrid:function(){
			//初始化采集点grid
			var collectorOpt={
				datatype: "json",
				height:150,
				colModel: [{
					name: 'name',
					label: '网元名称',
					width: 100
				},{
					name : "objId",
					label : '网管标识',
					width : 100
				}],
				
				autowidth: true,
				//rowList : [50,80,100],
				//autoResizable: true,
				rowNum: rowNum,
				// pager: true,
				server: true,
				multiselect:true,
				pageData: currentObj.loadElementData
			};
			$collectorGrid=$("#nms_jobInfo_collectorInfoGrid").grid(collectorOpt);
        },

        initEmsGrid:function(){
			var collectorOpt={
				datatype: "json",
				height:150,
				colModel: [{
					name: 'name',
					label: '网管名称',
					width: 100
				},{
					name : "vendorName",
					label : '归属厂家',
					width : 100
				}],
				
				autowidth: true,
				autoResizable: true,
				rowList : [50,80,100],
				rowNum: rowNum,
				// pager: true,
				server: true,
				multiselect:true,
				pageData: currentObj.loadEmsData
			};
			$collectorGrid=$("#nms_jobInfo_collectorInfoGrid").grid(collectorOpt);
        },

        initKpiGrid:function(){
             var kpiOption={
				datatype: "json",
				height:150,
				colModel: [{
					name: 'kpiName',
					label: '指标名称',
					width: 100
				},
				{
					name: 'kpiCode',
					label: '指标编码',
					width: 100
				}],
				
				autowidth: true,
				autoResizable: true,
				rowList : [100,150,200],
				rowNum: rowNum,
				// pager: true,
				server: true,
				multiselect:true,
				pageData: currentObj.loadperformanceData
             };
              $kpiGrid=$("#nms_jobInfo_kpiInfoGrid").grid(kpiOption);
        },

		loadElementData : function(page, rowNum, sortname, sortorder, params) {
			utils.ajax('elementService', 'queryElementPageList',params, page,rowNum).done($.proxy(function(data) {

				var result = {
						"rows": data.objects,
						"page": page,
						"total": data.totalPage,
						"records":data.totalNumber,
						"id": "id"
				};
				$("#nms_jobInfo_collectorInfoGrid").grid("reloadData", result);				
			},this));
		},
		loadEmsData : function(page, rowNum, sortname, sortorder, params) {
			utils.ajax('emsService', 'queryEMS',params, page,rowNum).done($.proxy(function(data) {

				var result = {
						"rows": data.objects,
						"page": page,
						"total": data.totalPage,
						"records":data.totalNumber,
						"id": "id"
				};
				$("#nms_jobInfo_collectorInfoGrid").grid("reloadData", result);				
			},this));
		},		

        getElementByjobId:function(){
			utils.ajax('jobInfoService', 'queryElementByJobId',this.options.id).done($.proxy(function(data) {

				var result = {
						"rows": data.objects,
						"page": 1,
						"total": data.totalPage,
						"records":data.totalNumber,
						"id": "id"
				};
				$("#nms_jobInfo_collectorInfoGrid").grid("reloadData", result);				
			},this));
        },

        getEmsByjobId:function(){
			utils.ajax('jobInfoService', 'queryEmsByJobId',this.options.id).done($.proxy(function(data) {

				var result = {
						"rows": data.objects,
						"page": 1,
						"total": data.totalPage,
						"records":data.totalNumber,
						"id": "id"
				};
				$("#nms_jobInfo_collectorInfoGrid").grid("reloadData", result);				
			},this));
        },

        getKpiByjobId:function(){
			utils.ajax('jobInfoService', 'queryKpiByJobId',this.options.id).done($.proxy(function(data) {

				var result = {
						"rows": data.objects,
						"page": 1,
						"total": data.totalPage,
						"records":data.totalNumber,
						"id": "id"
				};
				$("#nms_jobInfo_kpiInfoGrid").grid("reloadData", result);				
			},this));
        },

        searchElement:function(){
            var eleParam=$("#nms_jobInfo_elementForm").form('value');
            currentObj.loadElementData(1, rowNum, null, null, eleParam);
        },
        searchEms:function(){
            var emsParam=$("#nms_jobInfo_emsForm").form('value');
            currentObj.loadEmsData(1, rowNum, null, null, emsParam);
        },
		searchKpi:function(){
          var kpiParam=$("#nms_jobInfo_searchKpiForm").form('value');
          currentObj.loadperformanceData(1,rowNum,null,null,kpiParam);
		},

		loadperformanceData:function(page, rowNum, sortname, sortorder, params){
			if(!params){
				params = {};
			}
			utils.ajax('performanceKpiService','loadKPIConfigurationData',params, page,rowNum).done(function(data){
				var result = {
						"rows": data.objects,
						"page": page,
						"total": data.totalPage,
						"records":data.totalNumber,
						"id": "kpiConfigId"
				};
				$("#nms_jobInfo_kpiInfoGrid").grid("reloadData", result);
			});
		},

		saveBtnEvent:function(){	
		    var resultValid=$('#nms_jobInfo_baseInfo').isValid();
			if(resultValid){
				var jobInfo=this.$el.find("#nms_jobInfo_baseInfo").form("value");
				var kpi=$kpiGrid.grid("getCheckRows");//返回所有被选中的行

				var cllpt=$collectorGrid.grid("getCheckRows");//返回所有被选中的行
				var ids="";
	            $.each(cllpt,function(i,cp){
	            	if(i==0){
	                    ids=ids+cp.id;
	            	}
	                else{
	                	ids=ids+","+cp.id;
	                }
	            });
	            var kpiCodes="";
	            $.each(kpi,function(i,k){
	            	if(i==0){
	                    kpiCodes+=k.kpiCode;
	            	}
	                else{
	                	kpiCodes=kpiCodes+","+k.kpiCode;
	                }
	                 
	            });
				var jobExt={
					jobId:jobInfo.id,
					clldataTypes:kpiCodes
				};					

				utils.ajax('jobInfoService', 'saveJobInfo',jobInfo,jobExt,ids).done(function(data) {
					try{
						var result = data.toString().split(';');
						if(result[1]== 200){
							fish.info({title:'温馨提醒', message:result[0]});
							
						}else{
							fish.info({title:'温馨提醒', message:result[0]});
						}
					}catch(e){
						fish.info({title:'温馨提醒', message:'保存失败，解析数据异常！'});
					}	
					
				});
			}

		},



		closeBtnEvent:function(){
			this.popup.dismiss();
		}
	});
});