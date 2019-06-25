/**
 * 高阶函数：封装后的 this.props 传递 Peact 实际用于绘制的类型（element or class）
 */
const ComponentWrapper = function(props) {
  this.props = props;
};
ComponentWrapper.prototype.render = function() {
  return this.props;
};

// 类型判断：是否为 Peact 元素
function isPeactCreate () {
  const t = this._t_
  if( t === "PeactElement" || t === "PeactClass" ) {
    return true
  }
  return false;
}

// state 初始化
function initialState(){
  this.state = {}
  this.getInitialState = function(){
    return this.state
  }
}

let extend = Util.extend

// 此处的 function 写法与 class 写法虽不一致，但基本逻辑一样
// Peact 文本组件 string or number
function PeactTextComponent (text) {
  this._currentElement = '' + text;
}
PeactTextComponent.prototype.mountComponent = function(container){
  const domElement = document.createElement("span");
  domElement.innerHTML = this._currentElement
  container.appendChild(domElement);
  return domElement
}

// Peact 基础组件
class PeactDOMComponent {
  constructor(element /* Peact element */){ 
    this._currentElement = element
  }
  // 绘制真实的DOM节点
  mountComponent(container){
    // create HTML dom 
    const domElement = document.createElement(this._currentElement.type);
    // 显式表现结果
    const children = this._currentElement.props.children;
    const props = this._currentElement.props
    if( typeof children === "string" ){
      const textNode = document.createTextNode(children);
      domElement.appendChild(textNode);
    }
    // 注册事件监听
    if( props.onClick ){
      domElement.onclick = props.onClick
    }
    container.appendChild(domElement);
    return domElement;
  }
}

/**
 * 对 Peact 封装的高阶组件进行计算
 */
class PeactCompositeComponentWrapper {
  constructor(element) {
    this._currentElement = element;
  }

  mountComponent(container) {
    // Component 就是 ComponentWrapper 构造函数
    const Component = this._currentElement.type;
    // this._currentElement.props 就是 Peact.render() 第一个参数
    const componentInstance = new Component(this._currentElement.props);
    // 如果是 Peact element，则 element 是 Peact.render() 第一个参数，如果是 Peact class，element 就是 Peact.createClass 内部的构造函数 ElementClass
    let element = componentInstance.render();
    // 对 element 类型判断决定，如果是 Peact class 则element 是构造函数，如果是 Peact element，element 是string，
    while (typeof element === 'function') {
      // render 为 Peact class 声明时的 render 
      element = (new element(element.props)).render();
    }

    // 确保此处的 element 为 Peact element
    const domComponentInstance = new PeactDOMComponent(element);
    domComponentInstance.mountComponent(container);
  }
}

// Peact 实现
const Peact = {
  /**
   * 创造 Peact element 
   * @param {*} type      (String) dom 类型
   * @param {*} props     (Object) Peact element 属性
   * @param {*} children  (Peact element or Dom or Basic type) 子节点 
   */
  createElement(type, props, children){ 
    /* create a Peact element */ 
    const element = {
      type,
      props: props || {},
      _t_: "PeactElement",
      isPeactCreate: function(){
        return isPeactCreate.call(this)
      }
    };

    if (children) {
      element.props.children = children;
    }
    return element;
  },
  /**
   * 创造 Peact class
   * @param {*} sepc   Peact class 声明
   */
  createClass( sepc ){
    // create a Peact class
    function ElementClassConstructor(props){
      this.props = props
      initialState.call(this)
    }
    // render 为必须函数
    if( !sepc.render ){
      console.error("Required render function!")
      return {};
    }

    // 支持全部方法
    // es6 Object.assign 仅适用浅拷贝
    if( Object.assign ){
      ElementClassConstructor.prototype = Object.assign(ElementClassConstructor.prototype, sepc)
    }
    // extend 手动支持
    else{

    }

    ElementClassConstructor._t_ = "PeactClass"
    ElementClassConstructor.isPeactCreate = function(){
      return isPeactCreate.call(this)
    }
    
    return ElementClassConstructor
  },
  render(element /* Peact class or Peact element */, container){
    // 类型判断
    if( element.isPeactCreate && element.isPeactCreate() ){
      // wrapperElement { type: ComponentWrapper, props: element, children: undefined } 
      const wrapperElement = this.createElement(ComponentWrapper, element);

      const componentInstance = new PeactCompositeComponentWrapper(wrapperElement);
      return componentInstance.mountComponent(container);
    }
    // DOM or basic
    else if(typeof element === "string" || typeof element === "number"){
      const componentInstance = new PeactTextComponent(element);
      return componentInstance.mountComponent(container);
    }
  }
}
