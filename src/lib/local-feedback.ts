import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash,randomUUID } from 'node:crypto'
type Entry={id:string;slug:string;visitor:string;kind:'like'|'comment';name?:string;message?:string;approved:boolean;date:string}
const directory=path.join(process.cwd(),'.local-data'),file=path.join(directory,'blog-feedback.json')
let queue:Promise<unknown>=Promise.resolve()
export const isLocalFeedbackEnabled=()=>process.env.NODE_ENV==='development'&&!process.env.VERCEL&&!process.env.NEON_DATABASE_URL
export function localFeedback(slug:string,id:string,action?:string,name?:string,message?:string){
 const run=queue.then(async()=>{
  await fs.mkdir(directory,{recursive:true});let rows:Entry[]=[]
  try{rows=JSON.parse(await fs.readFile(file,'utf8'))}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e}
  const visitor=createHash('sha256').update(id).digest('hex')
  if(action){
   if(action==='comment'&&rows.filter(r=>r.visitor===visitor&&r.kind==='comment'&&Date.parse(r.date)>Date.now()-3600000).length>=3)throw Error('Please wait before posting another comment.')
   if(action!=='like'||!rows.some(r=>r.kind==='like'&&r.slug===slug&&r.visitor===visitor)){
    rows.push({id:randomUUID(),slug,visitor,kind:action as 'like'|'comment',name,message,approved:false,date:new Date().toISOString()})
    const temporary=file+'.tmp';await fs.writeFile(temporary,JSON.stringify(rows,null,2));await fs.rename(temporary,file)
   }
   return {success:true}
  }
  const entries=rows.filter(r=>r.slug===slug)
  return {likes:entries.filter(r=>r.kind==='like').length,liked:entries.some(r=>r.kind==='like'&&r.visitor===visitor),comments:entries.filter(r=>r.kind==='comment'&&r.approved).slice(-50).reverse().map(r=>({id:r.id,name:r.name,message:r.message,date:r.date}))}
 });queue=run.catch(()=>{});return run
}
