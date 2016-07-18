package com.ztesoft.terminal.common.control;

import com.jfinal.aop.Before;

import com.jfinal.core.Controller;


//@Before(AuthInterceptor.class)
public class DemoOrderMonitor extends Controller{
	
	public void index() {
//		IdcUser user = (IdcUser)this.getSessionAttr("SYS_USER");
//		IdcRole role = (IdcRole)this.getSessionAttr("SYS_USER_ROLE");
//		this.setAttr("realname", user.getRealname());
//		this.setAttr("rolename", role.getRolename());
		this.render("/newPages/monitor/orderMonitor.html");
	}
}
