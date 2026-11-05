import assert from 'node:assert/strict';
import {parseReceipt} from './worker/core.mjs';
const id='74dcda53-1b79-42ef-867b-01829fb6f6e7';
function wrap(received){const userHtml='window.top.postMessage('+JSON.stringify({type:'passport-comment',id,received})+', "https://passportradio.online");';return 'goog.script.init('+JSON.stringify(JSON.stringify({userHtml}))+');';}
assert.equal(parseReceipt(wrap(true),id).received,true);
assert.equal(parseReceipt(wrap(false),id).received,false);
assert.throws(()=>parseReceipt(wrap(true),'other'));
assert.throws(()=>parseReceipt('OK',id));
console.log('Receipt verification passed');
