define([
    	'text!modules/idcrm/resourcemanager/equrm/templates/NetEquipmentBoardFormView.html',
    	'i18n!modules/idcrm/resourcemanager/equrm/i18n/equip.i18n',
    	'modules/common/cloud-utils'
    ], function(FrameFormViewTpl, i18n,utils) {
    	return fish.View.extend({
    		template: fish.compile(FrameFormViewTpl),
    		i18nData: fish.extend({}, i18n),
    		events: {
    			"click #equip-net-board-detail-parent-btn":"equipNetRoomBtnClick"
    		},
    		
    		//这里用来进行dom操作
    		_render: function() {
    			var html=$(this.template(this.i18nData));
    			html.find('#net-equip-form').form();  
    			this.$el.html(html);
    			if(this.options.action=='detail.equipNetBoardAdd') {
    				this.$("#ne_equip_board_title",html).html("网络设备槽位新增");
    			 }
    			if(this.options.action=='detail.equipNetBoardMod') {
    				this.$("#equipBoardPortDiv").css({"display":"none"});
    				this.$("#ne_equip_board_title",html).html("网络设备槽位修改");
    			 }
    			return this;
    		},
    		//这里用来初始化页面上要用到的fish组件
    		_afterRender: function() {
    			this.loadStaticData();
    			var popup = this.popup;
    			var me = this;
    			var netEquip = me.options.netEquip;
    			$("#net-equip-board-form").form("value", this.options.selectedBoard);

    			this.$el.on('click', '#save-button', function(e) {
    				var ret = me.$('#net-equip-board-form').form('value')||{};
    				 
    				ret.creatorId = currentUser.staffId;
                    ret.updateId = currentUser.staffId;
                    ret.roomId = netEquip.roomId;
                    ret.equipmentId = netEquip.id;
                    if(ret.parentId == ''){
                    	ret.parentId = 0;
                    }
                    
                    var batchPortDto = {creatorId:currentUser.staffId, updateId:currentUser.staffId, roomId:netEquip.roomId, equipmentId:netEquip.id};
                    batchPortDto.seriesNo = ret.portNumStartPos;
                	batchPortDto.allocationType = ret.portShareStyle;
                	batchPortDto.rateId = ret.portRate;
                	batchPortDto.portNum = ret.portNum;
                	batchPortDto.comments = ret.comments;
                	
                	// 添加槽位
                    if(me.options.action=='detail.equipNetBoardAdd') {
                    	ret.id = 0;
                    	utils.ajax('netEquipBoardService','addRsNetEquipBoard',ret).done(function(result){
                    		if(result){
                    			if(result.code==0){
                    				//fish.info('保存成功');
                    				
                    				// 批量增加端口
                    				batchPortDto.boardId = result.busiId;
                                	console.log(batchPortDto);
                                    utils.ajax('iRsPortService','batchInsert',batchPortDto).done(function(){
                                        fish.info('保存成功');
                                        popup.close(ret);
                                    }).fail(function(e){
                                        fish.error(e);
                                    });
                                    
                    			}else{
                    				fish.info(result.msg);
                    			}
                    		}else{
                    			fish.info('消息未返回');
                    		}                           

                        }).fail(function(e){
                                fish.error(e);
                        });
                        
                    }else if(me.options.action=='detail.equipNetBoardMod'){
                    	utils.ajax('netEquipBoardService','updateRsNetEquipBoard',ret).done(function(result){
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
    		loadStaticData:function(){
    			var self = this;
    			this.$("input[attrCode]",this.$el).each(function(o){
    				$this = $(this);
    				var attrCode = $this.attr("attrCode");    				
    				self.renderSelect($this,attrCode);
    			});
    			this.$("#isParentEquip").combobox({
					placeholder: '--请选择--',
					dataValueField:'code',
					dataTextField: 'value',
					dataSource: [{code:'1', value:'是'},{code:'0', value:'否'}]
				});
    			
    			
    		},
    		renderSelect:function(o,attrCode){
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
            	var viewOptionO ={};
            	var ret = this.$('#net-equip-board-form').form('value')||{};
            	var actType = "";
            	if(this.options.action=='detail.equipNetBoardMod'){
            		actType = "mod";
            	}else{
            		actType = "add";
            	}
            	viewOptionO = {netEquip:this.options.netEquip,netEquipBoardId:ret.id,action:actType};
                var pop =fish.popupView({url: 'modules/idcrm/resourcemanager/equrm/views/NetEquipBoardSelectView',
                    width: "50%",
                    callback:function(popup,view){
                    	
                        popup.result.then(function (e) {
                        	console.log(e);
                        	$("#net_equip_board_detail_parentId",self.$el).val(e.id);
                        	$("#net_equip_board_detail_parentName",self.$el).val(e.positionNum);
                        },function (e) {
                            console.log('关闭了',e);
                        });
                    },
                	viewOption:viewOptionO
                });
            }
    	});
    });