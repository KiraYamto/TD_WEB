define([
	'text!modules/idcrm/rmconfig/templates/PortConfigView.html'+codeVerP,
	'i18n!modules/idcrm/rmconfig/i18n/PortConfig.i18n.zh.js'+codeVerP,
	'css!modules/idcrm/rmconfig/styles/PortConfig.css'+codeVerP,
	'modules/common/cloud-utils.js'+codeVerP
], function(portConfigTpl,i18nPortConfig,css,utils) {

    var _configState = {add:"1",reduce:"2"};
	var _rsConfigTag = {add:"1",reduce:"2",normal:"0"};

	return fish.View.extend({
		template: fish.compile(portConfigTpl),
		i18nData: fish.extend({}, i18nPortConfig),
		events: {
		   "click #rmconfig-port-savebtn":"submitAction",
		   "click #rmconfig-port-showbtn":"showPort",
		   "click #rmconfig-port-delPortbtn":"deletePort",
		   "click #rmconfig-port-resetPortbtn":"resetPort"
		},
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
		     //模拟传过来的参数
		  //   this.rsConfig = this.getCfgData() || {};
		     this.rsConfig = this.options.rsConfig || {};
		     if(this.rsConfig && this.rsConfig.configRequire){
		        this.configState = this.rsConfig.configRequire.configState;
		     }
		     //减少才有恢复按钮
		     if(this.configState == _configState.reduce){
		        this.$('#rmconfig-port-resetPortbtn').removeClass('hide');
		        this.$('.rmconfig-port-side').hide();
             }

		    //配置要求
		    this.$('#rmconfig-port-form').form('value',this.rsConfig);
		    this.$('#rmconfig-port-form').form('value',this.rsConfig.configRequire);
		    this.$('#rmconfig-port-form').form('disable');
            this._initCfgResultGrid();
            this._initNavTree();

		},
		_initNavTree: function(){
		    //滚动条
		    this.$('#rmconfig-port-navtree').height(400);
		    this.$('#rmconfig-port-navtree').niceScroll({
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
            this.$("#rmconfig-port-navtree").tree(options);
           //根据房间ID加载设备
            me.$("#rmconfig-port-navtree").blockUI();
            utils.ajax('netEquipService','findEquipToCfgByRoomId',this.rsConfig.roomId)
	             .done(function(nodeDatas){
	                 for(var i=0; i < nodeDatas.length;i++){
	                    nodeDatas[i].isParent=true;
	                 }
	                 me.$("#rmconfig-port-navtree").tree('reloadData',nodeDatas);
	             })
	             .always(function(){
	                 me.$("#rmconfig-port-navtree").unblockUI();
	             }); 
		},
		navTreeExpand:function(event,treeNode){
		   if(treeNode.tag == 'netEquip' && !treeNode.expanded){
		       treeNode.expanded = true;
		       var me = this;
		       //加载端口
		       utils.ajax('iRsPortService','findPortsToCfg',treeNode.id,this.rsConfig.configRequire.rate,this.rsConfig.configRequire.allocationType)
	                .done(function(nodeDatas){
	                    var portCfgTree = me.$("#rmconfig-port-navtree").tree("instance");
	                    portCfgTree.removeChildNodes(treeNode);
                        //对于配置要求为增加，当前配置环节中，第一次配置端口时，增加了一个端口，
                        //当第二次打开配置端口页面，加载端口时要过滤掉配置结果中分配状态为新增的端口。
                        if(me.configState == _configState.add){

                            var totalDatas = me.$("#rmconfig-port-cfgresult").grid('getRowData');
                            var addStatePorts = fish.filter(totalDatas,function(item){
                                 return item.rsConfigTag == _rsConfigTag.add;
                            });

                            if(addStatePorts && addStatePorts.length > 0){

								nodeDatas = fish.reject(nodeDatas,function(node){
								    var findObj = fish.find(addStatePorts,function(addPort){ 
								                     return (addPort.portId == node.id && 'portList' == node.tag);
								                  });
								    return (findObj != null);
	                            });
                            }
                        }
                        
	                    portCfgTree.addNodes(treeNode,nodeDatas);
	                });
		   }
		},
		navTreeDbClick:function(event,treeNode){//双击添加端口

		  var me = this;
		  if(me.configState == _configState.add){//增加
		       //校验是否超出要求配置数量
		        var $grid = me.$("#rmconfig-port-cfgresult");
                var totalDatas = $grid.grid('getRowData');
                if(totalDatas.length < me.rsConfig.configRequire.requireNum){
                   
                    utils.ajax('iRsPortService','getConfigPortByPortId',treeNode.id)
				         .done(function(gridNodeData){
				               //删除树节点
				               var portCfgTree = me.$("#rmconfig-port-navtree").tree("instance");
				               portCfgTree.removeNode(treeNode);
				               //更新设备的端口数量
				                var pNode = treeNode.getParentNode();
				                me.$("#equ_portCount_"+pNode.id).trigger('minusPortCount',{equId:pNode.id,minusCount:1});

                               //添加
				               gridNodeData.rsConfigTag = _rsConfigTag.add;
	                           me.$("#rmconfig-port-cfgresult").grid('addRowData',gridNodeData);
				          });

                }else{
	                fish.info('要求配置的端口数量为'+me.rsConfig.configRequire.requireNum+",不可以再增加端口！");
                }
           }
		},
		navTreeAddDiyDom: function(treeNode){//显示设备的端口数量
		    var me = this;
		    if(treeNode.tag == 'netEquip'){
		    	var aObj = me.$("#" + treeNode.tId + "_a");
				if (me.$("equ_portCount_"+treeNode.id).length>0) return;
				var countStr = "(<span id='equ_portCount_" +treeNode.id+ "' class='text-info'>"+treeNode.portCount+"</span>)";
				aObj.append(countStr);

				var countSpan = me.$("#equ_portCount_"+treeNode.id);
				if (countSpan){
					countSpan.bind("addPortCount",function(e,data){
					    var originalCount =  me.$("#equ_portCount_"+data.equId).text();
					    me.$("#equ_portCount_"+data.equId).text(parseInt(originalCount) + data.addCount);
					});
					countSpan.bind("minusPortCount",function(e,data){
					    var originalCount =  me.$("#equ_portCount_"+data.equId).text();
					    me.$("#equ_portCount_"+data.equId).text(parseInt(originalCount) - data.minusCount);
					});
				}
			}
		},
		_initCfgResultGrid:function(){
		    var me = this;
			var $srGrid = me.$("#rmconfig-port-cfgresult").grid({
				datatype: "local",
				width:'100%',
				height: 380,
				colModel: [{
					name: 'rsConfigTag',
					label: '分配状态',
					width: 80,
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
					name: 'equName',
					width: 180,
					label: '设备名称'
				}, {
					name: 'equCode',
					label: '设备编码',
					width: 180
				}, {
					name: 'boardName',
					width: 180,
					label: '模块名称'
				},{
					name: 'portSeq',
					width: 80,
					label: '端口序号'
				},{
					name: 'portName',
					width: 180,
					label: '端口名称'
				},{
					name: 'equId',
					label: '设备Id',
					hidden:true
				},{
					name: 'portId',
					label: '端口Id',
					hidden:true
				}],
				shrinkToFit:false,
				multiselect:true
			});
			if(me.rsConfig && me.rsConfig.configResult && me.rsConfig.configResult.rateResList){
                me.$("#rmconfig-port-cfgresult").grid('reloadData',me.rsConfig.configResult.rateResList);
			}
		},
		submitAction:function(){//提交按钮
		   var me = this;
		   //更新传入的端口列表
		   var tempAry = [];
		   if(!me.rsConfig.configResult || me.rsConfig.configResult == ''){
                      me.rsConfig.configResult = {};
		   }
		   me.rsConfig.configResult.rateResList = tempAry;
		   var rowDatas = me.$("#rmconfig-port-cfgresult").grid('getRowData');
		   _.each(rowDatas,function(ele,idx,list){
		       tempAry.push(_.pick(ele,'equId','equName','equCode','boardName','portName','portSeq','portId','rsConfigTag'));
		   });
		   me.popup.close({rsConfig:me.rsConfig});
		},
		showPort:function(){//弹出端口管理页面
		  var me = this;
		  fish.popupView({ 
		       url: 'modules/idcrm/resourcemanager/portrm/views/portView',canClose:true,
			   width: "85%"
		  });
		 
		},
		deletePort:function(){//删除端口
		 
		   var selRows = this.$("#rmconfig-port-cfgresult").grid('getCheckRows');
	       if (selRows==null||selRows.length==0){
	          fish.info('请选择要删除的端口');
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
                   fish.info('只能删除分配状态为【增加】的端口');
                   return;
                }
               //删除
		       var $grid = this.$("#rmconfig-port-cfgresult");
		       for(var i=0; i<selRows.length; i++){
	              $grid.grid('delRowData',selRows[i]); 
                  
                  //添加到树节点
	              var portCfgTree = this.$("#rmconfig-port-navtree").tree("instance");
	              var deviceNodes = portCfgTree.getNodesByFilter(function(node){
	                 return (node.id == selRows[i].equId && node.tag == 'netEquip');
	              }); 
	              portCfgTree.addNodes(deviceNodes[0],{id:selRows[i].portId,name:selRows[i].portName,tag:'rsPort'});
	              //更新设备的端口数量
	              $("#equ_portCount_"+selRows[i].equId).trigger('addPortCount',{equId:selRows[i].equId,addCount:1});
		       }

           }else if(this.configState == _configState.reduce){//配置状态为2--减少
               
                var isCanDel = _.every(selRows,function(item){
                    return (item.rsConfigTag == _rsConfigTag.normal);
                });
                if(!isCanDel){
                   fish.info('只能删除分配状态为【正常】的端口');
                   return;
                }
                var $grid = this.$("#rmconfig-port-cfgresult");
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
                   fish.info('要求配置的端口数量为'+this.rsConfig.configRequire.requireNum+",不可以再删除端口");
                }else{
                   fish.info('要求配置的端口数量为'+this.rsConfig.configRequire.requireNum+",只能再删除"+
                             (countRt.normalNum-this.rsConfig.configRequire.requireNum )+"个端口");
                }
           }

		},
	    resetPort:function(){//恢复端口
	       if(this.configState != _configState.reduce){
		     return;
		   }
	      this.$("#rmconfig-port-cfgresult").grid('reloadData',this.rsConfig.configResult.rateResList);
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
						  				  allocationType:"104002",
						  				  allocationTypeName:"共享"
						                },
						  configResult:{}
						};
		  var rateResList = [{
								equId:"1",
								equName:"1",
								equCode:"1",
								boardName:"1",
								portId:"1",
								portName:"1",
								portSeq:"1",
								rsConfigTag:"0"
							},
							{
								equId:"2",
								equName:"12",
								equCode:"12",
								boardName:"12",
								portId:"22",
								portName:"12",
								portSeq:"12",
								rsConfigTag:"0"
							},
							{
								equId:"3",
								equName:"12",
								equCode:"12",
								boardName:"12",
								portId:"31",
								portName:"12",
								portSeq:"12",
								rsConfigTag:"0"
							}];
		  cfgData.configResult.rateResList = rateResList;

		  return cfgData;
		}*/
	});
});