define([
    	'text!modules/idcrm/resourcemanager/equrm/templates/NetEquipmentFormView.html',
    	'i18n!modules/idcrm/resourcemanager/equrm/i18n/equip.i18n',
    	'modules/common/cloud-utils'
    ], function(FrameFormViewTpl, i18n,utils) {
    	return fish.View.extend({
    		template: fish.compile(FrameFormViewTpl),
    		i18nData: fish.extend({}, i18n),
    		events: {
    			"click #equip-net-room-detail-btn":"equipNetRoomBtnClick"
    		},
    		
    		//这里用来进行dom操作
    		_render: function() {
    			var html=$(this.template(this.i18nData));
    			html.find('#net-equip-form').form();  
    			if(this.options.action=='detail.equipNetAdd') {
    				$("#ne_equip_title",this.$el).html("设备新增");
    			 }
    			if(this.options.action=='detail.equipNetMod') {
    				$("#ne_equip_title",this.$el).html("设备修改");
    			 }
    			this.$el.html(html);
    			return this;
    		},
    		//这里用来初始化页面上要用到的fish组件
    		_afterRender: function() {
    			this.loadData();
    			this.loadStaticData();
    			var popup = this.popup;
    			var me = this;

    			this.$el.on('click', '#save-button', function(e) {
    				var ret = me.$('#net-equip-form').form('value')||{};
    				 
    				ret.creatorId = currentUser.staffId;
                    ret.updateId = currentUser.staffId;
                    
                    if(me.options.action=='detail.equipNetAdd') {
                    	ret.id = 0;
                    	utils.ajax('netEquipService','addRsNetEquip',ret).done(function(result){
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
                    }else if(me.options.action=='detail.equipNetMod'){
                    	utils.ajax('netEquipService','updateRsNetEquip',ret).done(function(result){
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
    		loadData:function(){
    			this.$el.find("#net-equip-form").form("value", this.options.selectedFrame);
    		},
    		loadStaticData:function(){
    			var self = this;
    			$("select[attrCode]",this.$el).each(function(o){
    				$this = $(this);
    				var attrCode = $this.attr("attrCode");    				
    				self.renderSelect($this,attrCode);
    			});
    			$("input[attrCode]",this.$el).each(function(o){
    				$this = $(this);
    				var attrCode = $this.attr("attrCode");    				
    				self.renderInputSel($this,attrCode);
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
    		},
    		renderInputSel:function(o,attrCode){
    			$.ajaxSetup({   
    	            async : false  
    	        }); 
    			utils.ajax('basicDataService', 'getBasicDataListByBasicType',attrCode).done(function(ret){
    				o.combobox({
    					placeholder: '--请选择--',
    					dataValueField:'code',
    					dataTextField: 'value',
    					dataSource: ret
    				});
                });
    			$.ajaxSetup({   
    	            async : true  
    	        }); 
    		},
    		equipNetRoomBtnClick: function() {
            	var self = this;
                var pop =fish.popupView({url: 'modules/idcrm/resourcemanager/equrm/views/RootSelectView',
                    width: "30%",
                    height:"80%",
                    callback:function(popup,view){
                    	
                        popup.result.then(function (e) {
                        	console.log(e);
                        	self.$el.find("#net_equip_detail_room_id").val(e.kId);
                        	self.$el.find("#net_equip_detail_room_name").val(e.name);
                        },function (e) {
                            console.log('关闭了',e);
                        });
                    }
                });
            }
    	});
    });