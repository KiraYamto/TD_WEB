define([
	'text!modules/idcrm/cust/templates/CustFormView.html',
	'i18n!modules/idcrm/cust/i18n/cust.i18n',
	'modules/common/cloud-utils',
    'css!modules/idcrm/cust/styles/CustResDetail.css'
], function(frameViewTpl, i18nEquip,utils, css) {
	return fish.View.extend({
		template: fish.compile(frameViewTpl),
		i18nData: fish.extend({}, i18nEquip),
		events: {},
		
		//这里用来进行dom操作
		_render: function() {
			//this.$el.html(this.template(this.i18nData));
			//return this;
			
			var html=$(this.template(this.i18nData));
			html.find('#cust_oper_info_form').form();  
			if(this.options.action=='detail.custAdd') {
				html.find('#cust_oper_info_title').html("客户新增");
			 }
			if(this.options.action=='detail.custMod') {
				html.find('#cust_oper_info_title').html("客户修改");
			 }
			this.$el.html(html);
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this.loadStaticData();
			
			//this.getEquipData(1);
			
			//this.loadCustInfo(this.options);
			
			var popup = this.popup;
			var me = this;

			this.$el.on('click', '#cust-save-button', function(e) {
				var ret = me.$('#cust_oper_info_form').form('value')||{};
				 
				ret.creatorId = currentUser.staffId;
                ret.updateId = currentUser.staffId;
                
                if(me.options.action=='detail.custAdd') {
                	ret.id = 0;
                	utils.ajax('custService','addCust',ret).done(function(result){
                		if(result){
                			if(result.code==0){
                				fish.info('保存成功');
                				popup.close(ret);
                			}else{
                				fish.info(result.msg);
                			}
                		}else{
                			fish.info('消息未返回');
                		} 

                    }).fail(function(e){
                            fish.error(e);
                        });
                }else if(me.options.action=='detail.custMod'){
                	utils.ajax('custService','updateCust',ret).done(function(result){
                		if(result){
                			if(result.code==0){
                				fish.info('修改成功');
                				popup.close(ret);
                			}else{
                				fish.info(result.msg);
                			}
                		}else{
                			fish.info('消息未返回');
                		} 
                        
                    }).fail(function(e){
                            fish.error(e);
                    });
                } 
				
			});
		},
		loadCustInfo:function(paramObj) {
			console.log(paramObj);
			if (paramObj&&paramObj.custDto) {
				this.$el.find("#cust_detail_info_form").form("value", paramObj.custDto);
			}
		},
		loadStaticData:function(){
			var self = this;
			$("select[attrCode]").each(function(o){
				$this = $(this);
				var attrCode = $this.attr("attrCode");
				self.renderSelect($this,attrCode);				
			})
		},
		renderSelect:function(o,attrCode){
			$.ajaxSetup({   
	            async : false  
	        }); 
			utils.ajax('basicDataService', 'getBasicDataListByBasicType',attrCode).done(function(ret){
				var html="<option value=''>--请选择--</option>";
				if(ret){
                	for(var key in ret ){
                		var basicDataDto = ret[key];
                		html+="<option value='"+basicDataDto.code+"'>"+basicDataDto.value+"</option>";
                	}
                }	
				o.append($(html));
            });
			$.ajaxSetup({
	            async : true  
	        }); 
		},
	});
});