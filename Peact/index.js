/**
 * 高阶函数
 * 
 */
const TopLevelWrapper = function(props) {
  this.props = props;
};
TopLevelWrapper.prototype.render = function() {
  return this.props;
};

// Peact 基础组件
class PeactDOMComponent {
  constructor(element /* Peact element */){ 
    this._currentElement = element
  }
  // 绘制真实的DOM节点
  mountComponent(container){
    // create HTML dom 
    const domElement = document.createElement(this._currentElement.type);
    const children = this._currentElement.props.children;
    if( typeof children === "string" ){
      const textNode = document.createTextNode(children);
      domElement.appendChild(textNode);
    }
    container.appendChild(domElement);
    // this._hostNode = domElement; //会在第三章用到
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
    // Component 就是 TopLevelWrapper 构造函数
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
      props: props || {}
    };

    if (children) {
      element.props.children = children;
    }
    return element;
  },
  createClass({ render }){
    // create a Peact class
    function ElementClass(props){
      this.props = props
    }
    if( !render ){
      console.error("Required render function!")
      return {};
    }
    ElementClass.prototype.render = render;
    return ElementClass
  },
  render(element /* Peact class or Peact element */, container){
    // wrapperElement 包含 type 为构造函数，props为组件 element，children = null，prototype.render 函数，
    const wrapperElement = this.createElement(TopLevelWrapper, element);
    // 利用 type 执行构造
    // 将 element 赋值给 this.props (此处的element 可能是 Peact element，也可能是 Peact class)
    // 执行 prototype.render() 返回 this.props
    // 如果是 Peact element， PeactDOMComponent() 
    const componentInstance = new PeactCompositeComponentWrapper(wrapperElement);
    return componentInstance.mountComponent(container);
  }
}
