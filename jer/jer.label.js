/* ======================================
* jer.js JavaScript Library v0.0.1
* jer.js JavaScript工具库
* jer.label.js 目录版本
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
    // *** jer.fn.init 构造函数，防止直接return new jer() 无限递归
    // *** jer.prototype.init === jer.init // false 对象仅在引用地址一致时才相同
    // *** 利用原型链上的函数作为构造函数，防止通过自身作为构造函数产生的递归
    /*
      var $$ = ajQuery = function(selector) {
          return new ajQuery.prototype.init(selector);
        }
        ajQuery.prototype.init = function(selector){
            this.selector = selector;
            console.log(this) // 指向 prototype.init 这个函数对象
        }
        $$('a')
    */
    // *** END
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
        // *** 链式会产生阻塞，js 是非阻塞语言
        // *** 所有函数返回的均是对象本身，没有返回值，是否存在不适用某些场景？
        /* 返回数据
            ***
            0~n: 指向dom
            context：指执行环境
            prevObject：回溯设计用，DOM元素堆栈能减少重复查询及遍历操作
            selector：选择器名
            length：选择器集合长度
            回溯设计：两个方法
            .end()
            .addBack()
            *** END
         */
        // *** 简单封装: 调用时转化成数组调用
        if(elem){
            // this.extend(ret, this.toArray(elem));
            // this.extend(ret, {
            //     'length': elem.length,
            //     'context': context,
            //     'selector': selector,
            // });

            ret = jer.fn.toArray(elem);
            ret.context  = context;
            ret.selector = selector;
            
            this.extend(ret);
        }

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
    _isType: function (type){
      return function(obj){
        return Object.prototype.toString.call(obj) === '[object '+type+']';
      }
    },
    // 插件接口：
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
                    // 此处可能存在对 copy 的再处理，例如深层拷贝等
                    target[name] = copy;
                }
            }
        };
        return target;
    },
    // 利用观察者模式，组建回调函数
    // option 配置回调函数类型：once, memory(***), unique, stopOnFalse
    // option 配置回调函数类型：once(仅执行一次), unique（事件再组中仅保存一次）, stopOnFalse（事件执行中遇到失败则停止）
    /* ***
            var actions = installEvent({}, 'once');
            event.listen('key1', fn1);
            event.trigger('key1', args); // 所有的 key1下的函数，均用这个参数
            event.remove('key1', fn1);
        
            var actions = $.callback('option');
            actions.add(fn1);
            actions.add(fn2);
            actions.fire(args);
         *** END
     */
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
        listen = function(key, fn){  // 监听客户端状态
            if( !clientList[key] ){
                clientList[key] = [];
            }
            // 一个订阅者多个事件
            if( option === 'unique' ){
                if( -1 === clientList[key].indexOf(fn) ){
                    clientList[key].push(fn);
                }
            }else{
                clientList[key].push(fn);
            }
            // clientList[key] = fn;
        }
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


}
// *** 将 jer.prototype 与 jer.prototype.init.prototype 同步，此时 init 就能获得 jer 中的方法，即实例方法与静态方法（prototype上的方法）关联
jer.fn.init.prototype = jer.fn;

// *** jer 仅保留最核心部分，剩下的通过扩展函数新增，可以方便剥离
// *** 此时扩展的是 jer 而不是 jer.prototype，如果需要扩展 jer ，显式的使用 jer.fn.extend。两者的区别在于，前者是对该对象的扩展，后者扩展的对象的原型，所以所有的实例均能使用该方法
// *** 写在 jer.fn.init.prototype = jer.fn; 之后是因为 jer 实例是通过 prototype.init 实例的，jer.extend 需要扩展在实例上。
jer.extend = jer.fn.extend;

