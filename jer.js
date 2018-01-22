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
	// 使用方法：var obj = j.fn.installToolExtend(obj)
	// 安装扩展
	installToolExtend: function( obj ){
		return this.extend( obj || {}, this._extend() );
	},

	// 扩展
	_extend: function(){
		var self = this;
		return {
			'array': self.arrayExtend(),
			'date': self.dateExtend(),
			'string': self.stringExtend(),
			'function': self.functionExtend()
		}
	},

	// 数组类型方法扩展
	// 内部使用方法，例如 this.array.diff()
	// 外部使用方法，例如 j.fn.array.diff()
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
	},

	// 日期类型方法扩展

	dateExtend: function(){

	  // 格式化当前日期
		// 内部使用方法，例如 this.date.format.call(new Date(), 'yyyy-MM-dd')
		// 外部使用方法，例如 j.fn.date.format.call(new Date(), 'yyyy-MM-dd') 
		var format = function( format ){
		  // format("yyyy-MM-dd hh:mm:ss");
		   var date = {
	        "M+" : this.getMonth()+1,                            //月份 
	        "d+" : this.getDate(),                               //日 
	        "h+" : this.getHours(),                              //小时 
	        "m+" : this.getMinutes(),                            //分 
	        "s+" : this.getSeconds(),                            //秒 
	        "q+" : Math.floor((this.getMonth()+3)/3),            //季度 
	        "S"  : this.getMilliseconds()                        //毫秒 
		   };
		   if (/(y+)/i.test(format)) {
          format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
		   }
		   //英文字母月份，例如01JUN=>ddU
		   if(/(U)/i.test(format)) {
          format = format.replace(RegExp.$1, this.toString().substr(4,3).toUpperCase());
		   }

		   for (var k in date) {
          if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1
                    ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
          }
		   }
		   return format;
		}

		return {
			format: format
		}
	},

	// 字符类型方法扩展
	// 使用方法，例如 this.string.trim.call()
	stringExtend: function(){

		// 清除两边符号，默认为空格 
		var trim = function(Symbol) {
		  if(Symbol){
		    Symbol = Symbol.replace(/(\\|\||\*|\+|\-|\?|\(|\)|\/|\.|\^|\$|\=)/g, "\\$1");
		    var patten = new RegExp("(^"+Symbol+"*)|("+Symbol+"*$)",'g');
		    return this.replace(patten, ''); 
		  }
		  return this.replace(/(^\s*)|(\s*$)/g, ''); 
		}; 

		return {
			trim: trim
		}
	},

	// 函数类型方法扩展
	// 外部使用方法，例如 ：var a = fn; var b = j.fn.function.after.call(a, fn1, arg1, arg2); b(arg)
	// var b = a.after(fn).after(fn2); b(args); 或 a.after(fn).after(fn2)(args)
	functionExtend: function(){
		// 延后执行
		var after = function(){
		  var self = this, 
		  		fn   = Array.prototype.shift.call( arguments ), 
		  		args = arguments;

		  return function(){

		    var ret = self.apply( this, arguments );
		    args.valueOf().length > 0 ? fn.apply(this, args) :  // 自定义参数时
		    														fn.apply(this, arguments);

		    return ret;
		  }
		};

		// 预先执行
		var before = function(){
		  var self = this, 
		  		fn   = Array.prototype.shift.call( arguments ), 
		  		args = arguments;

		  return function(){

		    args.valueOf().length > 0 ? fn.apply(this, args) :  // 自定义参数时
		    														fn.apply(this, arguments);

		    return self.apply(this, arguments);
		  }
		};

		return {
			after: after,
			before: before
		}
	}

})
// 装载扩展类型方法
jer.fn.extend(jer.fn._extend())

