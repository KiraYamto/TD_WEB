define([
    'text!templates/JobListView.html',
    'i18n!i18n/login.i18n'
], function(LoginViewTpl, i18nlogin) {

    return fish.View.extend({
        template: fish.compile(LoginViewTpl),
        i18nData: fish.extend({}, i18nlogin),

        events: {
            'click #login-job-list>a': 'selectJobClick'
        },

        //这里用来进行dom操作
        _render: function() {
            var html=$(this.template(this.i18nData));
            var jobs=this.jobs||[{orgName:"组织",JobName:"职位"}];
            $.each(jobs,function(i,job){

                html.find('#login-job-list').append('<a data-job="'+ i.toString()+'" class="list-group-item"><h4 class="list-group-item-heading">'+job.orgPathName+'</h4><p class="list-group-item-text">'+job.jobName+'</p></a>');
            });
            html.find('#login-job-list>a').on('click',$.proxy(this.selectJobClick, this));
            this.$el=html;
            this.el=this.$el;
            return this;
        },

        //这里用来初始化页面上要用到的fish组件
        _afterRender: function() {



        },
        selectJobClick:function(){
            var me =this;
            var jobs=this.jobs||[{orgName:"组织",JobName:"职位"}];
            var index = $(event.currentTarget).data("job");
            var job=jobs[index];
            $(event.currentTarget).parent().find('a').removeClass('active');
            $(event.currentTarget).addClass('active');
            this.selectedJob=job;
            this.selectedIndex=index;
        }

    });
});
