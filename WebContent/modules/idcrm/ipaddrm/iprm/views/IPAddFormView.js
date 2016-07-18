define([
		'text!modules/idcrm/ipaddrm/iprm/templates/IPAddFormView.html',
		'i18n!modules/idcrm/ipaddrm/iprm/i18n/agency.i18n',
    	'modules/common/cloud-utils'
    ], function(FrameFormViewTpl, i18n,utils) {
    	return fish.View.extend({
    		template: fish.compile(FrameFormViewTpl),
    		i18nData: fish.extend({}, i18n),
    		events: {
    			"click #ipseg-add-room-btn":"ipsegAddRoomBtnClick",
    			"change #ipseg_add_ipmark":"ipsegAddIpmarkBtnClick"
    		},
    		
    		//这里用来进行dom操作
    		_render: function() {
    			var html=$(this.template(this.i18nData));
    			html.find('#ip-segment-form').form();  
    			if(this.options.action=='detail.ipSegmentAdd') {
    				html.find("#ip_add_title").html("新增IP段");
    			 }
    			if(this.options.action=='detail.ipSegmentMod') {
    				html.find("#ip_add_title").html("IP段修改");
    			 }
    			this.$el.html(html);
    			console.log(this);
    			return this;
    		},
    		//这里用来初始化页面上要用到的fish组件
    		_afterRender: function() {
    			this.loadStaticData();
    			var popup = this.popup;
    			var me = this;

    			this.$el.on('click', '#save-button', function(e) {
    				var ret = me.$('#ip-segment-form').form('value')||{};
    				ret.segmIp = ret.segmIp1+"."+ret.segmIp2+"."+ret.segmIp3+"."+ret.segmIp4;
//    				if(ret.gateway1==""||ret.gateway2==""||ret.gateway3==""||ret.gateway4==""){
//    					fish.info('请填写完整的网关！');
//    					return;
//    				}
    				if(ret.gateway1==""||ret.gateway2==""||ret.gateway3==""||ret.gateway4==""){
    					ret.gateway = '';
    				}else{
    					ret.gateway = ret.gateway1+"."+ret.gateway2+"."+ret.gateway3+"."+ret.gateway4;
    				}
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
                    	ret.ipMark = me.options.sendipMark;
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
    			if(this.options.action=='detail.ipSegmentMod') {
    				$("#ipseg_add_segmip1").attr("disabled","disabled");
    				$("#ipseg_add_segmip2").attr("disabled","disabled");
    				$("#ipseg_add_segmip3").attr("disabled","disabled");
    				$("#ipseg_add_segmip4").attr("disabled","disabled");
    				$("#ipseg_add_gateway1").attr("disabled","disabled");
    				$("#ipseg_add_gateway2").attr("disabled","disabled");
    				$("#ipseg_add_gateway3").attr("disabled","disabled");
    				$("#ipseg_add_gateway4").attr("disabled","disabled");
    				$("#ipseg_add_ipmark").attr("disabled","disabled");
    				$("#ipseg-add-room-btn").attr('disabled','disabled');
    			}
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
    				o.empty();
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
                var pop =fish.popupView({url: 'modules/idcrm/ipaddrm/iprm/views/DataCenterSelectView',
                    width: "30%",
                    height: 550,
                    callback:function(popup,view){
                    	
                        popup.result.then(function (e) {
                        	console.log(e);
                        	self.$el.find("#ipseg_add_dcid").val(e.id);
                        	self.$el.find("#ipseg_add_dcname").val(e.name);
                        },function (e) {
                            console.log('关闭了',e);
                        });
                    }
                });
            },
            ipsegAddIpmarkBtnClick: function(){
            	var me = this;
            	var ret = me.$('#ip-segment-form').form('value')||{};
            	if($.trim(ret.segmIp1)==''||$.trim(ret.segmIp2)==''||$.trim(ret.segmIp3)==''||$.trim(ret.segmIp4)==''){
            		fish.info("请先填写完整的IP地址！");
            		var self = this;
            		self.renderSelectIpMark($this,'SPLIT_TYPE');
            		return;
            	}
    			var a = $("#ipseg_add_ipmark").val();
    			var ipaddr = ret.segmIp1+"."+ret.segmIp2+"."+ret.segmIp3+"."+ret.segmIp4;
    			if(a==24){
    				$("#ipseg_add_sumnetnum").val('1');
    				$("#ipseg_add_sumnetipnum").val('256');
    				$("#ipseg_add_segmname").val(ipaddr+"/"+a);
    				$("#ipseg_add_segmcode").val(ipaddr+"/"+a);
    			}
    			if(a==25){
    				$("#ipseg_add_sumnetnum").val('2');
    				$("#ipseg_add_sumnetipnum").val('128');
    				$("#ipseg_add_segmname").val(ipaddr+"/"+a);
    				$("#ipseg_add_segmcode").val(ipaddr+"/"+a);
    			}
    			if(a==26){
    				$("#ipseg_add_sumnetnum").val('4');
    				$("#ipseg_add_sumnetipnum").val('64');
    				$("#ipseg_add_segmname").val(ipaddr+"/"+a);
    				$("#ipseg_add_segmcode").val(ipaddr+"/"+a);
    			}
    		}
    	});
    });