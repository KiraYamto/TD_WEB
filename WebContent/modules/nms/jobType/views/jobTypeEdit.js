define([ 'text!modules/nms/jobType/templates/jobTypeEdit.html',
	'i18n!modules/nms/jobType/i18n/jobType.i18n', 'modules/common/cloud-utils',
	'css!modules/nms/jobType/styles/jobType.css' ], function(
		viewTpl, i18n, utils, css) {
		

		return fish.View.extend({
			template : fish.compile(viewTpl),
			i18nData : fish.extend({}, i18n),

			initialize : function() {			
				console.log("initialize");
				
			},

			events : {
				"click #saveBtn": "saveBtnEvent",
				"click #closeBtn":"closeBtnEvent"
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
			this.loadData();
			console.log("_afterRender");
		},

		initparam:function(){		    

			utils.ajax('dictionaryService','getDictionaryOfJSONArray',"MD_JOB_TYPE_INFO","COLLECT_MODE").done(function(data){

				var option="";
				$.each(data,function(i,item){
					option+="<option value=\""+item.dictionaryId+"\">"+item.value+"</option>";	
				});
				$("#collectMode2").append(option);
			});
			
			//初始化采集类型
			utils.ajax('dictionaryService','getDictionaryOfJSONArray',"MD_JOB_TYPE_INFO","COLLECT_TYPE").done(function(data){
				// $('#collectType2').combobox({
			 //        dataTextField: 'value',
			 //        dataValueField: 'dictionaryId',
			 //        dataSource: data
			 //    });
			var option2="";
			$.each(data,function(i,item){
				option2+="<option value=\""+item.dictionaryId+"\">"+item.value+"</option>";	
			});
			$("#collectType2").append(option2);
		});	
			

		},

		loadData : function() {
			utils.ajax('jobTypeService', 'getJobTypeById',this.options.jobTypeId).done($.proxy(function(data) {
				this.$el.find("#perform").form('value', data );

				if(data.collectMode){
					$('#collectMode2').val(data.collectMode);
				};
				if(data.collectType){
					$('#collectType2').val(data.collectType);
				};
				
			},this));
		},

		saveBtnEvent:function(){
			var resultValid=$('#perform').isValid();
			if(resultValid){
				var param=this.$el.find("#perform").form("value");
				param.id=this.options.jobTypeId;			

				utils.ajax('jobTypeService', 'saveJobType',param).done(function(data) {
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