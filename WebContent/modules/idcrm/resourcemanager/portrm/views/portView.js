define([
    'text!modules/idcrm/resourcemanager/portrm/templates/portView.html',
    'i18n!modules/idcrm/resourcemanager/portrm/i18n/port.i18n',
    'modules/common/cloud-utils',
    'css!modules/idcrm/resourcemanager/portrm/styles/portrm.css'
], function (frameUnitViewTpl, i18nEquip, utils, css) {
    return fish.View.extend({
        template: fish.compile(frameUnitViewTpl),
        i18nData: fish.extend({}, i18nEquip),
        events: {
            "click #port-add-btn": "portAddBtnClick",
            "click #port-mod-btn": "portModBtnClick",
            /*"click #port-del-btn": "portDelBtnClick",*/
            "click #port-cancel-btn": "PortCancelBtnClick"
        },

        //这里用来进行dom操作
        _render: function () {
            this.$el.html(this.template(this.i18nData));
            return this;
        },

        //这里用来初始化页面上要用到的fish组件
        _afterRender: function () {
            this.loadPortRender();
            this.getPortData(1);
            $("#port-grid").grid("setGridHeight",400);
        },
        loadPortRender: function () {
        	var perpage = $.proxy(this.getPortData,this);
            $("#port-grid").grid({
                datatype: "json",
                height: 600,
                colModel: [
                    {
                        name: 'id',
                        label: 'ID',
                        key: true,
                        hidden: true
                    },
                    {
                        name: 'seriesNo',
                        label: '端口序号',
                        width: 100
                    },
                    {
                        name: 'code',
                        width: 100,
                        label: '端口编码'
                    },
                    {
                    	name: 'boardName',
                        width: 100,
                        label: '所属模块'
                    },
                    {
                    	name: 'portType',
                        width: 100,
                        label: '模块类型'
                    },
                    {
                        name: 'rateName',
                        label: '端口速率',
                        width: 100
                    },
                    {
                        name: 'allocationTypeName',
                        width: 100,
                        label: '共享方式'
                    },
                    {
                        name: 'equipmentId',
                        width: 100,
                        label: '关联设备'
                    },
                    {
                        name: 'parentId',
                        width: 100,
                        label: '关联端口'
                    },
                    {
                        name: 'useStateName',
                        width: 100,
                        label: '业务状态'
                    },
                    {
                        name: 'cusName',
                        width: 100,
                        label: '占用客户'
                    },
                    {
                        name: 'openOrderId',
                        width: 100,
                        label: '业务单号'
                    },
                    {
                        name: 'ipAddr',
                        width: 100,
                        label: 'IP地址'
                    }
                ],
                rowNum: 10,
                multiselect: true,
                shrinkToFit: false,
                rownumbers: true,
                pager: true,
                server: true,
                recordtext: "当前显示 {0} - {1} 条记录 共 {2} 条记录",
                pgtext: "第 {0} 页 / 共 {1} 页",
                emptyrecords: "没有记录",
                pageData: perpage //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
            });
        },
        getPortData: function (page, sortname, sortorder) { //请求服务器获取数据的方法
            var rowNum = $("#port-grid").grid("getGridParam", "rowNum");

            // 查询的时候 锁定页面
            if ($('#port-grid').data('blockui-content')) {
                $('#port-grid').unblockUI().data('blockui-content', false);
            } else {
                $('#port-grid').blockUI({
                    message: '加载中......'
                }).data('blockui-content', true);
            }
            
            var me = this;
            utils.ajax('iRsPortService', 'findPortsByEquipId', me.options.netEquip.id, page, rowNum).done(function (ret) {
                ret.page = page;
                var rows = ret.rows
                
                for(var i=0;i<rows.length;i++){
                	rows[i].boardId="";
                	rows[i].parentId="";
                }
            	$("#port-grid").grid("reloadData", ret);

                // 解锁页面
                $('#port-grid').unblockUI().data('blockui-content', false);

            });

        },
        // 新增端口
        portAddBtnClick: function () {
            var reloadPortData = $.proxy(this.getPortData, this);
            var pop = fish.popupView({url: 'modules/idcrm/resourcemanager/portrm/views/PortAddFormView',
                width: "98%",
                callback: function (popup, view) {
                    popup.result.then(function (e) {
                    	reloadPortData(1);
                    }, function (e) {
                        console.log('关闭了', e);
                    });
                },
                viewOption:{action:"detail.portAddEquipNet",portAddNetEquipment:this.options.netEquip}
            });

        },
        // 端口修改
        portModBtnClick: function () {
            var reloadPortData = $.proxy(this.getPortData, this);
            var selectedPortIds = $("#port-grid").grid('getGridParam', 'selarrrow');
            if (selectedPortIds == null || selectedPortIds.length == 0) {
                fish.info("请选择一项数据！");
                return;
            }
            if (selectedPortIds.length > 1) {
                fish.info("一次只能修改一条数据！");
                return;
            }
            var selectedPort = $("#port-grid").grid("getRowData", selectedPortIds[0]);
            var pop = fish.popupView({url: 'modules/idcrm/resourcemanager/portrm/views/PortModFormView',
                width: "98%",
                viewOption:{action:"detail.portModEquipNet",portModNetEquipment:this.options.netEquip,selectedPort:selectedPort},
                callback: function (popup, view) {
                    // 查询端口详情信息，加载
                   /* var selectedPort = $("#port-grid").grid("getRowData", selectedPortIds[0]);
                    view.$el.find("#port-form").form("value", selectedPort);*/
                    
                 /*   view.$el.find("#selTemplet").val($("#selTemplet").val());
                    view.$el.find("#selTemplet").disable();*/

                    popup.result.then(function (e) {
                        reloadPortData(1);
                    }, function (e) {
                        console.log('关闭了', e);
                    });
                }
            });

        },
        //端口删除
       /* portDelBtnClick: function () {
            var reloadPortData = $.proxy(this.getPortData, this);
                var selectedFrameIds = $("#port-grid").grid('getGridParam', 'selarrrow');
                if (selectedFrameIds == null || selectedFrameIds.length == 0) {
                    fish.info("请至少选择一条记录！");
                    return;
                }
                fish.confirm('是否删除所选端口？').result.then(function () {

                utils.ajax('iRsPortService', 'deleteByIds',selectedFrameIds currentUser.staffId).done(function (ret) {
                    if (ret > 0) {
                        fish.info("操作成功！");
                        reloadPortData(1);
                    } else {
                        fish.info("操作失败，请稍后再试！");
                    }

                });
            });

        },*/
        /*// 查询
        equipQueryBtnClick: function () {
            this.getPortData(1);
        },*/
        // 取消
        PortCancelBtnClick: function () {
        	$("#port-dialog").dialog("close");
        	
        }
    });
});