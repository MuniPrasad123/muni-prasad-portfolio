/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS media preparation script. */
const fs=require('node:fs');const path=require('node:path');
const dir=__dirname,scenes=JSON.parse(fs.readFileSync(path.join(dir,'scenes.json'),'utf8'));
const stamp=s=>`00:${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}.000`;
const script=['# Episode 014 voiceover and storyboard','','Pending natural-English recording. Six 18-second scenes, three six-second cues each (108 seconds). Calm senior-architect delivery. Record against these cues, then align subtitles to actual speech and review before release.',''];
const vtt=['WEBVTT',''];
scenes.forEach((scene,i)=>{
  script.push(`## ${stamp(i*18)} — ${scene.title}`,'',`Visual: ${scene.nodes.join(' → ')}. Write: ${scene.write}; read: ${scene.read}.`,'');
  scene.voiceover.forEach((line,j)=>{const start=i*18+j*6;script.push(`${stamp(start)}–${stamp(start+6)}: ${line}`,'');vtt.push(`${stamp(start)} --> ${stamp(start+6)}`,line,'');});
});
fs.writeFileSync(path.join(dir,'voiceover.md'),script.join('\n'));
fs.writeFileSync(path.join(dir,'captions.vtt'),vtt.join('\n'));
console.log('Prepared 108-second script and 18 draft synchronized caption cues.');
