define([ 'text!modules/common/sysmonitor/widgets/rmmonitor/templates/ResourceCapacityView.html',
		'i18n!modules/nms/monitorHomePage/i18n/monitor.i18n',
		'modules/common/cloud-utils',
		'css!modules/common/sysmonitor/styles/rescapacity.css' ], 
		function(viewTpl, i18n,utils) {

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
				"height":"100%",
				"width":"100%"
			});
			
			//this.$(".resourcecapacity-frame").tooltip({ placement: 'top'});
			
			return this;
		},
		_afterRender:function(){
			this.resize();
			//this.thread($.proxy(this.generateData,this),2000);
		},
		resize:function(){
			var h = this.$('.resourcecapacity-title').height();
			this.$('.resourcecapacity-title span').css({"line-height":h+"px"});
		},
		generateData:function(){
			var isNA = Math.ceil(Math.random()*10);
			var num = Math.ceil(Math.random()*5);
			var pre = 65;
			if(isNA>5){
				pre+=num;
			}else{
				pre-=num;
			}
			this.$('.resourcecapacity-frame-num').text("机架 "+pre+"%");
			this.$('.resourcecapacity-frame-process').css('width',pre+"%");
			
			
			isNA = Math.ceil(Math.random()*10);
			num = Math.ceil(Math.random()*5);
			pre = 45;
			if(isNA>5){
				pre+=num;
			}else{
				pre-=num;
			}
			this.$('.resourcecapacity-phymachine-num').text("物理机 "+pre+"%");
			this.$('.resourcecapacity-phymachine-process').css('width',pre+"%");
			
			isNA = Math.ceil(Math.random()*10);
			num = Math.ceil(Math.random()*5);
			pre = 48;
			if(isNA>5){
				pre+=num;
			}else{
				pre-=num;
			}
			this.$('.resourcecapacity-store-num').text("存储 "+pre+"%");
			this.$('.resourcecapacity-store-process').css('width',pre+"%");
			
			isNA = Math.ceil(Math.random()*10);
			num = Math.ceil(Math.random()*5);
			pre = 70;
			if(isNA>5){
				pre+=num;
			}else{
				pre-=num;
			}
			this.$('.resourcecapacity-ip-num').text("IP "+pre+"%");
			this.$('.resourcecapacity-ip-process').css('width',pre+"%");
			

			isNA = Math.ceil(Math.random()*10);
			num = Math.ceil(Math.random()*5);
			pre = 85;
			if(isNA>5){
				pre+=num;
			}else{
				pre-=num;
			}
			this.$('.resourcecapacity-brand-num').text("带宽 "+pre+"%");
			this.$('.resourcecapacity-brand-process').css('width',pre+"%");
			
			isNA = Math.ceil(Math.random()*10);
			num = Math.ceil(Math.random()*5);
			pre = 40;
			if(isNA>5){
				pre+=num;
			}else{
				pre-=num;
			}
			this.$('.resourcecapacity-virtual-num').text("虚机 "+pre+"%");
			this.$('.resourcecapacity-virtual-process').css('width',pre+"%");
			
		}
	});
});