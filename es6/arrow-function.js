// 箭头函数的 this 指针
// 箭头函数没有 this 实际上的 this 是外层包裹层的 this

// es6 -> es5
// ES6
function foo() {
  setTimeout(() => {
    console.log('id:', this.id);
  }, 100);
}

// ES5
function foo() {
  var _this = this;

  setTimeout(function () {
    console.log('id:', _this.id);
  }, 100);
}


// 此时 this 指向 window || global 这样的全局环境
const cat = {
  lives: 9,
  jumps: () => {
    // console.log(this)
    this.lives--;
  }
}

// this 指向 handler，由于箭头函数的 this 在 init 这个函数内， init 函数是普通函数，this 指向 handler 
var handler = {
  id: '123456',

  init: function() {
    document.addEventListener('click',
      event => this.doSomething(event.type), false);
  },

  doSomething: function(type) {
    console.log('Handling ' + type  + ' for ' + this.id);
  }
};

// ext. 尾调用
function f(){
  return g()
}

// 错误：这个不是尾调用，尾调用主要是由于函数最后的返回是函数，在函数内部，返回的函数是有指针记录，从而形成执行栈
// 尾调用会形成调用帧：f->g g->z z->w
// 尾调用会减少内部函数对外部函数调用帧、内部变量的引用，及 z->w 不需要 g->z 的内部信息
function f(){
  const r = g()
  return r;
}

// 尾调用优化：将所有执行简化成一次执行
function f() {
  let m = 1;
  let n = 2;
  return g(m + n);
}
f();

// 等同于
function f() {
  return g(3);
}
f();

// 等同于
g(3);

// 不适用尾调用优化：内层函数inner用到了外层函数addOne的内部变量one
function addOne(a){
  var one = 1;
  function inner(b){
    return b + one;
  }
  return inner(a);
}