define([
    'text!modules/idcrm/query/templates/DetailQryView.html',
    'i18n!modules/idcrm/query/il8n/equipdetail.i18n',
    'modules/common/cloud-utils',
    'css!modules/idcrm/query/styles/equipdetail.css'
], function(detailQryViewTpl, i18nDetail,utils, css) {
    return fish.View.extend({
        template: fish.compile(detailQryViewTpl),
        i18nData: fish.extend({}, i18nDetail),
        events: {
            "click #detailQryView-treeQry-btn":"detailQryViewTreeQryBtnClick" // 导航树查询
        },

        //这里用来进行dom操作
        _render: function() {
            var html=$(this.template(this.i18nData));
            html.find("#detailQryView-qryContentDiv").hide();
            html.find("#detailQryView-navTree").height($(window).height-200);
            this.$el.html(html);
            return this;
        },

        //这里用来初始化页面上要用到的fish组件
        _afterRender: function() {

            $('#detailQryView-treeDiv').bind('contextmenu',function(){
                return false;
            });

            this.initTreeOptions();
            this.loadTreeRender();

            // 设置grid高度
            $("#detailQryView-grid").grid("setGridHeight", $(window).height()-350);
        },

        getSelectedNode: function() {
            return this.options.selectedNode;
        },

        setSelectedNode: function(selectedNode) {
            this.options.selectedNode = selectedNode;
        },

        // 初始化导航树
        initTreeOptions: function() {
            var setSelectedNodeProxy = $.proxy(this.setSelectedNode, this);
            var loadEquipRenderProxy = $.proxy(this.loadEquipRender, this);

            $("#detailQryView-treeDiv").height($(window).height()-170);
            $("#detailQryView-navTree").height($(window).height()-180);
            $("#detailQryView-treeDiv").niceScroll({
                cursorcolor: '#CE0015',
                cursorwidth: "6px"
            });

            var options = {
                view: {
                    dblClickExpand: true
                },
                data: {
                    simpleData: {
                        enable: true
                    }
                },
                fNodes: [],
                callback: {
                    onClick: function(e, treeNode) {
                        // 是根节点，并且是机房，则点击加载机柜、网络设备、IP信息
                        var isDataCenter = (treeNode && treeNode.tag == "dataCenter"); // 数据中心
                        var isDcRoom = (treeNode && treeNode.tag == "dcRoom"); // 机房
                        var isFrame = (treeNode && !treeNode.isParent && treeNode.tag == "frame"); // 机柜
                        var isNetEquip = (treeNode && !treeNode.isParent && treeNode.tag == "netEquip"); // 网络设备
                        var isIpAddr = (treeNode && !treeNode.isParent && treeNode.tag == "ipAddr"); // IP地址段

                        if(isDataCenter) {
                            utils.ajax('equiprmService','getDcRoomNodeList',treeNode.kId).done(function(ret){
                                // 点击数据中心加载机房节点
                                $("#detailQryView-navTree").tree('removeChildNodes',treeNode);
                                $("#detailQryView-navTree").tree('addNodes',treeNode, ret, false);
                            });
                        }

                        if(isDcRoom) {
                            if(!treeNode.children) {
                                var treeInstance = $("#detailQryView-navTree").tree("instance");
                                treeInstance.addNodes(treeNode, [{
                                    id: treeNode.id + "_001",
                                    pId: treeNode.id,
                                    kId: treeNode.kId*1000+1,
                                    parentKId: treeNode.kId,
                                    isParent: false,
                                    name: '机柜',
                                    tag: 'frame'
                                },{
                                    id: treeNode.id + "_002",
                                    pId: treeNode.id,
                                    kId: treeNode.kId*1000+2,
                                    parentKId: treeNode.kId,
                                    isParent: false,
                                    name: '网络设备',
                                    tag: 'netEquip'
                                },{
                                    id: treeNode.id + "_003",
                                    pId: treeNode.id,
                                    kId: treeNode.kId*1000+3,
                                    parentKId: treeNode.kId,
                                    isParent: false,
                                    name: 'IP地址段',
                                    tag: 'ipAddr'
                                }]);
                            }
                        }

                        setSelectedNodeProxy(treeNode);
                        var tag = treeNode.tag;
                        if("area" == tag) {
                            tag += treeNode.grade;
                        }
                        loadEquipRenderProxy(tag);

                    },
                    onExpand: $.proxy(this.onClick, this)
                }
            };
            $("#detailQryView-navTree").tree(options);
        },
        // 加载导航树
        loadTreeRender: function() {

            // 查询的时候 锁定页面
            if ($('#detailQryView-treeDiv').data('blockui-content')) {
                $('#detailQryView-treeDiv').unblockUI().data('blockui-content', false);
            } else {
                $('#detailQryView-treeDiv').blockUI({
                    message: '加载中......'
                }).data('blockui-content', true);
            }

            var me = this;
            var nodeName = $("#detailQryView-nodeName").val();
            utils.ajax('commonService','getDcNavTreeByName',nodeName).done(function(ret){
                $.each(ret,function(i, n){
                    n.icon = me.getNavtreeIcon(n.tag,n.grade);
                });
                $("#detailQryView-navTree").tree("reloadData", ret);

                // 解锁页面
                $('#detailQryView-treeDiv').unblockUI().data('blockui-content', false);
            });

        },
        // 市级的统计列表字段
        getAreaC4ColModel: function() {
            return [{
                name: 'dcId',
                label: 'ID',
                key:true,
                hidden:true
            }, {
                name: 'dcName',
                width: 100,
                label: '数据中心'
            }, {
                name: 'roomCount',
                label: '机房数',
                width: 180
            },  {
                name: 'frameCount',
                width: 100,
                label: '机柜数'
            }, {
                name: 'frameUseRate',
                label: '机柜使用率',
                width: 180
            }, {
                name: 'portCount',
                width: 100,
                label: '端口数'
            }, {
                name: 'portUseRate',
                width: 100,
                label: '端口使用率'
            }, {
                name: 'ipCount',
                width: 100,
                label: 'IP数'
            }, {
                name: 'ipUseRate',
                width: 100,
                label: 'IP使用率'
            }];
        },
        // 数据中心列表字段
        getDataCenterColModel: function(){
            return [{
                name: 'roomId',
                label: 'ID',
                key:true,
                hidden:true
            }, {
                name: 'roomName',
                width: 100,
                label: '机房'
            },   {
                name: 'frameCount',
                width: 100,
                label: '机柜数'
            }, {
                name: 'frameUseRate',
                label: '机柜使用率',
                width: 180
            }, {
                name: 'portCount',
                width: 100,
                label: '端口数'
            }, {
                name: 'portUseRate',
                width: 100,
                label: '端口使用率'
            }, {
                name: 'ipCount',
                width: 100,
                label: 'IP数'
            }, {
                name: 'ipUseRate',
                width: 100,
                label: 'IP使用率'
            }];
        },
        // 机房列表的字段
        getRoomColModel: function() {
            return [{
                name: 'roomId',
                label: 'ID',
                key:true,
                hidden:true
            }, {
                name: 'frameCount',
                width: 100,
                label: '机柜数'
            }, {
                name: 'frameUseRate',
                label: '机柜使用率',
                width: 180
            }, {
                name: 'portCount',
                width: 100,
                label: '端口数'
            }, {
                name: 'portUseRate',
                width: 100,
                label: '端口使用率'
            }, {
                name: 'ipCount',
                width: 100,
                label: 'IP数'
            }, {
                name: 'ipUseRate',
                width: 100,
                label: 'IP使用率'
            }];
        },
        // 机柜列表的字段
        getFrameColModel: function() {
            return [{
                name: 'id',
                label: 'ID',
                key:true,
                hidden:true
            }, {
                name: 'code',
                width: 100,
                label: '机柜编号'
            }, {
                name: 'allocationStateName',
                label: '分配状态',
                width: 180
            }, {
                name: 'unitNum',
                width: 100,
                label: '机位数'
            }, {
                name: 'useRate',
                width: 100,
                label: '机位数使用率'
            }];
        },
        // 网络设备列表字段
        getNetEquipColModel: function() {
            return [{
                name: 'id',
                label: 'ID',
                key:true,
                hidden:true
            }, {
                name: 'eqCode',
                width: 100,
                label: '设备编号'
            }, {
                name: 'portCount',
                label: '端口数',
                width: 180
            }, {
                name: 'portUseRate',
                width: 100,
                label: '端口使用率'
            }, {
                name: 'bandwidth',
                width: 100,
                label: '带宽'
            }, {
                name: 'bandwidthRate',
                width: 100,
                label: '带宽使用率'
            }];
        },
        // IP地址段列表的字段
        getIpAddrColModel: function() {
            return [{
                name: 'id',
                label: 'ID',
                key:true,
                hidden:true
            }, {
                name: 'segmIP',
                width: 100,
                label: 'IP地址段'
            }, {
                name: 'allCount',
                width: 100,
                label: 'IP地址数'
            }, {
                name: 'useRate',
                width: 100,
                label: 'IP地址使用率'
            }];
        },
        loadEquipRender: function(tag) {
            var colModel = [];
            if('areaC4' == tag) {
                colModel = this.getAreaC4ColModel();
            } else if('dataCenter' == tag) {
                colModel = this.getDataCenterColModel();
            } else if('dcRoom' == tag) {
                colModel = this.getRoomColModel();
            } else if('frame' == tag) {
                colModel = this.getFrameColModel();
            } else if('netEquip' == tag) {
                colModel = this.getNetEquipColModel();
            } else if('ipAddr' == tag) {
                colModel = this.getIpAddrColModel();
            }

            var getEquipDataProxy = $.proxy(this.getEquipData, this);
            this.$("#detailQryView-grid").grid({
                datatype: "json",
                colModel: colModel,
                rowNum: 10,
                displayNum : 5,
                multiselect: true,
                rownumbers:true,
                pager: true,
                server: true,
                recordtext: "当前 {0}-{1} 条记录 共{2}条记录",
                pgtext: "第 {0} 页 / 共 {1} 页",
                emptyrecords: "没有记录",
                pageData: getEquipDataProxy
            });

            // 设置grid高度
            $("#detailQryView-grid").grid("setGridHeight", $(window).height()-350);

            // 初始化加载第一页数据
            this.getEquipData(1);
        },
        getEquipData:  function(page, sortname, sortorder) { //请求服务器获取数据的方法
        	var me = this;
            var selectedNode = this.getSelectedNode();
            if(!selectedNode) {
                return;
            }

            // 查询的时候 锁定页面
            if ($('#detailQryView-grid').data('blockui-content')) {
                $('#detailQryView-grid').unblockUI().data('blockui-content', false);
            } else {
                $('#detailQryView-grid').blockUI({
                    message: '加载中......'
                }).data('blockui-content', true);
            }

            var methodName = null;
            var rowNum = $("#detailQryView-grid").grid("getGridParam", "rowNum");
            var id = selectedNode.parentKId;
            var tag = selectedNode.tag;
            if("area" == tag) {
                // 查看某市级下数据中心占用情况
                methodName = "calcAreaC4UseRate";
                id = selectedNode.kId;
            } else if("dataCenter" == tag) {
                // 查看某数据中心占用情况
                methodName = "calcDataCenterUseRate";
                id = selectedNode.kId;
            } else if("dcRoom" == tag) {
                // 查询某数据中心下机房占用情况
                methodName = "calcRoomUseRate";
                id = selectedNode.kId;
            } else if("frame" == tag) {
                // 查询某机房下机柜占用情况
                methodName = "calcFrameUseRate";
            } else if("ipAddr" == tag) {
                // 查询某机房下IP地址使用情况
                methodName = "calcIpAddrUseRate";
            } else if("netEquip" == tag) {
                // 查询某机房下网络设备使用情况
                methodName = "calcNetEquipUseRate";
            } else {
                return;
            }

            utils.ajax('detailQryService', methodName, id, page, rowNum).done(function(ret){

                $("#detailQryView-grid").grid("reloadData", ret);

                // 解锁页面
                $('#detailQryView-grid').unblockUI().data('blockui-content', false);
                if("area" == tag) {
                	me.initAreaBar(id);
                } else if("dataCenter" == tag) {
                	me.initDcBar(id);
                } else if("dcRoom" == tag) {
                	me.initRoomBar(ret);
                } else if("frame" == tag) {
                	me.initFrameBar(id);
                } else if("ipAddr" == tag) {
                	me.initIpAddrBar(id);
                } else if("netEquip" == tag) {
                	me.initPortBar(id);
                } else {
                    return;
                }
            });

        },
          
        // 树形搜索
        detailQryViewTreeQryBtnClick: function() {
            this.loadTreeRender();
        },
        // 导航树图标
        getNavtreeIcon: function(tag,grade){
            if(tag == "area" && grade == "C2"){
                return "resources/images/idc/treeNode/province.png";
            }else if(tag == "area" && grade == "C3"){
                return "resources/images/idc/treeNode/city.png";
            }else if(tag == "area" && grade == "C4"){
                return "resources/images/idc/treeNode/county.png";
            }else if(tag == "dataCenter"){
                return "resources/images/idc/treeNode/datacenter.png";
            }else if(tag == "dcRoom"){
                return "resources/images/idc/treeNode/room.png";
            }else if(tag == "frame"){
                return "resources/images/idc/treeNode/frame.png";
            }
        },
        initAreaBar: function(areaId){
	    	utils.ajax('detailQryService', 'calcAllAreaC4UseRate', areaId).done(function(data){
	    		var dcNames = [];
	        	var frameDatas = [];
	        	var portDatas = [];
	        	var ipDatas = [];
	        	for(var i=0;i< data.rows.length;i++){
	        		var obj = data.rows[i];
	        		dcNames[i] = obj.dcName;
	        		frameDatas[i] = obj.frameUseRate.substring(0,obj.frameUseRate.indexOf('%'));
	        		portDatas[i] = obj.portUseRate.substring(0,obj.portUseRate.indexOf('%'));
	        		ipDatas[i] = obj.ipUseRate.substring(0,obj.ipUseRate.indexOf('%'));
	        	}
	        	var option = {
	        			tooltip : {
	        		        trigger: 'axis',
	        		        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
	        		            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
	        		        }
	        		    }, 
	        		    legend: {
	        		        data:['机柜','端口','IP']
	        		    },
	        		    grid: {
	        		        left: '3%',
	        		        right: '4%',
	        		        bottom: '3%',
	        		        containLabel: true
	        		    },
	        		    xAxis : [
	        		        {
	        		            type : 'category',
	        		            data : dcNames
	        		        }
	        		    ],
	        		    yAxis : [
	        		        {
	        		            type : 'value'
	        		        }
	        		    ],	
	        		    color:['#3366CC','#CC3333','#99CC66'],
	        		    series: [
	        		        {
	        		        	name:'机柜',
	        		        	type:'bar',
	        		        	data:frameDatas
	        		        },
	        		        {
	        		        	name:'端口',
	        		        	type:'bar',
	        		        	data:portDatas
	        		        },
	        		        {
	        		        	name:'IP',
	        		        	type:'bar',
	        		        	data:ipDatas
	        		        }
	        		    ]
	        	};
	        	var chart = echarts.init(document.getElementById('detailQry-bar'));	
	        	chart.setOption(option);
	    	});
        },
        initDcBar: function(dcId){
	    	utils.ajax('detailQryService', 'calcAllDcUseRate', dcId).done(function(data){
	        	var roomNames = [];
	        	var frameDatas = [];
	        	var portDatas = [];
	        	var ipDatas = [];
	    		for(var i=0;i< data.rows.length;i++){
	        		var obj = data.rows[i];
	        		roomNames[i] = obj.roomName;
	        		frameDatas[i] = obj.frameUseRate.substring(0,obj.frameUseRate.indexOf('%'));
	        		portDatas[i] = obj.portUseRate.substring(0,obj.portUseRate.indexOf('%'));
	        		ipDatas[i] = obj.ipUseRate.substring(0,obj.ipUseRate.indexOf('%'));
	        	}
	        	var option = {
	        			tooltip : {
	        		        trigger: 'axis',
	        		        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
	        		            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
	        		        }
	        		    }, 
	        		    legend: {
	        		        data:['机柜','端口','IP']
	        		    },
	        		    grid: {
	        		        left: '2%',
	        		        right: '4%',
	        		        bottom: '20%',
	        		        containLabel: true
	        		    },
	        		    xAxis : [
	        		        {
	        		            type : 'category',
	        		            axisLabel:{
	        		            	interval:0,
	        		            	rotate:30,
	        		            	margin:2
	        		            },
	        		            data : roomNames
	        		        }
	        		    ],
	        		    yAxis : [
	        		        {
	        		            type : 'value'
	        		        }
	        		    ],	
	        		    color:['#3366CC','#CC3333','#99CC66'],
	        		    series: [
	        		        {
	        		        	name:'机柜',
	        		        	type:'bar',
	        		        	data:frameDatas
	        		        },
	        		        {
	        		        	name:'端口',
	        		        	type:'bar',
	        		        	data:portDatas
	        		        },
	        		        {
	        		        	name:'IP',
	        		        	type:'bar',
	        		        	data:ipDatas
	        		        }
	        		    ]
	        	};
	        	var chart = echarts.init(document.getElementById('detailQry-bar'));	
	        	chart.setOption(option);
	    	});
        },
        initRoomBar: function(data){
        	var datas = [];
			var obj = data.rows[0];
			var frameData = obj.frameUseRate.substring(0,obj.frameUseRate.indexOf('%'));
			var portData = obj.portUseRate.substring(0,obj.portUseRate.indexOf('%'));
			var ipData = obj.ipUseRate.substring(0,obj.ipUseRate.indexOf('%'));
			datas[0] = frameData;
			datas[1] = portData;
			datas[2] = ipData;
        	var option = {
        			tooltip : {
        		        trigger: 'axis',
        		        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
        		            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        		        }
        		    }, 
        		    legend: {
        		        data:['使用率']
        		    },
        		    grid: {
        		        left: '3%',
        		        right: '4%',
        		        bottom: '3%',
        		        containLabel: true
        		    },
        		    xAxis : [
        		        {
        		            type : 'category',
        		            data : ['机柜','端口','IP']
        		        }
        		    ],
        		    yAxis : [
        		        {
        		            type : 'value'
        		        }
        		    ],	
        		    color:['#3366CC','#CC3333','#99CC66'],
        		    series: [
        		        {
        		        	name:'使用率',
        		        	type:'bar',
        		        	barWidth:30,
        		        	data:datas
        		        }
        		    ]
        	};
        	var chart = echarts.init(document.getElementById('detailQry-bar'));	
        	chart.setOption(option);
        },
        initFrameBar: function(roomId){
	    	utils.ajax('detailQryService', 'calcAllFrameUseRate', roomId).done(function(data){
	        	var datas = [0,0,0,0,0];
	    		for(var i=0;i< data.length;i++){
	        		var obj = data[i];
	        		if('空闲' == obj.name){
	        			datas[0] = obj.value;
	        		}else if('预占' == obj.name){
	        			datas[1] = obj.value;
	        		}else if('占用' == obj.name){
	        			datas[2] = obj.value;
	        		}else if('预释放' == obj.name){
	        			datas[3] = obj.value;
	        		}else if('预留' == obj.name){
	        			datas[4] = obj.value;
	        		}
	        	}
	        	var option = {
	        			tooltip : {
	        		        trigger: 'axis',
	        		        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
	        		            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
	        		        }
	        		    }, 
	        		    legend: {
	        		        data:['数量']
	        		    },
	        		    grid: {
	        		        left: '3%',
	        		        right: '4%',
	        		        bottom: '3%',
	        		        containLabel: true
	        		    },
	        		    xAxis : [
	        		        {
	        		            type : 'category',
	        		            data : ['空闲','预占','占用','预释放','预留']
	        		        }
	        		    ],
	        		    yAxis : [
	        		        {
	        		            type : 'value'
	        		        }
	        		    ],	
	        		    color:['#3366CC','#CC3333','#99CC66'],
	        		    series: [
	        		        {
	        		        	name:'数量',
	        		        	type:'bar',
	        		        	barWidth:30,
	        		        	data:datas
	        		        }
	        		    ]
	        	};
	        	var chart = echarts.init(document.getElementById('detailQry-bar'));	
	        	chart.setOption(option);
	    	});
        },
        initPortBar: function(roomId){
	    	utils.ajax('detailQryService', 'calcAllPortUseRate', roomId).done(function(data){
	        	var datas = [0,0,0,0,0];
	    		for(var i=0;i< data.length;i++){
	        		var obj = data[i];
	        		if('空闲' == obj.name){
	        			datas[0] = obj.value;
	        		}else if('预占' == obj.name){
	        			datas[1] = obj.value;
	        		}else if('占用' == obj.name){
	        			datas[2] = obj.value;
	        		}else if('预释放' == obj.name){
	        			datas[3] = obj.value;
	        		}else if('预留' == obj.name){
	        			datas[4] = obj.value;
	        		}
	        	}
	        	var option = {
	        			tooltip : {
	        		        trigger: 'axis',
	        		        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
	        		            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
	        		        }
	        		    }, 
	        		    legend: {
	        		        data:['数量']
	        		    },
	        		    grid: {
	        		        left: '3%',
	        		        right: '4%',
	        		        bottom: '3%',
	        		        containLabel: true
	        		    },
	        		    xAxis : [
	        		        {
	        		            type : 'category',
	        		            data : ['空闲','预占','占用','预释放','预留']
	        		        }
	        		    ],
	        		    yAxis : [
	        		        {
	        		            type : 'value'
	        		        }
	        		    ],	
	        		    color:['#3366CC','#CC3333','#99CC66'],
	        		    series: [
	        		        {
	        		        	name:'数量',
	        		        	type:'bar',
	        		        	barWidth:30,
	        		        	data:datas
	        		        }
	        		    ]
	        	};
	        	var chart = echarts.init(document.getElementById('detailQry-bar'));	
	        	chart.setOption(option);
	    	});
        },
        initIpAddrBar: function(roomId){
	    	utils.ajax('detailQryService', 'calcAllIpAddrUseRate', roomId).done(function(data){
	        	var datas = [0,0,0,0,0];
	    		for(var i=0;i< data.length;i++){
	        		var obj = data[i];
	        		if('空闲' == obj.name){
	        			datas[0] = obj.value;
	        		}else if('预占' == obj.name){
	        			datas[1] = obj.value;
	        		}else if('占用' == obj.name){
	        			datas[2] = obj.value;
	        		}else if('预释放' == obj.name){
	        			datas[3] = obj.value;
	        		}else if('预留' == obj.name){
	        			datas[4] = obj.value;
	        		}
	        	}
	        	var option = {
	        			tooltip : {
	        		        trigger: 'axis',
	        		        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
	        		            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
	        		        }
	        		    }, 
	        		    legend: {
	        		        data:['数量']
	        		    },
	        		    grid: {
	        		        left: '3%',
	        		        right: '4%',
	        		        bottom: '3%',
	        		        containLabel: true
	        		    },
	        		    xAxis : [
	        		        {
	        		            type : 'category',
	        		            data : ['空闲','预占','占用','预释放','预留']
	        		        }
	        		    ],
	        		    yAxis : [
	        		        {
	        		            type : 'value'
	        		        }
	        		    ],	
	        		    color:['#3366CC','#CC3333','#99CC66'],
	        		    series: [
	        		        {
	        		        	name:'数量',
	        		        	type:'bar',
	        		        	barWidth:30,
	        		        	data:datas
	        		        }
	        		    ]
	        	};
	        	var chart = echarts.init(document.getElementById('detailQry-bar'));	
	        	chart.setOption(option);
	    	});
        }
    });
});