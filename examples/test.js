import { rHtmlValidator } from "../lib/r-html-validator.js";
import { rHtmlConverter } from "../r-html-converter.js";
/**
 * 태그가 제대로 안닫힐 경우
 * <div> zz  <h1> </h1>
 * 태그 순서가 맞지 않는 경우
 * <div> zz <h1> </div> </h1>
 *
 *
 */

// 테스트 버튼 이벤트 핸들러 객체
const btnHandlers = [
    btnHandler1,
    btnHandler2,
    btnHandler3,
]


// 테스트 버튼 이벤트 처리
const btns = document.querySelectorAll('.container .header button')
for(let [idx, btn] of btns.entries()) {
    btns[idx].onclick = btnHandlers[idx]
}

// 테스트 버튼 이벤트 핸들러 ( 함수 수정하여 테스트 진행 )
function btnHandler1(e) {
    console.log('Btn 1 Click')
}
function btnHandler2(e) {
    console.log('Btn 2 Click')
}
function btnHandler3(e) {
    console.log('Btn 3 Click')
}