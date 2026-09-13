require('./register-typescript.cjs');
const assert=require('node:assert/strict');const React=require('react');const {renderToStaticMarkup}=require('react-dom/server');const {JSDOM}=require('jsdom');
const {AgenticIntegrations}=require('../components/platform/agentic-integrations.tsx');
const markup=renderToStaticMarkup(React.createElement(AgenticIntegrations,{controls:true}));
assert.ok(markup.includes('Provider status unverified'));assert.ok(!markup.includes('Connected (runtime checked)'));assert.ok(markup.includes('Import Omi Conversation'));
const dom=new JSDOM('<!doctype html><html lang="en"><title>Integration accessibility test</title><body><main>'+markup+'</main></body></html>');
global.window=dom.window;global.document=dom.window.document;global.Element=dom.window.Element;global.Node=dom.window.Node;
require('axe-core').run(dom.window.document,{rules:{'color-contrast':{enabled:false}}}).then(result=>{assert.deepEqual(result.violations.map(v=>v.id),[]);console.log('PASS component server rendering and axe semantics (contrast/layout require real browser)');dom.window.close();}).catch(e=>{console.error(e);process.exitCode=1;});
