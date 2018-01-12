/* ======================================
 * jer.js JavaScript Library v0.0.1
 * jer.js JavaScript工具库
 * jer.es6.js ECSMscript2016版
 * ======================================
 * 
 * DOM操作：jQuery 操作风格
 * 
 */
 const jer2 = class j{

 	// 构造函数
 	constructor(selector, context){
	 	// 匹配 #id, .className, tagName
	  this.domExpr = /^([#|\.|\w]?)([\w]+)$/;

 		return this.init(selector, context);
 	}

 	// 初始化
 	static init(selector, context){
 		return this.domExpr
 	}
}
window.jer2 = window.j2 = jer2;