// 观察者模式及函数组合
jer.fn.extend({
	// 回调函数
	// 使用方法：var a = j.fn.Callbacks('once');a.listen('listen', f1);a.listen('listen', f2); a.trigger('listen');
	// option 配置回调函数类型：once(仅执行一次), unique（事件再组中仅保存一次）, stopOnFalse（事件执行中遇到失败则停止）
	Callbacks: function(option){
		return this.installEvent( {}, option );
	},

	// 为对象安装观察者模式 
	// option 配置回调函数类型：once(仅执行一次), unique（事件再组中仅保存一次）, stopOnFalse（事件执行中遇到失败则停止）
  installEvent: function(obj, option){
  	return this.extend( obj || {}, this.Event(option) );
  },

  // Event 构造函数
  // option 配置回调函数类型：once(仅执行一次), unique（事件再组中仅保存一次）, stopOnFalse（事件执行中遇到失败则停止）
	Event:  function(option){
		var clientList = {},  // 订阅客户
		    listen,           // 监听事件
		    trigger,          // 触发事件
		    remove;           // 移除事件 

		// 订阅事件，利用key来区别函数组
		// event.liten('key', function)
		listen = function(key, fn){
			if( !j.fn.isFunction(fn) ) { return j.fn.error('The arguments is wrong type! ') }

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
		// event.trigger('key', ...args)
		trigger = function(){

		    var i = 0, fn,
		     		key = Array.prototype.shift.call(arguments),
		        fns = clientList[key];

		    if(!fns || fns.length === 0){
	      	return false;
		    }

		    for(; fn = fns[i++];){
	      	if( fn.apply(this, arguments) === false && option === 'stopOnFalse'){
	      		break;
	      	}
		    }

		    if( option === 'once' ){
		    	clientList = {};
		    }
		}

		// 移除事件，利用key来区别函数组
		// event.remove('key', fn)
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

		// 判断该状态在不在队列中
		var hasEvent = function( key ){
			return clientList[key] ? true : false;
		}

		return {
		    listen: listen,
		    trigger: trigger,
		    remove: remove,
		    hasEvent: hasEvent
		}

	},

})

// *** 命令行模式：生成命令组合，封装复合命令，宏命令
jer.fn.extend({
	// 可以 promise 链式生成
	Command: function(){
		var self = j.fn,
				command = {},
				set = {
					
					command: function( obj ){
						return self.isObject(obj) ? self.extend( obj, set ) : set;
					},
					execute: function(){

					}
				};

		set.command(command)
		console.log(command)
	}
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
		return false;
	},

	// ready function
	ready: function(){
		/* ***
			function addLoadEvent(func){
			  var oldOnLoad = window.onload;
			  if(typeof window.onload != 'function'){
			    window.onload = func;
			  }
			  else{
			    window.onload = function(){
			          oldOnLoad();
			          func();
			    }
			        
			  }
			}
			可以改为 观察者模式
		*/
	}
})

