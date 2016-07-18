package com.ztesoft.terminal.common.control;

import com.jfinal.core.Controller;

public class DemoYunMain extends Controller {

	public void index() {
		render("/modules/iom/cloudiom/task/templates/TaskManagementView.html");
	}
}
