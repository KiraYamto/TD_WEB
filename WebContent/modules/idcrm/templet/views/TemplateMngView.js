define([
	'text!modules/idcrm/templet/templates/TemplateMngView.html'+codeVerP,
	'i18n!modules/idcrm/templet/i18n/template.i18n.zh.js'+codeVerP,
	'css!modules/idcrm/templet/styles/templateMng.css'+codeVerP,
	'modules/common/cloud-utils.js'+codeVerP
], function(TemplateMngViewTpl, i18nTemplateMngView,css,utils) {
	return fish.View.extend({
		template: fish.compile(TemplateMngViewTpl),
		i18nData: fish.extend({}, i18nTemplateMngView),
		events: {
		   "click #template-search-btn":"searchTemplate",
		   "click #template-create-btn":"createTemplate",
		   "click #template-update-btn":"updateTemplate",
		   "click #template-del-btn":"delTemplate"
		},
		
		//这里用来进行dom操作
		_render: function() {
			var html=$(this.template(this.i18nData));
			
			html.find('#template-mng-rsTypeId').combobox({
                placeholder: '请选择',
                dataTextField: 'name',
                dataValueField: 'value',
                dataSource: []
            });
			utils.ajax('equipmentRecordService','qryRsTypes').done(function(datas){                
				html.find('#template-mng-rsTypeId').combobox('option', 'dataSource', datas);
           });
			this.$el.html(html);
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this._initTemplateGrid();
			
		},
		_initTemplateGrid:function(){
		    
		    var dcGridPerData = $.proxy(this.getTemplatePerData,this); //函数作用域改变
			this.$("#template-grid").grid({
				datatype: "json",
				width:'100%',
				height: 380,
				colModel: [{
					name: 'tmplName',
					label: '模板名称',
					width: 100
				}, {
					name: 'rsTypeName',
					width: 100,
					label: '资源类型'
				}, {
					name: 'vendor',
					label: '厂商',
					width: 80
				}, {
					name: 'model',
					width: 100,
					label: '型号'
				},{
					name: 'creatorId',
					width: 100,
					label: '创建人'

				},{
					name: 'createDate',
					width: 100,
					label: '创建日期'

				},{
					name: 'description',
					width: 100,
					label: '说明'

				},{
					name: 'id',
					width: 100,
					label: 'id',
					key:true,
					hidden:true

				},{
					name: 'rsTypeId',
					width: 100,
					label: 'rsTypeId',
					key:false,
					hidden:true
				}],
				rowNum: 10,
				pager: true,
				showMask:true,
				shrinkToFit:true,
				multiselect:true,
				pageData: dcGridPerData, //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
				afterInsertRow:function(e,rowid,data){
					
				}
			});
		},
		getTemplatePerData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法
		    //获取查询条件
		    var conds = utils.getConditions('template-Qryform');

			rowNum = rowNum || this.$("#template-grid").grid("getGridParam", "rowNum");
			var me =this;
			var params = {};
			params.conditions=conds;
			params.pageIdx=page;
			params.pageSize=rowNum;
			
			utils.ajax('templateService','qryTemplateListByCond',params).done(function(ret)	{				 
			  var datas = {
			             "total": Math.ceil(ret.total/rowNum),
						 "page": page, 
						 "records": ret.total, 
						 "rows": ret.rows
			    };		
				$("#template-grid").grid("reloadData", datas);
			});

			return false;
			
		},
		_getSelTemplate:function(){
		    var selRows = this.$("#template-grid").grid('getCheckRows');
		    if (selRows==null||selRows.length==0|| selRows.length > 1){
		        fish.info('请选择一个模板记录');
		        return;
		    }
		    return selRows[0];
		},
		_getSelTemplateIds:function(){
		    var selRows = this.$("#template-grid").grid('getCheckRows');
		    if (selRows==null||selRows.length==0){
		        fish.info('请至少选择一个模板记录');
		        return;
		    } 
		    var ids = new Array();
		    for (var i = selRows.length - 1; i >= 0; i--) {
		    	ids[i] = selRows[i].id;
		    }
		    return ids;
		},
		
		searchTemplate:function(){//查询
		   this.getTemplatePerData(1);
		},
		createTemplate:function(){//新增
		  var me = this;
		  var rsTypeId = $('#template-mng-rsTypeId').combobox('value');
		  if(rsTypeId == ''){
			  fish.info("请选择一个资源类型！");
			  return;
		  }
		  var pop = fish.popupView({url: 'modules/idcrm/templet/views/TemplateFormView',
	            width: "70%",	viewOption:{action:"create.template",rsTypeId:rsTypeId},	
	            callback:function(popup,view){
	            	popup.result.then(function (data) {
		         	fish.info('新增成功');
		         	me.getTemplatePerData(1);
	            	},function (e) {
	            		console.log('关闭了',e);
	            	});
	            }
          });
		  
		},
		updateTemplate:function(){//修改
		 
          var selDc = this._getSelTemplate();
          if(!selDc){
             return;
          }
          var me = this;
   		  var pop = fish.popupView({url: 'modules/idcrm/templet/views/TemplateFormView',
	            width: "70%",	viewOption:{action:"update.template",tmplId:selDc.id,rsTypeId:selDc.rsTypeId},	
	            callback:function(popup,view){
            		
	            	popup.result.then(function (data) {
	            		utils.ajax('templateService','updateTempalte',data)
	            		     .done(function(){
	            		     	fish.info('修改成功');
	            		     	me.getTemplatePerData(1);

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
		delTemplate:function(){//删除
		    var me = this;
		    var ids = this._getSelTemplateIds(); 
		    if(!ids){
		    	fish.info("请至少选择一条要删除的模板记录！");
		    	return;
		    }
	    	 fish.confirm('是否删除所选模板？').result.then(function() {
	    		 utils.ajax('templateService','batchDelTemplate',ids)
	               .done(function(ret){
	                   if(ret && (ret.code === 'success' || ret.code === 'fail')){
	                       fish.info(ret.msg);
	                       if(ret.code === 'success'){
	                          me.getTemplatePerData(1);
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
	});
});