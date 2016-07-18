//舞台对象
function IDCStage(canvas,showToobar) {
    this.canvas = canvas;
    var stage = new JTopo.Stage(canvas); // 创建一个舞台对象
  stage.wheelZoom = 0.85;//缩放比例
  //显示工具栏
  if(showToobar) {
    showJTopoToobar(stage);
  }
    this.stage = stage;
    this.add = function(arg){
        this.stage.add(arg);
    }
    this.setSize = function(width,height) {
        this.canvas.width=width;
        this.canvas.height=height;
    }
    return this;
}
//场景对象
function IDCScene(sceneId) {
    this.id = sceneId;
    var scene = new JTopo.Scene(); // 创建一个场景对象
    this.scene = scene;
    this.scene.setBackground('resources/jtopo/image/bj.png');
    this.setBackground = function(path){
        this.scene.setBackground(path);
    }
    this.add = function(arg){
        this.scene.add(arg);
    }
    this.getScene = function() {
        return this.scene;
    }   
    return this;
}
//机房-机柜使用状态，包括机房的大小，机房的名称，以及机柜说明
function IDCRoomScene_FrameUseState(sceneId,roomObj,showStr,maxRowNum,maxColNum) {
    var idcScene = new IDCScene(sceneId);
    this.id = sceneId;
    this.defaultRoomWidth = 800;
    this.defaultRoomHeight = 240;
    this.maxRowNum = maxRowNum;
    this.maxColNum = maxColNum;
    var width = 95*maxColNum;
    var height = 80*maxRowNum;
    this.roomWidth = this.defaultRoomWidth;
    this.roomHeight = this.defaultRoomHeight;
    if(width > this.defaultRoomWidth) {
      this.roomWidth = width;
    }
    if(height > this.defaultRoomHeight) {
      this.roomHeight = height;
    }
  this.idcScene = idcScene;
    this.init = function() {
      var icoNode1 = new JTopo.Node(" 空闲");    // 创建一个节点
    icoNode1.textPosition = "Middle_Right";
    icoNode1.font = "11px Microsoft YaHei";
    icoNode1.fontColor = "0,0,0";
    icoNode1.fillColor = "0,255,0";
    icoNode1.setLocation(25,10);    // 设置节点坐标                    
    icoNode1.setSize(30,35);
    icoNode1.setImage("resources/jtopo/image/kongxian.png");  //设置背景
    this.idcScene.add(icoNode1); // 放入到场景中
              
    var icoNode2 = new JTopo.Node(" 整柜出租");    // 创建一个节点
    icoNode2.textPosition = "Middle_Right";
    icoNode2.font = "11px Microsoft YaHei";
    icoNode2.fontColor = "0,0,0";
    icoNode2.fillColor = "255,0,0";
    icoNode2.setLocation(100,10);    // 设置节点坐标
    icoNode2.setSize(30,35);
    icoNode2.setImage("resources/jtopo/image/zhenggui.png");  //设置背景
    this.idcScene.add(icoNode2); // 放入到场景中  
    
    var icoNode3 = new JTopo.Node(" 机位出租");    // 创建一个节点
    icoNode3.textPosition = "Middle_Right";
    icoNode3.font = "11px Microsoft YaHei";
    icoNode3.fontColor = "0,0,0";
    icoNode3.fillColor = "0,0,255";
    icoNode3.setLocation(190,10);    // 设置节点坐标
    icoNode3.setSize(30,35);
    icoNode3.setImage("resources/jtopo/image/jiwei.png");  //设置背景
    this.idcScene.add(icoNode3); // 放入到场景中       
    
    var roomNameNode = new JTopo.Node(showStr);    // 创建一个节点
    roomNameNode.textPosition = "Middle_Right";
    roomNameNode.font = "15px Microsoft YaHei";
    roomNameNode.fontColor = "0,0,0";
    roomNameNode.setLocation(290,25);    // 设置节点坐标
    roomNameNode.setSize(0.5,0.5);
    this.idcScene.add(roomNameNode); // 放入到场景中       
    //创建机房
    createSquare(this.idcScene,25, 50, this.roomWidth, this.roomHeight);
    }
  this.reInit = function() {
    this.idcScene.getScene().clear();
    this.init();
  }
    this.setRoomSize = function(width,height) {
        var flg = 0;
        if(width > this.defaultRoomWidth) {
        this.roomWidth = width;
        flg++;
      }
      if(height > this.defaultRoomHeight) {
        this.roomHeight = height;
        flg++;
      }
      if(flg > 0) {
        alert("init");
        this.reInit();
      }
    }
    this.getScene = function() {
        return this.idcScene.getScene();
    }
    this.add = function(arg){
        this.idcScene.add(arg);
    }
    this.init();
    return this;
}
function createSquare(scene,x, y, w, h){
    var leftUpNode = new JTopo.Node();
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
  }
  
    function RoomFrame(code,rownum,colnum,unitnum,power,vender,state) {
        this.code = code;
        this.rownum = rownum;
        this.colnum = colnum;
        this.unitnum = unitnum;
        this.power = power;
        this.vender = vender;
        this.state = state;
        return this;
    }  
    //创建机柜节点
    function RoomFrameUseStateNode(roomFrame,rowNum,colNum) {
    this.rowNum = rowNum;
    this.colNum = colNum;
    var frameNode = new JTopo.Node(roomFrame.code);    // 创建一个节点
    frameNode.textPosition = "Bottom_Center";
    frameNode.font = "11px Microsoft YaHei";
    frameNode.fontColor = "0,0,0";
    frameNode.dragable=0;
    if(roomFrame.state == 1) {
      frameNode.setImage("resources/jtopo/image/zhenggui.png");
    } else if(roomFrame.state == 2) {
         frameNode.setImage("image/jiwei.png"); 
    } else if(roomFrame.state == 3) {
         frameNode.setImage("resources/jtopo/image/kongxian.png"); 
    }     
    frameNode.setSize(30,40);              
    this.positionx = 55+95*(colNum-1);
    this.positiony = 65+75*(rowNum-1);
    frameNode.setLocation(this.positionx,this.positiony);    // 设置节点坐标
    this.frameNode = frameNode;
    this.roomFrame = roomFrame;
    return this;
    }
    