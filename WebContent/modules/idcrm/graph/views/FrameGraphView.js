define([
    'resources/jtopo/js/jtopo-0.4.8-min.js'+codeVerP,
    'resources/jtopo/js/excanvas.js'+codeVerP,
    'text!modules/idcrm/graph/templates/FrameGraphView.html',
    'i18n!modules/idcrm/graph/i18n/FrameGraphView.i18n',
    'modules/common/cloud-utils'
], function (jtopo, excanvas, frameGraphViewTpl, i18nFrameGraph, utils) {
    return fish.View.extend({
        template: fish.compile(frameGraphViewTpl),
        i18nData: fish.extend({}, i18nFrameGraph),
        events: {

        },

        //这里用来进行dom操作
        _render: function () {
            var html = $(this.template(this.i18nData));
            this.$el.html(html);
            return this;
        },

        //这里用来初始化页面上要用到的fish组件
        _afterRender: function () {
            var frameId = this.options.frameId;
            this.frameInit(frameId);
        },
        createFrameSquare: function (scene, x, y, w, h) {
            var leftUpNode = new JTopo.Node();
            leftUpNode.setSize(10, 10);
            leftUpNode.fillColor = "0,0,0";
            leftUpNode.setLocation(x, y);
            scene.add(leftUpNode);
            var leftDownNode = new JTopo.Node();
            leftDownNode.setSize(10, 10);
            leftDownNode.fillColor = "0,0,0";
            leftDownNode.setLocation(x, y + h);
            scene.add(leftDownNode);
            var rightUpNode = new JTopo.Node();
            rightUpNode.setSize(10, 10);
            rightUpNode.fillColor = "0,0,0";
            rightUpNode.setLocation(x + w, y);
            scene.add(rightUpNode);
            var rightDownNode = new JTopo.Node();
            rightDownNode.setSize(10, 10);
            rightDownNode.fillColor = "0,0,0";
            rightDownNode.setLocation(x + w, y + h);
            scene.add(rightDownNode);

            var upLink = new JTopo.Link(leftUpNode, rightUpNode, '');
            upLink.lineWidth = 10; // 线宽
            upLink.strokeColor = '0,0,0';
            scene.add(upLink);
            var downLink = new JTopo.Link(leftDownNode, rightDownNode, '');
            downLink.lineWidth = 10; // 线宽
            downLink.strokeColor = '0,0,0';
            scene.add(downLink);
            var leftLink = new JTopo.Link(leftUpNode, leftDownNode, '');
            leftLink.lineWidth = 10; // 线宽
            leftLink.strokeColor = '0,0,0';
            scene.add(leftLink);
            var rightLink = new JTopo.Link(rightUpNode, rightDownNode, '');
            rightLink.lineWidth = 10; // 线宽
            rightLink.strokeColor = '0,0,0';
            scene.add(rightLink);
        },
        createUnitName: function (scene, x, y, unitNum) {
            for (var i = 1; i <= unitNum; i++) {
                var node = new JTopo.CircleNode();
                var text = i + "U";
                if (i < 10) {
                    text = "0" + text
                }
                if (i % 5 == 0) {
                    text = text + "--";
                } else {
                    text = text + " -";
                }
                node.text = text;
                node.textPosition = "Top_Left";
                node.font = "7px Microsoft YaHei";
                node.fontColor = "0,0,0";
                node.radius = 0.01;
                node.fillColor = "0,0,0";
                node.setLocation(x, y + (i * 10));
                scene.add(node);
            }
        },
        //1 空闲 2 占空 3 占用 4 设备

       /* 102001	空闲
        102002	预占
        102003	占用
        102004	占空
        102005	预释放
        102006	保留*/
        createUnit: function (scene, x, y, unitNum, unitList) {
            var posY = y;
            for (var i = 0; i < unitList.length; i++) {
                var unitEq = unitList[i];
                var node = this.createUnitNode(unitEq.state, unitEq.useUnitNum, x, posY);
                scene.add(node);
//                posY = posY + 10;

               /* if (unitEq.state == '102003') {
                    var node = this.createUnitNode(unitEq.state, unitEq.useUnitNum, x, posY);
                    scene.add(node);
                    posY = posY + unitEq.useUnitNum * 10;
                } else {
                    for (var j = 0; j < unitEq.useUnitNum; j++) {
                        posY = posY + j * 10;
                        var node = this.createUnitNode(unitEq.state, unitEq.useUnitNum, x, posY);
                        scene.add(node);
                        //createUnitLine(scene,x,posY+9,170,1);
                    }
                    posY = posY + 10;
                }
                cnum = cnum + unitEq.useUnitNum;*/
            }
            /*if (cnum < unitNum) {
                for (var i = 0; i < unitNum - cnum; i++) {

                    var node = this.createUnitNode('102001', 1, x, posY);
                    scene.add(node);
                    posY = posY + 10;
                }
            }*/
        },
        createUnitNode: function (state, useUnitNum, x, y) {
            var node = new JTopo.Node();
            var width = 170;
            var height = 10;
            node.setLocation(x, y+10*(useUnitNum-1));
            node.dragable = 0;
            if (state == '102001') {
                node.setImage(basePath+"resources/jtopo/image/ukongxian.png");
            } else if (state == '102002') {
                node.setImage(basePath+"resources/jtopo/image/uyuzhan.png");
            } else if (state == '102003') {
                node.setImage(basePath+"resources/jtopo/image/uzhanyong.png");
            } else if (state == '102004') {
                node.setImage(basePath+"resources/jtopo/image/uzhankong.png");
            } else if (state == '102006') {
                node.setImage(basePath+"resources/jtopo/image/uyuliu.png");
            } /*else if (state == '102003') {
                height = useUnitNum;
                node.setImage(basePath+"resources/jtopo/image/equ.png");
            }*/
            node.setSize(width, height);
            return node;
        },
        createUnitLine: function (scene, x, y, w, h) {
            var sNode = new JTopo.Node();
            sNode.setSize(0.1, 0.1);
            sNode.fillColor = "0,0,0";
            sNode.setLocation(x, y);
            scene.add(sNode);
            var eNode = new JTopo.Node();
            eNode.setSize(0.1, 0.1);
            eNode.fillColor = "0,0,0";
            eNode.setLocation(x + w - 1, y);
            scene.add(eNode);

            var link = new JTopo.Link(sNode, eNode, '');
            link.lineWidth = h; // 线宽
            link.strokeColor = '0,0,0';
            scene.add(link);
        },

        frameInit: function (frameId) {
            var canvas = document.getElementById('canvas');
            //显示工具栏
            //showJTopoToobar(stage);
            var stage = new JTopo.Stage(canvas); // 创建一个舞台对象
            stage.wheelZoom = 0.85;//缩放比例

            var frameScene = new JTopo.Scene(); // 创建一个场景对象
            frameScene.setBackground(basePath+"resources/jtopo/image/bj.png");

            var icoNode1 = new JTopo.Node(" 空闲");    // 创建一个节点
            icoNode1.textPosition = "Middle_Right";
            icoNode1.font = "8px Microsoft YaHei";
            icoNode1.fontColor = "0,0,0";
            icoNode1.fillColor = "0,255,0";
            icoNode1.setLocation(15, 5);    // 设置节点坐标
            icoNode1.setSize(20, 10);
            icoNode1.setImage(basePath+"resources/jtopo/image/ukongxian.png");  //设置背景
            frameScene.add(icoNode1); // 放入到场景中

            var icoNode2 = new JTopo.Node(" 占空");    // 创建一个节点
            icoNode2.textPosition = "Middle_Right";
            icoNode2.font = "8px Microsoft YaHei";
            icoNode2.fontColor = "0,0,0";
            icoNode2.fillColor = "255,0,0";
            icoNode2.setLocation(70, 5);    // 设置节点坐标
            icoNode2.setSize(20, 10);
            icoNode2.setImage(basePath+"resources/jtopo/image/uzhankong.png");  //设置背景
            frameScene.add(icoNode2); // 放入到场景中

            var icoNode3 = new JTopo.Node(" 占用");    // 创建一个节点
            icoNode3.textPosition = "Middle_Right";
            icoNode3.font = "11px Microsoft YaHei";
            icoNode3.fontColor = "0,0,0";
            icoNode3.fillColor = "0,0,255";
            icoNode3.setLocation(125, 5);    // 设置节点坐标
            icoNode3.setSize(20, 10);
            icoNode3.setImage(basePath+"resources/jtopo/image/uzhanyong.png");  //设置背景
            frameScene.add(icoNode3); // 放入到场景中

            var icoNode4 = new JTopo.Node(" 预占");    // 创建一个节点
            icoNode4.textPosition = "Middle_Right";
            icoNode4.font = "11px Microsoft YaHei";
            icoNode4.fontColor = "0,0,0";
            icoNode4.fillColor = "0,0,255";
            icoNode4.setLocation(180, 5);    // 设置节点坐标
            icoNode4.setSize(20, 10);
            icoNode4.setImage(basePath+"resources/jtopo/image/uyuzhan.png");  //设置背景
            frameScene.add(icoNode4); // 放入到场景中

            var icoNode5 = new JTopo.Node(" 预留");    // 创建一个节点
            icoNode5.textPosition = "Middle_Right";
            icoNode5.font = "11px Microsoft YaHei";
            icoNode5.fontColor = "0,0,0";
            icoNode5.fillColor = "0,0,255";
            icoNode5.setLocation(235, 5);    // 设置节点坐标
            icoNode5.setSize(20, 10);
            icoNode5.setImage(basePath+"resources/jtopo/image/uyuliu.png");  //设置背景
            frameScene.add(icoNode5); // 放入到场景中

            var createFrameSquareProxy = $.proxy(this.createFrameSquare,this);
            var createUnitNameProxy = $.proxy(this.createUnitName,this);
            var createUnitProxy = $.proxy(this.createUnit,this);

             // 加载机柜信息
            utils.ajax('equiprmService', 'findFrameDetail', frameId).done(function (frameDto) {
                frameDto.rowColId = frameDto.rowId + '-' + frameDto.columnId;
                // 机柜基本信息
                $("#frame-show2d").form("value", frameDto);
                $("#frame-show2d").form('disable');

                // 加载机位
                var frameWidth = 180;
                var frameHeight = 10 * (frameDto.unitNum+1); // 机柜高度为机柜个数*10
                createFrameSquareProxy(frameScene, 40, 25, frameWidth, frameHeight);
                createUnitNameProxy(frameScene, 38, 39, frameDto.unitNum);

                utils.ajax('equiprmService', 'findFrameUnitList', frameId, 1, 200).done(function (frameUnitList) {
                    var unitList = new Array();
                    $.each(frameUnitList.rows, function(i,n){
                        var frameUnit = {"useUnitNum": n.positionNum, "state": n.useState};
                        unitList.push(frameUnit);
                    });

                    createUnitProxy(frameScene, 51, 35, frameDto.unitNum, unitList);
                    stage.add(frameScene);

                });

            });

        }
    });
});


