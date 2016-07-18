define([
    'text!newPages/diagious/templates/OneKeySpeedView.jsp',
    'newPages/diagious/views/OneKeySpeedDiagious.js',
    'newPages/diagious/i18n/OneKeySpeed.i18n'
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
            alert('b');
            return this;
        },

        // 这里用来初始化页面上要用到的fish组件
        _afterRender: function() {
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


    });
});
