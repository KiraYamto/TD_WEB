define(['resources/jtopo/js/jtopo-0.4.8-min.js'+codeVerP,
        'resources/jtopo/js/excanvas.js'+codeVerP,
        'modules/common/cloud-utils.js'+codeVerP,
        'text!modules/idcrm/graph/templates/RoomGraphView.html'+codeVerP,
        'i18n!modules/idcrm/graph/i18n/RoomGraphView.i18n.en.js'+codeVerP,
        'css!modules/idcrm/graph/styles/RoomGraphView.css'+codeVerP
    ], function(jtopo,excanvas,utils,roomGraphHtml,roomGraphI18n,roomGraphCss) {
        return fish.View.extend({
            template: fish.compile(roomGraphHtml),
            i18nData: fish.extend({}, roomGraphI18n),
            events: {//事件对象的书写格式为 {"event selector": "callback"}。 省略 selector 则事件被绑定到视图的根元素（this.el),可以用this.$el.trigger触发。
              "click #graph-frameused-btn":"frameUsed",
              "click #graph-emptyframeunitcount-btn":"emptyFrameUnitCount",
              "click #graph-emptyframeunitsearch-btn":"emptyFrameUnitSearch"
            },
            //这里用来进行dom操作
            _render: function() {
                this.$el.html(this.template(this.i18nData));        
                return this;
            },
            //这里用来初始化页面上要用到的fish组件
            _afterRender: function() { 
              //水平滚动条
              var parentWidth =  $("#idcrm-graph-roomgraph").parent().width();
           //   $("#idcrm-graph-roomgraph").width(parentWidth-30);
              $("#idcrm-graph-roomgraph").niceScroll({
                  cursorcolor: '#1d5987',
                  cursorwidth: "10px",
                  cursoropacitymax:"0.4",
                  touchbehavior:true
              });
               this.roomInit();
            },
            roomInit: function(){
                var me = this;
                me.$('#idcrm-graph-roomgraph').blockUI({message:''});
                if(this.options && this.options.roomId){
                    utils.ajax('spaceResourceService','queryRoomById',this.options.roomId).done(function(ret){   
                        var room = {roomName:"",floorArea:"",frameList:[]};
                        if(ret && ret.basicInfo && ret.basicInfo.roomName){
                            room.roomName = ret.basicInfo.roomName;   
                        }
                        if(ret && ret.entityProsInfo && ret.entityProsInfo.floorArea){
                            room.floorArea = ret.entityProsInfo.floorArea;   
                        }
                        if(ret){
                           me.$('#frameUsedPercent').html(ret.frameUsedPercent);
                           me.$('#frameTotalCount').html(ret.frameTotalCount);
                           me.$('#emptyCount').html(ret.emptyCount);
                           me.$('#frameAllocCount').html(ret.frameAllocCount);
                           me.$('#frameUnitAllocCount').html(ret.frameUnitAllocCount);
                        } 
                        utils.ajax('equiprmService','findFrameList',me.options.roomId).done(function(frameList){    
                           if(frameList){
                             room.frameList = frameList;
                           } 
                           me.roomDraw(room);
                       }).always(function(){
                          me.$('#idcrm-graph-roomgraph').unblockUI();   
                       });  
                    });
                    
                }
            },
            roomDraw:function(room){
                 var me = this;
                 //点击菜单的处理事件
                 this.rightMenuHandle();

                  var roomStage = this.createStage('idcrm-graph-canvas'); // 创建一个舞台对象
                  this.initToolbar(roomStage);

                  if(room.frameList ){
                     
                      //创建机柜并计算行列
                      var maxromNum = 1;
                      var maxColNum = 1;
                      var frameNodeList = [];
                      for(var i=0;i < room.frameList.length; i++){
                           var fData = room.frameList[i];
                           if(maxromNum < parseInt(fData.rowId)){
                                maxromNum = parseInt(fData.rowId);
                           }
                           if(maxColNum < parseInt(fData.columnId)){
                                maxColNum = parseInt(fData.columnId);
                           }
                           var frameNode = this.createUsageFrame(fData.rowId+'-'+fData.columnId,
                                                             fData.rowId,
                                                             fData.columnId,
                                                             fData.allocationStateId,
                                                             fData);
                           frameNodeList[i]=frameNode;
                      }
                      //默认不要小于6行10列
                      if(maxromNum < 3){
                          maxromNum = 3;
                      }
                      if(maxColNum <10){
                          maxColNum = 10;
                      }
                      //创建机房使用情况
                      var roomScene = this.createRoomScene('room1',"机房："+room.roomName+"    面积："+room.floorArea+"平方米",maxromNum,maxColNum); 
                   
                      //设置舞台大小
                      this.setStageSize(roomStage,roomScene.roomWidth+50,roomScene.roomHeight+80);
                      roomStage.add(roomScene);

                      //添加机柜
                      for(var i=0;i < frameNodeList.length; i++){
                           var frameNode = frameNodeList[i];
                           roomScene.add(frameNode); // 放入到场景中
                           
                           //鼠标右键弹出菜单begin
                           
                           frameNode.addEventListener('mouseup',function(event){
                              var x = event.clientX;
                              var y = event.clientY;
                              if(event.button == 2){// 右键
                                 document.oncontextmenu=function(aevent){//阻止出现系统默认的右键菜单
                                 　 if(window.event){
                                   　　 aevent=window.event;
                              　　　　　aevent.returnValue=false; //对IE 中断 默认点击右键事件处理函数
                              　　  }else{
                              　　　　　aevent.preventDefault(); //对标准DOM 中断 默认点击右键事件处理函数
                              　　　};
                                 };
                                 var zindex = me.$el.css("z-index")!="auto"?me.$el.css("z-index")+1:1;
                                    // 当前位置弹出菜单（div）
                                 $('#idcrm-graph-contextmenu').css({
                                      top:y,
                                      left:x,
                                      position:"fixed",
                                      zIndex:zindex
                                 }).show();  
                              }
                              me.setClickFrameNode(this);
                           });
                           frameNode.addEventListener('mouseout',function(event){
                                $('#idcrm-graph-contextmenu').hide();
                              /*  if(this.attachNode){
                                  roomScene.remove(this.attachNode);
                                } */
                               //me.$('#fameCode').html("");
                               //me.$('#frameUnitUseRate').html("");
                           });
                           //鼠标右键弹出菜单end
                           
                         frameNode.addEventListener('click',function(event){
                             /*  this.attachNode = new JTopo.Node(this.nodeData.code);
                               this.attachNode.setSize(1,1);
                               this.attachNode.setLocation(event.target.x,event.target.y);  
                               this.attachNode.font = "11px Microsoft YaHei";
                               this.attachNode.fontColor = "0,0,0"; 
                               this.attachNode.textPosition = "Top_Right"; 
                               roomScene.add(this.attachNode); */
                              me.$('#fameCode').html(this.nodeData.code);
                              me.$('#frameUnitUseRate').html(this.nodeData.useRate);

                         });

                           //双击弹出机柜图begin
                           frameNode.addEventListener("dbclick", function(event){
                              var _node = this;
                              fish.popupView({
                                  url: 'modules/idcrm/graph/views/FrameGraphView',
                                  width: 850,
                                  viewOption:{frameId:_node.nodeData.id}
                              });
                          });
                          //双击弹出机柜图end
                      }

                 }else{
                      var roomScene = this.createRoomScene('room1',"机房："+room.roomName+"    面积："+room.floorArea+"平方米",6,10); // 创建一个场景对象
                     //重新设置舞台大小
                     this.setStageSize(roomStage,roomScene.roomWidth+25,roomScene.roomHeight+100);
                     roomStage.add(roomScene);
                }
                  
            },
            frameUsed: function(){
                //fish.info('待实现');
            },
            emptyFrameUnitCount: function(){
                fish.info('尚未实现');
            },
            emptyFrameUnitSearch: function(){
               fish.info('尚未实现');
            },
            FRAME_USE_STATE:{
               "FULL":"417001",//整柜分配
               "UNIT":"417002",//机位分配
               "FREE":"417003" //空闲
            },
            createStage:function(canvasId){
                var canvas = document.getElementById(canvasId); 
              //  this.canvas = canvas;
                var stage =  new JTopo.Stage(canvas); // 创建一个舞台对象
                stage.wheelZoom = 0.85;//缩放比例
                return stage;
            },
            setStageSize: function(stage,width,height){
               stage.canvas.width=width;
               stage.canvas.height=height;
            },
            fameNodeWH:{width:50,height:80},
            createUsageFrame: function(text,rowId,columnId,state,data){
                 node = new JTopo.Node(text); // 创建一个节点
                 node.positionx = 50+ this.fameNodeWH.width *(columnId-1); 
                 node.positiony = 90+ this.fameNodeWH.height*(rowId-1);
                 node.state = state;

                 node.textPosition = "Bottom_Center";//文本位置：底部居中
                 node.font = "11px Microsoft YaHei";//字体
                 node.fontColor = "0,0,0";//字体颜色
                 node.dragable=0; //不能拖动
		             node.borderRadius=10;//圆角
                 node.borderWidth = 3;
                 if(node.state == this.FRAME_USE_STATE.FULL) {//整柜分配
                     node.setImage("resources/jtopo/image/zhenggui.png");
                 } else if(node.state == this.FRAME_USE_STATE.UNIT) {//机位分配
                     node.setImage("image/jiwei.png"); 
                 } else if(node.state == this.FRAME_USE_STATE.FREE) {//空闲
                     node.setImage("resources/jtopo/image/kongxian.png"); 
                 }     
                 node.setSize(30,50);              
                 node.setLocation(node.positionx,node.positiony);// 设置节点坐标
                 node.nodeData = data;
                 return node;
            },
            createRoomScene:function(roomId,title,maxRowNum,maxColNum){
              var scene = new JTopo.Scene(); // 创建一个场景对象
              scene.roomId = roomId;
              scene.setBackground('resources/jtopo/image/bj.png');
              scene.roomWidth = scene.defaultRoomWidth = (this.$el.width()-150);
              scene.roomHeight = scene.defaultRoomHeight = 400;
              if(maxRowNum && maxColNum){
                 this.calculateRoomWH(scene,maxRowNum,maxColNum);
              }
              this.setRoomTitle(scene,title);
              this.initRoomScene(scene,25,70,scene.roomWidth,scene.roomHeight);
              return scene;
            },
            initRoomScene:function(scene,x, y, w, h){ //画机房的四边框            
                var leftUpNode = new JTopo.Node("");
                leftUpNode.setSize(3,3);
                leftUpNode.setLocation(x,y);    
                scene.add(leftUpNode);    

                var leftDownNode = new JTopo.Node();
                leftDownNode.setSize(3,3);
                leftDownNode.setLocation(x,y+h);
                scene.add(leftDownNode); 

                var rightUpNode = new JTopo.Node();
                rightUpNode.setSize(3,3);
                rightUpNode.setLocation(x+w,y);     
                scene.add(rightUpNode);  

                var rightDownNode = new JTopo.Node();
                rightDownNode.setSize(3,3);
                rightDownNode.setLocation(x+w,y+h);  
                scene.add(rightDownNode);    
                
                var upLink = new JTopo.Link(leftUpNode, rightUpNode,'');
                upLink.lineWidth = 3; // 线宽
                upLink.strokeColor = '0,0,255';
                scene.add(upLink);   

                var downLink = new JTopo.Link(leftDownNode, rightDownNode,'');
                downLink.lineWidth = 3; // 线宽
                downLink.strokeColor = '0,0,255';
                scene.add(downLink);  

                var leftLink = new JTopo.Link(leftUpNode, leftDownNode,'');
                leftLink.lineWidth = 3; // 线宽
                leftLink.strokeColor = '0,0,255';
                scene.add(leftLink);

                var rightLink = new JTopo.Link(rightUpNode, rightDownNode,'');
                rightLink.lineWidth = 3; // 线宽
                rightLink.strokeColor = '0,0,255';
                scene.add(rightLink);
            },
            setRoomTitle: function(scene,title) {
              var emptyNode = new JTopo.Node(" 空闲");    // 创建一个节点
              emptyNode.textPosition = "Middle_Right";
              emptyNode.font = "11px Microsoft YaHei";
              emptyNode.fontColor = "0,0,0";
              emptyNode.fillColor = "0,255,0";
              emptyNode.setLocation(25,10);    // 设置节点坐标                    
              emptyNode.setSize(30,50);
              emptyNode.setImage("resources/jtopo/image/kongxian.png");  //设置背景
              emptyNode.dragable=0; //不能拖动
              scene.add(emptyNode); // 放入到场景中
                        
              var totalRentNode = new JTopo.Node(" 整柜出租");    // 创建一个节点
              totalRentNode.textPosition = "Middle_Right";
              totalRentNode.font = "11px Microsoft YaHei";
              totalRentNode.fontColor = "0,0,0";
              totalRentNode.fillColor = "255,0,0";
              totalRentNode.setLocation(100,10);    // 设置节点坐标
              totalRentNode.setSize(30,50);
              totalRentNode.setImage("resources/jtopo/image/zhenggui.png");  //设置背景
              totalRentNode.dragable=0; //不能拖动
              scene.add(totalRentNode); // 放入到场景中  
              
              var frameUnitRentNode = new JTopo.Node(" 机位出租");    // 创建一个节点
              frameUnitRentNode.textPosition = "Middle_Right";
              frameUnitRentNode.font = "11px Microsoft YaHei";
              frameUnitRentNode.fontColor = "0,0,0";
              frameUnitRentNode.fillColor = "0,0,255";
              frameUnitRentNode.setLocation(190,10);    // 设置节点坐标
              frameUnitRentNode.setSize(30,50);
              frameUnitRentNode.setImage("resources/jtopo/image/jiwei.png");  //设置背景
              frameUnitRentNode.dragable=0; //不能拖动
              scene.add(frameUnitRentNode); // 放入到场景中       
              
              //显示机房基本信息
              var roomNameNode = new JTopo.Node(title);   
              roomNameNode.textPosition = "Middle_Right";
              roomNameNode.font = "15px Microsoft YaHei";
              roomNameNode.fontColor = "0,0,0";
              roomNameNode.setLocation(290,25);    // 设置节点坐标
              roomNameNode.setSize(0.5,0.5);
              roomNameNode.dragable=0; //不能拖动
              scene.add(roomNameNode); // 放入到场景中   
            },
            calculateRoomWH: function(scene,rowNum,colNum){ //根据行数、列数计算宽、高。
       
              scene.rowNum = rowNum ? rowNum : 6;
              scene.colNum = colNum ? colNum : 10;

              var newWidth = 50 + this.fameNodeWH.width * scene.colNum;
              var newHeight = 80 + this.fameNodeWH.height * scene.rowNum;

              if(newWidth > scene.roomWidth) {
                scene.roomWidth = newWidth;
              }
              if(newHeight > scene.roomHeight) {
                scene.roomHeight = newHeight;
              }

            },
            setClickFrameNode:function(node){
               this.clickFrameNode = node;
            },
            getClickFrameNode:function(){
               return this.clickFrameNode;
            },
            rightMenuHandle:function(){//菜单事件
               
               var me = this;
               $('#idcrm-graph-contextmenu a').click(function(){
                    var text = $(this).text();
                    if(text == '复制机柜编码'){
                        //剪切板事件自动触发
                    }else if(text == '新增机柜'){
                       fish.popupView({url: 'modules/idcrm/resourcemanager/equrm/views/FrameFormView',
                            width: "70%",
                            callback:function(popup,view){
                                popup.result.then(function (e) {
                                    reloadEquipData(1);
                                },function (e) {
                                    console.log('关闭了',e);
                                });
                            }
                        });
                    }else if(text == '修改机柜'){
                        var selFrameNode = me.getClickFrameNode();
                        fish.popupView({url: 'modules/idcrm/resourcemanager/equrm/views/FrameFormView',
                            width: "70%",
                            viewOption: {
                                frameId: selFrameNode.nodeData.id
                            }
                        });
                    }
                    $('#idcrm-graph-contextmenu').hide();
                   
              });
              //初始化剪切板
              this.initClipboard();

            },
            initClipboard: function(){
                var me = this;
                if (window.clipboardData) { //for ie
                  $('#idcrm-graph-copyBtn').click(function () {
                       var selFrameNode = me.getClickFrameNode();
                       window.clipboardData.setData('text',selFrameNode.nodeData.code);
                  });
                } else {
                  var client = new ZeroClipboard($("#idcrm-graph-copyBtn"));
                  client.on('ready', function (event) {
           
                     client.on('copy', function (event) {
                         var selFrameNode = me.getClickFrameNode();
                         event.clipboardData.setData("text/plain",selFrameNode.nodeData.code);
                     });
                     client.on('aftercopy', function (event) {
		         var selFrameNode = me.getClickFrameNode();
                         fish.toast("info","机柜编码["+selFrameNode.nodeData.code+"]复制完成");
                     });
                  });
           
                  client.on('error', function (event) {
                    ZeroClipboard.destroy();
                  });
                }
            },
            initToolbar: function(stage){
              $('#idcrm-graph-centerButton').click(function(){
                 stage.centerAndZoom(); //缩放并居中显示
              });
              $('#idcrm-graph-zoomOutButton').click(function(){//放大
                 stage.zoomOut();
              });
              $('#idcrm-graph-zoomInButton').click(function(){//缩小
                 stage.zoomIn();
              });

              var runPrefixMethod = function(element, method) {
                  var usablePrefixMethod;
                  ["webkit", "moz", "ms", "o", ""].forEach(function(prefix) {
                      if (usablePrefixMethod) return;
                      if (prefix === "") {
                        // 无前缀，方法首字母小写
                        method = method.slice(0,1).toLowerCase() + method.slice(1);
                      }
                       var typePrefixMethod = typeof element[prefix + method];
                       if (typePrefixMethod + "" !== "undefined") {
                         if (typePrefixMethod === "function") {
                           usablePrefixMethod = element[prefix + method]();
                         } else {
                           usablePrefixMethod = element[prefix + method];
                         }
                       }
                  });

                   return usablePrefixMethod;
               };

              $('#idcrm-graph-fullScreenButton').click(function(){
                  runPrefixMethod(stage.canvas, "RequestFullScreen");
              }); 
          }

        });
    });
