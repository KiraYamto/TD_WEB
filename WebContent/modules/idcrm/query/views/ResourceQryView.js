define([
    'text!modules/idcrm/query/templates/ResourceQryView.html',
    'i18n!modules/idcrm/query/il8n/resource.i18n',
    'modules/common/cloud-utils',
    'css!modules/idcrm/query/styles/resource.css'
], function(ResourceViewTpl, i18nResourceView,utils,css) {
    return fish.View.extend({
    	pieChartList: [], //pie chart实例数组
    	mapChart: -1, //地图实例
        template: fish.compile(ResourceViewTpl),
        i18nData: fish.extend({}, i18nResourceView),
        events: {
            "click #resourceView-query-btn":"search"
        },

        // 这里用来进行dom操作
        _render: function() {
            var html=$(this.template(this.i18nData));

            this.$el.html(html);
            return this;
        },

        // 这里用来初始化页面上要用到的fish组件
        _afterRender: function() {
            this.initChineseMap();

            $("#frameImg").attr("src", "./resources/images/idc/treeNode/frame.png");
            $("#physicImg").attr("src", "./resources/images/idc/treeNode/room.png");
            $("#bandwidthImg").attr("src", "./resources/images/idc/treeNode/city.png");
            $("#ipImg").attr("src", "/resources/images/idc/treeNode/datacenter.png");
            $("#storeImg").attr("src", "./resources/images/idc/treeNode/room.png");

            this.initChartDatas(-1, true);//内蒙古50667

            this.resize();
        },
        getFrameColors: function(){
            return ['#92d503','#2391ee','#0bf0e3','#4e65f3','#9ac1d3','#dbe30e', 'pink','yellow'];
        },
        initChineseMap: function() {

            var chart = echarts.init(document.getElementById('chineseMap'));
            this.mapChart = chart;
            //utils.ajax('resourceQryService','calcResourceTotalCount').done(function(ret){


            utils.ajax('resourceQryService','qryMapArea4Test').done(function(virData){

            var seriesData = new Array();
                var option = {
                    tooltip : {
                        trigger: 'item',
                        formatter: "{b} : {c}"
                  
                    },
                    color:['transparent','#bb6f00','#bb6f00'],
		    
                    legend: {
                        orient: 'vertical',
                        x : '2%',
                        y: '10%',
                        data:['虚拟','资源池','园区'],
                        show: false
                    },
                    visualMap: {
                        min: 0,
                        max: 2000,
                        left: 'left',
                        top: 'bottom',
                        text: ['高','低'],
                        calculable: true,
			            color:['#287cbb','#b9d3f1'],
                        show: false
                    },
                    series: seriesData
                };


                var resPoolData = {
                    name: '资源池',
                    type: 'map',
                    mapType: 'china',
                    roam: false,
                    left: "17%",
                    label: {
                        normal: {
                            show: true
                        },
                        emphasis: {
                            show: true
                        }
                    },
                    itemStyle: {
                        normal: {
                            areaColor: 'lightblue',
                            borderColor: '#fff',
                            borderWidth: 1
                        }
                    },
                    data:[{"":"0","name":"辽宁", "value": 811},
                        {"":"0","name":"北京", "value": 611},
                        {"":"0","name":"上海", "value": 861},
                        {"":"0","name":"陕西", "value": 524},
                        {"":"0","name":"四川", "value": 624},
                        {"":"0","name":"湖北", "value": 524},
                        {"":"0","name":"福建", "value": 833},
                        {"":"0","name":"广东", "value": 114}]
                }; 

            var parkData = {
                name: '园区',
                type: 'map',
                mapType: 'china',
                roam: false,
                left: "17%",
                label: {
                    normal: {
                        show: true
                    },
                    emphasis: {
                        show: true
                    }
                },
                itemStyle: {
                    normal: {
                        areaColor: 'lightblue',
                        borderColor: '#fff',
                        borderWidth: 1
                    }
                },
                data:[{"":"0","name":"贵州", "value": 900},
                    {"":"0","name":"内蒙古", "value": 950}]
            };

                var vir = {
                    name: '虚拟',
                    type: 'map',
                    mapType: 'china',
                    roam: false,
                    left: "17%",
                    label: {
                        normal: {
                            show: true
                        },
                        emphasis: {
                            show: true
                        }
                    },
                    itemStyle: {
                        normal: {
                            areaColor: 'lightblue',
                            borderColor: '#fff',
                            borderWidth: 1
                        }
                    },
                    data:virData
                };

//                seriesData.push(frameData);
//                seriesData.push(physicData);
//                seriesData.push(bandwidthData);
//                seriesData.push(ipData);
//                seriesData.push(storeData);
//                seriesData.push(storeData);
                seriesData.push(vir);
                seriesData.push(resPoolData);
                seriesData.push(parkData);


                chart.setOption(option);

            });

            var initChartDatasProxy = $.proxy(this.initChartDatas, this);
            chart.on('click', function (params) {
                //资源池：沈阳、北京、西安、成都、武汉、上海、福州、广州
                //园区：呼和浩特、贵阳
                var flag = _.contains(['辽宁','北京','陕西','四川','湖北','上海','福建','广东', '内蒙古','贵州'], params.name);
	   
                var areaId = params.data.id;
                initChartDatasProxy(areaId, flag);
	 
            });

        },
         randomData: function(flag) {
            if(flag)
                return Math.round(Math.random()*1000);
            else
                return 0;
        },
        initChartDatas: function(areaId, flag) {
            var calcRet = {
                frameData:{totalCount: this.randomData(flag),
                    legendNames: ['空闲','预占',  '占用', '预留', '内部', '预释放'],
                    dataList: [{name:'空闲', value:this.randomData(flag)},
                        {name:'预占',value:this.randomData(flag)},
                        {name:'占用',value:this.randomData(flag)},
                        {name:'预释放',value:this.randomData(flag)},
                        {name:'预留',value:this.randomData(flag)},
                        {name:'内部',value:this.randomData(flag)}]
                },
                physicData:{totalCount: this.randomData(flag),
                    legendNames: ['空闲','预占',  '占用',  '预留',  '内部','预释放', '宿主机'],
                    dataList: [{name:'空闲', value:this.randomData(flag)},
                        {name:'预占',value:this.randomData(flag)},
                        {name:'占用',value:this.randomData(flag)},
                        {name:'预释放',value:this.randomData(flag)},
                        {name:'预留',value:this.randomData(flag)},
                        {name:'内部',value:this.randomData(flag)},
                        {name:'宿主机',value:this.randomData(flag)}]
                },
                bandwidthData:{totalCount: this.randomData(flag),
                    legendNames: ['空闲','预占',  '占用','占空',  '预留',  '内部', '预释放', '共享使用'],
                    dataList: [{name:'空闲', value:this.randomData(flag)},
                        {name:'预占',value:this.randomData(flag)},
                        {name:'占用',value:this.randomData(flag)},
                        {name:'占空',value:this.randomData(flag)},
                        {name:'预释放',value:this.randomData(flag)},
                        {name:'预留',value:this.randomData(flag)},
                        {name:'内部',value:this.randomData(flag)},
                        {name:'共享使用',value:this.randomData(flag)}]
                },
                ipData:{totalCount: this.randomData(flag),
                    legendNames: ['空闲','预占',  '占用', '占空',  '预留',  '内部','预释放'],
                    dataList: [{name:'空闲', value:this.randomData(flag)},
                        {name:'预占',value:this.randomData(flag)},
                        {name:'占用',value:this.randomData(flag)},
                        {name:'占空',value:this.randomData(flag)},
                        {name:'预释放',value:this.randomData(flag)},
                        {name:'预留',value:this.randomData(flag)},
                        {name:'内部',value:this.randomData(flag)}]
                },
                storeData:{totalCount: this.randomData(flag),
                    legendNames: ['空闲','预占',  '占用',  '预留',  '内部','预释放'],
                    dataList: [{name:'空闲', value:this.randomData(flag)},
                        {name:'预占',value:this.randomData(flag)},
                        {name:'占用',value:this.randomData(flag)},
                        {name:'预释放',value:this.randomData(flag)},
                        {name:'预留',value:this.randomData(flag)},
                        {name:'内部',value:this.randomData(flag)}]
                }
            };
            
            this.pieChartList = [];
            
            calcRet.frameData.totalCount += "架";
            this.initPie("framePieDiv", "机架", calcRet.frameData, this.getFrameColors());

            calcRet.physicData.totalCount += "个";
            this.initPie("physicPieDiv", "物理机", calcRet.physicData, this.getFrameColors());

            calcRet.bandwidthData.totalCount += "G";
            this.initPie("bandwidthPieDiv", "带宽", calcRet.bandwidthData, this.getFrameColors());

            calcRet.ipData.totalCount += "个";
            this.initPie("ipPieDiv", "IP", calcRet.ipData, this.getFrameColors());

            calcRet.storeData.totalCount += "T";
            this.initPie("storePieDiv", "存储", calcRet.storeData, this.getFrameColors());

        },
        initChartDatas1: function(areaId) {
            var initPieProxy = $.proxy(this.initPie, this);
            var getFrameColorsProxy = $.proxy(this.getFrameColors, this);

            if(!areaId) {
                areaId = 0;
            }

            utils.ajax('resourceQryService','calcResourceState',areaId).done(function(calcRet){

                calcRet.frameData.totalCount += "架";
                initPieProxy("framePieDiv", "机架", calcRet.frameData, getFrameColorsProxy());

                calcRet.physicData.totalCount += "个";
                initPieProxy("physicPieDiv", "物理机", calcRet.physicData, getFrameColorsProxy());

                calcRet.bandwidthData.totalCount += "G";
                initPieProxy("bandwidthPieDiv", "带宽", calcRet.bandwidthData, getFrameColorsProxy());

                calcRet.ipData.totalCount += "个";
                initPieProxy("ipPieDiv", "IP", calcRet.ipData, getFrameColorsProxy());

                calcRet.storeData.totalCount += "T";
                initPieProxy("storePieDiv", "存储", calcRet.storeData, getFrameColorsProxy());
            });
        },
        initPie: function(pieDiv, tagName, calcRet, colors) {
            var chart = echarts.init(document.getElementById(pieDiv));
            this.pieChartList.push(chart);

            var option = {
                tooltip : {
                    trigger: 'item',
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                legend: {
                    orient : 'horizontal',
                    x : '35%',
                    y: '20%',
                    data: calcRet.legendNames
                },
                color: colors,
                toolbox: {
                    show : false,
                    feature : {
                        mark : {show: true},
                        dataView : {show: true, readOnly: false},
                        magicType : {
                            show: true,
                            type: ['pie', 'funnel'],
                            option: {
                                funnel: {
                                    x: '25%',
                                    width: '50%',
                                    funnelAlign: 'center',
                                    max: 1548
                                }
                            }
                        },
                        restore : {show: true},
                        saveAsImage : {show: true}
                    }
                },
                calculable : true,
                series : [
                    {
                        name:tagName,
                        type:'pie',
                        radius: ['45%', '60%'],
                        center: ['20%', '45%'],
                        avoidLabelOverlap: false,
                        label: {
                            normal: {
                                show: true,
                                formatter: calcRet.totalCount,
                                position: 'center'
                            },
                            emphasis: {
                                show: false
                            }
                        },
                        data: calcRet.dataList
                    }
                ]
            };

            chart.setOption(option);
        },
        resize: function(){
        	$('#resourceView').css({'height' : $('#main-tabs-panel').height()-20});
        	if (this.mapChart != -1) {
        		this.mapChart.resize();
        	}
        	for (var i in this.pieChartList) {
        		this.pieChartList[i].resize();
        	}
        }
    });
});
