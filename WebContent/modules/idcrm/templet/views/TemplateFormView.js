define([
    	'text!modules/idcrm/templet/templates/TemplateFormView.html'+codeVerP,
    	'i18n!modules/idcrm/templet/i18n/template.i18n.zh.js'+codeVerP,
    	'modules/common/cloud-utils.js'+codeVerP
    ], function(TemplateFormViewTpl, i18nTemplate,utils) {
    	return fish.View.extend({
    		template: fish.compile(TemplateFormViewTpl),
    		i18nData: fish.extend({}, i18nTemplate),
    		events: {
                "update.template":"updateAction"
    		},
    		
    		//这里用来进行dom操作
    		_render: function() {
    			var html=$(this.template(this.i18nData));
    			this._initForm(html);
    			this.$el.html(html);
    			html.find('#template-rsTypeId').combobox('disable');
    			html.find('#template-rsTypeId').combobox('value',this.options.rsTypeId+'');
    			return this;
    		},
    		_initForm:function(html){ //初始化表单
    			html.find('#template-rsTypeId').combobox({
                   placeholder: '请选择',
                   dataTextField: 'name',
                   dataValueField: 'value',
                   dataSource: []
                   }
    			);
            	$.ajaxSetup({async : false});
	   			utils.ajax('equipmentRecordService','qryRsTypes').done(function(datas){                
	   				html.find('#template-rsTypeId').combobox('option', 'dataSource', datas);
	            });
            	$.ajaxSetup({async : true});
				html.find('#template-vendor').combobox({
	                placeholder: '请选择',
	                dataTextField: 'value',
	                dataValueField: 'code',
	                dataSource: [],
	                change: function (event) {
	                    var val = $('#template-vendor').combobox("value");
	                }
	            });
				utils.ajax('commonService','getDLCVByTypeCode','EQU_RS_VENDOR').done(function(datas){                
					html.find('#template-vendor').combobox('option', 'dataSource', datas);
	           });
				html.find('#template-model').combobox({
	                placeholder: '请选择',
	                dataTextField: 'value',
	                dataValueField: 'code',
	                dataSource: [],
	                change: function (event) {
	                    var val = $('#template-model').combobox("value");
	                }
	            });
				utils.ajax('commonService','getDLCVByTypeCode','EQU_RS_MODEL').done(function(datas){                
					html.find('#template-model').combobox('option', 'dataSource', datas);
	           });
				this._initInfoForm(html);
            },
            _initInfoForm:function(html){
            	utils.ajax('templateService','qryEntityParams',this.options.rsTypeId).done(function(ret){                
				var infoForm = $('#template-info-form').form();
				if($('#template-'+ret[0].code+'').val() == undefined){
					for(var i=0;i<ret.length;i++){
            			var obj = ret[i];
						var div = null;
						if(obj.singleRow == '0'){
							if(obj.inputType == 'textarea'){
								div = $('<div class="col-md-6"><div class="form-group"> <label class="col-md-4 control-label">'+obj.name+':</label> <div class="input-group col-md-8"><textarea class="form-control" placeholder="'+obj.name+'" id="template-info-'+obj.code+'" name="'+obj.code+'"></textarea>  </div>  </div>');
							}else{
								div = $('<div class="col-md-6"><div class="form-group"> <label class="col-md-4 control-label">'+obj.name+':</label> <div class="input-group col-md-8"><input class="form-control" placeholder="'+obj.name+'" id="template-info-'+obj.code+'" name="'+obj.code+'">  </div>  </div>');
							}
							
						}else{
							if(obj.inputType == 'textarea'){
								div = $('<div class="col-md-12"><div class="form-group"> <label class="col-md-2 control-label">'+obj.name+':</label> <div class="input-group col-md-10"><textarea class="form-control" placeholder="'+obj.name+'" id="template-info-'+obj.code+'" name="'+obj.code+'"></textarea>  </div>  </div>');
							}else{
								div = $('<div class="col-md-12"><div class="form-group"> <label class="col-md-2 control-label">'+obj.name+':</label> <div class="input-group col-md-10"><input class="form-control" placeholder="'+obj.name+'" id="template-info-'+obj.code+'" name="'+obj.code+'">  </div>  </div>');
							}
						}
						infoForm.append(div);
						if(obj.inputType == 'select'){
							var code = obj.code;
							$('#template-info-'+code+'').combobox({
				                placeholder: '请选择',
				                dataTextField: 'value',
				                dataValueField: 'code',
				                dataSource: []
				            });
			            	$.ajaxSetup({async : false});
							utils.ajax('commonService','getDLCVByTypeCode',obj.dicTypeCode).done(function(datas){  
								$('#template-info-'+code+'').combobox('option', 'dataSource', datas);
							});
			            	$.ajaxSetup({async : true});
						}
					}
				}
	           });
            },
            _loadTemplateById:function(){
            	 var me = this;
                 if(this.options && this.options.tmplId){
                     utils.ajax('templateService','qryTemplateVo',this.options.tmplId).done(function(ret){                           
                        me.$('#template-form').form('value',ret.templateDto);
                        var info = "";
                        for(var i in ret.detailList){
                        	var obj = ret.detailList[i];
//                        	me.$('#template-'+obj.entityCode).val(obj.entityValue);
                        	var code = obj.entityCode;
                        	info = info + "'"+code+"':"+"'"+obj.entityValue+"',";
                        }
                        info = "{"+info.substring(0,info.length-1)+"}";
                        var infoObj = eval('('+info+')');
                        me.$('#template-info-form').form('value',infoObj);                        
                        me.trigger('initFinished');
                     });
                 }
            },
    		//这里用来初始化页面上要用到的fish组件
    		_afterRender: function() {
               //根据不同动作（事件）触发不同动作（事件）
                if(this.options && this.options.action){
                    this.$el.trigger(this.options.action); // this.options为打开view传入的参数
                }
    			var popup=this.popup;
    			var me=this;
    			
    			this.$el.on('click', '#save-button', function(e) {
    				var ret = me.$('#template-form').form('value')||{};
					var info = me.$('#template-info-form').form('value')||{};
    				var param = {
    						tmplName:ret.tmplName,
    						rsTypeId:ret.rsTypeId,
    						model:ret.model,
    						vendor:ret.vendor,
    						creatorId:currentUser.staffId,
    						description:ret.description,
    						info:info
    				};
    				if(me.options.action != undefined && me.options.action == 'update.template'){
    					 param.tmplId = me.options.tmplId;
    					 param.updateId = currentUser.staffId;
    					 popup.close(param); //传递数据
    				}else{
        				utils.ajax('templateService','addTemplate',param).done(function(ret){
            				if(ret.code == 'success'){
            					fish.info('新增成功！');
                				popup.close(ret);
            				}else{
            					fish.error('操作失败！');
            				}
            			}).fail(function(e){
        		         	console.log(e);
        		         	fish.error(e);
    	            	});
    				}
    			});
    		},
    		updateAction:function(){
    			this._loadTemplateById();
    		}
    	});
    });