// 非阻塞（异步）
jer.fn.extend({
	// defer 对象的构造函数
	Deferred: function( fn ){

		var self = j.fn,
				i = 0,
				// events 配置
				events = [
					['resolve', 'done', j.fn.Callbacks('once')]
				],
				// Defer 实例
				deferred = {},
				// 中间件 *** 未完成
				promise = {
					// 表示此时状态
					state: function(){}, 
					// 进行下一步，类似于返回 this
					then: function(){
						var fn = Array.prototype.shift(arguments);

						if( self.isFunction(fn) ){ 
							fn();
						}
						//	每回返回的是该对象
						return new self.Deferred();
					},
					// 构造函数：返回 promise 实例 或 扩展
					promise: function( obj ){
						return self.isObject(obj) ? self.extend( obj, promise ) : promise;
					}
				},
				deferEvent;

		// pipe 生成的 promise 
		promise.promise( deferred );

		// 一套操作[triggerName( ext. command ), listenName, eventList] 例如['resolve', 'done', j.fn.Callbacks('once')]
		// 批量生成 '观察者'
		for(; i < events.length; i++){
			// event list
			deferEvent = events[i][2];

			// event trigger
			deferred[events[i][0]] = (function(i, deferEvent, deferred){

				return function(){

					var args = Array.prototype.slice.call( arguments );

					// 利用 setTimeout 0 在done之后执行
					if( !deferEvent.hasEvent( events[i][0] ) ) {

						setTimeout(function(){
							deferEvent.trigger.apply( deferred, Array.prototype.concat(events[i][0], args) );
						},0);

					}else{

						deferEvent.trigger.apply( deferred, Array.prototype.concat(events[i][0], args) );

					}
				}

			})(i, deferEvent, deferred);

			// event listen
			deferred[events[i][1]] = (function(i, deferEvent, deferred){

				return function( fn ){

	        deferEvent.listen(events[i][0], fn);

	        return deferred;
	      };

	    })(i, deferEvent, deferred)
		}


		return deferred;

		// 监听的三个状态： 未完成(unfulfilled)，已完成(resolved)，拒绝(rejected)
			// 一套Done操作['resolve', 'done', j.fn.Callbacks('once'),'resolved']
			// 一套Fail操作['reject', 'fail', j.fn.Callbacks('once'),'rejected']
			// 一套Progress操作['notify', 'progress', j.fn.Callbacks('once')]

	}
})


// url 异步请求
var jax = jer.extend({}, {
	// 安装
	install: function(){
		return {
			req: this.req

		}
	},

	// XMLRequest 
	// config ={query:{} /* 查询条件 */, url: ''/* url地址 */, clk: function(){}/* 回调函数 */, type: 'POST' /* default */}
	// 问题：
	// 1、跨域, jsonp
	// 2、json的格式， dataType
	// 3、dataType dataType
	// 4、AJAX乱码问题 utf-8
	// 5、页面缓存 
	// 6、状态的跟踪 before after done
	// 7、不同平台兼容 xhr API 不一致
	req: function(config){
		// 检查字段是否完整
		if ( !this.check(config, ['query', 'url', 'clk']) ){ this.error('Wrong config items!'); }
		
		var resp, 
				self     = this,
				deferred = j.fn.Deferred(),
				jaxEvent = this.installEvent('once'),
				request  = new XMLHttpRequest();

		request.open( config.type || 'POST', config.url, config.async || true );

		// IE8+
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

		if( config.clk && self.isFunction(config.clk) ){
			deferred.done(config.clk);
		}

		// IE9+
		request.onload = function() {
		  if (request.status >= 200 && request.status < 400) {
		    // Success!

		    // 返回的数据类型： xml html json script jsonp text
		    if( config.dataType ){
		    	switch ( config.dataType ){
		    		case 'text':
		    			resp = request.responseText;
		    			break;
		    		case 'json': 
		    			resp = JSON.parse(request.response);
		    			break;
		    		// ...
		    		default:
		    			resp = request.response;
		    			break;
		    	}
		    }
		    else{
			    resp = request.response;
		    }

		    if( config.success && self.isFunction(config.success) ){
		    	config.success( resp, request.status, request );
		    }

		    // trigger 'done'
			  deferred.resolve( resp, request.status, request );

		  } else {
		    // We reached our target server, but it returned an error
		    self.error( request.statusText + ' ' + request.status );

		    // trigger 'done'
			  deferred.resolve( request.statusText + ' ' + request.status );
		  }

		};

		request.onerror = function() {
		  // There was a connection error of some sort
		  if( config.error && self.isFunction(config.error) ){
		    	config.error( request, request.status );
		   }

		  // trigger 'done'
		  deferred.resolve( request, request.status );
		};

		request.send(config.query);

		// jax 后的事件
		return this;
	},


	// http GET
	get: function(){

	},

	// http POST
	post: function(){

	},

	// http Fetch  
	fetch: function(){

	},

})

// 装配 req clk


jer.fn.extend(jax.install());

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