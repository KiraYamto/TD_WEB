define([
    'text!modules/login/templates/CloudLoginView.html',
    'i18n!modules/login/i18n/login.i18n'
], function(LoginViewTpl, i18nlogin) {


    return fish.View.extend({
        template: fish.compile(LoginViewTpl),
        i18nData: fish.extend({}, i18nlogin),

        events: {
            'click #btnLogin': 'loginClick',
            'change #selectLanguage': 'doSwitchLanguage',
            'focus .jstoggleFocus': 'formFocus',
            'blur  .jstoggleFocus': 'formBlur',
            'click #imgVerifyCode': 'refreshVerifyCode',
            'click .delUserName': 'clearUserName',
			'click .delPwd': 'clearPwd'
        },

        // 这里用来进行dom操作
        _render: function() {
        	var me=this;
            this.$el.html(this.template(this.i18nData));
            this.$('[data-toggle="dropdown"]').dropdown({
				trigger: "hover"
			});
            this.$el.find('#loginForm').form({validate: 1});
			// this.$(".js-verify-code").hide();
            $(document).keypress($.proxy(this._keypress,this));
            this.$('#verificationCode').keydown($.proxy(this._keypress,this));
            this.$('#imgVerifyCode').click($.proxy(function(){
            	me.loadCode();
                me.$("#verificationCode").val(""); // 重置验证码输入框
            	
            },this));
            this.loadCode();
			this.$(".login-title").show();
			this.$("#inputUserName").val(fish.cookies.get('username'));
			if(fish.cookies.get('usercode')){
				this.$("#inputPassword").val(fish.Base64.decode(fish.cookies.get('usercode')));
			} else {
				this.$("#inputPassword").val("");
			}
			if(fish.cookies.get('username') == undefined){
				this.$("#checkRememberMe").prop("checked",false);
			}
			else
			{
				this.$("#checkRememberMe").prop("checked",true);
			}
			
            return this;
        },

        // 这里用来初始化页面上要用到的fish组件
        _afterRender: function() {
            this.initUIFunc();
        },

        initUIFunc: function() {
            this.$el.bind("contextmenu", function() { // 禁止右击，复制，粘贴和剪切等行为
                return false;
            }).bind("cut", function() {
                return false;
            }).bind("copy", function() {
                return false;
            })/*
				 * .bind("paste", function() { return false; });
				 */

            /*
			 * this.$("#inputUserName").bind("paste", function() { // 禁止用户名粘贴的行为
			 * return false; });
			 */
            /*
			 * .keydown(function(event) { //IE中keypress不支持功能按键
			 * this.checkLogin(event, 1); });
			 */

            /*this.$("#inputPassword").bind("paste", function() { // 禁止用户密码粘贴的行为
                return false;
            });*//*
				 * .keydown(function(event) { this.checkLogin(event, 2); });
				 */

            // 初始化语言下拉框
            $('#selectLanguage').prop('value', fish.language);
        },

        // 切换语言选项
        doSwitchLanguage: function(event) {
            var value = $('#selectLanguage').val()
            fish.setLanguage(value);
            var moduleURL = "modules/login/i18n/login.i18n" + '.' + value;
            var thisObj = this;
            require([moduleURL], function(i18nlogin) {
                thisObj.i18nData = fish.extend({}, i18nlogin);
                var tmp = thisObj.template(thisObj.i18nData);
                thisObj.$el.html(tmp);
                $('#selectLanguage').prop('value', fish.language);
            });

        },

        checkLogin: function(event, type) {
            var code = eve.keyCode || eve.which || eve.charCode;
            if (code == 13) {
                try {
                    if (t == 1) {
                        $("#inputPassword").focus();
                    } else if (t == 2) {
                        this.loginClick();
                    } else {
                        this.loginClick();
                    }
                    eve.keyCode ? eve.keyCode = 0 : eve.which = 0;
                    eve.preventDefault();
                } catch (e) {}
                return;
            }
            if (t == 1) { // Check if the Key pressed is digits or valid
							// character in [A..Z,a..z] and TAB key which the
							// code is 9;
                if (!(code >= 48 && code <= 57) && !(code >= 65 && code <= 90) && !(code >= 97 && code <= 122) && code != 45 && code != 95 && code != 8 && code != 9) {
                    eve.keyCode ? eve.keyCode = 0 : eve.which = 0;
                    eve.preventDefault();
                    return;
                }
            }
            event.preventDefault();
            return false;
        },
        clearUserName: function(){
			this.$("#inputUserName").val("");
		},
		clearPwd: function(){
			this.$("#inputPassword").val("");
		},
		 loadCode: function() {
	            this.$("#imgVerifyCode").attr("src", "oaas/code.do?time=" + new Date().getTime());
	        },
	        _keypress:function(e){
	        	if(fish.modalStack.openedWindows.keys().length>0)return;
	        	if(e.charCode== 13||e.keyCode== 13){
	        		this.$("#btnLogin").click();
	        	}
	        	
	        },
        // 校验完毕登录
        loginClick: function(event) {
        	var me =this;
			if(!$("#checkRememberMe").prop("checked")){
				var date = new Date();
				date.setTime(date.getTime() + 1000*60*60*24*30); 
				fish.cookies.set("currentUser","");
				fish.cookies.set("username","",{expires:date});
				fish.cookies.set("usercode","",{expires:date});
			}
        	
            // if (this.loginForm.isValid()) { //校验
            // }
        	if ($('#loginForm').isValid()) { // 校验
        		
        		$.blockUI({message: '校验中'});
        		$.post('oaas/checkCert',{certCode:$("#verificationCode").val()}, function(ret){
                    $.unblockUI();

                    if("success" == ret) {
                    	$.blockUI({message: '加载中'});
        		$.post('oaas/login',{user:$("#inputUserName").val(),password:$("#inputPassword").val()}).done(function(ret){
        			$.unblockUI();
        			if(ret){
        				if(ret.jobs.length<1){
        					return fish.info("当前登录人没有职位，请通知系统管理员。");
        					
        				}
        				
        				if(ret.jobs.length==1){
        					$.blockUI({message: '登录成功'});
        					window.location.href ='./main.jsp';
        					return;
        					
        				}
        				
        				var date = new Date();
						date.setTime(date.getTime() + 1000*60*60*24*30); 
						fish.cookies.set("currentUser",JSON.stringify(ret));
        				if($("#checkRememberMe").prop("checked")){
        					fish.cookies.set("username",$("#inputUserName").val(),{expires:date});
							fish.cookies.set("usercode",fish.Base64.encode($("#inputPassword").val()),{expires:date});
        				}
        				
        				
        				fish.popupView({url: 'modules/login/views/JobListView',
        					width: "60%",
        					height: 500,
        		            modal: true,
        		            draggable: true,
        		            viewOption:{
        		            	jobs:ret.jobs
        		            },
        		            autoResizable: true
        		        });
        				        				
        			}else{
        				fish.error('用户名密码错误');
        			}
        		}).fail(function(){
        			$.unblockUI();
        			fish.error('用户名密码错误');
        		})
                    } else {
                        fish.error("验证码错误！");
                        me.loadCode();
                        me.$("#verificationCode").val(""); // 重置验证码输入框
                        return;
                    } 
        		});
            	// -----
                
             }
        	
        }
    });
});
