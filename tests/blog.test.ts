import test from 'node:test'
import assert from 'node:assert/strict'
import { initialLimiter, advance, burst } from '../src/lib/rate-limit.ts'
import { getArticles, parseArticle, renderMarkdown, rssFeed } from '../src/lib/blog.ts'
test('eight requests: fixed window admits five then waits for aligned boundary',()=>{
 let result=burst(initialLimiter(),8,'fixed');assert.equal(result.accepted,5);assert.equal(result.rejected,3);assert.equal(result.retryAfter,10)
 result=burst(advance(result.state,5),8,'fixed');assert.equal(result.accepted,0);assert.equal(result.retryAfter,5)
 result=burst(advance(result.state,5),8,'fixed');assert.equal(result.accepted,5)
})
test('bucket refills fractional tokens and caps idle capacity',()=>{
 let result=burst(initialLimiter(),8,'bucket');assert.equal(result.accepted,5);assert.equal(result.retryAfter,2)
 const state=advance(result.state,5);assert.equal(state.tokens,2.5)
 result=burst(state,8,'bucket');assert.equal(result.accepted,2);assert.equal(result.state.tokens,.5);assert.equal(result.retryAfter,1)
 assert.equal(advance(result.state,100).tokens,5)
})
test('boundary burst and invalid input',()=>{
 const first=burst(advance(initialLimiter(),9.9),5,'fixed');const second=burst(advance(first.state,.1),5,'fixed');assert.equal(second.accepted,5)
 assert.throws(()=>advance(initialLimiter(),-1));assert.throws(()=>burst(initialLimiter(),NaN,'fixed'));assert.throws(()=>burst(initialLimiter(),51,'fixed'))
})
test('production content and RSS exclude every draft',()=>{
 const drafts=getArticles(true).filter(post=>post.draft);assert.ok(drafts.length)
 for(const draft of drafts){assert.ok(!getArticles(false).some(post=>post.slug===draft.slug));assert.ok(!rssFeed().includes(draft.slug))}
 assert.ok(getArticles(false).some(post=>post.sample));assert.ok(rssFeed().includes('rate-limiting-shopping-apis'))
})
test('Markdown handles duplicate headings, highlighted code and hostile content safely',()=>{
 const rendered=renderMarkdown('## Same\n\n## Same\n\n```java\nclass Example {}\n```\n\n<script>alert(1)</script>\n\n[x](javascript:alert)')
 assert.deepEqual(rendered.toc.map(h=>h.id),['section-same','section-same-2']);assert.match(rendered.html,/hljs-keyword/);assert.match(rendered.html,/data-copy-code/);assert.ok(!rendered.html.includes('<script>'));assert.ok(!rendered.html.includes('href="javascript:'))
})
test('metadata rejects invalid files instead of silently publishing them',()=>{
 assert.throws(()=>parseArticle('---\ntitle: Missing fields\n---\nText','broken.md'))
})
