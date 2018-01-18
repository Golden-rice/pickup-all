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
	 			'length': elem.length || 1,
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
	isNull: function(dom){
		return this._isType('Null')(dom);
	},
	isElement: function(dom){
		return /^\[object\sHTML\w+Element\]$/.test(Object.prototype.toString.call(dom));
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
		else if(this.isArray(input)){
			return input;
		}
		// 类数组对象
		else if(input.length){
			return Array.prototype.slice.call(input);
		}
		else if(this.isElement(input)){
			return [input];
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

// 扩充类型方法
jer.fn.extend({
	// 使用方法：var obj = j.fn.installExtend(obj)
	// 安装扩展
	installExtend: function( obj ){
		return this.extend( obj || {}, this._extend() );
	},

	// 扩展
	_extend: function(){
		var self = this;
		return {
			array: self.arrayExtend()
		}
	},

	// 数组类型
	arrayExtend: function(){

		// 返回 first 与 second 的差集
		var diff = function( first, second ){
			return first;
		}

		// 返回 first 与 second 的交集
		// 不含key，含key
		var intersect = function( first, second ){
			return first;
		}

		return {
			diff: diff,
			intersect: intersect,
		}
	}

})
// 装载工具
jer.fn.extend(jer.fn._extend())

// 观察者模式及函数组合
// *** 命令行模式：封装复合命令，宏命令
jer.fn.extend({
	// 回调函数
	callback: function(option){
		return installEvent( {}, option );
	},

	// 为对象安装观察者模式 
  installEvent: function(obj, option){
  	return this.extend( obj || {}, this._event(option) );
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

		if( elem[0] ){ // 同类仅返回第一个即可

			// 获取 data- 属性
			if( elem[0].dataset[name] ){ return elem[0].dataset[name]; }
			// 获取缓存
			if( elem[0].eid && this.cache[elem[0].eid] ) { 
				return this.cache[elem[0].eid][name]; 
			}

		}else{
			// 获取全局缓存
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

// 工具
jer.fn.extend({
	// 判断是否为空， '',  0 ,{}, [], false, NaN, undefined, null 
	empty: function( input ){
		switch ( input ){
			case '':     // String
				return true;
			case false:  // Bool
				return true;
			case 0:      // Number
				return true;
			default: 
				// Array
				if( JSON.stringify( input ) === '[]' ) return true;
				// Object
				if( JSON.stringify( input ) === '{}' ) return true;
				// undefined
				if( isUndefined( input ) ) return true;
				// null
				if( isNull( input ) ) return true;
				// NaN
				if( isNaN( input ) ) return true;
		}
		return false;
	},

	// 检查必须字段是否全面，第一个参数为输入的对象，后面为检查字段
	check: function( input, refer ){

		// object -> array
		if( this.isObject(input) ) { input = [input]; }

		if( this.checkField( input[0], refer ) ){
			return true;
		}
	},

	// 检查字段是否全面
	checkField: function( input, field ){
		return this.array.diff( input, this.toArray( field ) );
	},

	// 生成错误
	// error( msg[, file[, lineNumber]] )
	error: function( msg, file, lineNumber ){
		try {
			throw new Error( msg, file, lineNumber );
		} catch (e) {
		  console.log(e)
		}
	}

})

// url 异步请求
jer.fn.extend({

	// XMLRequest 
	// config ={query:{} /* 查询条件 */, url: ''/* url地址 */, clk: function(){}/* 回调函数 */, type: 'POST' /* default */}
	req: function(config){
		// 检查字段是否完整
		if ( !this.check(config, ['query', 'url', 'clk']) ){ this.error('Wrong config items!'); }
		
		var resp, self = this,
				request = new XMLHttpRequest();

		request.open( config.type || 'POST', config.url, true );

		// IE8+
		// request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

		// IE9+
		request.onload = function() {
		  if (request.status >= 200 && request.status < 400) {
		    // Success!
		    var resp = request.responseText;

		    if( config.success && self.isFunction(config.success) ){
		    	config.success( resp, request.status, request );
		    }
		  } else {
		    // We reached our target server, but it returned an error
		    self.error( request.statusText + request.status )
		  }
		};

		request.onerror = function() {
		  // There was a connection error of some sort
		  if( config.error && self.isFunction(config.error) ){
		    	config.error( request, request.status );
		   }
		};
			
		request.send(config.query);

		return request.response
	},

	// http GET
	get: function(){

	},

	// http POST
	post: function(){

	},

	// http Fetch  
	fetch: function(){

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