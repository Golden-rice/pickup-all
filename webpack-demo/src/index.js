// import _ from 'lodash';
import { cube } from './math.js';
import printMe from './print.js'

// 入口加载
// function component() {
//   var element = document.createElement('pre');
//    	element.innerHTML = _.join([
//      'Hello webpack!',
//      '5 cubed is equal to ' + cube(5)
//    	], ' ');
//   return element;
// }



// 懒加载：将其他文件 通过 import 引入
function component(){
		var element = document.createElement('div');
		var button = document.createElement('button');
		button.onclick = (e) => import(/* webpackChunkName: "print" */ './print').then(module=>{
			var printMe = module.default; // 此处必须显式指向
			printMe();
		})
		button.innerHTML = "click"
		element.appendChild(button);
		return element
}
document.body.appendChild(component());



// 代码分离：将同目录代码通过import函数引用
// function getComponent(){
//   return import(/* webpackChunkName: "lodash" */ 'lodash').then(_ => {
//      var element = document.createElement('div');
//      var _ = _.default;
//      element.innerHTML = _.join(['Hello', 'webpack'], ' ');
//      return element;

//    }).catch(error => 'An error occurred while loading the component');
// }

// 代码分离-优雅写法：
async function getComponent(){
	var element = document.createElement('div');
	// first return promise from import()
  const _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  element.innerHTML = _.join(['Hello', 'webpack'], ' ');
  // then( result =>{})
  return element;
}

getComponent().then(component => {
  document.body.appendChild(component);
})

if (module.hot) {
  module.hot.accept('./print.js', function() {
    console.log('Accepting the updated printMe module!');
    printMe();
  })
}