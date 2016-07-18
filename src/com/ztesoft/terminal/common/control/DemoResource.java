package com.ztesoft.terminal.common.control;

import com.jfinal.core.Controller;

public class DemoResource extends Controller{

	public void index(){
		this.render("/modules/resourceWarehouse/resourceWarehouse.html");
	}
}
