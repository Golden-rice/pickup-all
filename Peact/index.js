// 高阶函数：封装后的 this.props 传递 Peact 实际用于绘制的类型（element or class）
const ComponentWrapper = function (props) {
  this.props = props;
};
ComponentWrapper.prototype.render = function () {
  return this.props;
};

// 类型判断：是否为 Peact 元素
function isPeactCreate() {
  const t = this._t_
  if (t === "PeactElement" || t === "PeactClass") {
    return true
  }
  return false;
}

// state 初始化
function initialState() {
  this.state = {}
  this.getInitialState = function () {
    return this.state
  }
}

let extend = Util.extend

// 此处的 function 写法与 class 写法虽不一致，但基本逻辑一样
// Peact 文本组件 string or number
function PeactDOMTextComponent(text) {
  this._currentElement = '' + text;
}
PeactDOMTextComponent.prototype.mountComponent = function (container) {
  const domElement = document.createElement("span");
  domElement.innerHTML = this._currentElement
  container.appendChild(domElement);
  return domElement
}

// Peact 基础组件
// 管理 html 标签对应的组件
class PeactDOMComponent {
  constructor(element /* Peact element */ ) {
    this._currentElement = element
  }
  // 绘制真实的DOM节点
  mountComponent(container) {
    // create HTML dom 
    const domElement = document.createElement(this._currentElement.type);
    // 显式表现结果
    const children = this._currentElement.props.children;
    const props = this._currentElement.props
    // 目前先支持 一个子节点
    if (typeof children[0] === "string") {
      const textNode = document.createTextNode(children[0]);
      domElement.appendChild(textNode);
    }
    // 注册事件监听
    if (props.onClick) {
      domElement.onclick = props.onClick
    }
    container.appendChild(domElement);
    return domElement;
  }
}

/**
 * 对 Peact 封装的高阶组件进行计算，管理自定义组件对应的PeactElement
 */
class PeactCompositeComponentWrapper {
  constructor(element) {
    this._currentElement = element;
  }

  // 安装 component
  mountComponent(container) {
    // this._currentElement { type: ComponentWrapper, props: element, children: undefined }
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
  createElement(type, config, children) {
    /* create a Peact element */
    function Element(type, key, props) {
      this.type = type
      this.key = key;
      this.props = props;
    }

    let props = extend({}, config)

    // 支持不定参数，并均合并至 children 中
    var childrenLength = arguments.length - 2;
    if (childrenLength === 1) {
      props.children = Array.isArray(children) ? children : [children];
    } else if (childrenLength > 1) {
      var childArray = [];
      for (var i = 0; i < childrenLength; i++) {
        childArray[i] = arguments[i + 2];
      }
      props.children = childArray;
    }

    return new Element(type, null, props)
  },
  /**
   * 创造 Peact class
   * @param {*} sepc   Peact class 声明
   */
  createClass(sepc) {
    // create a Peact class
    function ElementClassConstructor(props) {
      this.props = props
      initialState.call(this)
    }
    // render 为必须函数
    if (!sepc.render) {
      console.error("Required render function!")
      return {};
    }

    // 支持全部方法
    // es6 Object.assign 仅适用浅拷贝
    if (Object.assign) {
      ElementClassConstructor.prototype = Object.assign(ElementClassConstructor.prototype, sepc)
    }
    // extend 手动支持
    else {
      ElementClassConstructor.prototype = extend(ElementClassConstructor.prototype, sepc)
    }

    return ElementClassConstructor
  },

}

const PeactDOM = {
  /**
   * 根据元素类型实例化一个具体的component
   * @param {*} node ReactElement
   * @return {*} 返回一个具体的component实例
   */
  instantiatePeactComponent(node) {
    // 文本节点的情况
    if (typeof node === "string" || typeof node === "number") {
      return new PeactDOMTextComponent(node);
    }
    // 自定义的元素节点及原生DOM
    // wrapperElement { type: ComponentWrapper, props: node, children: undefined } 
    const wrapperNode = Peact.createElement(ComponentWrapper, node);
    return new PeactCompositeComponentWrapper(wrapperNode);
  },
  render(element /* Peact class or Peact element */ , container) {
    const componentInstance = PeactDOM.instantiatePeactComponent(element)
    return componentInstance.mountComponent(container);
  }
}

// es6 支持
// Peact基础组件
class Component {
  constructor() {
    this.props = {}
    this.state = {}
  }
  // state 设置函数
  setState() {}
  // 声明周期函数
  // ...
  render() {}
}