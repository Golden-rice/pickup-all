// [reactjs源码分析-下篇（更新机制实现原理）](https://github.com/purplebamboo/blog/issues/3)
// [reactjs源码分析-上篇（首次渲染实现原理）](https://github.com/purplebamboo/blog/issues/2)
// [React 源码解析](https://react.jokcy.me/)


// 高阶函数：封装后的 this.props 传递 Peact 实际用于绘制的类型（element or class）
const ComponentWrapper = function (props) {
  this.props = props;
};
ComponentWrapper.prototype.render = function () {
  return this.props
};

/**
 * 通过比较两个元素，判断是否需要更新
 * @param {*} preElement  旧的元素
 * @param {*} nextElement 新的元素
 * @return {boolean}
 */
function _shouldUpdatePeactComponent(prevElement, nextElement) {
  // 判空
  if( !prevElement || !nextElement ) return false;

  // PeactDOMTextComponent

  if (prevElement != null && nextElement != null) {
    var prevType = typeof prevElement;
    var nextType = typeof nextElement;
    if (prevType === "string" || prevType === "number") {
      // 文本节点比较是否为相同类型节点
      return nextType === "string" || nextType === "number";
    } else {
      // 通过type 和 key 判断是否为同类型节点和同一个节点
      return (
        nextType === "object" &&
        prevElement.type === nextElement.type &&
        prevElement.key === nextElement.key
      );
    }
  }
  return false;
}

let extend = Util.extend

// 此处的 function 写法与 class 写法虽不一致，但基本逻辑一样
// Peact 文本组件 string or number
function PeactDOMTextComponent(text) {
  this._currentElement = '' + text;
}
PeactDOMTextComponent.prototype.mountComponent = function (nodeID) {
  this._nodeID = nodeID
  const domElement = document.createElement("span");
  domElement.innerHTML = this._currentElement
  return domElement
}
PeactDOMTextComponent.prototype.receiveComponent = function(nextText) {
  var nextStringText = "" + nextText;
  // 跟以前保存的字符串比较
  if (nextStringText !== this._currentElement) {
    this._currentElement = nextStringText;
    // 替换整个节点
    // $('[data-reactid="' + this._nodeID + '"]').html(this._currentElement);
  }
};

// Peact 基础组件
// 管理 html 标签对应的组件
class PeactDOMComponent {
  constructor(element /* Peact element */ ) {
    this._currentElement = element
  }

  _updateDOMChildren(){}
  _updateDOMProperties(lastProps, nextProps){
    // 新属性替换旧属性
    Object.assign(lastProps, nextProps)
    // 更新属性
  }

  receiveComponent(nextElement){
    var lastProps = this._currentElement.props;
    var nextProps = nextElement.props;
    this._currentElement = nextElement;
    // 处理当前节点的属性
    this._updateDOMProperties(lastProps, nextProps);
    // 处理当前节点的子节点变动
    this._updateDOMChildren(nextElement.props.children);
  }

  // 绘制真实的DOM节点
  mountComponent(nodeID) {
    // console.log(this._currentElement)
    // create HTML dom 
    this._nodeID = nodeID
    const _PEACTCLASS_INSTANCE = this._currentElement._instancePointer
    const children = this._currentElement.props.children;
    const props = this._currentElement.props

    const domElement = document.createElement(this._currentElement.type);
    domElement.setAttribute("data-peactid", nodeID)
    
    // 注册事件监听
    if (props.onClick) {
      // domElement.onclick = props.onClick
      domElement.onclick = function(){
        return props.onClick.call(_PEACTCLASS_INSTANCE)
      }
    }

    children.forEach((child, key) => {
      let childComponentInstance = PeactDOM.instantiatePeactComponent(child)
      // childComponentInstance._mountIndex = key;
      let childDomElement = childComponentInstance.mountComponent(nodeID + "." + key)
      domElement.appendChild(childDomElement)
    })

    return domElement;
  }
}

// 对 Peact 封装的高阶组件进行计算，管理自定义组件对应的PeactElement
class PeactCompositeComponentWrapper {
  constructor(element) {
    this._currentElement = element;
    this._nodeID = null;
    this._instance = null;  // 实例对象 PeactElement or PeactClass
  }

  // 接受 component 并准备更新
  receiveComponent(nextElement, newState){
    this._currentElement = nextElement || this._currentElement;
    
    const { state }  = this._instance;
    const nextProps = this._currentElement.props 
    const nextState = extend(state, newState)
    const nextElement = this._currentElement
    const prevElement = this._renderedElement
    // update 

    // 更新 state
    this._instance.state = nextState

    // shouldComponentUpdate
    if ( this._instance.shouldComponentUpdate && this._instance.shouldComponentUpdate(nextProps, nextState)  === false )
      return;
    
    this._instance.componentWillUpdate && this._instance.componentWillUpdate(nextProps, nextState)

    // 比较 element 决定是否要更新
    if (_shouldUpdateReactComponent(prevElement, nextElement)) {
      // 遍历子节点
      this._instance.componentDidUpdate && this._instance.componentDidUpdate()
    }
  }

  // 安装 component
  mountComponent(nodeID) {
    // this._currentElement { type: ComponentWrapper, props: element, children: undefined }
    // Component 就是 ComponentWrapper 构造函数
    const Component = this._currentElement.type;
    // this._currentElement.props 就是 PeactDOM.render() 第一个参数
    const componentInstance = new Component(this._currentElement.props);
    // 如果是 Peact element，则 element 是 PeactDOM.render() 第一个参数，也就是 New Element()
    // PeactElement { type, props }
    // 如果是 Peact class，element 就是 Peact.createClass 内部的构造函数 ElementClassConstructor
    let element = componentInstance.render();
    this._instance = element
    // 对 element 类型判断决定，如果是 Peact class 则element 是构造函数，如果是 Peact element，element 是string，
    while (typeof element === 'function') {
      // render 为 Peact class 声明时的 render 
      let elementClass = new element()
      element = elementClass.render();
      // 传递指针
      elementClass._peactInternalInstance = this
      // 继承声明的所有方法
      element.__proto__ = elementClass.__proto__
      element._instancePointer = elementClass

      this._instance = elementClass
    }
    this._renderedElement = element
    // componentWillMount
    this._instance.componentWillMount && this._instance.componentWillMount()

    // 确保此处的 element 为 Peact element
    const domComponentInstance = new PeactDOMComponent(element);
    const domElement = domComponentInstance.mountComponent(nodeID);

    // triger 监听事件 mountReady
    // this._instance.componentDidMount && this._instance.componentDidMount()
     
    return domElement
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
    function ElementClass(props) {
      this.props = props
      this.state = this.getInitialState()
    }
    // render 为必须函数
    if (!sepc.render) {
      console.error("Required render function!")
      return {};
    }

    ElementClass.prototype.getInitialState = function(){
      return null
    }
    ElementClass.prototype.setState = function(newState) {
      this._peactInternalInstance.receiveComponent(null, newState);
    };
    
    // 支持全部方法
    // es6 Object.assign 仅适用浅拷贝
    if (Object.assign) {
      ElementClass.prototype = Object.assign(ElementClass.prototype, sepc)
    }
    // extend 手动支持
    else {
      ElementClass.prototype = extend(ElementClass.prototype, sepc)
    }

    return ElementClass
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
    const rootID = "peact"
    const componentInstance = PeactDOM.instantiatePeactComponent(element)
    const domElement =  componentInstance.mountComponent(rootID);

    // 渲染
    container.appendChild(domElement);
  }
}