// 缓存
jer.fn.extend({
    // *** 内存泄漏
    /* ***
           循环引用，循环引用自己，DOM插入，闭包（常驻内存中）
            HTML dom绑定数据，安全性？无意义的标签
            jQuery.data( element, key, value ) 与 $(ele).data( key, value ); 前者同名key数据缓存不会替换，后者会
            jQuery.data 存储的数据在内存中以 映射关系与DOM关联，一种是存储在cache中，一种是存储在对象中
            jquery.expando 关联 DOM 利用id缓存数据
            Object.defineProperty(obj, 'name', object);
            缓存结构：
            var cache = {
              "uid1": { // DOM节点1缓存数据，
                "name1": value1,
                "name2": value2
              },
              "uid2": { // DOM节点2缓存数据，
                "name1": value1,
                "name2": value2
              }
              // ......
            };
        // 1.8 后被弃用
        j.data('a') ->get
        j.data('a','c') ->set
        j().data('a') ->get uid
        j().data('a',c)

        j('.cl1').data('a', 'aa')
        j.fn.data('b', 'bb')
        j.fn.data('b')
     *** END
     */
    // ***
  // 缓存
  cache: {},

  
  // 生成缓存
    data: function( name, data ){
        if( !name ) { return this; }

        var gid = 'j-BB68835792FC129863D93292CE17E21D',
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
    // *** 命令行模式：封装复合命令，宏命令
})

// *** 命令行模式：生成命令组合，封装复合命令，宏命令
jer.fn.extend({
    // *** var a = {c: fn, b: fn}; set = function(target, command){ target.action1 = command.c(); }
    // *** -> var aCommand = function(reciver){ return {execute: function(){ reciver.c(); reciver.b(); }}} 
    // *** -> a.execute(){ cfn(); bfn(); }
    Command: function( reciver ){
        var self = j.fn,
                command = [],
                set = {
                    // 重构函数
                    set: function( obj ){
                        return self.isObject(obj) ? self.extend( obj, set ) : set; 
                    },
                    // 为命令绑定事件并执行，target 为dom，action 为绑定的事件
                    bind: function( target, action ){
                        self.bind(target, action, this.command);
                    },
                    // 执行命令
                    execute: function(){
                        var fn, i;
                        for(i in command){
                            fn = command[i];
                            fn.apply(this, arguments);
                        }
                    }
                };

        if( self.isObject( reciver ) ){
            command = self.toArray( reciver );
        }   

        return set.set();
    }
})

// 非阻塞（异步）
jer.fn.extend({
    // defer 对象的构造函数
    Deferred: function( fn ){

        var tuple,
                self = this,
                i = 0,
                tuples = [
                // 类似于REACT对DOM的区分:  动作 侦听器 fn 最终状态 -> 命令行模式
                // 所有暴露的API接口
                ["resolve", "done", self.Callbacks("once"), "resolved"],
                ["reject", "fail", self.Callbacks("once"), "rejected"],
                ["notify", "progress", self.Callbacks("memory")]
                ],
                // 封装的 promise 实例，用于管道执行的中间件
                promise = {
                state: function() {},
                always: function() {},
                then: function( /* fnDone, fnFail, fnProgress */ ) {},
                // 扩展 promise 或 作为构造函数指向自己
                promise: function( obj ) {

                        return self.isObject(obj) ? self.extend(this, obj) : promise;

                }
                },
                // 封装的 defer 实例，done fail progress 
                deferred = {},
                deferEvent = this.Event();

        // 定义管道风格的接口pipe *** 不知何用？换个名字而已
        // 一个 then 就是一个新的 promise 对象：promise.promise(deferred) 即生成一个新的 promise 对象
      promise.pipe = promise.then;

      for(; i < tuples.length; i++ ){
        tuple = tuples[i];
        // *** 
        var list = tuple[2], stateString = tuple[3];
        // 批量生成 derred 状态方法

        if( stateString ){
            list.listen(tuple[1], )
        }
        // resolveWith
        deferred[tuple[0]+'With'] = list.fireWith;
        // promise.done = listen 
        promise[tuple[1]] = list.listen;
        // resolve -> 实际调用 resolveWith
        deferred[tuple[0]] = function(){
            deferred[tuple[0]+'With'](this === deferred ?  promise : this, arguments);
            // this is deferred
            return this;
        }
        
      }
      /*
            deferred = {
                resolve: function(){
                    deferred.resolveWith( this === deferred ? promise : this, arguments )
                    // derred.resolveWith = deferEvent.fireWith
                    return this;
                },
                resolveWith: 
            }
      */
        // 批量扩展 defer 对象


      promise.promise( deferred );

      if (func) {
        func.call(deferred, deferred);
      }

    // *** 链式实际仍然是用返回值 .then 是利用新的Deferred，但是执行保留原先执行上下文（参数）,利用callback.fireWith
    return deferred;
    // 监听的三个状态： 未完成(unfulfilled)，已完成(resolved)，拒绝(rejected)
    // 一套Done操作['resolve', 'done', j.fn.Callbacks('once'),'resolved']
    // 一套Fail操作['reject', 'fail', j.fn.Callbacks('once'),'rejected']
    // 一套Progress操作['notify', 'progress', j.fn.Callbacks('once')]


    }
})

window.jer = window.j = jer;
})(window);
