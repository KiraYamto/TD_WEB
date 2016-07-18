define([
	'text!modules/idcrm/rmconfig/templates/IPConfigView.html'+codeVerP,
	'i18n!modules/idcrm/rmconfig/i18n/IPConfig.i18n.zh.js'+codeVerP,
	'css!modules/idcrm/rmconfig/styles/IPConfig.css'+codeVerP,
	'modules/common/cloud-utils.js'+codeVerP
], function(portConfigTpl,i18nPortConfig,css,utils) {

    var _configState = {add:"1",reduce:"2"};
	var _rsConfigTag = {add:"1",reduce:"2",normal:"0"};

	return fish.View.extend({
		template: fish.compile(portConfigTpl),
		i18nData: fish.extend({}, i18nPortConfig),
		events: {
		   "click #rmconfig-ip-savebtn":"submitAction",
		   "click #rmconfig-ip-showbtn":"showPort",
		   "click #rmconfig-ip-delPortbtn":"deletePort",
		   "click #rmconfig-ip-resetPortbtn":"resetPort"
		},
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
		     //模拟传过来的参数
		 //    this.rsConfig = this.getCfgData() || {};
		     this.rsConfig = this.options.rsConfig || {};
		     if(this.rsConfig && this.rsConfig.configRequire){
		         this.configState = this.rsConfig.configRequire.configState;
		     }
		     //减少才有恢复按钮
		     if(this.configState == _configState.reduce){
		        this.$('#rmconfig-ip-resetPortbtn').removeClass('hide');
		        this.$('.rmconfig-ip-side').hide();
             }

		    //配置要求
		    this.$('#rmconfig-ip-form').form('value',this.rsConfig);
		    this.$('#rmconfig-ip-form').form('value',this.rsConfig.configRequire);
		    this.$('#rmconfig-ip-form').form('disable');
            this._initCfgResultGrid();
            this._initNavTree();

		},
		_initNavTree: function(){
		    //滚动条
		    this.$('#rmconfig-ip-navtree').height(400);
		    this.$('#rmconfig-ip-navtree').niceScroll({
			        cursorcolor: '#1d5987',
			        cursorwidth: "10px",
			        cursoropacitymax:"0.4"
			});

		    var me = this;
		    var navTreeExpand = $.proxy(this.navTreeExpand,this);
		    var navTreeDbClick = $.proxy(this.navTreeDbClick,this);
		    var navTreeAddDiyDom = $.proxy(this.navTreeAddDiyDom,this);
		    var options = {
                            view: {
                                dblClickExpand: false,
                                addDiyDom: navTreeAddDiyDom
                            },
                            callback: {
                                onExpand:navTreeExpand,
                                onDblClick: navTreeDbClick
                            }
                          };
            this.$("#rmconfig-ip-navtree").tree(options);
           //根据房间ID加载IP地址段
            me.$("#rmconfig-ip-navtree").blockUI();
            utils.ajax('ipaddrservice','findIPSeqToCfgByRoomId',this.rsConfig.roomId)
	             .done(function(nodeDatas){
	                 //将返回的pId设置为空，防止pId与返回的某个节点ID相同，导致显示不对
	                 for(var i=0; i < nodeDatas.length;i++){
	                    nodeDatas[i].isParent=true;
	                 }
	                 me.$("#rmconfig-ip-navtree").tree('reloadData',nodeDatas);
	             })
	             .always(function(){
	                 me.$("#rmconfig-ip-navtree").unblockUI();
	             }); 
		},
		navTreeExpand:function(event,treeNode){
		   if(treeNode.tag == 'IPAddrSeq' && !treeNode.expanded){
		       treeNode.expanded = true;
		       var me = this;
		       //加载IP
		       utils.ajax('ipaddrservice','findIPAddrToCfgByIPSegId',treeNode.id)
	                .done(function(nodeDatas){
	                    var portCfgTree = me.$("#rmconfig-ip-navtree").tree("instance");
	                    portCfgTree.removeChildNodes(treeNode);
	                    
	                    //对于配置要求为增加，当前配置环节中，第一次配置ip时，增加了一个ip，
                        //当第二次打开配置ip页面，加载ip时要过滤掉配置结果中分配状态为新增的ip。
                        if(me.configState == _configState.add){

                            var totalDatas = me.$("#rmconfig-ip-cfgresult").grid('getRowData');
                            var addStateIps = fish.filter(totalDatas,function(item){
                                 return item.rsConfigTag == _rsConfigTag.add;
                            });

                            if(addStateIps && addStateIps.length > 0){

								nodeDatas = fish.reject(nodeDatas,function(node){
								    var findObj = fish.find(addStateIps,function(addIp){ 
								                     return (addIp.ipId == node.id);
								                  });
								    return (findObj != null);
	                            });
                            }
                        }
	                    
	                    portCfgTree.addNodes(treeNode,nodeDatas);
	                });
		   }
		},
		navTreeDbClick:function(event,treeNode){//双击添加IP

		  var me = this;
		  if(me.configState == _configState.add){//增加
		       //校验是否超出要求配置数量
		        var $grid = me.$("#rmconfig-ip-cfgresult");
                var totalDatas = $grid.grid('getRowData');
                if(totalDatas.length < me.rsConfig.configRequire.requireNum){
                   
	               //删除树节点
	               var portCfgTree = me.$("#rmconfig-ip-navtree").tree("instance");
	               portCfgTree.removeNode(treeNode);
	               //更新IP地址段的IP数量
	                var pNode = treeNode.getParentNode();
	                me.$("#ipseg_portCount_"+pNode.id).trigger('minusPortCount',{ipSegId:pNode.id,minusCount:1});

                   //添加
                   var pNode = treeNode.getParentNode();
                   var gridNodeData = {
										 ipSegId:pNode.id,
										 ipSegName:pNode.name,
										 ipId:treeNode.id,
										 ipName:treeNode.name,
										 rsConfigTag:_rsConfigTag.add
									  };
                   me.$("#rmconfig-ip-cfgresult").grid('addRowData',gridNodeData);

                }else{
	                fish.info('要求配置的IP数量为'+me.rsConfig.configRequire.requireNum+",不可以再增加IP！");
                }
           }
		},
		navTreeAddDiyDom: function(treeNode){//显示IP地址段的IP数量
		    var me = this;
		    if(treeNode.tag == 'IPAddrSeq'){
		    	var aObj = me.$("#" + treeNode.tId + "_a");
				if (me.$("ipseg_portCount_"+treeNode.id).length>0) return;

				var countStr = "(<span id='ipseg_portCount_" +treeNode.id+ "' class='text-info'>"+treeNode.ipCount+"</span>)";
				aObj.append(countStr);

				var countSpan = me.$("#ipseg_portCount_"+treeNode.id);
				if (countSpan){
					countSpan.bind("addPortCount",function(e,data){
					    var originalCount =  me.$("#ipseg_portCount_"+data.ipSegId).text();
					    me.$("#ipseg_portCount_"+data.ipSegId).text(parseInt(originalCount) + data.addCount);
					});
					countSpan.bind("minusPortCount",function(e,data){
					    var originalCount =  me.$("#ipseg_portCount_"+data.ipSegId).text();
					    me.$("#ipseg_portCount_"+data.ipSegId).text(parseInt(originalCount) - data.minusCount);
					});
				}
			}
		},
		_initCfgResultGrid:function(){
		    var me = this;
			var $srGrid = me.$("#rmconfig-ip-cfgresult").grid({
				datatype: "local",
				width:'100%',
				height: 380,
				colModel: [{
					name: 'rsConfigTag',
					label: '分配状态',
					width: '30%',
					formatter:function(cellval,opts,rwdat,_act){
					   if(cellval == 0){
					       return '正常';
					   }else if(cellval == 1){
                           return '增加';
					   }else if(cellval == 2){
                           return '减少';
					   }
					   return cellval;
					}
				}, {
					name: 'ipSegName',
					width: '35%',
					label: 'IP地址段'
				}, {
					name: 'ipName',
					label: 'IP地址',
					width: '35%'
				},{
					name: 'ipSegId',
					label: 'IP地址段Id',
					hidden:true
				},{
					name: 'ipId',
					label: 'IPId',
					hidden:true
				}],
				multiselect:true
			});
			if(me.rsConfig && me.rsConfig.configResult && me.rsConfig.configResult.ipResList){
			    me.$("#rmconfig-ip-cfgresult").grid('reloadData',me.rsConfig.configResult.ipResList);
			}
          
		},
		submitAction:function(){//提交按钮
		   var me = this;
		   //更新传入的IP列表
		   var tempAry = [];
		   if(!me.rsConfig.configResult || me.rsConfig.configResult == ''){
                         me.rsConfig.configResult = {};
		   }
		   me.rsConfig.configResult.ipResList = tempAry;
		   var rowDatas = me.$("#rmconfig-ip-cfgresult").grid('getRowData');
		   _.each(rowDatas,function(ele,idx,list){
		       tempAry.push(_.pick(ele,'ipSegId','ipSegName','ipId','ipName','rsConfigTag'));
		   });
		   me.popup.close({rsConfig:me.rsConfig});
		},
		showPort:function(){//弹出IP管理页面
		  var me = this;
		  fish.popupView({ 
		       url: 'modules/idcrm/ipaddrm/iprm/views/IPFormView',canClose:true,
			   width: "85%",
			   callback:function(popup,view){
			      //将打开的内容放入对话框中
			      var innerViewHtml = view.$el.html();
			      view.$el.html('<div class="modal-header"><button type="button" class="close" data-dismiss="" aria-label="Close">'
			                   +' <span aria-hidden="true">×</span></button><h4 class="modal-title">IP管理</h4></div>'
			                   +'<div class="modal-body">'+innerViewHtml+'</div>');
			   }
		  });
		 
		},
		deletePort:function(){//删除IP
		 
		   var selRows = this.$("#rmconfig-ip-cfgresult").grid('getCheckRows');
	       if (selRows==null||selRows.length==0){
	          fish.info('请选择要删除的IP');
	          return;
	       }
	       //校验配置状态（configState）和资源分配标识（rsConfigTag）
	       //配置状态为1--增加 需要在原先配置要求上增加资源，允许删除单个资源标记为1(add)的资源
           //配置状态为2--减少 需要在原先配置要求上减少资源，不允许新增资源,允许删除单个资源标记为0的资源，删除时只将单个资源标记从0更改为2
           if(this.configState ==  _configState.add){//配置状态为1--增加
                var isCanDel = _.every(selRows,function(item){
                    return (item.rsConfigTag == _rsConfigTag.add);
                });
                if(!isCanDel){
                   fish.info('只能删除分配状态为【增加】的IP');
                   return;
                }
               //删除
		       var $grid = this.$("#rmconfig-ip-cfgresult");
		       for(var i=0; i<selRows.length; i++){
	              $grid.grid('delRowData',selRows[i]); 
                  
                  //添加到树节点
	              var portCfgTree = this.$("#rmconfig-ip-navtree").tree("instance");
	              var ipSegNodes = portCfgTree.getNodesByFilter(function(node){
	                 return (node.id == selRows[i].ipSegId && node.tag == 'IPAddrSeq');
	              }); 
	              portCfgTree.addNodes(ipSegNodes[0],{id:selRows[i].portId,name:selRows[i].ipName,tag:'rsPort'});
	              //更新IP地址段的IP数量
	              $("#ipseg_portCount_"+selRows[i].ipSegId).trigger('addPortCount',{ipSegId:selRows[i].ipSegId,addCount:1});
		       }

           }else if(this.configState == _configState.reduce){//配置状态为2--减少
               
                var isCanDel = _.every(selRows,function(item){
                    return (item.rsConfigTag == _rsConfigTag.normal);
                });
                if(!isCanDel){
                   fish.info('只能删除分配状态为【正常】的IP');
                   return;
                }
                var $grid = this.$("#rmconfig-ip-cfgresult");
                var totalDatas = $grid.grid('getRowData');
                var countRt = _.countBy(totalDatas,function(item){
                    return item.rsConfigTag == _rsConfigTag.normal?'normalNum':'otherNum';
                });
                if((countRt.normalNum-selRows.length) >= this.rsConfig.configRequire.requireNum ){
                    //更新配置状态为减少
			        for(var i=0; i<selRows.length; i++){
			           selRows[i].rsConfigTag = _rsConfigTag.reduce;
		               $grid.grid('setRowData',selRows[i]);  
			        }
                }else if(countRt.normalNum == this.rsConfig.configRequire.requireNum){
                   fish.info('要求配置的IP数量为'+this.rsConfig.configRequire.requireNum+",不可以再删除IP");
                }else{
                   fish.info('要求配置的IP数量为'+this.rsConfig.configRequire.requireNum+",只能再删除"+
                             (countRt.normalNum-this.rsConfig.configRequire.requireNum )+"个IP");
                }
           }

		},
	    resetPort:function(){//恢复IP
	       if(this.configState != _configState.reduce){
		     return;
		   }
	      this.$("#rmconfig-ip-cfgresult").grid('reloadData',this.rsConfig.configResult.ipResList);
		}/*,
		getCfgData: function(){//传过来的造数据
		  var cfgData = { roomId:"2",
						  roomName:"机房名称2",
						  circuitId:"",
						  configRequire:{
						  				  totalNum:"3",
						  				  configState:"1",
						  				  requireNum:"5",
						  				  requireRsType:"",
						  				  unitPower:"10001",
						  				  unitPowerName:"1KW",
						  				  rate:"1",
						  				  rateName:"200Kb/s",
						  				  allocationType:"1",
						  				  allocationTypeName:"整柜出租"
						                },
						  configResult:{}
						};
		  var ipResList = [{
							   ipSegId:"1",
							   ipSegName:"10.10.10.0",
							   ipId:"1",
							   ipName:"10.10.10.1",
							   rsConfigTag:"0"
							},
							{
							   ipSegId:"2",
							   ipSegName:"10.10.20.0",
							   ipId:"2",
							   ipName:"10.10.20.1",
							   rsConfigTag:"0"
							},{
							   ipSegId:"3",
							   ipSegName:"10.10.30.0",
							   ipId:"2",
							   ipName:"10.10.30.1",
							   rsConfigTag:"0"
							}];
		  cfgData.configResult.ipResList = ipResList;

		  return cfgData;
		} */
	});
});