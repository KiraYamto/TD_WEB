define(['modules/common/cloud-utils'],
    function(cUtil){
        return fish.View.extend({
            events: {
                "click .sidebar li>a": "doMenuLV1Click",
                "click .sidebar li>ul>a": "doMenuLv2Click"
            },
            i18nData: fish.extend({}),
            initialize: function () {
                fish.on('replaceTabView', $.proxy(this.replaceTabView, this));
            },
            _render: function () {
            	var data=this.options.menus||[];
            	
            	if(this.options.mainMenu&&this.options.menus&&this.options.menus.length>0){
	                var template= this.buildTemplate(data,this.options.mainMenu);
	                fish.compile(template)(this.i18nData);
	                this.$el=$(fish.compile(template)(this.i18nData));
            	}
            	this.resize();
                return this;
            },
            afterRender: function () {
            	//this.resize();
            },
            buildTemplate:function(m,mainMenu){
                var str='';
                
                $.each(m,function(index,obj){
                    if(obj.children&& $.isArray(obj.children)&& obj.children.length){
                    	var v1Id = obj.moduleName?obj.moduleName.toLowerCase():obj.moduleName;
                    	 var archorUrl="#/"+mainMenu.moduleName+"/"+obj.moduleName;
                    	 var iconTmp=obj.iconCls;
                    	 if(iconTmp!=null&&iconTmp!=''&&iconTmp.startsWith('fa')||iconTmp.startsWith('icon')){
                    		 iconTmp='fa '+iconTmp;
                    	 }
                    	 
                        str+='<li class="treeview"> <a href="'+archorUrl+'" id="com-menu-'+v1Id+'"><i class="'+iconTmp+'"></i><span>'+obj.menuName+'</span>';
                        str+='<i class="fa fa-angle-left pull-right"></i></a><ul class="treeview-menu" style="display: none;">';
                       
                        $.each(obj.children,function(i,sub){
                        	var v2Id=sub.moduleName?sub.moduleName.toLowerCase():sub.moduleName;
                        	
                        	var subIconTmp=sub.iconCls;
	                       	 if(subIconTmp!=null&&subIconTmp!=''&&subIconTmp.startsWith('fa')||subIconTmp.startsWith('icon')){
	                       		subIconTmp='fa '+subIconTmp;
	                       	 }
                        	
                            str+='<li><a href="'+archorUrl+'/'+sub.moduleName+'" id="com-menu-'+v2Id+'" data-module="'+sub.moduleUrl+'" data-modulename="'+sub.menuName+'" data-isiframe="'+sub.isIframe+'" data-frameurl="'+sub.frameUrl+'" >'+((sub.iconCls!=null&&sub.iconCls!='')?'<i class="'+subIconTmp+'"></i>':'<i class="fa"></i>')+'<span>'+sub.menuName+'</span></a></li>';
                        });

                        str+='</ul></li>';
                    }
                    else{
                    	var archorUrl="#/"+mainMenu.moduleName+"/"+obj.moduleName;
                    	var v2Id=obj.moduleName?obj.moduleName.toLowerCase():obj.moduleName;
                    	
                    	var iconTmp=obj.iconCls;
                   	 if(iconTmp!=null&&iconTmp!=''&&iconTmp.startsWith('fa')||iconTmp.startsWith('icon')){
                   		 iconTmp='fa '+iconTmp;
                   	 }
                    	
                        str+='<li><a href="'+archorUrl+'" id="com-menu-'+v2Id+'" data-module="'+obj.moduleUrl+'" data-modulename="'+obj.menuName+'" data-isiframe="'+obj.isIframe+'" data-frameurl="'+obj.frameUrl+'" ><i class="'+iconTmp+'"></i><span>'+obj.menuName+'</span></a></li>';

                    }
                });
                return str;
            },resize:function(){
            	if(this.options.mainMenu&&this.options.menus&&this.options.menus.length>0){
            		$(".main-sidebar").show();
            		$(".content-wrapper").hide();
            		$(".content-wrapper").removeAttr("style");
            		
            		
            	}else{
            		$("body").addClass("hide-main-sidebar");
            		$(".main-sidebar").hide();
            		
            		if ($(window).width() <= (this.screenSizes.sm - 1)){//767px
            				$(".content-wrapper").removeAttr("style");
        			}else{
        				
        				$(".content-wrapper").css("margin-left",($(".first-sidebar").width()).toString()+"px");
        				
        			}
            		
            		
            	}
            }

        });
    }
);