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

// *** jer.fn 相当于替换掉了 jer.prototype 的位置
jer.fn = jer.prototype = {
	// 显式声明构造函数
	// *** 希望 this 指向 jer
	constructor: jer,

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

		// *** 此时 this 指向 jer.prototype.init, __proto__ 指向 jer ，如何让 this 指向 jer.prototype 从而实现链式，其实直接通过 js 本身的原型链就可以实现，init.prototype = jer.prototype
		// *** 链式会产生阻塞
		// *** 所有函数返回的均是对象本身，没有返回值，是否存在不适用某些场景？

		/* 返回数据
			***
			0~n: 指向dom
			context：指执行环境
			prevObject：回溯设计用
			selector：选择器名
			length：选择器集合长度
			*** END
		 */
	  return this;
	},

	// 运行检查: 命名空间
	_check: function(){
		// *** 
		// 解决命名冲突问题
		// 不能直接在原基础上扩展，因为如果存在名称一样的函数则会发生覆盖
		// 闭包可以，es6 use strict {} 可以
		// noConflict(){}
		// 是否来源于同一个引用地址
		// *** END
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
			p   = context || document;

		// 支持getElementByClassName的浏览器
		if(document.getElementsByClassName){
			node = p.getElementsByClassName(clName);
			ret  = node;
		}
		// 不支持的浏览器	
		else{
			node = p.getElementsByTagName(tag);

			for (i = 0; i < node.length; i++) {
				o = node[i].className.split(/\s+/);
				if(o[0]){
					for(j = 0; j < o.length; j++){
						console.log(o[j])
						if(o[j] == clName){
							console.log(node[i].className)
							ret.push(node[i]);
							break;
						}
					}
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
		// *** 该对象为 jer.prototype 或 jer.init实例 的方法
		if( i === length ) {
			target = this;  // 调用上下文 *** jer.prototype 或 jer.init实例
			i--;
		}

		// 多个参数，扩展第一个参数（对象）
		for (; i < length; i++ ) {
			if( (options = arguments[i]) != null ){
				for( name in options ){   // 获取扩展对象的事件 *** 此处仅浅拷贝，即仅能拷贝一层
					copy = options[name];   // 覆盖拷贝
					// *** 为何多个 copy? 变量
					// *** 此处可能存在对 copy 的再处理，例如深层拷贝等
					target[name] = copy; 
				}
			}
		};

		return target;
	},

	// 利用观察者模式，组建回调函数
	// *** var clk = $.callBack(type); 根据不同类型生成callback，然后fire执行
	// *** $.callback 利用事件注册，事件触发组合函数
	// *** 使用方法是否和jq一致？
	// option 配置回调函数类型：once,memory(***),unique(*** 缺少duplicate),stopOnFalse
	event:  function(option){
		var clientList = {},  // 订阅客户
		    listen,           // 监听事件
		    trigger,          // 触发事件
		    remove;           // 移除事件 

		// *** 默认是不允许添加 两个重复事件的 即unique
		// *** 如何重复添加？
		listen = function(key, fn){  // 监听客户端状态
		    if(!clientList[key]){
		        clientList[key] = [];
		    }
		    clientList[key] = fn;
		}

		trigger = function(){
		    var key = Array.prototype.shift.call(arguments),
		        fns = clientList[key];
		    if(!fns || fns.length === 0){
		      	return false;
		    }
		    for(var i, fn; fn = fns[i++];){
		      	if( fn.apply(this, argumetns) === false && option === 'stopOnFalse'){
		      		break;
		      	}
		    }
		    // 仅执行一次
		    if( option === 'once' ){
		    	clientList = {};
		    }
		}

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

	}
}

// *** 将 jer.prototype 与 jer.prototype.init.prototype 同步，此时 init 就能获得 jer 中的方法，即实例方法与静态方法（prototype上的方法）关联
jer.fn.init.prototype = jer.fn;

// *** jer 仅保留最核心部分，剩下的通过扩展函数新增，可以方便剥离
// *** 此时扩展的是 jer 而不是 jer.prototype，如果需要扩展 jer ，显式的使用 jer.fn.extend。两者的区别在于，前者是对该对象的扩展，后者扩展的对象的原型，所以所有的实例均能使用该方法
// *** 写在 jer.fn.init.prototype = jer.fn; 之后是因为 jer 实例是通过 prototype.init 实例的，jer.extend 需要扩展在实例上。
jer.extend = jer.fn.extend;

window.jer = window.j = jer;

})(window);