package com.ztesoft.terminal.config;

import java.util.Properties;

import org.apache.log4j.Logger;

import com.jfinal.config.Constants;

import com.jfinal.config.Handlers;
import com.jfinal.config.Interceptors;
import com.jfinal.config.JFinalConfig;
import com.jfinal.config.Plugins;
import com.jfinal.config.Routes;
import com.jfinal.core.JFinal;
import com.jfinal.kit.PathKit;
import com.jfinal.kit.PropKit;
import com.jfinal.plugin.activerecord.ActiveRecordPlugin;
import com.jfinal.plugin.activerecord.CaseInsensitiveContainerFactory;
import com.jfinal.plugin.activerecord.dialect.OracleDialect;
import com.jfinal.plugin.c3p0.C3p0Plugin;
import com.jfinal.plugin.ehcache.CacheKit;
import com.jfinal.plugin.ehcache.EhCachePlugin;
import com.ztesoft.terminal.common.control.DemoFishTest;
import com.ztesoft.terminal.common.control.DemoOrderMonitor;
import com.ztesoft.terminal.common.control.DemoResource;
import com.ztesoft.terminal.common.control.DemoYunMain;
import com.ztesoft.terminal.common.control.DemoYunManagerView;
import com.ztesoft.terminal.common.model._MappingKit;

public class WebConfig extends JFinalConfig {
	
	private static final Logger logger = Logger.getLogger(WebConfig.class);  
	/**
	 * 配置常量
	 */
	public void configConstant(Constants me) {
		logger.info("初始化开始!");
		// 加载少量必要配置，随后可用PropKit.get(...)获取值
//		Properties properties = loadPropertyFile(PathKit.getRootClassPath()+"/a_little_config.txt");
		PropKit.use("a_little_config.txt");
		me.setDevMode(PropKit.getBoolean("devMode", false));
	}

	/**
	 * 配置路由
	 */
	public void configRoute(Routes me) {
		me.add("/", com.ztesoft.terminal.common.control.IndexController.class);	
		me.add("/fishTest", DemoFishTest.class);
		me.add("/resourceWarehouse",DemoResource.class);
		//样例模块
		me.add("/orderMonitor", DemoOrderMonitor.class);
		me.add("/TaskMain",DemoYunMain.class);
		me.add("/TaskManagementView",DemoYunManagerView.class);
//		me.add("/login", LoginController.class);
//		me.add("/user", UserMangerController.class);
		
		
		//业务模块
//		me.add("/flight",FlightController.class);
	}

	public static C3p0Plugin createC3p0Plugin() {
		return new C3p0Plugin(PropKit.get("jdbcUrl").trim(), PropKit.get("user").trim(),
				PropKit.get("password").trim(),PropKit.get("oracleDrive").trim());
	}

	/**
	 * 配置插件
	 */
	public void configPlugin(Plugins me) {
		// 配置C3p0数据库连接池插件
		C3p0Plugin C3p0Plugin = createC3p0Plugin();
		me.add(C3p0Plugin);

		// 配置ActiveRecord插件
		ActiveRecordPlugin arp = new ActiveRecordPlugin(C3p0Plugin);
		me.add(arp);
		// 配置Oracle方言
		arp.setDialect(new OracleDialect());
		// 配置属性名(字段名)大小写不敏感容器工厂 
		arp.setContainerFactory(new CaseInsensitiveContainerFactory());
		
		//ehcached
		me.add(new EhCachePlugin());
		
		
		// 所有配置在 MappingKit 中搞定
//		_MappingKit.mapping(arp);
		logger.info("初始化结束!");

	}

	/**
	 * 配置全局拦截器
	 */
	public void configInterceptor(Interceptors me) {
	//	me.addGlobalActionInterceptor(new AuthInterceptor());// 授权拦截
	}

	/**
	 * 配置处理器
	 */
	public void configHandler(Handlers me) {
	}

	/**
	 * 建议使用 JFinal 手册推荐的方式启动项目 运行此 main
	 * 方法可以启动项目，此main方法可以放置在任意的Class类定义中，不一定要放于此
	 */
	public static void main(String[] args) {
		JFinal.start("WebContent", 8080, "/", 5);
	}
}
