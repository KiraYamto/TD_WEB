define([
    'text!modules/idcrm/resourcemanager/equrm/templates/FrameUnitView.html',
    'i18n!modules/idcrm/resourcemanager/equrm/i18n/equip.i18n',
    'modules/common/cloud-utils',
    'css!modules/idcrm/resourcemanager/equrm/styles/equiprm.css'
], function (frameUnitViewTpl, i18nEquip, utils, css) {
    return fish.View.extend({
        template: fish.compile(frameUnitViewTpl),
        i18nData: fish.extend({}, i18nEquip),
        events: {
            "click #frameUnit-export-btn": "frameUnitExportBtnClick"
        },
        //这里用来进行dom操作
        _render: function () {
            this.$el.html(this.template(this.i18nData));
            return this;
        },

        //这里用来初始化页面上要用到的fish组件
        _afterRender: function () {
            this.loadFrameUnitRender();
            this.getFrameUnitData(1);
        },
        getFrameId : function () {
            return this.options.frameId;
        },
        loadFrameUnitRender: function () {
            this.$("#frameUnit-grid").grid({
                datatype: "json",
                height: 200,
                colModel: [
                    {
                        name: 'id',
                        label: 'ID',
                        key: true,
                        hidden: true
                    },
                    {
                        name: 'positionNum',
                        label: '机位序号',
                        width: 100
                    },
                    {
                        name: 'useStateName',
                        width: 100,
                        label: '占用状态'
                    },
                    {
                        name: 'subEntityId',
                        label: '占用资源类型',
                        width: 100
                    },
                    {
                        name: 'subEntityCode',
                        width: 100,
                        label: '占用资源名称'
                    },
                    {
                        name: 'custName',
                        width: 100,
                        label: '占用客户'
                    }
                ],
                rowNum: 15,
                shrinkToFit: true,
                rownumbers: true,
                pager: true,
                server: true,
                recordtext: "当前显示 {0} - {1} 条记录 共 {2} 条记录",
                pgtext: "第 {0} 页 / 共 {1} 页",
                emptyrecords: "没有记录",
                pageData: this.getFrameUnitData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
            });
        },
        getFrameUnitData: function (page, sortname, sortorder) { //请求服务器获取数据的方法
            var getFrameId = $.proxy(this.getFrameId,this);
            var rowNum = $("#frameUnit-grid").grid("getGridParam", "rowNum") || 10;

            // 查询的时候 锁定页面
            if ($('#frameUnit-grid').data('blockui-content')) {
                $('#frameUnit-grid').unblockUI().data('blockui-content', false);
            } else {
                $('#frameUnit-grid').blockUI({
                    message: '加载中......'
                }).data('blockui-content', true);
            }

            // 加载机柜信息
            utils.ajax('equiprmService', 'findFrameDetail', getFrameId()).done(function (ret) {
                $("#frameUnit-form").form('value', ret);
                $("#frameUnit-form").form('disable');
            });

            // 加载机位列表
            utils.ajax('equiprmService', 'findFrameUnitList', getFrameId(), page, rowNum).done(function (ret) {

                $("#frameUnit-grid").grid("reloadData", ret);

                // 解锁页面
                $('#frameUnit-grid').unblockUI().data('blockui-content', false);

            });

        },
        // 导出
        frameUnitExportBtnClick: function () {
            alert("尚未实现")
        }
    });
});