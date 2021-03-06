package com.ztesoft.terminal.common.model.base;

import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;

/**
 * Generated by JFinal, do not modify this file.
 */
@SuppressWarnings("serial")
public abstract class BasePmEquipmentType<M extends BasePmEquipmentType<M>> extends Model<M> implements IBean {

	public void setTypeCode(java.lang.String typeCode) {
		set("TYPE_CODE", typeCode);
	}

	public java.lang.String getTypeCode() {
		return get("TYPE_CODE");
	}

	public void setTypeName(java.lang.String typeName) {
		set("TYPE_NAME", typeName);
	}

	public java.lang.String getTypeName() {
		return get("TYPE_NAME");
	}

	public void setEquipmentClass(java.lang.String equipmentClass) {
		set("EQUIPMENT_CLASS", equipmentClass);
	}

	public java.lang.String getEquipmentClass() {
		return get("EQUIPMENT_CLASS");
	}

	public void setManufacturerCode(java.lang.String manufacturerCode) {
		set("MANUFACTURER_CODE", manufacturerCode);
	}

	public java.lang.String getManufacturerCode() {
		return get("MANUFACTURER_CODE");
	}

	public void setState(java.lang.String state) {
		set("STATE", state);
	}

	public java.lang.String getState() {
		return get("STATE");
	}

}
