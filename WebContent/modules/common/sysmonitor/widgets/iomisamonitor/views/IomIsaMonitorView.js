define(
		[
				'text!modules/common/sysmonitor/widgets/iomisamonitor/templates/IomIsaMonitorView.html',
				'i18n!modules/common/sysmonitor/i18n/SysMonitor.i18n',
				'modules/common/cloud-utils' ], function(viewTpl, i18n, utils) {

			return fish.View.extend({
				template : fish.compile(viewTpl),
				i18nData : fish.extend({}, i18n),
				events : {

				},
				initialize : function() {

				},
				// 这里用来进行dom操作
				_render : function() {
					this.$el.html(this.template(this.i18nData));
					this.$el.css({
						"height" : "100%",
						"width" : "100%"
					});

					return this;
				},
				_afterRender : function() {
					var h = this.$(".sysmonitorwidget-iommonitor-main")
							.height()
							- 30
							- this.$(".sysmonitorwidget-iommonitor-error-body")
									.outerHeight();
					this.$(".sysmonitorwidget-iommonitor-bussinessiom-body")
							.height(h + "px");
					this.$(".sysmonitorwidget-iommonitor-noramlorder-con").css(
							"top",
							(this.$(".sysmonitorwidget-iommonitor-noramlorder")
									.width() / 2 - 25)
									+ "px");

					this.$(".sysmonitorwidget-iommonitor-alarmorder-con").css(
							"top",
							(this.$(".sysmonitorwidget-iommonitor-alarmorder")
									.width() / 2 - 25)
									+ "px");

					this.$(".sysmonitorwidget-iommonitor-overorder-con").css(
							"top",
							(this.$(".sysmonitorwidget-iommonitor-overorder")
									.width() / 2 - 25)
									+ "px");

					this.initNewOrdersChart();

					this.newOrdersOption.xAxis[0].data =[fish.dateutil.format(fish.dateutil.addDays(new Date(),-6),"m-dd"),fish.dateutil.format(fish.dateutil.addDays(new Date(),-5),"m-dd"),fish.dateutil.format(fish.dateutil.addDays(new Date(),-4),"m-dd"),fish.dateutil.format(fish.dateutil.addDays(new Date(),-3),"m-dd"),fish.dateutil.format(fish.dateutil.addDays(new Date(),-2),"m-dd"),fish.dateutil.format(fish.dateutil.addDays(new Date(),-1),"m-dd"),fish.dateutil.format(new Date(),"m-dd")];
					this.newOrdersOption.series[0].data = [  122,
							156, 143, 108, 95, 110 , 129  ];// 云主机
					this.newOrdersOption.series[1].data = [ 
							60, 30, 63, 50, 72, 80, 94 ];// 物理机
					this.newOrdersOption.series[2].data = [ 
							 8, 20, 50, 43, 30, 54, 65 ];// IDC
					this.newOrdersChart.setOption(this.newOrdersOption);
					//this.thread($.proxy(this.generateData,this),2000);
				},
				initNewOrdersChart : function() {
					this.newOrdersChart = echarts.init(this.$(
							".sysmonitorwidget-iommonitor-bussinessiom-body")
							.get(0), 'macarons');
					this.newOrdersOption = {
						color : [ '#0085FF', '#08E0EE', '#08EE4F' ],
						title : {
							show : true,
							text : '业务开通',
							x : 'left',
							y : 'top',
							padding : [ 6, 0, 6, 15 ],
							textAlign : 'left',
							textStyle : {
								fontSize : 18,
								fontWeight : 'normal',
								fontFamily : 'Microsoft Yahei',
								color:'#f6f6f6'
							}
						},
						tooltip : {
							trigger : 'axis'/*,
							textStyle : {
								align:'left'
							}*/
						},
						grid : {
							left : '15px',
							right : '20px',
							bottom : '5px',
							top : '40px',
							containLabel : true
						},
						legend : {
							orient : 'horizontal',
							x : 'right',
							padding : [ 11, 15, 11, 0 ],
							itemGap : 3,
							data : [ '物理机', 'IDC', '云存储' ],
							textStyle : {
								color:'#f6f6f6'
							}
						},
						/*
						 * toolbox: { show : true, padding: [5,18,5,5], feature : {
						 * dataView : {show: true, readOnly: false}, magicType :
						 * {show: true, type: ['line', 'bar', 'stack',
						 * 'tiled']}, restore : {show: true}, saveAsImage :
						 * {show: true} } },
						 */
						xAxis : [ {
							type : 'category',
							// boundaryGap : false,
							data : [],
							axisLine:{
								lineStyle:{
									color:'#A7AAAE'
								}
							},
							axisLabel:{
								textStyle : {
									color:'#f6f6f6'
								}
								
							},splitLine: {
								lineStyle: {
									
									color:'#636A73',
									type:'dotted'
								}
								
							}
						} ],
						yAxis : [ {
							type : 'value',
							axisLine:{
								lineStyle:{
									
									color:'#A7AAAE'
								}
							},
							axisLabel:{
								textStyle : {
									color:'#f6f6f6'
								}
								
							},splitLine: {
								lineStyle: {
									
									color:'#636A73',
									type:'dotted'
								}
								
							}
						} ],
						series : [ {
							name : '物理机',
							type : 'line',
							symbol : 'circle',
							symbolSize : 7,
							data : []
						},

						{
							name : 'IDC',
							type : 'line',
							symbol : 'circle',
							symbolSize : 7,
							data : []
						}, {
							name : '云存储',
							type : 'line',
							symbol : 'circle',
							symbolSize : 7,
							data : []
						} ]
					};
				},generateData: function() {
					
					var isNA = Math.ceil(Math.random()*10);
					var num = Math.ceil(Math.random()*40);
					
					if(isNA>5){
						this.$('.sysmonitorwidget-iommonitor-noramlorder-num').text(26+num);
						
					}else{
						
						this.$('.sysmonitorwidget-iommonitor-noramlorder-num').text(26-num);
					}
					
					isNA = Math.ceil(Math.random()*10);
					num = Math.ceil(Math.random()*40);
					
					if(isNA>5){
						this.$('.sysmonitorwidget-iommonitor-alarmorder-num').text(12+num);
						
					}else{
						
						this.$('.sysmonitorwidget-iommonitor-alarmorder-num').text(12-num);
					}
					
					isNA = Math.ceil(Math.random()*10);
					num = Math.ceil(Math.random()*40);
					
					if(isNA>5){
						this.$('.sysmonitorwidget-iommonitor-overorder-num').text(2+num);
						
					}else{
						
						this.$('.sysmonitorwidget-iommonitor-overorder-num').text(2-num);
					}
					
					
					/*isNA = Math.ceil(Math.random()*10);
					num = Math.ceil(Math.random()*10);
					
					
					if(isNA>5){
						this.newOrdersOption.series[0].data[9] = this.newOrdersOption.series[0].data[9] + num;
						
					}else{
						var tm = this.newOrdersOption.series[0].data[9] + num*-1;
						if(tm>2){
							this.newOrdersOption.series[0].data[9]=tm;
						}
						else{
							this.newOrdersOption.series[0].data[9] = this.newOrdersOption.series[0].data[9] + num;
							
						}
					}
					
					
					
					isNA = Math.ceil(Math.random()*10);
					num = Math.ceil(Math.random()*10);
					

					if(isNA>5){
						this.newOrdersOption.series[1].data[9] = this.newOrdersOption.series[1].data[9] + num;
						
					}else{
						var tm = this.newOrdersOption.series[1].data[9] + num*-1;
						if(tm>2){
							this.newOrdersOption.series[1].data[9]=tm;
						}
						else{
							this.newOrdersOption.series[1].data[9] = this.newOrdersOption.series[1].data[9] + num;
							
						}
					}
					isNA = Math.ceil(Math.random()*10);
					num = Math.ceil(Math.random()*10);
					
					if(isNA>5){
						this.newOrdersOption.series[2].data[9] = this.newOrdersOption.series[2].data[9] + num;
						
					}else{
						var tm = this.newOrdersOption.series[2].data[9] + num*-1;
						if(tm>2){
							this.newOrdersOption.series[2].data[9]=tm;
						}
						else{
							this.newOrdersOption.series[2].data[9] = this.newOrdersOption.series[2].data[9] + num;
							
						}
					}
					
					this.newOrdersChart.setOption(this.newOrdersOption);*/
					
				},

				resize : function() {
					var h = this.$(".sysmonitorwidget-iommonitor-main")
							.height()
							- 30
							- this.$(".sysmonitorwidget-iommonitor-error-body")
									.outerHeight();
					this.$(".sysmonitorwidget-iommonitor-bussinessiom-body")
							.height(h + "px");

					this.$(".sysmonitorwidget-iommonitor-noramlorder-con").css(
							"top",
							(this.$(".sysmonitorwidget-iommonitor-noramlorder")
									.width() / 2 - 25)
									+ "px");

					this.$(".sysmonitorwidget-iommonitor-alarmorder-con").css(
							"top",
							(this.$(".sysmonitorwidget-iommonitor-alarmorder")
									.width() / 2 - 25)
									+ "px");

					this.$(".sysmonitorwidget-iommonitor-overorder-con").css(
							"top",
							(this.$(".sysmonitorwidget-iommonitor-overorder")
									.width() / 2 - 25)
									+ "px");

					this.newOrdersChart.resize();
				}
			});
		});
