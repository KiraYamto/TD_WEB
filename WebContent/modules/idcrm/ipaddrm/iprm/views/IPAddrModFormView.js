define([
		'text!modules/idcrm/ipaddrm/iprm/templates/IPAddrModFormView.html',
		'i18n!modules/idcrm/ipaddrm/iprm/i18n/agency.i18n',
    	'modules/common/cloud-utils'
    ], function(FrameFormViewTpl, i18n,utils) {
    	return fish.View.extend({
    		template: fish.compile(FrameFormViewTpl),
    		i18nData: fish.extend({}, i18n),
    		events: {
    			"click #ipseg-add-room-btn":"ipsegAddRoomBtnClick"
    		},
    		
    		//这里用来进行dom操作
    		_render: function() {
    			this.$el.html(this.template(this.i18nData));
    			return this;
    		},
    		//这里用来初始化页面上要用到的fish组件
    		_afterRender: function() {
    			this.loadStaticData();
    			var popup = this.popup;
    			var me = this;

    			this.$el.on('click', '#ip-save-button', function(e) {
    				var ret = me.$('#ip-addr-info-form').form('value')||{};
    				 
    				ret.creatorId = currentUser.staffId;
                    ret.updateId = currentUser.staffId;
                    
                    	ret.id = 0;
                    	utils.ajax('ipaddrservice','updateIPAddr',ret).done(function(){
                            fish.info('保存成功');
                            popup.close(ret);

                        }).fail(function(e){
                                fish.error(e);
                            });
    			});
    		},
    		loadStaticData:function(){
    			var self = this;
    			$("select[attrCode]").each(function(o){
    				$this = $(this);
    				var attrCode = $this.attr("attrCode");    				
    				self.renderSelect($this,attrCode);
    			});
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
    		}
    	});
    });