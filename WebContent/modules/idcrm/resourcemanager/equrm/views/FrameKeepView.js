define([
		'text!modules/idcrm/resourcemanager/equrm/templates/FrameKeepView.html',
		'i18n!modules/idcrm/resourcemanager/equrm/i18n/equip.i18n',
    	'modules/common/cloud-utils',
    	'css!modules/idcrm/resourcemanager/equrm/styles/equiprm.css'
    ], function(FrameFormViewTpl, i18n,utils) {
    	return fish.View.extend({
    		template: fish.compile(FrameFormViewTpl),
    		i18nData: fish.extend({}, i18n),
    		events: {
    			"click #ipseg-add-room-btn":"ipsegAddRoomBtnClick",
    			"change #frame_keep_type":"frameKeepTypeBtnClick",
    			"click #frame-keep-choose-btn": "frameKeepChooseBtnClick",
    			"click #frame-keep-save-button": "frameKeepSaveBtnClick"
    		},
    		
    		//这里用来进行dom操作
    		_render: function() {
    			var html=$(this.template(this.i18nData));
    			this._initForm(html);
    			this.$el.html(html);
    			console.log(this);
    			return this;
    		},
    		_initForm:function(html){
    			html.find('#frame_keep_reserveddate').datetimepicker({
    				endDate: fish.dateutil.addDays(new Date(), 100)
    			});
    		},
    		//这里用来初始化页面上要用到的fish组件
    		_afterRender: function() {
    			this.loadStaticData();
    			var popup = this.popup;
    			var me = this;

    			this.$el.on('click', '#save-button', function(e) {
    				var ret = me.$('#ip-segment-form').form('value')||{};
    				ret.segmIp = ret.segmIp1+"."+ret.segmIp2+"."+ret.segmIp3+"."+ret.segmIp4;
    				if(ret.gateway1==""||ret.gateway2==""||ret.gateway3==""||ret.gateway4==""){
    					fish.info('请填写完整的网关！');
    					return;
    				}
    				ret.gateWay = ret.gateway1+"."+ret.gateway2+"."+ret.gateway3+"."+ret.gateway4;
    				ret.creatorId = currentUser.staffId;
                    ret.updateId = currentUser.staffId;
                    
                    if(me.options.action=='detail.ipSegmentAdd') {
                    	ret.id = 0;
                    	utils.ajax('ipaddrservice','addIPAddrSegment',ret).done(function(){
                            fish.info('保存成功');
                            popup.close(ret);

                        }).fail(function(e){
                                fish.error(e);
                            });
                    }else if(me.options.action=='detail.ipSegmentMod'){
                    	utils.ajax('ipaddrservice','updateIPAddrSegment',ret).done(function(){
                            fish.info('修改成功');
                            popup.close(ret);
                            
                        }).fail(function(e){
                                fish.error(e);
                            });
                    } 
    				
    			});
    		},
    		loadStaticData:function(){
    			var self = this;
    			$("select[attrCode]").each(function(o){
    				$this = $(this);
    				var attrCode = $this.attr("attrCode");    				
    				self.renderSelect($this,attrCode);
    				self.renderSelectIpMark($this,attrCode);
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
    		renderSelectIpMark:function(o,attrCode){
    			utils.ajax('ipaddrservice', 'getSplitTypeList',attrCode).done(function(ret){
    				var html="<option value=''>--请选择--</option>";
    				if(ret){
                    	for(var key in ret ){
                    		var ipSplitTypeDto = ret[key];
                    		html+="<option value='"+ipSplitTypeDto.markNum+"'>"+ipSplitTypeDto.ipMarkName+"</option>";
                    	}
                    }	
    				$("#ipseg_add_ipmark").empty();
    				$("#ipseg_add_ipmark").append($(html));
                });
    		},
    		ipsegAddRoomBtnClick: function() {
            	var self = this;
                var pop =fish.popupView({url: 'modules/idcrm/resourcemanager/equrm/views/RootSelectView',
                    width: "30%",
                    callback:function(popup,view){
                    	
                        popup.result.then(function (e) {
                        	console.log(e);
                        	self.$el.find("#ipseg_add_roomid").val(e.id);
                        	self.$el.find("#ipseg_add_roomname").val(e.name);
                        },function (e) {
                            console.log('关闭了',e);
                        });
                    }
                });
            },
            frameKeepTypeBtnClick: function() {
    			var me = this;
            	var ret = me.$('#frame-keep-form').form('value')||{};
            	if(ret.reservedObject=="440001"){
            		$("#frame-keep-choose-btn").removeAttr("disabled");
            	}
            	if(ret.reservedObject=="440002"){
            		$("#frame-keep-choose-btn").attr("disabled","disabled");
            	}
    		},
    		frameKeepChooseBtnClick: function() {
    			var self = this;
            	var pop =fish.popupView({url: 'modules/idcrm/common/custchoose/views/CustView',
                    width: "80%",
                    callback:function(popup,view){
                        popup.result.then(function (e) {
                        	self.$el.find("#frame_keep_custcode").val(e.custCode);
                         	self.$el.find("#frame_keep_custname").val(e.custName);
                         	self.$el.find("#frame_keep_adminname").val(e.lindName);
                         	self.$el.find("#frame_keep_admintel").val(e.lindMobile);
                        },function (e) {
                            console.log('关闭了',e);
                        });
                    },
                });
    		},
    		frameKeepSaveBtnClick: function(){
    			var popup = this.popup;
    			var me = this;
    			var ret = me.$('#frame-keep-form').form('value')||{};
    			ret.cusCode = ret.custCode;
				ret.creatorId = currentUser.staffId;
    			var selectedFrameIds = this.options.selectedFrame;
    			utils.ajax('equiprmService','addFrameCusRelation',selectedFrameIds,ret).done(function(){
                    fish.info('保存成功');
                    popup.close(ret);
            	}).fail(function(e){
                    fish.error(e);
                });
    		}
    	});
    });