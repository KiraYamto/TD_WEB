define([
	'text!modules/idcrm/equipmentrecord/templates/RecordMenegementView.html'+codeVerP,
	'i18n!modules/idcrm/equipmentrecord/i18n/record.i18n.zh.js'+codeVerP,
	'css!modules/idcrm/equipmentrecord/styles/recordmanagement.css'+codeVerP,
	'modules/common/cloud-utils.js'+codeVerP
], function(RecordMenegementViewTpl, i18nRecordMenegementView,css,utils) {
	return fish.View.extend({
		template: fish.compile(RecordMenegementViewTpl),
		i18nData: fish.extend({}, i18nRecordMenegementView),
		events: {
		   "click #record-search-btn":"searchRecord",
		   "click #record-create-btn":"createRecord",
		   "click #record-update-btn":"updateRecord",
		   "click #record-del-btn":"delRecord",
		   "click #record-import-btn":"importRecord",
		   "click #record-export-btn":"exportRecord"
		},
		
		//这里用来进行dom操作
		_render: function() {
			var html=$(this.template(this.i18nData));
			html.find('#record-mng-startDate').datetimepicker({
				endDate: fish.dateutil.addDays(new Date(), 10)
			});
			html.find('#record-mng-endDate').datetimepicker({
				endDate: fish.dateutil.addDays(new Date(), 10)
			});
			
			html.find('#record-mng-rsTypeId').combobox({
                placeholder: '请选择',
                dataTextField: 'name',
                dataValueField: 'value',
                dataSource: []
            });
			utils.ajax('equipmentRecordService','qryRsTypes').done(function(datas){                
				html.find('#record-mng-rsTypeId').combobox('option', 'dataSource', datas);
           });
			html.find('#record-mng-eventCode').combobox({
                placeholder: '请选择',
                dataTextField: 'value',
                dataValueField: 'code',
                dataSource: []
            });
			utils.ajax('commonService','getDLCVByTypeCode','EVENT_CODE').done(function(datas){                
				html.find('#record-mng-eventCode').combobox('option', 'dataSource', datas);
           });
			html.find('#record-mng-fitType').combobox({
                placeholder: '请选择',
                dataTextField: 'value',
                dataValueField: 'code',
                dataSource: []
            });
			utils.ajax('commonService','getDLCVByTypeCode','FIT_TYPE').done(function(datas){                
				html.find('#record-mng-fitType').combobox('option', 'dataSource', datas);
           });
			html.find('#record-mng-vendor').combobox({
                placeholder: '请选择',
                dataTextField: 'value',
                dataValueField: 'code',
                dataSource: []
            });
			utils.ajax('commonService','getDLCVByTypeCode','EQU_RS_VENDOR').done(function(datas){                
				html.find('#record-mng-vendor').combobox('option', 'dataSource', datas);
           });
			html.find('#record-mng-model').combobox({
                placeholder: '请选择',
                dataTextField: 'value',
                dataValueField: 'code',
                dataSource: []
            });
			utils.ajax('commonService','getDLCVByTypeCode','EQU_RS_MODEL').done(function(datas){                
				html.find('#record-mng-model').combobox('option', 'dataSource', datas);
           });
			this.$el.html(html);
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this._initRecordGrid();
			
		},
		_initRecordGrid:function(){
		    
		    var dcGridPerData = $.proxy(this.getRecordPerData,this); //函数作用域改变
			this.$("#record-grid").grid({
				datatype: "json",
				width:'100%',
				height: 380,
				colModel: [{
					name: 'roCode',
					label: '机历卡编号',
					width: 160
				}, {
					name: 'serialNo',
					width: 60,
					label: '序号'
				}, {
					name: 'eventCode',
					label: '事件类型',
					width: 80
				}, {
					name: 'eventName',
					width: 100,
					label: '事件名称'
				},{
					name: 'rsTypeName',
					width: 100,
					label: '设备类型'

				},{
					name: 'rsName',
					width: 100,
					label: '设备名称'

				},{
					name: 'vendor',
					width: 100,
					label: '设备厂家'

				},{
					name: 'fitTypeName',
					width: 100,
					label: '配件类型'

				},{
					name: 'creatorId',
					width: 100,
					label: '创建人'

				},{
					name: 'createDate',
					width: 100,
					label: '创建时间'

				},{
					name: 'comments',
					width: 100,
					label: '附件'

				},{
					name: 'contentId',
					width: 100,
					label: '机历卡内容id',
					key:true,
					hidden:true

				},{
					name: 'roId',
					width: 100,
					label: '机历卡id',
					hidden:true

				}],
				rowNum: 10,
				pager: true,
				showMask:true,
				shrinkToFit:true,
				multiselect:true,
				pageData: dcGridPerData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
				
			});
		},
		getRecordPerData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法
		    //获取查询条件
		    var conds = utils.getConditions('record-Qryform');

			rowNum = rowNum || this.$("#record-grid").grid("getGridParam", "rowNum");
			var me =this;
			var params = {};
			params.conditions=conds;
			params.pageIdx=page;
			params.pageSize=rowNum;
			
			utils.ajax('equipmentRecordService','qryEquipmentRecordByCond',params).done(function(ret)	{				 
			  var datas = {
			             "total": Math.ceil(ret.total/rowNum),
						 "page": page, 
						 "records": ret.total, 
						 "rows": ret.rows
			    };		
				$("#record-grid").grid("reloadData", datas);
			});

			return false;
			
		},
		_getSelRecord:function(){
		    var selRows = this.$("#record-grid").grid('getCheckRows');
		    if (selRows==null||selRows.length==0|| selRows.length > 1){
		        fish.info('请选择一个机历卡记录');
		        return;
		    }
		    return selRows[0];
		},
		_getSelRecords:function(){
		    var selRows = this.$("#record-grid").grid('getCheckRows');
		    if (selRows==null||selRows.length==0){
		        fish.info('请至少选择一个机历卡记录');
		        return;
		    }
		    return selRows;
		},
		
		searchRecord:function(){//查询
		   this.getRecordPerData(1);
		},
		createRecord:function(){//新增
		  var me = this;
		  var selRows = this.$("#record-grid").grid('getCheckRows');
          if(selRows==null||selRows.length==0|| selRows.length > 1){
        	  var pop = fish.popupView({url: 'modules/idcrm/equipmentrecord/views/RecordFormView',
		            width: "70%",	
		            callback:function(popup,view){
		            	popup.result.then(function (data) {
      		         	fish.info('新增成功');
      		         	me.getRecordPerData(1);
		            	},function (e) {
		            		console.log('关闭了',e);
		            	});
		            }
	            });
          }else{
        	  var pop = fish.popupView({url: 'modules/idcrm/equipmentrecord/views/RecordFormView',
		            width: "70%",	viewOption:{action:"create.record",roId:selRows[0].roId},
		            callback:function(popup,view){
		            	popup.result.then(function (data) {
      		         	fish.info('新增成功');
      		         	me.getRecordPerData(1);
		            	},function (e) {
		            		console.log('关闭了',e);
		            	});
		            }
	            });
          }
		  
		},
		updateRecord:function(){//修改
		 
          var selDc = this._getSelRecord();
          if(!selDc){
             return;
          }
          var me = this;
   		  var pop = fish.popupView({url: 'modules/idcrm/equipmentrecord/views/RecordFormView',
	            width: "70%",	viewOption:{action:"update.record",roId:selDc.roId},	
	            callback:function(popup,view){
	            	popup.result.then(function (data) {
	            	   
	            		utils.ajax('equipmentRecordService','updateRecord',data)
	            		     .done(function(){
	            		     	fish.info('修改成功');
	            		     	me.getRecordPerData(1);

	            		     }).fail(function(e){
	            		     	console.log(e);
	            		     	fish.error(e);
	            		     }); 

	            	},function (e) {
	            		console.log('关闭了',e);
	            	});
	            }
            });
		},
		delRecord:function(){//删除
		    var me = this;
		    var selRows = this._getSelRecords(); 

		    var ids = new Array();
		    for (var i = selRows.length - 1; i >= 0; i--) {
		    	//ids.push(selRows[i].contentId);
		    	ids[i] = selRows[i].contentId;
		    }
		    if(ids){
		    	 fish.confirm('是否删除所选机历卡记录？').result.then(function() {
		    		 utils.ajax('equipmentRecordService','batchDelRecord',ids,selRows[0].roId)
		               .done(function(ret){
		                    console.log(ret);
		                   if(ret && (ret.code === 'success' || ret.code === 'fail')){
		                       fish.info(ret.msg);
		                       if(ret.code === 'success'){
		                          me.getRecordPerData(1);
		                       }
		                   }else{
		                      fish.error('删除失败');
		                   }
		               }).fail(function(e){
		               	   console.log(e);
		               	   fish.error(e);
		               });
		    	 });
		    }
		},
		importRecord:function(){//导入
   
		},
		exportRecord:function(){//导出

		}
	});
});