define([ 'text!modules/nms/performance/templates/resourceMonitor.html',
	'i18n!modules/nms/performance/i18n/performance.i18n', 'modules/common/cloud-utils',
	'css!modules/nms/performance/styles/resourceMonitor.css' ], function(
	viewTpl, i18n, utils, css) {
var currentObj;
var rowNum = 20;
var $gridlist;
var selectRow; //当前选中的指标值
var resourceTypeId ;
var objId;

return fish.View.extend({
    template:fish.compile(viewTpl),
    i18nData:fish.extend({},i18n),

    initialize:function(){
    	currentObj=this;   
    
    },

    events:{
    	"click #nms_rs_search_btn": "searchBtnEven",
        "combobox:change #timeCircle":"getDataByTime"
    },

    _beforeRender:function(){
    	//console.log("_beforeRender");	
    },

	beforeRender:function(){
		//console.log("beforeRender");
	},

/*	render:function(){
		console.log("render");
	},*/
	//这里用来进行dom操作
	_render: function() {
		//console.log("_render");
		this.$el.html(this.template(this.i18nData));
		
		return this;
	},
	
/*		afterRender:function(){
		console.log("afterRender");
	},*/
	
	//这里用来初始化页面上要用到的fish组件
	_afterRender: function() {
		this.layout();
		this.initSearchForm();
		this.initResourceTree();		
		this.initList();
		
		//console.log("_afterRender");
					//设置hightchart时区
			  // Highcharts.setOptions({
			  //       global: {
			  //           useUTC: false //当X轴类型为datetime日期时间型的，需要设置时区
			  //       }
			  //   });	
	},
	
    layout:function(){
			//计算屏幕高度
		availableHeight = $(document.body).height() - 135; //页面可用高度
		centerPanelHeight = availableHeight  - 39;//这里的32px是toolbar的高度; 28px：是第二个grid title的高度
		$("#kpiInfoArea").height(centerPanelHeight/3*1);
		var chartHeight=centerPanelHeight/3*2;
		
		if(chartHeight<298){
           chartHeight=298;
		}
        $("#nms_echartDiv").height(chartHeight-90);
		$("#nms_chartMap").height(chartHeight-90);		
    },
   

    getDataByTime:function(e){
       var currentValue=$('#timeCircle').combobox('value');
       if(currentValue==4){
       	  $('#startDate').datetimepicker('enable');
       	  $('#endDate').datetimepicker('enable');
       	  $("#nms_rs_search_btn").removeClass('disabled');
       }else{
       	  $('#startDate').datetimepicker('disable');
       	  $('#endDate').datetimepicker('disable');
       	  $("#nms_rs_search_btn").addClass('disabled');

	     if(!selectRow) return;
	     currentObj.loadHistoryKPIValue({
			 resourceTypeId:selectRow["objectTypeId"],
			 resourceObjectId:selectRow["objectId"],
			 kpiId:selectRow["kpiId"],
			 kpiName:selectRow["kpiName"],
			 timeType:currentValue,
			 beginTime:null,
			 endTime:null
	     });      	  
       }
    },

	initSearchForm:function(){
		$('#startDate').datetimepicker();
		$('#endDate').datetimepicker();
		//初始化周期
		
		var $timecircle=$('#timeCircle').combobox({
	        dataTextField: 'text',
	        dataValueField: 'value',
	        dataSource: [ {
					text : '最近一天',
					value : 1
				}, {
					text : '最近一周',
					value : 2
				}, {
					text : '最近一月',
					value : 3
				}, {
					text : '自定义',
					value : 4
			} ]
	    });
	    $timecircle.combobox('value',1);
	},
	
    initResourceTree:function(){
     	var options = {     		
			view: {
				dblClickExpand: false,
				showIcon:true
			},
			data: {
				simpleData: {
					enable: true
				}
				// ,key: {
			 //        iconFontEnable: true//显示字体图标
		  //       }
			},
			callback:{
				onExpand :currentObj.expandTree ,
				onAsyncSuccess:currentObj.treeLoadSuccess,
				onClick:currentObj.treeClickFun
			}
		};
        $("#leftTree").blockUI({message:'加载中...'});
		 utils.ajax('resourceTreeService','loadResourceTreeByEMSPath',null,null,null,null,null).done(function(data){
			    $("#leftTree").unblockUI();   
			    options.fNodes =data;
			    $("#resourceTree").tree(options);
			    var allNodes= $("#resourceTree").tree("instance").getNodes();
			    $("#resourceTree").tree('expandNode',allNodes[0],true);
		 });
    },


	
    expandTree:function(event, node){
		if (!node || !node.attributes)
			return;
		var objType = node.attributes["objType"];
		var objId = node.attributes["objId"];
		var AllchildrenNode = node.children;
        currentObj.loadResourceTreeByNode(node,objType,objId);

	    $.each(AllchildrenNode,function(index,item){
	    	 objType = item.attributes["objType"];
		     objId = item.attributes["objId"];
            currentObj.loadResourceTreeByNode(item,objType,objId);
	    });
    },

    loadResourceTreeByNode:function(node,objType,objId){
        $("#leftTree").blockUI({message:'加载中...'});
		utils.ajax('resourceTreeService','loadResourceTreeByEMSPath',objType,objId,null,null,null).done(function(data){			 
			 $("#leftTree").unblockUI(); 
			 if(data.length!=0){
			 	var zTree =  $("#resourceTree").tree("instance");
			 	if(node.children==null){
                  zTree.addNodes(node,data);
			 	};
			 	
			 	var emsNodes=node.children;
			 	$.each(emsNodes,function(i,item){
			 	   if(item.attributes["objType"]=="ems"){//无传输系统，查询ems下的网元	
                      currentObj.loadElement(item,"ems",item.attributes["objId"]);
		           }
			 	});

			 }
			 
		});	
    },

    loadElement:function(node,objType,objId){
    	$("#leftTree").blockUI({message:'加载中...'});
    	utils.ajax('resourceTreeService','loadResourceTreeByEMSPath',objType,objId,null,null,null).done(function(data){	
        		$("#leftTree").unblockUI(); 
        		if(data.length!=0){
			 	    var zTree =  $("#resourceTree").tree("instance");
			 	    if(node.children==null){
                       zTree.addNodes(node,data);
			 	    };
			 	    
			 	    var portNodes=node.children;
			 	    $.each(portNodes,function(i,item){
			 	      if(item.attributes["objType"]=="element"){//查询网元下的端口	
                        currentObj.loadPort(item,"element",item.attributes["objId"]);
		              }
			 	    });			 	    
			 	}
        });
    },

    loadPort:function(node,objType,objId){
    	$("#leftTree").blockUI({message:'加载中...'});
    	utils.ajax('resourceTreeService','loadResourceTreeByEMSPath',objType,objId,null,null,null).done(function(data){	
        		$("#leftTree").unblockUI(); 
        		if(data.length!=0){
			 	    var zTree =  $("#resourceTree").tree("instance");
			 	    if(node.children==null){
                       zTree.addNodes(node,data);
			 	    };			 	    
			 	    
			 	}
        });
    },

    treeLoadSuccess:function(event, treeId, node){
			var regexp = /\(\d+\)/;
			var data= $("#resourceTree").tree("instance").getNodes();
			if (node) {
				var newText = "";
				if (node.name.search(regexp) > -1) {
					newText = node.name.replace(regexp,
							"(" + data.length + ")");
				} else {
					newText = node.name + "("
							+ data.length + ")";
				}
				$("#resourceTree").tree('updateNode', {
					target : node.target,
					name : newText
				});
			}
			if (!data || data.length != 1)
				return;
			if (data[0]
					&& data[0]['attributes']
					&& data[0]['attributes'].objType == 'area') {
				var tempNode = $("#resourceTree").tree('getNodeByParam',"id",
						data[0]["id"]);
				$("#resourceTree").tree('expandNode', tempNode,true);				
			}		
    },

    treeClickFun:function(event, node){
		if (!node || !node.attributes)
			return;
		
		resourceTypeId = node.attributes["resourceTypeId"];
		objId = node.attributes["objId"];
        currentObj.loadKpiInfoGridData(resourceTypeId,objId);
 
    },

    loadKpiInfoGridData:function(resourceTypeId,objId){
      
		utils.ajax('kpiInfoService','loadResourceKPIValue',resourceTypeId,objId,1,rowNum).done(function(data){
			var result = {
					"rows": data.objects,
					"page": 1,
					"total": data.totalPage,
					"records":data.totalNumber,
					"id": "kpiConfigId"
			};
           $gridlist.grid('reloadData',result);
           currentObj.loadSuccess();
		});
        
    },
    loadData:function(page, rowNum, sortname, sortorder, params){

		utils.ajax('kpiInfoService','loadResourceKPIValue',resourceTypeId,objId, page,rowNum).done(function(data){
			var result = {
					"rows": data.objects,
					"page": page,
					"total": data.totalPage,
					"records":data.totalNumber,
					"id": "kpiConfigId"
			};
			$gridlist.grid('reloadData',result);
		});
	},
	//初始化告警列表
	initList:function(){
		var opt={
			datatype: "json",
			colModel: [{
				name: 'kpiName',
				label: '指标名称',
				width: 150
			}, {
				name:"kpiTypeName",
				label:"指标类型",
				width:80
								
			}, {
				name : "value",
				label : "指标值",
				width : 80
			}
			, {
				name : "prewarnValue",
				label : "预警门限值",
				width : 80
			}, {
				name : "warnValue",
				label : "告警门限值",
				width : 80
			},{
				name:"updateDateStr",
				label:"采集时间",
				width:80
			} ],
			
			rowNum: rowNum,
			// pager: true,
			//server: true,
			multiselect:true,
			pageData: this.loadData,
			onSelectRow:this.loadHistoryKPIValueBySelect
		};
		$gridlist=$("#kpiInfoGrid").grid(opt);
	},

    loadSuccess:function(){
    	var data=$gridlist.grid("getRowData");
    	if (!data || data.length <= 0)return;								
		currentObj.loadHistoryKPIValue({
			 resourceTypeId:data[0]["objectTypeId"],
			 resourceObjectId:data[0]["objectId"],
			 kpiId:data[0]["kpiId"],
			 kpiName:data[0]["kpiName"]
		 });
		selectRow = data[0];
    	
    },

    loadHistoryKPIValueBySelect:function(e, rowid, state, checked){
       selectRow= $gridlist.grid("getSelection");
       currentObj.loadHistoryKPIValue({
			 resourceTypeId:selectRow["objectTypeId"],
			 resourceObjectId:selectRow["objectId"],
			 kpiId:selectRow["kpiId"],
			 kpiName:selectRow["kpiName"]
		 });
    },

	loadHistoryKPIValue : function(params) {
		if(!params["timeType"]){
			params.timeType = $("#timeCircle").combobox('value');
			if(params.timeType && params.timeType == 4  && (!params.beginTime || !params.endTime)){	
				var formParams = this.$el.find("#timeForm").form("value");
				params.beginTime = formParams["startDate"];
				params.endTime = formParams["endDate"];
			}
			else{
				params.beginTime=null;
				params.endTime=null;
			}
		};

		utils.ajax('kpiInfoService', 'loadResourceKPIHistoryValue',params.resourceTypeId,params.resourceObjectId,params.kpiId,params.timeType,params.beginTime,params.endTime).done(function(kpiHisValues) {
				try{
					currentObj.initEcharts(params["kpiName"], kpiHisValues);					
				}catch(e){
					fish.info({title:'温馨提醒', message:'获取数据异常！'});
				}		
		});	
	},

	searchBtnEven:function(){
			var isValid = $("#timeForm").isValid();
			if(!isValid){
				return;
			}
			var params = this.$el.find("#timeForm").form("value");
			currentObj.loadHistoryKPIValue({
				 resourceTypeId:selectRow["objectTypeId"],
				 resourceObjectId:selectRow["objectId"],
				 kpiId:selectRow["kpiId"],
				 kpiName:selectRow["kpiName"],
				 timeType:4,
				 beginTime:params["startDate"],
				 endTime:params["endDate"]
			 });
	},
    
    nmsdateFormat:function(date,fmt)   
    {  
		  var o = {   
		    "M+" : date.getMonth()+1,                 //月份   
		    "d+" : date.getDate(),                    //日   
		    "h+" : date.getHours(),                   //小时   
		    "m+" : date.getMinutes(),                 //分   
		    "s+" : date.getSeconds(),                 //秒   
		    "q+" : Math.floor((date.getMonth()+3)/3), //季度   
		    "S"  : date.getMilliseconds()             //毫秒   
		  };   
		  if(/(y+)/.test(fmt))   
		    fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));   
		  for(var k in o)   
		    if(new RegExp("("+ k +")").test(fmt))   
		  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
		  return fmt;   
     }, 
    

	initEcharts:function(kpiName, data){
		var myChart = echarts.init(document.getElementById('nms_chartMap'));
		var time=new Array();
		var hisKpiValue=new Array();
		var minkpiValue;
		var maxkpiValue;

		if(data.length>0){
           minkpiValue=data[0].value;
           maxkpiValue=data[0].value;
		}
		$.each(data,function(i,m){
			var updateDate=new Date(m.updateDate);
			//var chartDate=currentObj.nmsdateFormat(updateDate,'yyyy-MM-dd hh:mm:ss');
			/*var charDate=new Date(updateDate.getFullYear(),updateDate.getMinutes(),updateDate.getDate(), updateDate.getHours(),    
		     updateDate.getMinutes(), updateDate.getSeconds());*/
            time.push(currentObj.nmsdateFormat(updateDate,'yyyy-MM-dd hh:mm:ss'));//yyyy-MM-dd hh:mm:ss   
            hisKpiValue.push(m.value); 
            // hisKpiValue.push({
            // 	name:chartDate.toString(),
            // 	value:[
            // 	   chartDate,m.value
            // 	]
            // });        
          
            if(eval(maxkpiValue)<eval(m.value)){
                maxkpiValue=m.value;
            };

            if(eval(minkpiValue)>eval(m.value)){
                minkpiValue=m.value;
            }
		});
         
        if(eval(minkpiValue)==eval(maxkpiValue)){
           minkpiValue=minkpiValue-3;
           maxkpiValue=maxkpiValue+3;
        } 
		// minkpiValue=Math.round(minkpiValue*10)/10;
		// maxkpiValue=Math.round(maxkpiValue*10)/10;

		var option = {
	        	    title: {
	        	        text: '\"' + kpiName + '\"指标趋势图',	
	        	        x: 'center'
	        	    },
	        	    tooltip : {
	        	        trigger: 'axis'	        	        
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
	        	            //type : 'time',	        	            
	        	            boundaryGap : false,
	        	            data:time
	        	        }
	        	    ],
	        	    yAxis : [
	        	        {	        	        	
	        	            type : 'value',
	        	            min:'dataMin',
	        	            max:'dataMax'
	        	            //splitNumber:6
	        	            //interval :Math.round(((maxkpiValue-minkpiValue)/6)*10)/10
	        	        }
	        	    ],
	        	    series : [
	        	        {
	        	            name:'',
	        	            type:'line',
	        	            smooth: true, 
	        	            areaStyle:{normal:{}},
	        	            data:hisKpiValue
	        	        }
	        	    ]
	        };

	     // 使用刚指定的配置项和数据显示图表。
	     myChart.setOption(option);
	}


});
});
