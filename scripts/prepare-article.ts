import fs from 'node:fs'
import path from 'node:path'
import { getArticles, absoluteUrl } from '../src/lib/blog.ts'
const slug=process.argv[2]
if(!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw Error('Usage: npm run blog:prepare -- article-slug')
const post=getArticles(true).find(p=>p.slug===slug)
if(!post)throw Error('Article not found')
const mediaPath=path.join('content','lessons',slug+'.media.json')
const media=fs.existsSync(mediaPath)?JSON.parse(fs.readFileSync(mediaPath,'utf8')):{scenes:[{title:post.title,caption:post.description,accepted:0,rejected:0}],socialHooks:[post.description]}
if(!Array.isArray(media.scenes)||!media.scenes.length||media.scenes.some((s: Record<string,unknown>)=>typeof s.title!=='string'||typeof s.caption!=='string'||!Number.isInteger(s.accepted)||!Number.isInteger(s.rejected)||Number(s.accepted)<0||Number(s.rejected)<0||Number(s.accepted)+Number(s.rejected)>50))throw Error('Invalid media scenes')
const out=path.join('out','publishing',slug);fs.mkdirSync(out,{recursive:true})
fs.writeFileSync(path.join(out,'video-props.json'),JSON.stringify({title:post.title,scenes:media.scenes,slide:0},null,2))
media.scenes.forEach((_: unknown,i:number)=>fs.writeFileSync(path.join(out,`slide-${i+1}.json`),JSON.stringify({title:post.title,scenes:media.scenes,slide:i},null,2)))
fs.writeFileSync(path.join(out,'linkedin.txt'),`${media.socialHooks.join('\n\n')}\n\nExplore the interactive lesson: ${absoluteUrl('/blog/'+slug)}\n\nEducational example; no personal or employer performance claims.\n`)
fs.writeFileSync(path.join(out,'devto.md'),`---\ntitle: ${JSON.stringify(post.title)}\npublished: false\ncanonical_url: ${absoluteUrl('/blog/'+slug)}\n---\n\nTry the interactive version: ${absoluteUrl('/blog/'+slug)}#interactive-lab\n\n${post.body}`)
fs.writeFileSync(path.join(out,'storyboard.md'),media.scenes.map((s: {title:string;caption:string},i:number)=>`## ${i*45/media.scenes.length}–${(i+1)*45/media.scenes.length}s: ${s.title}\n\n${s.caption}`).join('\n\n'))
fs.mkdirSync('out/publishing',{recursive:true});fs.writeFileSync('out/publishing/inventory.json',JSON.stringify(getArticles(true).map(article=>{const {body,...meta}=article;void body;return meta}),null,2))
console.log(`Prepared local publishing files in ${out}. Nothing was published.`)
