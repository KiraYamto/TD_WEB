define([
    'text!templates/LoginView.html',
    'i18n!i18n/login.i18n',
    'views/JobListView'
], function(LoginViewTpl, i18nlogin,joblist) {

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
            'click .delPwd': 'clearPwd',
            'click #btnCode': 'loadCode'
        },

        //这里用来进行dom操作
        _render: function() {
            this.$el.html(this.template(this.i18nData));
            this.$('[data-toggle="dropdown"]').dropdown({
                trigger: "hover"
            });
            this.$el.find('#loginForm').form({validate: 1});
            this.$(".js-verify-code").hide();
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

        //这里用来初始化页面上要用到的fish组件
        _afterRender: function() {
            this.initUIFunc();
        },
        // 加载验证码
        loadCode: function() {
            $("#imgcode").attr("src", "oaas/code.do?time=" + new Date().getTime());
        },
        initUIFunc: function() {
            this.$el.bind("contextmenu", function() { // 禁止右击，复制，粘贴和剪切等行为
                return false;
            }).bind("cut", function() {
                    return false;
                }).bind("copy", function() {
                    return false;
                }).bind("paste", function() {
                    return false;
                });

            this.$("#inputUserName").bind("paste", function() { // 禁止用户名粘贴的行为
                return false;
            });/*.keydown(function(event) { //IE中keypress不支持功能按键
             this.checkLogin(event, 1);
             });*/

            this.$("#inputPassword").bind("paste", function() { // 禁止用户密码粘贴的行为
                return false;
            });/*.keydown(function(event) {
             this.checkLogin(event, 2);
             });*/

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
            if (t == 1) { // Check if the Key pressed is digits or valid character in [A..Z,a..z] and TAB key which the code is 9;
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
        // 校验完毕登录
        loginClick: function(event) {

            // if (this.loginForm.isValid()) { //校验
            // }
            if ($('#loginForm').isValid()) { //校验
                $.blockUI({template :'<i class="fa fa-spinner fa-spin"></i>'});

                $.post('oaas/checkCert',{certCode:$("#certCode").val()}, function(ret){
                    $.unblockUI();

                    if("success" == ret) {

                        $.post('oaas/login',{user:$("#inputUserName").val(),password:$("#inputPassword").val()}).done(function(ret){
                            $.unblockUI();
                            if(ret){
                                var date = new Date();
                                date.setTime(date.getTime() + 1000*60*60*24*30);
                                fish.cookies.set("currentUser",JSON.stringify(ret));
                                if($("#checkRememberMe").prop("checked")){
                                    fish.cookies.set("username",$("#inputUserName").val(),{expires:date});
                                    fish.cookies.set("usercode",fish.Base64.encode($("#inputPassword").val()),{expires:date});
                                }


                                var jl= new joblist();
                                jl.jobs=ret.jobs;
                                jl.render();
                                var $popup = $(jl.el);
                                var options = {
                                    height: 500,
                                    modal: true,
                                    draggable: false,
                                    content: $popup,
                                    autoResizable: true
                                };
                                var popup = fish.popup(options);


                                $popup.on('click', '#login-job-save-button', function() {
                                    console.log(jl.selectedJob)
                                    popup.close('save button click');
                                    $.blockUI({template :'<i class="fa fa-spinner fa-spin"></i>登录成功'});
                                    $.post('oaas/selectJob',{index:jl.selectedIndex}).done(
                                        function(){
                                            window.location.href ='./main-hn.jsp';
                                        }
                                    ).fail(function(){
                                            $.unblockUI();
                                            window.location.href ='./main-hn.jsp';
                                        });

                                });

                            }else{
                                fish.error('登录失败');
                            }
                        }).fail(function(){
                                $.unblockUI();
                                fish.error('登录失败');
                            });
                        
                    } else {
                        fish.error("验证码错误！");
                        $("#imgcode").attr("src", "oaas/code.do?time=" + new Date().getTime()); // 刷新验证码
                        $("#certCode").val(""); // 重置验证码输入框
                        return;
                    } 
                });

            }

        }
    });
});
