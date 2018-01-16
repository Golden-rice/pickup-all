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
    domExpr = /^([#|\.|\w]?)([\w]+)$/,

    // 防止命名空间冲突
    _j   = window.j,
    _jer = window.jer;


// 构造函数
jer = function(selector, context){
	return new jer.fn.init(selector, context);
};

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

		var elem, ret = {},
				context = context || document; 

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
			if(/^#(\w+$)/.test(selector) && document.querySelector ){
				// 匹配 id element
				elem = document.querySelector(selector);
			}else if ( document.querySelectorAll ){
		 		// 匹配 class tagname elements
		 		elem = document.querySelectorAll(selector);
		 	} else {
		 		// 匹配 #id tagName .className
		 		elem = document.getElementById(/^#(\w+$)/.exec(selector)[1]) || document.getElementsByTagName(/(^\w+$)/.exec(selector)[1]) || ( document.getElementsByClassName && document.getElementsByClassName(/^\.(\w+$)/.exec(selector)[1]) ) || this.getElementsByClassName(/^\.(\w+$)/.exec(selector)[1]);
		 	}
		}


		// *** 简单封装: 调用时转化成数组调用
	 	if(elem){

	 		this.extend(ret, this.toArray(elem));
	 		this.extend(ret, {
	 			'length': elem.length,
	 			'context': context,
	 			'selector': selector,
	 		});

	 		this.extend(ret);
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

	// 获取elem元素
	elem: function(){
		return this.toArray(this);
	},

	// 类型判断
	isArray: function(dom){
		return this._isType('Array')(dom);
	},
	isString: function(dom){
		return this._isType('String')(dom);
	},
	isNumber: function(dom){
		return this._isType('Number')(dom);
	},
	isObject: function(dom){
		return this._isType('Object')(dom);
	},
	isFunction: function(dom){
		return this._isType('Function')(dom);
	},
	isUndefined: function(dom){
		return this._isType('Undefined')(dom);
	},
	_isType: function (type){
	  return function(obj){
	    return Object.prototype.toString.call(obj) === '[object '+type+']';
	  } 
	},

	// 合并，将第二个合并到第一个上
	merge: function(first, second){
		var i = 0, l = first.length;

		if(!this.isArray(second)){
			second = this.toArray(second);
		}

		if(this.isNumber(l)){
			for( ; i < l; i++){
				first[i] = second[i];
			}
		}

		return first; 
	},

	// 转化成对象
	toObject: function(input){
		var o = 0, ret = {};

		if(this.isArray(input)){
	 		for(; o < input.length; o++){
	 			ret[o] = input[o];
	 		}
	 		return ret;
		} 
		else if(this.isObject(input)){
			return input;
		}
		return ret
	},

	// 转化成数组
	toArray: function(input){
		if(this.isObject(input)){
			if(Array.from){
		    // ES6
		    return Array.from(input)
			}

	    // ES5
	    return Array.prototype.slice.call(input);
		} 
		else if(this.isArray()){
			return input;
		}
		// 类数组对象
		else if(input.length){
			return Array.prototype.slice.call(input);
		}
		return [];
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

};

jer.fn.init.prototype = jer.fn;

jer.extend = jer.fn.extend;

// 观察者模式及函数组合
// *** 命令行模式：封装复合命令，宏命令
jer.fn.extend({
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
})

// 缓存
jer.fn.extend({

  // 缓存
  cache: {},

  // 生成缓存
	data: function( name, data ){

		if( !name ) { return this; }

		var gid  = 'j-BB68835792FC129863D93292CE17E21D',
				name = name && name.toString(), 
			  elem = this.elem();

		// 存储在elem中
		if( elem.length ){
			// 设置数据
			if( data ) {
				return this.setDate( elem, name, data );
			}
			// 如果仅有name，则是取数据
			else{
				return this.getDate( elem, name );
			}

		}
		// 存储在j中
		else {

			if( data ){
				if ( !this.cache[this.gid] ) { this.cache[this.gid] = {}; }
				return this.setDate( this.cache[this.gid], name, data );
			}

			else{
				return this.getDate( this.cache[this.gid], name );
			}

		}

		return this;
	},

	// 获得元素缓存
	getDate: function( elem, name ){

		if( !name || !elem ) { return this; }

		if( elem[0] ){

			if( elem[0].eid && this.cache[elem[0].eid] ) { 
				return this.cache[elem[0].eid][name]; 
			}

		}else{
			return elem[name];
		}


		return this;
	},

	// 给元素设置缓存
	setDate: function( elem, name, data ){

		if( !name || !elem ) { return this; }

		var i = 0,
				data = data && data.toString(),  
				id = 'j' + Math.random();

		// 给元素赋值
		if( elem.length ){

			for(; i < elem.length; i++){

				elem[i].eid = id;

				if( !this.cache[id] ) { this.cache[id] = {}; }
				this.cache[id][name] = data;

			}

		}
		// 给全局赋值
		else{
			elem[name] = data;
		}


		return this;
	},

	// 移除元素缓存
	removeDate: function( elem, name ){

		if( !name ) { return this; }

		var i = 0;

		// 移除元素缓存
		if( elem.length ){

			for(; i < elem.length; i++){

				delete elem[i].eid;

				if( this.cache[id] ) { 
					delete this.cache[id][name];
				}

			}

		}
		// 移除全局缓存
		else{
			delete elem[name];
		}
	}
})

// XMLRequest 工具
jer.fn.extend({
	req: function(){

	}
})

// from free jquery
// refer: https://github.com/nefe/You-Dont-Need-jQuery/blob/master/README.zh-CN.md#translations

// css 
jer.fn.extend({
	// 获得css 
	css: function(){

	},

	getStyle: function(){

	},

	setStyle: function(){

	}

})


window.jer = window.j = jer;

})(window);