package com.ztesoft.terminal.common.control;

import com.jfinal.core.Controller;

public class DemoFishTest extends Controller{

	public void index() {
		this.render("/newPages/configPages/fishTest.html");
	}
}
