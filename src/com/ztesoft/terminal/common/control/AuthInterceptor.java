package com.ztesoft.terminal.common.control;

import org.apache.log4j.Logger;

import com.jfinal.aop.Interceptor;
import com.jfinal.aop.Invocation;
import com.jfinal.core.Controller;

/**
 * BlogInterceptor 此拦截器仅做为示例展示，在本 demo 中并不需要
 */
public class AuthInterceptor implements Interceptor {

	public static Logger log = Logger.getLogger(AuthInterceptor.class);

	public void intercept(Invocation inv) {
		//
		// 校验用户授权
		Controller con = inv.getController();
		Boolean flag = con.getSessionAttr("SYS_LOGINFLAG");
		//System.out.println(flag);
		if (flag == null) {
			log.equals("user doesn't login,request rediret to login page");
			con.redirect("/login?from="+inv.getActionKey());
		}else{
			inv.invoke();
		}
		
	}
}
