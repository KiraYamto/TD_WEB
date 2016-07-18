define([
    'text!modules/idcrm/resourcemanager/framerm/templates/FrameUnitFormView.html',
    'i18n!modules/idcrm/resourcemanager/framerm/i18n/framerm.i18n',
    'css!modules/idcrm/resourcemanager/framerm/styles/framerm.css',
    'modules/common/cloud-utils'
], function(frameUnitFormViewTpl, i18nFramerm, css, utils) {
    return fish.View.extend({
        template: fish.compile(frameUnitFormViewTpl),
        i18nData: fish.extend({}, i18nFramerm),
        events: {
            "click #framerm-frameUnitFormView-2d-btn": "frameShow2dBtnClick"
        },
        //这里用来进行dom操作
        _render: function() {
            this.$el.html(this.template(this.i18nData));
            return this;
        },
        //这里用来初始化页面上要用到的fish组件
        _afterRender: function() {
            this.loadFrameUnitRender();
            this.getFrameUnitData(1);
        },
        loadFrameUnitRender: function () {
            this.$("#framerm-frameUnitFormView-grid").grid({
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
                    },
                    {
                        name: 'danhao',
                        width: 100,
                        label: '业务单号'
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
                pageData: this.getFrameUnitData
            });
            // 设置高度
            $("#framerm-frameUnitFormView-grid").grid("setGridHeight", 380);
        },
        getFrameUnitData: function (page, sortname, sortorder) { //请求服务器获取数据的方法
            var me = this;
            var rowNum = $("#framerm-frameUnitFormView-grid").grid("getGridParam", "rowNum") || 10;

            // 查询的时候 锁定页面
            if ($('#framerm-frameUnitFormView-grid').data('blockui-content')) {
                $('#framerm-frameUnitFormView-grid').unblockUI().data('blockui-content', false);
            } else {
                $('#framerm-frameUnitFormView-grid').blockUI({
                    message: '加载中......'
                }).data('blockui-content', true);
            }

            // 加载机位列表
            utils.ajax('equiprmService', 'findFrameUnitList', me.options.frameId, page, rowNum).done(function (ret) {

                $("#framerm-frameUnitFormView-grid").grid("reloadData", ret);

                // 解锁页面
                $('#framerm-frameUnitFormView-grid').unblockUI().data('blockui-content', false);

            });

        },
        // 2D展示
        frameShow2dBtnClick: function() {

            var frameId = this.options.frameId;
            var pop =fish.popupView({url: 'modules/idcrm/graph/views/FrameGraphView',
                width: "70%",
                viewOption: {
                    frameId: frameId
                },
                callback:function(popup,view){

                    popup.result.then(function (e) {
                        fish.info("e="+e)
                    },function (e) {
                        console.log('关闭了',e);
                    });
                }
            });
        },
        resize: function() {
            this.$("#framerm-frameUnitFormView-grid").grid("setGridHeight",$(window).height()-150);
            this.$("#framerm-frameUnitFormView-grid").grid("resize",true);
        }
    });
});