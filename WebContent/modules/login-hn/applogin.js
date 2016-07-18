define(function() {
    var isRunning = false;
    return {
        run: function() {
            //这里配置一下语言，可以动态设置，真实的系统需要根据浏览器设置来获取语言然后设置给fish
        	fish.language = "zh";
            $(document).trigger("languageChanged.fish");
            if (!isRunning) {
                isRunning = true;
                require(['views/LoginView'], function(LoginView) {
                	 var loginView = new LoginView();
                     $('.container_main').append(loginView.render().el);
                     $('.container_main>div').addClass('container-fluid login-container');
                });
            }
        }
    }
});
