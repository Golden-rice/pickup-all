/* ======================================
 * jer.js JavaScript Library v0.0.1
 * jer.js JavaScript工具库
 * ======================================
 * 
 * 获取DOM：css 命名规范。
 * 
 */
(function(window, undefined){  

var 
    // 匹配 #id, .className, tagName
    domExpr = /^([#|\.|\w]?)([\w]+)$/;

    // 防止命名空间冲突
    _j   = window.j;
    _jer = window.jer;


// 构造函数
jer = function(selector, context){
	return new jer.fn.init(selector, context);
}

jer.fn = jer.prototype = {
	// 显式声明构造函数
	// *** 循环引用，内存泄漏？
	// constructor: jer,

	// 选择器
	selector: "",

	// 选择器长度
	length: 0,

	// 入口
	init: function(selector, context){

		var elem; 

		// 运行检查
    this._check();

		// 处理 (null) (undefined) ('') (false)
		if ( !selector ) { 
		 	return this;
		}

	  // 处理 (HTML标签)
	  if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ){
	 	  return this;
	  } 

		// 处理查询语句
		if ( this.isString(selector) ) {
		 	if ( document.querySelectorAll ){
		 		// 匹配 element
		 		elem = document.querySelectorAll(selector);
		 	} else {
		 		// 匹配 #id tagName .className
		 		elem = document.getElementById(/^#(\w+$)/.exec(selector)[1]) || document.getElementsByTagName(/(^\w+$)/.exec(selector)[1]) || ( document.getElementsByClassName && document.getElementsByClassName(/^\.(\w+$)/.exec(selector)[1]) ) || this.getElementsByClassName(/^\.(\w+$)/.exec(selector)[1]);
		 	}
		}

	  return this;
	},

	// 运行检查: 命名空间
	_check: function(){
		if( window.j !== j || window.jer !== jer) {
			console.log('The library has same namespace in Global!');
		}
		return this;
	},

	// 类型判断
	isArray: function(dom){
		return this._isType('Array')(dom)
	},
	isString: function(dom){
		return this._isType('String')(dom)
	},
	isNumber: function(dom){
		return this._isType('Number')(dom)
	},
	isObject: function(dom){
		return this._isType('Object')(dom)
	},
	isFunction: function(dom){
		return this._isType('Function')(dom)
	},
	_isType: function (type){
	  return function(obj){
	    return Object.prototype.toString.call(obj) === '[object '+type+']';
	  } 
	},

	// 根据类名查询 element
	getElementsByClassName: function(clName, tagName, context){
		var node, elements, o, i , j ,
				ret = [],
				tag = tagName || "*",
				p   = context || document.body;

		// 支持getElementByClassName的浏览器
		if(document.getElementsByClassName){

			node = p.getElementsByClassName(clName);
			ret  = node;

		}
		// 不支持的浏览器	
		else{
			for ( i = 0, node = p.getElementsByTagName(tag); i < node.length; i++ ) {

				if( node[i].className && (new RegExp(clName)).test(node[i].className) ){
					ret.push(node[i]);
				}

			};
		}
		return ret;
	},

	// 插件接口
	extend: function(){
		var options, copy, name,
			i = 1,
			target = arguments[0] || {},
			length = arguments.length;

		// 仅一个参数，扩展该对象 
		if( i === length ) {
			target = this;  // 调用上下文 
			i--;
		}

		// 多个参数，扩展第一个参数（对象）
		for (; i < length; i++ ) {
			if( (options = arguments[i]) != null ){
				for( name in options ){   // 获取扩展对象的事件 
					copy = options[name];   // 覆盖拷贝
					target[name] = copy; 
				}
			}
		};

		return target;
	},


	// 回调函数
	callback: function(option){
		return installEvent( {}, option );
	},

	// 为对象安装观察者模式 
  installEvent: function(obj, option){
  	return this.extend( obj || {}, _event(option) );
  },

	_event:  function(option){
		var clientList = {},  // 订阅客户
		    listen,           // 监听事件
		    trigger,          // 触发事件
		    remove;           // 移除事件 

		// 订阅事件，利用key来区别函数组
		listen = function(key, fn){
		    if( !clientList[key] ){
		        clientList[key] = [];
		    }

		    if( option === 'unique' ){
		    	if( -1 === clientList[key].indexOf(fn) ){
				    clientList[key].push(fn);
		    	}
		    }else{
		    	clientList[key].push(fn);
		    }
		}

		// 触发事件，利用key来出发函数，第二个参数后面的部分座位执行函数的参数
		trigger = function(){
		    var i, fn,
		     		key = Array.prototype.shift.call(arguments),
		        fns = clientList[key];
		    if(!fns || fns.length === 0){
		      	return false;
		    }
		    for(; fn = fns[i++];){
		      	if( fn.apply(this, argumetns) === false && option === 'stopOnFalse'){
		      		break;
		      	}
		    }

		    if( option === 'once' ){
		    	clientList = {};
		    }
		}

		// 移除事件，利用key来区别函数组
		remove = function(key, fn){
		    var fns = clientList[key];

		    if(!fns){
		      	return false;
		    }
		    if(!fn){
		        fns && (fns.length = 0);
		    }else{
		      	for(var l = fns.length - 1; l>=0; l--){
		        	var _fn = fns[l]
		        	if(_fn === fn){
		         		fns.splice(l, 1);
		        	}
		      	}
		    }
		  }

		return {
		    listen: listen,
		    trigger: trigger,
		    remove: remove
		}

	},

	// *** 内存泄漏
	/* ***
   		循环引用，循环引用自己，DOM插入，闭包（常驻内存中）
			HTML dom绑定数据，安全性？无意义的标签
			jQuery.data( element, key, value ) 与 $(ele).data( key, value ); 前者同名key数据缓存不会替换，后者会
			jQuery.data 存储的数据在内存中以 映射关系与DOM关联，一种是存储在cache中，一种是存储在对象中
			jquery.expando 关联 DOM 利用id缓存数据
     *** END
	 */
	// *** 
}

jer.fn.init.prototype = jer.fn;

jer.extend = jer.fn.extend;

window.jer = window.j = jer;

})(window);