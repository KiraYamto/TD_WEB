define([
    'text!modules/login/templates/JobListView.html',
    'i18n!modules/login/i18n/login.i18n'
], function(LoginViewTpl, i18nlogin) {

    return fish.View.extend({
        template: fish.compile(LoginViewTpl),
        i18nData: fish.extend({}, i18nlogin),

        events: {
            'click #login-job-list>a': 'selectJobClick',
            'dblclick #login-job-list>a': 'selectJobDBClick',
            'click #login-job-save-button':'saveSelectJob'
        },
        initialize : function() {
			/*var html = $(this.template(this.i18nData));
			this.setElement(html);*/
		},
        //这里用来进行dom操作
        _render: function() {
        	this.$el.html(this.template(this.i18nData));
            var html=this.$el;
            var jobs=this.options.jobs||[{orgName:"组织",JobName:"职位"}];
            $.each(jobs,function(i,job){

                html.find('#login-job-list').append('<a data-job="'+ i.toString()+'" class="list-group-item" ><h4 class="list-group-item-heading">'+job.orgPathName+'</h4><p class="list-group-item-text">'+job.jobName+'</p></a>');
            });
            //html.find('#login-job-list>a').on('click',$.proxy(this.selectJobClick, this));
            
            
            return this;
        },

        //这里用来初始化页面上要用到的fish组件
        _afterRender: function() {
        	//this.$('#login-job-list>a').on('dblclick',$.proxy(this.selectJobDBClick, this));
            
        	this.$('.list-group-item-span').on('dblclick',$.proxy(this.selectJobDBClick, this));


        },
        saveSelectJob:function(event){
        	var si = this.selectedIndex||0;
        	
        	$.blockUI({message: '登录成功'});
        	$.post('oaas/selectJob',{index:si}).done(
        	function(){
        		window.location.href ='./main.jsp';
        	}		
        	).fail(function(){
        			$.unblockUI();
        			window.location.href ='./main.jsp';
        	});
        	this.popup.close('save button click');
        },
        selectJobClick:function(event){
        	
            var me =this;
            var jobs=this.jobs||[{orgName:"组织",JobName:"职位"}];
            var index = $(event.currentTarget).data("job");
            var job=jobs[index];
            $(event.currentTarget).parent().find('a').removeClass('active');
            $(event.currentTarget).addClass('active');
            this.selectedJob=job;
            this.selectedIndex=index;
        },
        selectJobDBClick:function(event){
        	var me =this;
            var jobs=this.jobs||[{orgName:"组织",JobName:"职位"}];
            var index = $(event.currentTarget).data("job");
            var job=jobs[index];
            $(event.currentTarget).parent().find('a').removeClass('active');
            $(event.currentTarget).addClass('active');
            this.selectedJob=job;
            this.selectedIndex=index;
            $.blockUI({message: '登录成功'});
          
        	$.post('oaas/selectJob',{index:index}).done(
        	function(){
        		window.location.href ='./main.jsp';
        	}		
        	).fail(function(){
        			$.unblockUI();
        			window.location.href ='./main.jsp';
        	});
        }

    });
});
