define([
    'text!modules/idcrm/rmconfig/templates/FrameUnitConfigView.html',
    'i18n!modules/idcrm/rmconfig/i18n/FrameConfig.i18n',
    'modules/common/cloud-utils',
    'css!modules/idcrm/rmconfig/styles/FrameConfig.css'
], function (frameUnitConfigViewTpl, i18nFrameConfig, utils, css) {
    return fish.View.extend({
        template: fish.compile(frameUnitConfigViewTpl),
        i18nData: fish.extend({}, i18nFrameConfig),
        events: {
            "click #frameUnitConfigView-config-btn": "frameUnitConfigViewConfigBtnClick",
            "click #frameUnitConfigView-view-btn": "frameUnitConfigViewViewBtnClick",
            "click #frameUnitConfigView-del-btn": "frameUnitConfigViewDelBtnClick",
            "click #frameUnitConfigView-renew-btn": "frameUnitConfigViewRenewBtnClick",
            "click #frameUnitConfigView-confirm-btn": "frameUnitConfigViewConfirmBtnClick"
        },

        //这里用来进行dom操作
        _render: function () {
            var html = $(this.template(this.i18nData));
            this.$el.html(html);
            return this;
        },
        // 父级页面传过来的配置参数
        getRsConfig: function() {
            return this.options.rsConfig;
        },
        // 获取树选中机柜ID
        getSelectedFrameId: function() {
            return this.options.selectedFrameId;
        },
        // 存储树选中机柜ID
        setSelectedFrameId: function(frameId) {
            this.options.selectedFrameId = frameId;
        },
        // 存储已删除的配置机位
        getDeletedFrameUnits: function() {
            var deletedFrameUnits = this.options.deletedFrameUnits;
            if(!deletedFrameUnits) {
                deletedFrameUnits = new Array();
            }
            return deletedFrameUnits;
        },
        // 更新已经删除的配置机位
        setDeletedFrameUnits: function(frameUnits) {
            this.options.deletedFrameUnits = frameUnits;
        },
        //这里用来初始化页面上要用到的fish组件
        _afterRender: function () {

            var rsConfig = this.getRsConfig();

            // 加载导航树：机房-行号-机柜
            this.initFrameConfigTree(rsConfig.roomId, rsConfig.roomName);

            // 加载未配置机位
            this.initFrameConfigRawGrid();
            // 加载已配置机位
            this.initFrameConfigReadyGrid();
//            var totalCount = rsConfig.configResult.frameUnitResList.length;
//            var readyData = {
//                page: 1,
//                pageSize: 10,
//                records: totalCount,
//                rows: rsConfig.configResult.frameUnitResList
//            };
            this.$("#frameUnitConfigView-ready-grid").grid("reloadData", rsConfig.configResult.frameUnitResList);

            // 加载配置要求
            rsConfig.configRequire.roomName = rsConfig.roomName;
            this.$("#frameUnitConfigView-configForm").form('value', rsConfig.configRequire);
            this.$("#frameUnitConfigView-configForm").form('disable');

        },
        // 加载导航树
        initFrameConfigTree: function (roomId, roomName) {

            var setSelectedFrameIdProxy = $.proxy(this.setSelectedFrameId, this);
            var loadFrameUnitListProxy = $.proxy(this.loadFrameUnitList, this);

            $("#frameUnitConfigView-treeDiv").height(390);
            $("#frameUnitConfigView-treeDiv").niceScroll({
                cursorcolor: '#CE0015',
                cursorwidth: "7px"
            });

            var options = {
                view: {
                    showLine: false
                },
                data: {
                    simpleData: {
                        enable: true
                    }
                },
                fNodes: [],
                callback: {
                    onDblClick: function(e, treeNode) {

                        // 清理备选的机位列表
                        $("#frameUnitConfigView-raw-grid").grid("clearData");

                        // 根据机柜id加载备选的机位列表
                        if("frame" == treeNode.tag) {
                            setSelectedFrameIdProxy(treeNode.kId);
                            loadFrameUnitListProxy(1);
                        }

                    }
                }
            };
            $("#frameUnitConfigView-tree").tree(options);

            // 查询的时候 锁定页面
            if ($('#frameUnitConfigView-treeDiv').data('blockui-content')) {
                $('#frameUnitConfigView-treeDiv').unblockUI().data('blockui-content', false);
            } else {
                $('#frameUnitConfigView-treeDiv').blockUI({
                    message: '加载中......'
                }).data('blockui-content', true);
            }

            var nodeName = $("#frameUnitConfigView-nodeName").val();
            utils.ajax('frameConfigService', 'findFrameConfigTree', roomId).done(function (ret) {

                // 构造机房节点
                var roomNode = {
                    id: roomId,
                    pId: 0,
                    name: roomName,
                    isParent: true,
                    open: true,
                    tag: "room"
                };
                ret.push(roomNode);

                // 加载
                $("#frameUnitConfigView-tree").tree("reloadData", ret);

                // 解锁页面
                $('#frameUnitConfigView-treeDiv').unblockUI().data('blockui-content', false);
            });
        },

        // 加载可配置的机位
        loadFrameUnitList: function(page, sortname, sortorder) {

            var selectedFrameId = this.getSelectedFrameId();
            var rowNum = $("#frameUnitConfigView-raw-grid").grid("getGridParam", "rowNum");

            // 已配置的机位
            var readyData = $("#frameUnitConfigView-ready-grid").grid("getRowData");

            utils.ajax('equiprmService', 'findFrameUnitList', selectedFrameId, page, rowNum).done(function (ret) {

                $.each(ret.rows, function(i,n){
                    // 剔除掉已配置的机位
                    var hasConfig = _.findWhere(readyData, {frameUnitId: n.id});
                    if(!hasConfig) {
                        var newData = new Object();
                        newData.frameId = n.frameId;
                        newData.frameCode = n.frameCode;
                        newData.frameName = n.frameName;
                        newData.frameUnitId = n.id;
                        newData.frameUnitCode = n.code;
                        newData.frameUnitName = n.name;
                        newData.rsConfigTag=1; //

                        $("#frameUnitConfigView-raw-grid").grid("addRowData", newData);
                    }
                });

            });
        },

        // 初始化可配置的机位
        initFrameConfigRawGrid: function () {
            this.$("#frameUnitConfigView-raw-grid").grid({
                height: 160,
                colModel: [
                    {
                        name: 'frameId',
                        label: '机柜ID',
                        width: 100,
                        hidden: true
                    },
                    {
                        name: 'frameName',
                        width: 100,
                        label: '机柜名称'
                    },
                    {
                        name: 'frameCode',
                        width: 100,
                        label: '机柜编码'
                    },
                    {
                        name: 'frameUnitId',
                        width: 100,
                        label: '机位ID',
                        hidden: true
                    },
                    {
                        name: 'frameUnitName',
                        width: 100,
                        label: '机位号' // 即机位名称
                    }
                ],
                data: [],
                //                rowNum: 10,
                multiselect: true,
                shrinkToFit: true,
                rownumbers:true
//                pager: true,
//                server: true,
//                recordtext: "当前显示 {0} - {1} 条记录 共 {2} 条记录",
//                pgtext: "第 {0} 页 / 共 {1} 页",
//                emptyrecords: "没有记录",
//                pageData: this.loadFrameUnitList
            });
        },
        initFrameConfigReadyGrid: function() {
            this.$("#frameUnitConfigView-ready-grid").grid({
                height: 160,
                data: [],
                colModel: [
                    {
                        name: 'frameId',
                        label: '机柜ID',
                        width: 100,
                        hidden: true
                    },
                    {
                        name: 'frameName',
                        width: 100,
                        label: '机柜名称'
                    },
                    {
                        name: 'frameCode',
                        width: 100,
                        label: '机柜编码'
                    },
                    {
                        name: 'frameUnitId',
                        width: 100,
                        label: '机位ID',
                        hidden: true
                    },
                    {
                        name: 'frameUnitName',
                        width: 100,
                        label: '机位号' // 即机位名称
                    },
                    {
                        name: 'rsConfigTag',
                        label: '资源分配标记',
                        width: 100,
                        formatter: function(cellval, opts, rwdat, _act) {
                            // 参数为cellval(单元格值), opts(参数含rowid、列属性等), rwdat(行数据), _act(行为,是add还是edit方式调用的)
                            if("0" == cellval) {
                                return "正常";
                            } else if("1" == cellval) {
                                return "增加";
                            } else if("2" == cellval) {
                                return "减少";
                            }

                        }
                    }
                ],
                multiselect: true,
                shrinkToFit: true,
                rownumbers: true
            });
            if(this.getRsConfig() && this.getRsConfig().configResult && this.getRsConfig().configResult.frameResList){
                this.$("#frameUnitConfigView-raw-grid").grid("clearData");
                this.$("#frameUnitConfigView-ready-grid").grid("reloadData", this.getRsConfig().configResult.frameResList);
			}
        },

        // 机位配置
        frameUnitConfigViewConfigBtnClick: function() {
            // 配置要求为减少的时候，需要在原先配置要求上减少资源。不允许新增资源！！
            var rsConfig = this.getRsConfig();
            if("2" == rsConfig.configRequire.configState) {
                fish.info("配置要求为减少的时候，不允许新增资源！");
                return;
            }

            var selectedFrameIds = $("#frameUnitConfigView-raw-grid").grid('getGridParam', 'selarrrow');
            if (selectedFrameIds == null || selectedFrameIds.length == 0) {
                fish.info("请至少选择一个机位！");
                return;
            }

            // 从备选机位列表中删除，添加到已配置机位中
            var delRowDatas = new Array();
            _.each(selectedFrameIds, function(element, index, list){
                var selectedFrame = $("#frameUnitConfigView-raw-grid").grid("getRowData", element);
                delRowDatas.push(selectedFrame);
            });

            _.each(delRowDatas, function(element, index, list){
                $("#frameUnitConfigView-raw-grid").grid("delRowData", element);
                element.rsConfigTag = "1"; // 0 正常；1 增加；2 减少
                $("#frameUnitConfigView-ready-grid").grid("addRowData", element);
            });

        },
        // 机位查看
        frameUnitConfigViewViewBtnClick: function() {
            var selectedFrameIds = $("#frameUnitConfigView-ready-grid").grid('getGridParam', 'selarrrow');
            if (selectedFrameIds == null || selectedFrameIds.length == 0) {
                fish.info("请选择一个机位进行查看！");
                return;
            }

            if(selectedFrameIds.length > 1) {
                fish.info("一次只能查看一个机位管理！");
                return;
            }

            var frameId = selectedFrameIds[0];
            var selectedFrame = $("#frameUnitConfigView-ready-grid").grid("getRowData", frameId);
            var pop = fish.popupView({url: 'modules/idcrm/resourcemanager/equrm/views/FrameUnitFormView',
                    width: "80%",
                    viewOption: {
                        frameUnitId: selectedFrame.frameUnitId,
                        frameCode: selectedFrame.frameCode
                    }
            });
        },

        // 删除已配置机位
        frameUnitConfigViewDelBtnClick: function () {
            var rsConfig = this.getRsConfig();
            var selectedFrameIds = $("#frameUnitConfigView-ready-grid").grid('getGridParam', 'selarrrow');
            if (selectedFrameIds == null || selectedFrameIds.length == 0) {
                fish.info("请至少选择一个机位！");
                return;
            }

            // 存储已删除的配置机位
            var deletedFrameUnits = this.getDeletedFrameUnits();
            var deletedRowDatas = new Array();
            var isReturn = false;

            // 从grid中删除
            _.each(selectedFrameIds, function(element, index, list){
                var selectedFrame = $("#frameUnitConfigView-ready-grid").grid("getRowData", element);

                // 对于配置状态：
                // 1--增加 需要在原先配置要求上增加资源，允许删除单个资源标记为1的资源
                // 2--减少 需要在原先配置要求上减少资源，不允许新增资源,允许删除单个资源标记为0的资源，删除时只将单个资源标记从0更改为2
                if("1" == rsConfig.configRequire.configState && "1" != selectedFrame.rsConfigTag) {
                    fish.info("配置状态为【增加】时候，仅允许删除资源标记为【增加】的资源");
                    isReturn = true;
                    return;
                } else if("2" == rsConfig.configRequire.configState && "0" != selectedFrame.rsConfigTag) {
                    fish.info("配置状态为【减少】时候，仅允许删除资源标记为【正常】的资源");
                    isReturn = true;
                    return;
                }

                selectedFrame.rsConfigTag="2"; // 0 正常；1 增加；2 减少
                deletedRowDatas.push(selectedFrame);

                var ii = _.findWhere(rsConfig.configResult.frameUnitResList, {frameUnitId: selectedFrame.frameUnitId});
                if(ii) {
                    deletedFrameUnits.push(selectedFrame);
                }
            });
            this.setDeletedFrameUnits(deletedFrameUnits);

            if(!isReturn) {
                _.each(deletedRowDatas, function(element, index, list){
                    $("#frameUnitConfigView-ready-grid").grid("delRowData", element);
                });
            }

        },

        // 恢复父级页面传过来的配置数据
        frameUnitConfigViewRenewBtnClick: function() {
            this.$("#frameUnitConfigView-raw-grid").grid("clearData");
            this.$("#frameUnitConfigView-ready-grid").grid("reloadData", this.getRsConfig().configResult.frameResList);
        },
        // 保存按钮
        frameUnitConfigViewConfirmBtnClick: function() {
            var tempAry = [];
        	var rsConfig = this.getRsConfig();
        	rsConfig.configResult.frameResList = tempAry;
        	
        	var deletedFrameUnits = this.getDeletedFrameUnits();
        	 var configFrameUnits = $("#frameUnitConfigView-ready-grid").grid("getRowData");
            
 		   if(!rsConfig.configResult || rsConfig.configResult == ''){
 			  rsConfig.configResult = {};
 		   }
 		   _.each(deletedFrameUnits,function(ele,idx,list){
 		       tempAry.push(_.pick(ele,'roomName','frameId','frameName','frameCode','frameUnitId','frameUnitName','vendorName','modelName','rsConfigTag'));
 		   });
 		   _.each(configFrameUnits,function(ele,idx,list){
 			   tempAry.push(_.pick(ele,'roomName','frameId','frameName','frameCode','frameUnitId','frameUnitName','vendorName','modelName','rsConfigTag'));
 		   });
 		   
 		   this.popup.close({rsConfig:rsConfig});
        }
    });
});