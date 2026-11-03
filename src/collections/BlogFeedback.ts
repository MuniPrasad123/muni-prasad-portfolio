import type { CollectionConfig } from 'payload'
export const BlogFeedback: CollectionConfig = {
 slug:'blog-feedback', admin:{useAsTitle:'slug',defaultColumns:['slug','kind','name','approved','createdAt']},
 access:{read:({req})=>Boolean(req.user),create:({req})=>Boolean(req.user),update:({req})=>Boolean(req.user),delete:({req})=>Boolean(req.user)},
 fields:[{name:'slug',type:'text',required:true,index:true},{name:'kind',type:'select',required:true,options:['like','comment']},{name:'visitor',type:'text',required:true,index:true,admin:{hidden:true}},{name:'uniqueKey',type:'text',required:true,unique:true,admin:{hidden:true}},{name:'name',type:'text',maxLength:80},{name:'message',type:'textarea',maxLength:2000},{name:'approved',type:'checkbox',defaultValue:false}],
}
