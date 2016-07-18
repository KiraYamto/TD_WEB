define([
    	'text!modules/idcrm/ipaddrm/iprm/templates/IPFormView.html',
    	'i18n!modules/idcrm/ipaddrm/iprm/i18n/agency.i18n',
    	'modules/common/cloud-utils',
    	'css!modules/idcrm/ipaddrm/iprm/styles/ipAddr.css'
    ], function(AgencyMenegementViewTpl, i18nAgency,utils) {
    	return fish.View.extend({
    		template: fish.compile(AgencyMenegementViewTpl),
    		i18nData: fish.extend({}, i18nAgency),
    		events: {
                "click #ipseg-management-btn": "ipsegManagementBtnClick",
                "click #ipseg-breakup-btn": "ipsegBreakupBtnClick",
                "click #ipseg-combine-btn": "ipsegCombineBtnClick",
                "click #ipseg-mod-btn": "ipsegModBtnClick",
                "click #ipseg-del-btn": "ipsegDelBtnClick",
                "click #ipseg-query-btn": "ipsegQueryBtnClick",
                "click #ipseg-export-btn": "ipsegExportBtnClick",
                "click #ipseg-add-btn": "ipsegAddBtnClick",
                "click #ipseg-qry-room-btn":"ipsegQryRoomBtnClick",
                "click #ipseg-treeQry-btn":"equipTreeQryBtnClick",
                "click #ipseg-morequery-btn": "ipsegMoreQueryBtnClick",
                "keypress #spacerm-dc-ip-dcname":"inputkeyDown",
                "click #spacerm-dc-ip-search-btn":"searchNavTree"
    		},
    		//这里用来进行dom操作
    		_render: function() {
    			var html=this.$el.html(this.template(this.i18nData));
    			html.find("#ipsegView-qryContentDiv").hide();
    			html.find("#ipsegm-Tree").height($(window).height-200);
//                this.$el.html(html);
    			return this;
    		},

    		//这里用来初始化页面上要用到的fish组件
    		_afterRender: function() {
    			this.loadStaticData();
//                this.initTreeRender();
//                this.loadTreeRender();
    			this.loadIpSegmentRender();
    			this._initSpaceTree();
    			this.getIpSegmentData(1);
    		},
    		loadStaticData:function(){
    			var self = this;
    			$("input[attrCode]").each(function(o){
    				$this = $(this);
    				var attrCode = $this.attr("attrCode");
    				self.renderSelect($this,attrCode);				
    			});
    		},
    		renderSelect:function(o,attrCode){
    			utils.ajax('basicDataService', 'getBasicDataListByBasicType',attrCode).done(function(ret){
    				/**var html="<option value=''>--请选择--</option>";
    				if(ret){
                    	for(var key in ret ){
                    		var basicDataDto = ret[key];
                    		html+="<option value='"+basicDataDto.code+"'>"+basicDataDto.value+"</option>";
                    	}
                    }
    				o.empty();
    				o.append($(html));*/
    				o.combobox({
    					placeholder: '--请选择--',
    					dataValueField:'code',
    					dataTextField: 'value',
    					dataSource: ret
    				});
                });
    		},
            // 初始化导航树
            initTreeRender: function() {

                $("#ipsegm-treeDiv").height($(window).height()-170);
                $("#ipsegm-Tree").height($(window).height()-180);
                $("#ipsegm-treeDiv").niceScroll({
                    cursorcolor: '#CE0015',
                    cursorwidth: "6px"
                });

                var self= this;
                var options = {
                    view: {
                        dblClickExpand: false
                    },
                    data: {
                        simpleData: {
                        	enable: false
                        }
                    },
                    fNodes: [],
                    callback: {
                        onClick: function(e, treeNode) {
                            var isDataCenter = (treeNode && treeNode.isParent && treeNode.tag == "dataCenter"); // 是根节点，并且是数据中心，则点击加载信息
                            if(isDataCenter) {
                            	$("#ipseg_qry_dcname").val(treeNode.name);
                                $("#ipseg_qry_dcid").val(treeNode.id);
                                self.getIpSegmentData(1);
                            }
                        },
                        onExpand: $.proxy(this.onClick, this)
                    }
                };
                $("#ipsegm-Tree").tree(options);

            },
            // 加载导航树
            loadTreeRender: function() {

                // 查询的时候 锁定页面
                if ($('#ipsegm-treeDiv').data('blockui-content')) {
                    $('#ipsegm-treeDiv').unblockUI().data('blockui-content', false);
                } else {
                    $('#ipsegm-treeDiv').blockUI({
                        message: '加载中......'
                    }).data('blockui-content', true);
                }

                var nodeName = $("#ipseg-nodeName").val();
                utils.ajax('equiprmService', 'findFrameTreeByCond', nodeName, false, false).done(function(ret){
                    $("#ipsegm-Tree").tree("reloadData", ret);

                    // 解锁页面
                    $('#ipsegm-treeDiv').unblockUI().data('blockui-content', false);
                });

            },
            _initSpaceTree: function(){
        		var me =this;
        		//滚动条
        		    me.$('#ipsegm-Tree').height(495);
        		    me.$('#ipsegm-Tree').niceScroll({
        			        cursorcolor: '#CE0015',
        			        cursorwidth: "7px"
        			});
                     
        		     var onNavTreeClick = $.proxy(this.onNavTreeClick,this); //函数作用域改变
                     var settings = {
                          view:{
                             dblClickExpand: false
                          },
                          data: {
                                  simpleData: {
                                      enable: true,
                                      rootPId:'area_0'
                                  }
                                },
                         callback: {
//                                     onClick: onNavTreeClick
                                     onClick: function(e, treeNode) {
                                         var isDataCenter = (treeNode && treeNode.tag == "dataCenter"); // 是根节点，并且是数据中心，则点击加载信息
                                         if(isDataCenter) {
                                         	$("#ipseg_qry_dcname").val(treeNode.name);
                                            $("#ipseg_qry_dcid").val(treeNode.id.split('_')[1]);
                                            me.getIpSegmentData(1);
                                         }
                                     }
                                   }
                     };
                     me.$("#ipsegm-Tree").tree(settings);
                     //获取区域和数据中心
                    this.$("#ipsegm-Tree").blockUI({message:''});
                    utils.ajax('commonService','getAllAreasAndDcsTree')
        		   	     .always(function(){
                             me.$("#ipsegm-Tree").unblockUI();   
                         })
        		   	     .done(function(nodeDatas){   
        		   	          if(!nodeDatas){
        		   	             nodeDatas = [];
        			   	      }
        	                  fish.each(nodeDatas,function(element, index){
        			   	          element.icon = me.getNavtreeIcon(element.tag,element.grade);
        			   	      });             
                              me.$("#ipsegm-Tree").tree('reloadData',nodeDatas);
                         }).fail(function(){
                                console.log("加载空间树失败");
                         }); 
        		},
            loadIpSegmentRender: function() {
    			this.$("#ip-segment-grid").grid({
    				datatype: "json",
				
    				height: 400,
    				colModel: [{
                        name: 'ID',
                        label: 'ID',
                        key:true,
                        hidden:true
                    },{
    					name: 'segmIp',
    					label: 'IP地址',
    					width: 100,
    					hidden:true
    				},{
    					name: 'sumNetNum',
    					label: '子网个数',
    					width: 100,
    					hidden:true
    				},{
    					name: 'sumNetIpNum',
    					label: '子网IP数',
    					width: 100,
    					hidden:true
    				},{
    					name: 'parentId',
    					label: '上级地址段ID',
    					width: 100,
    					hidden:true
    				},{
    					name: 'adminName',
    					label: '联系人',
    					width: 100,
    					hidden:true
    				},{
    					name: 'adminTel',
    					label: '联系人电话',
    					width: 100,
    					hidden:true
    				},{
    					name: 'rsTypeId',
    					label: '资源类型ID',
    					width: 100,
    					hidden:true
    				},
                    		{
    					name: 'segmUse',
    					label: '用途',
    					width: 100,
    					hidden:true
    				},{
    					name: 'segmType',
    					label: '地址性质',
    					width: 100,
    					hidden:true
    				},
    				{
    					name: 'useState',
    					label: '占用状态',
    					width: 100,
    					hidden:true
    				},{
    					name: 'serviceTypeId',
    					label: '业务类型',
    					width: 100,
    					hidden:true
    				},{
    					name: 'segmDesc',
    					label: '描述',
    					width: 100,
    					hidden:true
    				},{
    					name: 'comments',
    					label: '备注',
    					width: 100,
    					hidden:true
    				},
    				{
    					name: 'dcId',
    					label: '所属数据中心',
    					width: 100,
    					hidden:true
    				},
    				{
    					name: 'segmCode',
    					label: '地址段编码',
    					width: 100,
    					hidden:true
    				},
    				{
    					name: 'segmName',
    					label: '地址段名称',
    					width: 120
    				}, {
    					name: 'parentCode',
    					width: 120,
    					label: '所属地址段'
    				}, 
    				{
    					name: 'dcName',
    					label: '所属数据中心',
    					width: 120
    				}, 
    				{
    					name: 'useStateName',
    					width: 80,
    					label: '业务状态'
    				}, {
                        name: 'startIp',
                        width: 100,
                        label: '起始IP'
                    }, {
                        name: 'endIp',
                        width: 100,
                        label: '终止IP'
                    }, 
                    {
                        name: 'sumNetIpNum',
                        width: 100,
                        label: 'IP地址总数'
                    },
                    {
                        name: 'segmUseName',
                        width: 80,
                        label: '用途'
                    }, {
                        name: 'gateway',
                        width: 100,
                        label: '网关'
                    }, {
                        name: 'ipMark',
                        width: 100,
                        label: '子网掩码'
                    },
                    {
                        name: 'useNum',
                        width: 80,
                        label: '使用数'
                    },
                    {
                        name: 'freeNum',
                        width: 80,
                        label: '空闲数'
                    },
                    {
                        name: 'occuRate',
                        width: 100,
                        label: '占用率'
                    },
                    ],
                    rowNum: 10,
                    multiselect: true,
                    displayNum:5,
                    shrinkToFit: false,
                    rownumbers:true,
                    pager: true,
                    server: true,
                    recordtext: "当前显示 {0} - {1} 条记录 共 {2} 条记录",
                    pgtext: "第 {0} 页 / 共 {1} 页",
                    emptyrecords: "没有记录",
    				pageData: this.getIpSegmentData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
    			});
    		},
    		getIpSegmentData:  function(page, sortname, sortorder) {
            	var rowNum = $("#ip-segment-grid").grid("getGridParam", "rowNum");
                // 查询的时候 锁定页面
                if ($('#ip-segment-grid').data('blockui-content')) {
                    $('#ip-segment-grid').unblockUI().data('blockui-content', false);
                } else {
                    $('#ip-segment-grid').blockUI({
                        message: '加载中......'
                    }).data('blockui-content', true);
                }
                var dcName = $("#ipseg_qry_dcname").val();
                if($.trim(dcName)==""){
                	$("#ipseg_qry_dcid").val("");
                }
                var cond = utils.getConditions("ip-segment-query-cond");
                var queryParamsDto ={};
                queryParamsDto["pageIdx"]=page;
                queryParamsDto["pageSize"]=rowNum;
                queryParamsDto["conditions"]=cond;
    			utils.ajax('ipaddrservice', 'findIPAddrSegmentListByCond', queryParamsDto).done(function(ret){
                    $("#ip-segment-grid").grid("reloadData", ret);

                    // 解锁页面
                    $('#ip-segment-grid').unblockUI().data('blockui-content', false);
                    
                });
            },
            // 更多查询
            ipsegMoreQueryBtnClick: function() {
                if("更多查询↓" == $("#ipseg-morequery-btn").html()) {//ipseg-morequery-btn
                    $("#ipsegView-qryContentDiv").show();
                    $("#ipseg-morequery-btn").html("收起↑");
                    $("#ip-segment-grid").grid("setGridHeight", $(window).height()-288);
                } else {
                    $("#ipsegView-qryContentDiv").hide();
                    $("#ipseg-morequery-btn").html("更多查询↓");
                    $("#ip-segment-grid").grid("setGridHeight", $(window).height()-190);
                }
            },
            // IP地址段修改
            ipsegModBtnClick: function() {
                var reloadIpSegmentData= $.proxy(this.getIpSegmentData,this);

                var selectedFrameIds = $("#ip-segment-grid").grid('getGridParam', 'selarrrow');
                if (selectedFrameIds == null || selectedFrameIds.length == 0) {
                    fish.info("请选择一项数据！");
                    return;
                }

                if(selectedFrameIds.length > 1) {
                    fish.info("只能修改一条数据！");
                    return;
                }
                var selectedFrame = $("#ip-segment-grid").grid("getRowData", selectedFrameIds[0]);
                var pop =fish.popupView({url: 'modules/idcrm/ipaddrm/iprm/views/IPAddFormView',
                    width: "80%",
                    callback:function(popup,view){
                    	console.log(selectedFrame);
                        var selectedFrame = $("#ip-segment-grid").grid("getRowData", selectedFrameIds[0]);
                        var segmIpStr = selectedFrame.segmIp.split(".");
                        selectedFrame.segmIp1= segmIpStr[0];
                        selectedFrame.segmIp2= segmIpStr[1];
                        selectedFrame.segmIp3= segmIpStr[2];
                        selectedFrame.segmIp4= segmIpStr[3];
                        //网关ip暂时用不到先注释
//                    	var gateWayStr = selectedFrame.gateway.split(".");
//                        selectedFrame.gateway1= gateWayStr[0];
//                        selectedFrame.gateway2= gateWayStr[1];
//                        selectedFrame.gateway3= gateWayStr[2];
//                        selectedFrame.gateway4= gateWayStr[3];
                        
                        view.$el.find("#ip-segment-form").form("value", selectedFrame);
                        popup.result.then(function (e) {
                        	reloadIpSegmentData();
                        },function (e) {
                            console.log('关闭了',e);
                        });
                    },
                    viewOption:{action:"detail.ipSegmentMod",segmId:selectedFrame.id,sendipMark:selectedFrame.ipMark}
                });
            },
            //IP地址管理
            ipsegManagementBtnClick:function() {
            	
            	var selectedFrameIds = $("#ip-segment-grid").grid('getGridParam', 'selarrrow');
                if (selectedFrameIds == null || selectedFrameIds.length == 0) {
                    fish.info("请选择一项数据！");
                    return;
                }

                if(selectedFrameIds.length > 1) {
                    fish.info("只能选择一条数据！");
                    return;
                }
            	var reloadIpSegmentData = $.proxy(this.getIpSegmentData,this);
            	var selectedFrame = $("#ip-segment-grid").grid("getRowData", selectedFrameIds[0]);
            	 var pop =fish.popupView({url: 'modules/idcrm/ipaddrm/iprm/views/IPManagementFormView',
                     width: "90%",
                     
                     callback:function(popup,view){
                    	 console.log(selectedFrame);
                         var selectedFrame = $("#ip-segment-grid").grid("getRowData", selectedFrameIds[0]);
                         view.$el.find("#ip-addr-query-cond").form("value", selectedFrame);
                         popup.result.then(function (e) {
//                        	 selectedFrameIds(1);
                         },function (e) {
                             console.log('关闭了',e);
                         });
                     },
                     viewOption:{action:"detail.equipNetAdd",segmId:selectedFrame.ID}
                 });
            },
            // 新增IP地址段
            ipsegAddBtnClick: function() {
            	var reloadIpSegmentData = $.proxy(this.getIpSegmentData,this);
                var pop =fish.popupView({url: 'modules/idcrm/ipaddrm/iprm/views/IPAddFormView',
                    width: "80%",
                    callback:function(popup,view){
                        popup.result.then(function (e) {
                        	reloadIpSegmentData(1);
                        },function (e) {
                            console.log('关闭了',e);
                        });
                    },
                viewOption:{action:"detail.ipSegmentAdd"}
                });
            },
            ipsegDelBtnClick:function() {
                var reloadIpSegmentData = $.proxy(this.getIpSegmentData,this);
                fish.confirm('是否删除所选记录？').result.then(function() {
                    var selectedFrameIds = $("#ip-segment-grid").grid('getGridParam', 'selarrrow');
                    if (selectedFrameIds == null || selectedFrameIds.length == 0) {
                        fish.info("请至少选择一条记录！");
                        return;
                    }
                    for (var i=0;i<selectedFrameIds.length;i++){
                    	var selectedFrame = $("#ip-segment-grid").grid("getRowData", selectedFrameIds[i]);
                    	utils.ajax('ipaddrservice','checkIsCanSplit',selectedFrame).done(function(rets){
                        	if(rets==-2){
                    			fish.info("所选网段已经拆分过，不能删除，请先删除子网段！");
                    			return;
                    		}
                    		if(rets==-1){
                    			fish.info("该IP段下已存在占用的IP地址，暂不能删除！");
                    			return;
                    		}
                    		var delIpAddrSegment = [];
                            for(var i in selectedFrameIds){
                            	delIpAddrSegment.push({"id":selectedFrameIds[i]});
                            }
                            utils.ajax('ipaddrservice', 'deleteIpAddrSegment', delIpAddrSegment).done(function(ret){
                                if(ret>0) {
                                    fish.info("操作成功！");
                                    reloadIpSegmentData(1);
                                } else {
                                    fish.info("操作失败，请稍后再试！");
                                }
                            });
                        }).fail(function(e){
      	                  fish.error(e);
                        });
                	}
                });
            },
            //IP地址拆分
            ipsegBreakupBtnClick:function() {
            	var selectedFrameIds = $("#ip-segment-grid").grid('getGridParam', 'selarrrow');
                if (selectedFrameIds == null || selectedFrameIds.length == 0) {
                    fish.info("请选择一项数据！");
                    return;
                }

                if(selectedFrameIds.length > 1) {
                    fish.info("只能选择一条数据！");
                    return;
                }
                var selectedFrame = $("#ip-segment-grid").grid("getRowData", selectedFrameIds[0]);
                var nowType = selectedFrame.segmCode.split("/")[1];
                if(nowType == 26){
                	fish.info("已拆分至最小网段，不能再拆分！");
                	return;
                }
                utils.ajax('ipaddrservice','checkIsCanSplit',selectedFrame).done(function(rets){
                	if(rets==-2){
            			fish.info("该网段已经拆分过，不能拆分！");
            			return;
            		}
            		if(rets==-1){
            			fish.info("该IP段下已存在占用的IP地址，暂不能拆分！");
            			return;
            		}
            		var pop =fish.popupView({url: 'modules/idcrm/ipaddrm/iprm/views/IPSegmentSplitView',
                        width: "80%",
                        callback:function(popup,view){
                       	 console.log(selectedFrame);
                            var selectedFrame = $("#ip-segment-grid").grid("getRowData", selectedFrameIds[0]);
                            view.$el.find("#ipaddr-segment-split").form("value", selectedFrame);
                            popup.result.then(function (e) {
                             selectedFrameIds(1);
                            },function (e) {
                                console.log('关闭了',e);
                            });
                        },
                        viewOption:{selectData:selectedFrame}
                    });
                }).fail(function(e){
	                  fish.error(e);
	            });
            },
            //合并IP地址段
            ipsegCombineBtnClick:function(){
            	var selectedFrameIds = $("#ip-segment-grid").grid('getGridParam', 'selarrrow');
                if (selectedFrameIds == null || selectedFrameIds.length == 0) {
                    fish.info("请选择一项数据！");
                    return;
                }
                var selectedFrame = $("#ip-segment-grid").grid("getRowData", selectedFrameIds[0]);
                if(selectedFrame.parentId == 0){
                	fish.info("该IP段不能合并,请选择已拆分过的IP段进行合并！");
                	return;
                }
           	 	var pop =fish.popupView({url: 'modules/idcrm/ipaddrm/iprm/views/IPSegmentCombineView',
                    width: "80%",
                    callback:function(popup,view){
                   	 console.log(selectedFrame);
                        var selectedFrame = $("#ip-segment-grid").grid("getRowData", selectedFrameIds[0]);
                        view.$el.find("#ipaddr-segment-combine").form("value", selectedFrame);
                        popup.result.then(function (e) {
                         //selectedFrameIds(1);
                        },function (e) {
                            console.log('关闭了',e);
                        });
                    },
                    viewOption:{action:"detail.equipNetAdd",segmId:selectedFrame.ID,parentId:selectedFrame.parentId}
                });
            },
            // 查询
            ipsegQueryBtnClick: function() {
                this.getIpSegmentData(1);
            },
      
            // 选择机房
            ipsegQryRoomBtnClick: function() {
            	var self = this;
                var pop =fish.popupView({url: 'modules/idcrm/ipaddrm/iprm/views/DataCenterSelectView',
                    width: "30%",
                    height: 550,
                    callback:function(popup,view){
                    	
                        popup.result.then(function (e) {
                        	console.log(e);
                            $("#ipseg_qry_dcid").val(e.id);
                            $("#ipseg_qry_dcname").val(e.name);
                        },function (e) {
                            console.log('关闭了',e);
                        });
                    }
                });
            },
            // 树形搜索
            equipTreeQryBtnClick: function() {
                this.loadTreeRender();
            },
            getNavtreeIcon: function(tag,grade){//空间资源导航树图标
     		   if(tag == "area" && grade == "C2"){
                    return "resources/images/idc/treeNode/province.png";
     		   }else if(tag == "area" && grade == "C3"){
                    return "resources/images/idc/treeNode/city.png";
     		   }else if(tag == "area" && grade == "C4"){
                    return "resources/images/idc/treeNode/county.png";
     		   }else if(tag == "dataCenter"){
     		      return "resources/images/idc/treeNode/datacenter.png";
     		   }else if(tag == "dcRoom"){
     		      return "resources/images/idc/treeNode/datacenter.png";
     		   }
     		},
     		inputkeyDown: function(e){
    		    if(e.keyCode == 13){ //回车键
    		       this.searchNavTree();
    		    }
    		},
    		searchNavTree:function(){
   		     var me = this;
   		     this.$("#ipsegm-Tree").blockUI({message:''});
   		     var cond = this.$("#spacerm-dc-ip-dcname").val();
   		     utils.ajax('commonService','getDcNavTreeByName',cond)
   		         .always(function(){
                       me.$("#ipsegm-Tree").unblockUI(); 
                    })
   		   	     .done(function(nodeDatas){ 
   		   	           if(!nodeDatas){
   		   	             nodeDatas = [];
   			   	      }
   	                  fish.each(nodeDatas,function(element, index){
   			   	          element.icon = me.getNavtreeIcon(element.tag,element.grade);
   			   	      });
   		       var navTreeInst = me.$("#ipsegm-Tree").tree("instance");
   		       navTreeInst.reloadData(nodeDatas);
   		       navTreeInst.expandAll(true);
                    });
    		},
    		resize:function(){
    	  		   var containerParentheight = $(".ipaddr_mana_view_container").parent().parent().outerHeight();
    	  		   this.$("#ip-segment-grid").grid("setGridHeight",containerParentheight-60);
    	  		   this.$("#ip-segment-grid").grid("resize",true);
    	             
    	            this.$('#ipAddrTreeDiv').height(containerParentheight-30);		  
    	  	}
    	});
});
