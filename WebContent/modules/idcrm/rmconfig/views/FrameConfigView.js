define([
    'text!modules/idcrm/rmconfig/templates/FrameConfigView.html',
    'i18n!modules/idcrm/rmconfig/i18n/FrameConfig.i18n',
    'modules/common/cloud-utils',
    'css!modules/idcrm/rmconfig/styles/FrameConfig.css'
], function (frameConfigViewTpl, i18nFrameConfig, utils, css) {
    return fish.View.extend({
        template: fish.compile(frameConfigViewTpl),
        i18nData: fish.extend({}, i18nFrameConfig),
        events: {
            "click #frameConfigView-view-btn": "frameConfigViewViewBtnClick",
            "click #frameConfigView-del-btn": "frameConfigViewDelBtnClick",
            "click #frameConfigView-renew-btn": "frameConfigViewRenewBtnClick",
            "click #frameConfigView-confirm-btn": "frameConfigViewConfirmBtnClick"
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
        // 存储已删除的配置机柜
        getDeletedFrames: function() {
            var deletedFrames = this.options.deletedFrames;
            if(!deletedFrames) {
                deletedFrames = new Array();
            }
            return deletedFrames;
        },
        // 更新已经删除的配置机柜
        setDeletedFrames: function(frames) {
            this.options.deletedFrames = frames;
        },
        //这里用来初始化页面上要用到的fish组件
        _afterRender: function () {

            var rsConfig = this.getRsConfig();

            // 加载导航树：机房-行号-机柜
            this.initFrameConfigTree(rsConfig.roomId, rsConfig.roomName);

            // 加载已配置机柜
            this.initFrameConfigGrid();
//            var totalCount = rsConfig.configResult.frameResList.length;
//            var data = {
//                page: 1,
//                pageSize: 5,
//                records: totalCount,
//                rows: rsConfig.configResult.frameResList
//            };
            this.$("#frameConfigView-grid").grid("reloadData", rsConfig.configResult.frameResList);

            // 加载配置信息
            rsConfig.configRequire.roomName = rsConfig.roomName;
            this.$("#frameConfigView-configForm").form('value', rsConfig.configRequire);
            this.$("#frameConfigView-configForm").form('disable');

        },
        // 加载导航树
        initFrameConfigTree: function (roomId, roomName) {

            var rsConfig = this.getRsConfig();

            $("#frameConfigView-treeDiv").height(320);
            $("#frameConfigView-treeDiv").niceScroll({
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

                        // 配置要求为减少的时候，需要在原先配置要求上减少资源。不允许新增资源！！
                        if("2" == rsConfig.configRequire.configState) {
                            fish.info("配置要求为减少的时候，不允许新增资源！");
                            return;
                        }

                        if("frame" == treeNode.tag) {

                            utils.ajax('equiprmService', 'findFrameDetail', treeNode.kId).done(function (ret) {

                                var newData = ret;
                                newData.frameId = ret.id;
                                newData.frameCode = ret.code;
                                newData.frameName = ret.name;
                                newData.vendorName = ret.vendor;
                                newData.modelName = ret.model;
                                newData.rsConfigTag = "1"; // 0 正常；1 增加；2 减少

                                var rowData =  $("#frameConfigView-grid").grid("getRowData");
                                var tmp = _.where(rowData, {frameId : ret.id});
                                if(!tmp || tmp.length == 0) {
                                    $("#frameConfigView-grid").grid("addRowData", newData);
                                }

                            });
                        }

                    }
                }
            };
            $("#frameConfigView-tree").tree(options);


            // 查询的时候 锁定页面
            if ($('#frameConfigView-treeDiv').data('blockui-content')) {
                $('#frameConfigView-treeDiv').unblockUI().data('blockui-content', false);
            } else {
                $('#frameConfigView-treeDiv').blockUI({
                    message: '加载中......'
                }).data('blockui-content', true);
            }

            var nodeName = $("#frameConfigView-nodeName").val();
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
                $("#frameConfigView-tree").tree("reloadData", ret);

                // 解锁页面
                $('#frameConfigView-treeDiv').unblockUI().data('blockui-content', false);
            });
        },
        initFrameConfigGrid: function () {
            this.$("#frameConfigView-grid").grid({
                height: 270,
                data: [],
                colModel: [
                    {
                        name: 'roomName',
                        label: '机房名称',
                        width: 100
                    },
                    {
                        name: 'frameId',
                        label: '机柜ID',
                        width: 100
                    },
                    {
                        name: 'frameCode',
                        width: 100,
                        label: '机柜编码'
                    },
                    {
                        name: 'frameName',
                        width: 100,
                        label: '机柜名称'
                    },
                    {
                        name: 'vendorName',
                        width: 100,
                        label: '厂商名称'
                    },
                    {
                        name: 'modelName',
                        width: 100,
                        label: '型号名称'
                    },
                    {
                        name: 'rsConfigTag',
                        width: 100,
                        label: '资源分配标记',
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
        },
        getEquipData: function (page, sortname, sortorder) { //请求服务器获取数据的方法
            var rowNum = $("#frameConfigView-grid").grid("getGridParam", "rowNum");

            // 查询的时候 锁定页面
            if ($('#frameConfigView-grid').data('blockui-content')) {
                $('#frameConfigView-grid').unblockUI().data('blockui-content', false);
            } else {
                $('#frameConfigView-grid').blockUI({
                    message: '加载中......'
                }).data('blockui-content', true);
            }

            // 查询条件-字段
            var qryObj = $("#frame-qryform").form('value');
            qryObj.name_cond = $("#equip_name_cond").val();
            qryObj.code_cond = $("#equip_code_cond").val();
            qryObj.model_cond = $("#equip_model_cond").val();

            // 查询条件-动作
            var condObj = {
                "name": $("#equip_name_cond").val(),
                "code": $("#equip_code_cond").val(),
                "model": $("#equip_model_cond").val()
                //"chassisTypeId":$("#equip_chassisTypeId_cond").val(),
                //"state":$("#equip_stateName_cond").val()
            };

            var dcRoomId = $("#frame_dcRoomId").val();
            var dataCenterId = $("#frame_dataCenterId").val();

            if ("" != dcRoomId) {
                qryObj.roomId = dcRoomId + '';
            }

            if ("" != dataCenterId) {
                qryObj.dcId = dataCenterId + '';
            }


            var nodes = $("#frameConfigView-tree").tree("getSelectedNodes");
            if (nodes && nodes.length > 0) {
                var selectedNode = nodes[0];
                if (selectedNode.tag == "dcRoom") {
                    qryObj.roomId = selectedNode.kId + '';
                }
            }

            utils.ajax('equiprmService', 'findFrameListByCond', qryObj, page, rowNum).done(function (ret) {

                $("#frameConfigView-grid").grid("reloadData", ret);

                // 解锁页面
                $('#frameConfigView-grid').unblockUI().data('blockui-content', false);

            });

        },

        // 机柜查看
        frameConfigViewViewBtnClick: function() {
            var selectedFrameIds = $("#frameConfigView-grid").grid('getGridParam', 'selarrrow');
            if (selectedFrameIds == null || selectedFrameIds.length == 0) {
                fish.info("请选择一项数据！");
                return;
            }

            if(selectedFrameIds.length > 1) {
                fish.info("一次只能查看一个机柜的机位管理！");
                return;
            }

            var frameId = selectedFrameIds[0];
            var selectedFrame = $("#frameConfigView-grid").grid("getRowData", frameId);
            var pop = fish.popupView({url: 'modules/idcrm/resourcemanager/equrm/views/FrameFormView',
                    width: "80%",
                    viewOption: {
                        frameId: selectedFrame.frameId
                    }
            });
        },

        // 删除已配置机柜
        frameConfigViewDelBtnClick: function () {
            var rsConfig = this.getRsConfig();
            var selectedFrameIds = $("#frameConfigView-grid").grid('getGridParam', 'selarrrow');
            if (selectedFrameIds == null || selectedFrameIds.length == 0) {
                fish.info("请选择一项数据！");
                return;
            }

            // 存储已删除的配置机柜
            var deletedFrames = this.getDeletedFrames();
            var deletedRowDatas = new Array();
            var isReturn = false;

            // 从grid中删除
            _.each(selectedFrameIds, function(n, i, list){
                var selectedFrame = $("#frameConfigView-grid").grid("getRowData", n);

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

                var ii = _.findWhere(rsConfig.configResult.frameResList, {frameUnitId: selectedFrame.frameUnitId});
                if(ii) {
                    deletedFrames.push(selectedFrame);
                }
            });
            this.setDeletedFrames(deletedFrames);

            if(!isReturn) {
                _.each(deletedRowDatas, function(n, i, list){
                    $("#frameConfigView-grid").grid("delRowData", n);
                });
            }
        },

        // 恢复父级页面传过来的配置数据
        frameConfigViewRenewBtnClick: function() {
            this.$("#frameConfigView-grid").grid("reloadData", this.getRsConfig().configResult.frameResList);
        },

        // 保存按钮
        frameConfigViewConfirmBtnClick: function() {
        	var tempAry = [];
        	var rsConfig = this.getRsConfig();
        	rsConfig.configResult.frameResList = tempAry;
        	
            var deletedFrames = this.getDeletedFrames();
            var configFrames = $("#frameConfigView-grid").grid("getRowData");
            
 		   if(!rsConfig.configResult || rsConfig.configResult == ''){
 			  rsConfig.configResult = {};
 		   }
 		   _.each(deletedFrames,function(ele,idx,list){
 		       tempAry.push(_.pick(ele,'roomName','frameId','frameName','frameCode','vendorName','modelName','rsConfigTag'));
 		   });
 		   _.each(configFrames,function(ele,idx,list){
 			   tempAry.push(_.pick(ele,'roomName','frameId','frameName','frameCode','vendorName','modelName','rsConfigTag'));
 		   });
 		   
 		   this.popup.close({rsConfig:rsConfig});
            
           //this.popup.close(_.union(deletedFrames, configFrames));
        }
    });
});