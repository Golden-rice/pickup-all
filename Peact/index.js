
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
      __type: "PeactElement",
      props: props || {}
    };

    if (children) {
      element.props.children = children;
    }
    return element;
  },
  createClass({ render = function(){} }){
    // create a Peact class
    function ElementClass(props){
      this.props = props
      this.__type = 'PeactClass'
    }
    // extend super render function
    if( !!ElementClass.prototype.render ){
      console.error("Required render function!")
      return {};
    }
    ElementClass.prototype.render = render;
    return ElementClass
  },
  render(element /* Peact class or Peact element */, container){
    let componentInstance = {}
    // 类型判断，最后均转化成 Peact element
    if( element.__type && element.__type === "PeactClass"){
      componentInstance = new PeactCompositeComponentWrapper(element);
    }else{
      componentInstance = new PeactDOMComponent(element);
    }
    return componentInstance.mountComponent(container);
  }
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

// class wrapper，转化成 Peact element
class PeactCompositeComponentWrapper {
  constructor(c) {
      this._currentElement = c;
  }
  mountComponent(container) {
      const elementClass = this._currentElement;
      if( !this._currentElement.props ){
        console.error("Required props!")
        return {}
      }

      const element = elementClass.render();
      // element rely on render, so must judge element type
      if( !element.__type || element.__type !== "PeactElement" ){
        console.error("Render create not a Peact element!")
        return {}
      }

      const domComponentInstance = new PeactDOMComponent(element);
      return domComponentInstance.mountComponent(container);
  }
}