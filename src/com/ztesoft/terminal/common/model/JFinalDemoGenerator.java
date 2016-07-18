package com.ztesoft.terminal.common.model;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import javax.sql.DataSource;


import com.jfinal.kit.PathKit;
import com.jfinal.kit.PropKit;
import com.jfinal.plugin.activerecord.generator.Generator;
import com.jfinal.plugin.c3p0.C3p0Plugin;
import com.ztesoft.terminal.config.WebConfig;

/**
 * 在数据库表有任何变动时，运行一下 main 方法，极速响应变化进行代码重构
 */
public class JFinalDemoGenerator {

	
	public static DataSource getDataSource() {
		PropKit.use("a_little_config.txt");
		C3p0Plugin c3p0Plugin = WebConfig.createC3p0Plugin();
		c3p0Plugin.start();
		return c3p0Plugin.getDataSource();
	}
	
	public static void main(String[] args) {
		// base model 所使用的包名
		String baseModelPackageName = "com.ztesoft.terminal.common.model.base";
		// base model 文件保存路径
		String baseModelOutputDir = PathKit.getWebRootPath() + "/../src/com/ztesoft/terminal/common/model/base";
		
		// model 所使用的包名 (MappingKit 默认使用的包名)
		String modelPackageName = "com.ztesoft.terminal.common.model";
		// model 文件保存路径 (MappingKit 与 DataDictionary 文件默认保存路径)
		String modelOutputDir = baseModelOutputDir + "/..";
		
		// 创建生成器
		Generator gernerator = new Generator(getDataSource(), baseModelPackageName, baseModelOutputDir, modelPackageName, modelOutputDir);
		// 添加不需要生成的表名,由于用户下表太多，需要生成映射的表存放在auto_deal_tables中
		gernerator.addExcludedTable(getExcTab("table"));
		gernerator.addExcludedTable(getExcTab("view"));
		// 设置是否在 Model 中生成 dao 对象
		gernerator.setGenerateDaoInModel(true);
		// 设置是否生成字典文件
		gernerator.setGenerateDataDictionary(false);
		// 设置需要被移除的表名前缀用于生成modelName。例如表名 "osc_user"，移除前缀 "osc_"后生成的model名为 "User"而非 OscUser
		gernerator.setRemovedTableNamePrefixes("t_");
		// 生成
		gernerator.generate();
	}
	private static String[] getExcTab(String type){ 
		String sql = null;
		if (type.equals("table")){
        sql="select table_name from user_tables where table_name not in (select table_name from auto_deal_tables)";
		}else if (type.equals("view")){
	    sql="select view_name from user_views where view_name not in (select table_name from auto_deal_tables)"	;
		}else{
		return new String[0];
		}
			
        List<String> list = new ArrayList<String>();                                                         
        Connection conn = null;                                                                              
        try {                                                                                                
            conn = getDataSource().getConnection();                                                          
            Statement stmt = conn.createStatement();                                                         
            ResultSet rs=stmt.executeQuery(sql);                                                             
            while (rs.next()) {                                                                              
                list.add(rs.getString(1));                                                                   
            }                                                                                                
        } catch (SQLException e) {                                                                           
            // TODO Auto-generated catch block                                                               
            e.printStackTrace();                                                                             
        }finally{                                                                                            
            try {                                                                                            
                conn.close();                                                                                
            } catch (SQLException e) {                                                                       
                // TODO Auto-generated catch block                                                           
                e.printStackTrace();                                                                         
            }                                                                                                
        }                                                                                                    
                                                                                                             
        String[] s=new String[list.size()];                                                                  
        for (int i = 0; i < list.size(); i++) {                                                              
            s[i]= list.get(i);                                                                               
        }                                                                                                    
        return s;                                                                                            
    }
}
