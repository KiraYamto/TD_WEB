define([ 'text!modules/nms/performance/templates/performanceKpiEdit.html',
	'i18n!modules/nms/performance/i18n/performance.i18n', 'modules/common/cloud-utils',
	'css!modules/nms/performance/styles/performance.css' ], function(
	viewTpl, i18n, utils, css) {
    

    return fish.View.extend({
		template : fish.compile(viewTpl),
		i18nData : fish.extend({}, i18n),

		initialize : function() {			
			console.log("initialize");
           
		},

		events : {
			"click #savePerformanceBtn": "saveBtnEvent",
			"click #closeBtn":"closeBtnEvent"
//			"change #prewarnValue" :"changesholdvalueEv",
//			"change #thresholdValue" :"changePrewarnvalueEv"

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
            this.initparam();
		    this.loadperformanceData();
			console.log("_afterRender");
		},

    	initparam:function(){

	        //初始化指标类型
			utils.ajax('typesService','queryKpiType').done(function(data){
				// $('#kpiTypeId2').combobox({
				// 	dataTextField: 'kpiTypeName',
				// 	dataValueField: 'kpiTypeId',
				// 	dataSource: data
				// });
				  var option="";
				  $.each(data,function(i,item){
	                   option+="<option value=\""+item.id+"\">"+item.name+"</option>";	
				  });
				  $("#kpiTypeId2").append(option);
			});
			
			//初始化指标目录
			utils.ajax('catalogService','queryCatalog').done(function(data){

				  var option="";
				  $.each(data,function(i,item){
	                   option+="<option value=\""+item.id+"\">"+item.name+"</option>";	
				  });
				  $("#catalogId2").append(option);				
			});	
//             //获取预警和告警门限         
//			utils.ajax('performanceKpiService','queryThreshold').done(function(data){				
//			
//				  var option="";
//				  var option2="";
//				  $.each(data,function(i,item){
//	                   option+="<option value=\""+item.thresholdId+"\">"+item.prewarnValue+"</option>";
//	                   option2+="<option value=\""+item.thresholdId+"\">"+item.thresholdValue+"</option>";	
//				  });
//				  $("#prewarnValue").append(option);	
//				  $("#thresholdValue").append(option);	
//				
//			});	
			//获取指标单位字典
		
			utils.ajax('dictionaryService','getDictionaryOfJSONArray',"NA_NET_KPI","UNIT_ID").done(function(data){
				  var option="";
				  $.each(data,function(i,item){
	                   option+="<option value=\""+item.dictionaryId+"\">"+item.value+"</option>";	
				  });
				  $("#unitId").append(option);	
			});				

	     },

        changesholdvalueEv:function(record){
				if(record){
					
					$('#thresholdValue').val(record.currentTarget.value);
				}
        },

        changePrewarnvalueEv:function(e){
              $('#prewarnValue').val(e.currentTarget.value);
        },


		loadperformanceData : function() {
			utils.ajax('performanceKpiService', 'getkpiById',this.options.kpiConfigId).done($.proxy(function(data) {
				this.$el.find("#perform").form('value', data );

				if(data.kpiTypeId){
					$('#kpiTypeId2').val(data.kpiTypeId);
				};
				if(data.catalogId){
					$('#catalogId2').val(data.catalogId);
				};
//				if(data.thresholdId){
//					$('#prewarnValue').val(data.thresholdId);
//					$('#thresholdValue').val(data.thresholdId);
//				};
				if(data.unitId){
					$('#unitId').val(data.unitId);
				};																
			},this));
		},

		saveBtnEvent:function(){
			var resultValid=$('#perform').isValid();
			if(resultValid){
				var param=this.$el.find("#perform").form("value");
				param.kpiConfigId=this.options.kpiConfigId;
				//param.thresholdId=$('#prewarnValue').combobox('value');

				utils.ajax('performanceKpiService', 'saveKPIConfigurationData',param).done(function(data) {
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