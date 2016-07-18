define([
    'text!OneKeyView.html',
    'i18n!../i18n/OneKeySpeed.i18n',
    'css!../styles/rest.css'
], function(OneKeySpeedViewTpl,i18nOneKey,css) {
	var height;
	var width;
    return fish.View.extend({
        template: fish.compile(OneKeySpeedViewTpl),
        i18nData: fish.extend({}, i18nOneKey),

        events: {
            'click #btnLogin': 'loginClick',
            'change #selectLanguage': 'doSwitchLanguage',
            'focus .jstoggleFocus': 'formFocus',
            'blur  .jstoggleFocus': 'formBlur'
        },

        // 这里用来进行dom操作
        _render: function() {
        	var me=this;
            this.$el.html(this.template(this.i18nData));
           
            return this;
        },
       
 	   bindClick:function(){
 	    	 $('#btnSubmit').click(function(){
     	    });

 	   },
 	   layout:function(){
 		   width = $(window).width();
 		   height = $(window).height();
 		  $('#total').height(height);
 		 
		},
	   footInit:function(){
			var img = "../../../newPages/diagious/styles/images/icon_";   //图片路径
			$("li").on("click",function(){
			   var $this = $(this);
			   var color = $this.attr("class");
			   //slideToggle 切换隐藏或显示li元素下的P元素，完了之后调用函数切换图标（+-）
			   $this.find("p").slideToggle("fast",function(){
				   if($this.find("p").is(":hidden")){
				  	   $this.find("img").attr("src",img+color+"_open.png");	  
				   }else{
					   $this.find("img").attr("src",img+color+"_stop.png");	
				   }
			   });
			});
			   //slideToggle 切换隐藏或显示ul元素下的所有元素，完了之后调用函数切换图标（+-）

			$(".title").on("click",function(){
				var $this = $(this);
			    var color = $this.find("span").attr("class");
				$this.next("ul").slideToggle("fast",function(){
				   if($this.next("ul").is(":hidden")){
				  	   $this.find("img").attr("src",img+color+"_open.png");	  
				   }else{
					   $this.find("img").attr("src",img+color+"_stop.png");	
				   }
			   });
		    });
		},
		image:function (raphael, src, locationX, locationY, text) {
		    var o1 = raphael.image(src, locationX, locationY, 50, 50);

		    var o2 = raphael.text(locationX + 20, locationY + 50 + 15, text);

		    var raphaelSet = raphael.set();
		    return raphaelSet.push(o1, o2);
		},

		link:function (raphael, from, to) {
		    return raphael.connection(from, to, "green", "green");
		},
		initRaphael:function(){
			var pc_normal = "../../../newPages/diagious/styles/images/device/pc_normal.png";
			var ONU_normal = "../../../newPages/diagious/styles/images/device/ONU_normal.png";
			var SPUTTER_normal = "../../../newPages/diagious/styles/images/device/SPUTTER_normal.png";
			var OLT_normal = "../../../newPages/diagious/styles/images/device/OLT_normal.png";
			var UPE_normal = "../../../newPages/diagious/styles/images/device/UPE_normal.png";
			var network_normal = "../../../newPages/diagious/styles/images/device/network_normal.png";
			var BRAS_normal = "../../../newPages/diagious/styles/images/device/BRAS_normal.png";
			var AAA_normal = "../../../newPages/diagious/styles/images/device/AAA_normal.png";
			var DNS_normal = "../../../newPages/diagious/styles/images/device/DNS_normal.png";
			
		    var paper = Raphael("canvas",width*0.8333333333,height*0.7 );
		    var pc1 = this.image(paper, pc_normal, 50, 100, "PC1");
		    var pc2 = this.image(paper, pc_normal, 50, 200, "PC2");
		    var pc3 = this.image(paper, pc_normal, 50, 300, "PC3");
		    var pc4 = this.image(paper, pc_normal, 50, 400, "PC4");
		    var onu = this.image(paper, ONU_normal, 200, 250, "ONU");
		    var olt = this.image(paper, OLT_normal, 350, 250, "OLT");
		    var bras = this.image(paper, BRAS_normal, 500, 250, "BRAS");
		    var network = this.image(paper, network_normal, 650, 250, "NETWORK");

		    this.link(paper, pc1, onu);
		    this.link(paper, pc2, onu);
		    this.link(paper, pc3, onu);
		    this.link(paper, pc4, onu);
		    this.link(paper, onu, olt);
		    this.link(paper, olt, bras);
		    this.link(paper, bras, network);
		},

        // 这里用来初始化页面上要用到的fish组件
        _afterRender: function() {
        
           this.layout();
    	   this.bindClick();
    	   this.footInit();
    	   this.initRaphael();
        },






    });
});
