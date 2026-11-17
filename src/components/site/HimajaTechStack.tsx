'use client'

import { useState } from 'react'
import { PanelsTopLeft, Atom, Braces, Palette, Layers, Database, UserRound, ShoppingCart, FileText, Sheet, Mail, Bot, ChartColumn } from 'lucide-react'
import technologies from './himaja-tech.json'
import styles from './HimajaTechStack.module.css'
const icons=[PanelsTopLeft,Atom,Braces,Palette,Layers,Database,UserRound,ShoppingCart,FileText,Sheet,Mail,Bot,ChartColumn]
export function HimajaTechStack(){
  const [selected,setSelected]=useState(0)
  const item=technologies[selected], ActiveIcon=icons[selected]
  return <section className={styles.section} aria-labelledby="himaja-stack-title"><h3 id="himaja-stack-title">Explore the technology stack</h3><p>Choose an icon to see its role in the reviewed implementation.</p><div className={styles.grid} role="group" aria-label="Himaja technologies">{technologies.map((tech,index)=>{const Icon=icons[index];return <button key={tech.name} type="button" title={tech.layer} aria-pressed={index===selected} aria-controls="himaja-tech-detail" onClick={()=>setSelected(index)}><Icon size={19} aria-hidden="true"/><span>{tech.name}</span></button>})}</div><div className={styles.detail} id="himaja-tech-detail" aria-live="polite"><ActiveIcon size={26} aria-hidden="true"/><div><span>{item.layer}</span><h4>{item.name}</h4><p>{item.detail}</p><a href={'https://github.com/MuniPrasad123/b2b-wholesale/blob/main/'+item.source} target="_blank" rel="noreferrer">Implementation: {item.source} ↗</a></div></div></section>
}
