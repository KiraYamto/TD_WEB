define([
	'text!modules/idcrm/query/templates/CapacityQryView.html'+codeVerP,
	'i18n!modules/idcrm/query/il8n/capacity.i18n.zh.js'+codeVerP,
	'css!modules/idcrm/query/styles/capacity.css'+codeVerP,
// 'resources/echarts/echarts.js'+codeVerP,
	'modules/common/cloud-utils.js'+codeVerP/*
											 * ,
											 * 'resources/echarts/china-main-city/henan-main-city-map.js'+codeVerP,
											 * 'resources/echarts/henan.js'+codeVerP
											 */
], function(CapacityQryViewTpl, i18nCapacityQryView,css,utils) {
	return fish.View.extend({
		template: fish.compile(CapacityQryViewTpl),
		i18nData: fish.extend({}, i18nCapacityQryView),
		events: {
		   "click #capacityView-query-btn":"search"
		},
		
		// 这里用来进行dom操作
		_render: function() {
			var html=$(this.template(this.i18nData));
			
			this.$el.html(html);
			return this;
		},

		// 这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this._initArea();
			var areaId = currentJob.areaId;
			if(areaId != ''){
			    this.initByAreaId(areaId);
			}else{
				this._initMap();
				this._initFramePie(null);
				this._initRatePie(null);
				this._initIpAddrPie(null);
			}
			this.resize();
		},
		_initMap:function(){
			var me = this;
		    var mapData = this.getMapData(); 
			var chart = echarts.init(document.getElementById('map'));
			var option = {
			    title: {
			        text: '区域资源统计',
			        left: 'center'
			    },
                color:['#0066CC','#00CCFF','#00CC33','#FFCC00','#FF9900','#000000'],
			    tooltip: {
			        trigger: 'item',
			        formatter:function(params,ticket,callback) {
						    var res = params.name +'</br>';
						    // get series
						    var series = chart.getOption().series;
						    // get data in series[i]
						    for(var i=0; i<chart.getOption().series.length;i++){
						        var dataArr = series[i].data;
						        if(series[i].data){
						        	for(var j=0;l = series[i].data.length,j<l;j++) {
							            if(dataArr[j].name == params.name){
							            	var value = dataArr[j].value;
							            	if(!value){
							            		value = 0;
							            	}
							                res+=series[i].name+':'+value+'</br>';
							            }
							        }
						        }
						        
						    }
						    return res;
						}
			    },
			    legend: {
			        orient: 'vertical',
			        left: 'left',
			        data:['机柜资源','带宽资源','IP地址资源']
			    },
		        series : [ {
				       name:'机柜资源',
				       type : 'map', 
				       map : '河南',
			           label: {
			               normal: {
			                   show: true
			               },
			               emphasis: {
			                   show: true
			               }
			           },
			           data:mapData.rsFrameData
			       },
			       {
				       	name:'带宽资源',
				        type : 'map', 
				        map : '河南',
				           label: {
				               normal: {
				                   show: true
				               },
				               emphasis: {
				                   show: true
				               }
				           },
				           data:mapData.rateData
				       },
			       {
			       	name:'IP地址资源',
			        type : 'map', 
			        map : '河南',
			           label: {
			               normal: {
			                   show: true
			               },
			               emphasis: {
			                   show: true
			               }
			           },
			          data:mapData.ipAddrData
			       }
			   	 ]
			   };
			   chart.setOption(option);
			   chart.on('click', function (params) {
			  		if(params.name == ""){
			  			chart.setOption(option);
			  			return;
			  		}
			  		var datas = me.getMapDataByName(params.name);
			  		me._initAreaMap(params.name,datas);
			  		me._initFramePie(params.name);
			  		me._initRatePie(params.name);
			  		me._initIpAddrPie(params.name);
			   });
		},
		_initFramePie:function(areaName){
			var me = this;
			var data = me.getRsFrameState(areaName);
			var chart = echarts.init(document.getElementById('frameDiv'));
			var option = {
					 legend: {
						 	orient: 'vertical',
						 	x: 'left',
	                        data:['空闲','预占','占用','预释放','保留']
	                    },
	                    color:['#0000CC','#00CCFF','#9999FF','#3366FF','#006699','#0099CC'],
	                    tooltip: {
	    			        trigger: 'item',
	    			        formatter:"{a} <br/>{b}: {c}"
	                    },
	                    series: [{
	                        name: '机柜',
	                        type: 'pie',
		                    radius:['50%','75%'],
		                    center: ['70%', '50%'],
		                    avoidLabelOverlap: false,
		                    label: {
		                        normal: {
		                            show: true,
		                            formatter:'机柜',
		                            position: 'center'
		                        },
		                        emphasis: {
		                            show: false
		                        }
		                    },
		                    labelLine: {
		                        normal: {
		                            show: false
		                        }
		                    },
	                        data:data
	                    }]
			};
			chart.setOption(option);
		},
		_initRatePie:function(areaName){
			var me = this;
			var data = me.getRateState(areaName);
			var chart = echarts.init(document.getElementById('rateDiv'));
			var option = {
					 legend: {
						 	orient: 'vertical',
						 	x: 'left',
	                        data:['空闲','预占','占用','预释放','保留']
	                    },
	                    color:['#99FFFF','#66CCCC','#66CCFF','#99CCFF','#99CCCC','#33CCCC'],
	                    tooltip: {
	    			        trigger: 'item',
	    			        formatter:"{a} <br/>{b}: {c}G"
	    			    },
	                    series: [{
	                        name: '带宽',
	                        type: 'pie',
		                    radius:['50%','75%'],
		                    center: ['70%', '50%'],
		                    avoidLabelOverlap: false,
		                    label: {
		                        normal: {
		                            show: true,
		                            formatter:'带宽',
		                            position: 'center'
		                        },
		                        emphasis: {
		                            show: false
		                        }
		                    },
		                    labelLine: {
		                        normal: {
		                            show: false
		                        }
		                    },
	                        data:data
	                    }]
			};
			chart.setOption(option);
		},
		_initIpAddrPie:function(areaName){
			var me = this;
			var data = me.getIpAddrState(areaName);
			var chart = echarts.init(document.getElementById('ipAddrDiv'));
			var option = {
					 legend: {
						 	orient: 'vertical',
						 	x: 'left',
	                        data:['空闲','预占','占用','预释放','保留'],
	                        textStyle:{
	                        	fontSize:10
	                        }
	                    },
	                    color:['#009900','#00CC66','#66CC00','#66FF00','#00FF33','#00FF66'],
	                    tooltip: {
	    			        trigger: 'item',
	    			        formatter:"{a} <br/>{b}: {c}"
	                    },
	                    series: [{
	                        name: 'ip地址',
	                        type: 'pie',
		                    radius:['50%','75%'],
		                    avoidLabelOverlap: false,
		                    center: ['70%', '50%'],
		                    label: {
		                        normal: {
		                            show: true,
		                            formatter:'ip地址',
		                            position: 'center'
		                        },
		                        emphasis: {
		                            show: false
		                        }
		                    },
		                    labelLine: {
		                        normal: {
		                            show: false
		                        }
		                    },
	                        data:data
	                    }]
			};
			chart.setOption(option);
		},
		_initAreaMap:function(areaName,datas){
			$.get('resources/echarts/china-main-city/'+cityMap[areaName]+'.json', function (cityJson) {
	  			echarts.registerMap(areaName, cityJson);
				var chart = echarts.init(document.getElementById('map'));
	  			chart.setOption({
					title: {
				        text: '区域资源统计',
				        left: 'center',
				        subtext: areaName
				    },
	                /*color:['#0066CC','#00CCFF','#00CC33','#FFCC00','#FF9900','#000000'],
				    tooltip: {
				        trigger: 'item',
				        formatter:function(params,ticket,callback) {
							    var res = params.name +'</br>';
							    // get series
							    var series = chart.getOption().series;
							    // get data in series[i]
							    for(var i=0; i<chart.getOption().series.length;i++){
							        var dataArr = series[i].data;
							        if(series[i].data){
							        	for(var j=0;l = series[i].data.length,j<l;j++) {
								            if(dataArr[j].name == params.name){
								            	var value = dataArr[j].value;
								            	if(!value){
								            		value = 0;
								            	}
								                res+=series[i].name+':'+value+'</br>';
								            }
								        }
							        }
							        
							    }
							    return res;
							}
				    },
				    legend: {
				        orient: 'vertical',
				        left: 'left',
				        data:['机柜资源','带宽资源','IP地址资源']
				    },*/
			        series: [{
			        	name:'机柜资源',
			            type: 'map',
			            map: areaName,
			            label: {
			                normal: {
			                    show: true
			                },
			                emphasis: {
			                    show: true
			                }
			            },
			            data:datas.rsFrameData
			        },
			        {
			        	name:'带宽资源',
			            type: 'map',
			            map: areaName,
			            label: {
			                normal: {
			                    show: true
			                },
			                emphasis: {
			                    show: true
			                }
			            },
			            data:datas.rateData
			        },
			        {
			        	name:'IP地址资源',
			            type: 'map',
			            map: areaName,
			            label: {
			                normal: {
			                    show: true
			                },
			                emphasis: {
			                    show: true
			                }
			            },
			            data:datas.ipAddrData
			        }]
			    });
			});
		},
		getMapData: function() { // 请求服务器获取数据的方法
		    // 获取查询条件
			var data = new Object();
		    var areaId =  $('#capacity-areaId').val();
			var me =this;
        	$.ajaxSetup({async : false});
        	if(areaId == ''){
        		areaId = currentJob.areaId;
        	}
			utils.ajax('capacityQryService','qryRsFramesByAreaId',areaId).done(function(ret)	{
				data.rsFrameData = ret;
			});
			utils.ajax('capacityQryService','qryRatesByAreaId',areaId).done(function(ret)	{
				data.rateData = ret;
			});
			utils.ajax('capacityQryService','qryIpAddrsByAreaId',areaId).done(function(ret)	{				 
				data.ipAddrData = ret;
			});
        	$.ajaxSetup({async : true});
			return data;
		},
		getMapDataByName: function(areaName) { // 请求服务器获取数据的方法
		    // 获取查询条件
			var data = new Object();
			utils.ajax('capacityQryService','qryRsFramesByAreaName',areaName).done(function(ret)	{				 
				data.rsFrameData = ret;
			});
			utils.ajax('capacityQryService','qryRatesByAreaName',areaName).done(function(ret)	{
				data.rateData = ret;
			});
			utils.ajax('capacityQryService','qryIpAddrsByAreaName',areaName).done(function(ret)	{				 
				data.ipAddrData = ret;
			});
			return data;
		},
		getRsFrameState:function(areaName){
			var me =this;
        	var data;
        	$.ajaxSetup({async : false});
			if(areaName == null){
			    var areaId =  $('#capacity-areaId').val();
	        	if(areaId == ''){
	        		areaId = currentJob.areaId;
	        	}
				utils.ajax('capacityQryService','qryRsFrameStateByAreaId',areaId).done(function(ret)	{
					data = ret;
				});
			}else{
				utils.ajax('capacityQryService','qryRsFrameStateByName',areaName).done(function(ret)	{
					data = ret;
				});
			}
        	$.ajaxSetup({async : true});
			return data;
		},
		getIpAddrState:function(areaName){
        	var data;
        	$.ajaxSetup({async : false});
			if(areaName == null){
				 var areaId =  $('#capacity-areaId').val();
					var me =this;
		        	if(areaId == ''){
		        		areaId = currentJob.areaId;
		        	}
					utils.ajax('capacityQryService','qryIpAddrStateByAreaId',areaId).done(function(ret)	{
						data = ret;
					});
			}else{
				utils.ajax('capacityQryService','qryIpAddrStateByName',areaName).done(function(ret)	{
					data = ret;
				});
			}
        	$.ajaxSetup({async : true});
			return data;
		},
		getRateState:function(areaName){
			var me =this;
        	var data;
        	$.ajaxSetup({async : false});
			if(areaName == null){
			    var areaId =  $('#capacity-areaId').val();
				if(areaId == ''){
	        		areaId = currentJob.areaId;
	        	}
				utils.ajax('capacityQryService','qryRateStateByAreaId',areaId).done(function(ret)	{
					data = ret;
				});
			}else{

				utils.ajax('capacityQryService','qryRateStateByName',areaName).done(function(ret)	{
					data = ret;
				});
			}
        	$.ajaxSetup({async : true});
			return data;
		},
		initByAreaId:function(areaId){
			var me = this;
			utils.ajax('capacityQryService','qryAreaById',areaId).done(function(area){
		    	if(area == null){
		        	$.ajaxSetup({async : false});
		    		utils.ajax('capacityQryService','qryAreaByDcId',areaId).done(function(ret){
		    			area = ret;
		    		});
		        	$.ajaxSetup({async : true});
		    	}
				if(area.grade == 'C3' || area.grade == 'C4'){
					var areaName = area.areaName;
					if(area.grade == 'C4'){
			        	$.ajaxSetup({async : false});
						utils.ajax('capacityQryService','qryAreaById',area.parentId).done(function(parentArea){	
							areaName = parentArea.areaName;
						});
			        	$.ajaxSetup({async : true});
					}
					areaName = areaName + '市';
					var datas = me.getMapData();
			  		me._initAreaMap(areaName,datas);
			  		me._initFramePie(areaName);
			  		me._initRatePie(areaName);
			  		me._initIpAddrPie(areaName);
				}else{
					$('#capacity-areaId').val(area.areaId);
		    		me._initMap();
			  		me._initFramePie(null);
			  		me._initRatePie(null);
			  		me._initIpAddrPie(null);
				}
		  	});
		},
		search:function(){// 查询
			var me = this;
		    var areaId = $('#capacity-areaId').val();
		    me.initByAreaId(areaId);
		},
		_initArea:function(){
            utils.ajax('commonService','getAllAreasAndDcsTree').done(function(nodeDatas){                
                var options = {
                    view: {
                        dblClickExpand: false,
                        selectedMulti:false
                    },
                    data: {
                        simpleData: {
                            enable: true
                        }
                    },
                    callback: {
                        onClick: onClick
                    },
                    fNodes : nodeDatas || []
                };

                $("#capa_area_tree").tree(options);
            });
            
            $("#capacity-area").click(function(){
                    showMenu();
             });
            $("#capa_area_tree_html").position({   
                of: $("#capacity-area"),
                my: "left top",
                at: "left bottom"
            }).hide();
            $("#capa_menuBtn").click(function(event) {
                showMenu();
                return false;
            });
             
            function onClick(e, treeNode) {
                var nodes = $("#capa_area_tree").tree("getSelectedNodes");
                if (nodes.length > 0 ) {
                	var nodeId = nodes[0].id;
                	var areaId = nodeId.substring(nodeId.indexOf("_")+1,nodeId.length);
                	$("#capacity-areaId").val(areaId);
                    $("#capacity-area").val(nodes[0].name);
                    hideMenu();
                }
            }

            function showMenu() {
                $("#capa_area_tree_html").slideDown("fast");
                $("body").on("mousedown", onBodyDown);
            }
            function hideMenu() {
                $("#capa_area_tree_html").fadeOut("fast");
            }
            function onBodyDown(event) {
                if (!(event.target.id == "capa_menuBtn" || event.target.id == "capa_area_tree_html" 
                      || $(event.target).parents("#capa_area_tree_html").length>0)) {
                    hideMenu();
                }
            }   

        },
		resize:function(){
			$('#capa_area_tree').width($('#capacity-area').width()-5);
			$('#mapDiv').height(document.body.clientHeight*0.7);
			$('#map').height(document.body.clientHeight*0.65);
//			$('#mapDiv').width(document.body.clientWidth*0.5);
//			$('#map').width(document.body.clientWidth*0.4);
			$('#framPanel').height(document.body.clientHeight*0.23);
			$('#ratePanel').height(document.body.clientHeight*0.23);
			$('#ipAddrPanel').height(document.body.clientHeight*0.23);
			$('#frameDiv').height($('#framPanel').height()-45);
			$('#rateDiv').height($('#framPanel').height()-45);
			$('#ipAddrDiv').height($('#framPanel').height()-45);
			$('#capacity_pie').width(document.body.clientWidth*0.2);
			$('#capacity_map').width(document.body.clientWidth*0.5);
		}
	});
});