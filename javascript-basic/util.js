(function(context, j){
  let DONT_HAVE_J = true
  if ( !j ) {
    console.log("Don't have jer libarary!")
  }else {
    DONT_HAVE_J = false
  }
  
  const isObject = DONT_HAVE_J ? function(o){
    return Object.prototype.toString.call(o) === '[object Object]';
  } : j.fn.isObject;
  const isArray  = DONT_HAVE_J ? function(o){
    return Object.prototype.toString.call(o) === '[object Array]';
  } : j.fn.isArray;
  const isBoolean  = DONT_HAVE_J ? function(o){
    return Object.prototype.toString.call(o) === '[object Boolean]';
  } : j.fn.isBoolean;

  /** 组合函数
   *  @param function a  有返回值的函数，参数、返回值的数据类型和x一直
   *  @param function b  有返回值的函数
   */
  function compose (b, a){
    // x 的数据类型和 a, b 的数据类型一致
    return function(x){
      try {
        return b(a(x))
      } catch (error) {
        console.warn(`compose fn with error: ${error}`)
      }
      return null;
    }
  }

  /**
   * 函数柯里化
   * @param  {...any} rest rest[0] 为执行函数，之后为该函数的参数
   * @description 参数复用(场景如下例中的重复+1操作)
   * @example let sum = (x, y)=>{ console.log(x + y) }; 
              let curriedAddOne = curry(sum, 1); 
              curriedAddOne(4);
   * @description 延迟执行
   */
  function curry(){
    const f = arguments[0]
    const commonArgs = Array.prototype.slice.call(arguments, 1);
    return function(){
      const fnArgs = Array.prototype.slice.call(arguments)
      const allArgs = commonArgs.concat(fnArgs)
      return f.apply(f, allArgs)
    }
  }

  /**
   * 对象扩展函数
   * @param {boolean} isDeep 是否进行深拷贝
   * @param {object}  destination 待拷贝对象
   * @param {...any}  source  待拷贝对象
   */
  function extend(...res){
    // 简单实现 for ... in 浅拷贝（source内部仍然保持引用关系），且target 的原型链不继承
    // 深拷贝，注意数组和 object 类型

    var index = 0,isDeep = false,obj,copy,destination,source,i
    if(isBoolean(arguments[0])) {
        index = 1
        isDeep = arguments[0]
    }
    for(i = arguments.length - 1;i>index;i--) {
        destination = arguments[i - 1]
        source = arguments[i]
        if(isObject(source) || isArray(source)) {
            for(var property in source) {
                obj = source[property]
                if(isDeep && ( isObject(obj) || isArray(obj) ) ) {
                    copy = isObject(obj) ? {} : []
                    var extended = extend(isDeep,copy,obj)
                    destination[property] = extended 
                }else {
                    destination[property] = source[property]
                }
            }
        } else {
            destination = source
        }
    }
    if( destination === null ){
      return {}
    }
    return destination
  }

  // 执行函数后的函数
  // var gn = fn.after(zn); g(); zn 的参数是 gn 的结果
  const after = function(before, fn) {
    const f = before
    if( typeof fn !== 'function' ){
      return console.error("first argument must be function!")
    }
    return function(...args){
      const first = f.apply(f, args)
      if( first === undefined ){
        fn.call(fn);
        console.warn("first function no return!")
      }else{
        fn.call(fn, first)
      }
      return first;
    }
  }

  // (f, g, ...) => if false { return } else { continue }
  // 有顺序前面的函数先判断 且关系
   function composeAndBoolean (...fns){
    return function(x){
      let i = 0;
      // O(lgN)
      for(; i< fns.length; i+=1){
        if( fns[i](x) === false ){
          return false
        }
      }
      return true;
    }
  }
  // 或关系
  function composeOrBoolean(...fns){
    return function(x){
      let i = 0;
      // O(lgN)
      for(; i< fns.length; i+=1){
        if( fns[i](x) === true ){
          return true
        }
      }
      return false;
    }
  }
  Util = {
    curry,
    extend,
  }
  context.Util = Util
})(window, window.jer)