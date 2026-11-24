"""Encode caption-aligned scene keyframes with full-rate moving request packets and actual narration."""
import json,os,subprocess,sys
from pathlib import Path
root=Path(__file__).resolve().parents[5];sys.path.insert(0,str(root/'.cache/episode015/python'))
import imageio_ffmpeg
ffmpeg=imageio_ffmpeg.get_ffmpeg_exe();public=root/'public/blog/episodes/017';t=json.loads((public/'timeline-search.json').read_text());folder=root/'.cache/episode017/search-keyframes';frames=json.loads((folder/'frames.json').read_text())
files=sorted(folder.glob('element-*.png'));assert len(files)==len(frames),(len(files),len(frames))
sequence=root/'.cache/episode017/search-frame-sequence';sequence.mkdir(exist_ok=True);cursor=0
for frame in range(t['durationInFrames']):
 while cursor+1<len(frames) and frames[cursor+1]<=frame:cursor+=1
 target=sequence/f'element-{frame:04d}.png'
 if not target.exists():os.link(files[cursor],target)
args=[ffmpeg,'-y','-v','warning','-framerate','30','-i',str(sequence/'element-%04d.png')]
for s in t['scenes']:args.extend(['-i',str(root/'public'/s['audio'])])
args.extend(['-f','lavfi','-i','color=c=0x88e5c6:s=14x14:r=30'])
packet=len(t['scenes'])+1
filters=['[0:v]format=yuv420p[base]',f"[base][{packet}:v]overlay=x='60+mod(t*150,930)':y=670:shortest=1[v]"]
audio=[]
for i,s in enumerate(t['scenes']):
 delay=round(s['from']/30*1000);filters.append(f'[{i+1}:a]adelay={delay}|{delay}[a{i}]');audio.append(f'[a{i}]')
filters.append(''.join(audio)+f'amix=inputs={len(audio)}:normalize=0:duration=longest,apad,atrim=duration={t["durationInFrames"]/30}[a]')
args.extend(['-filter_complex',';'.join(filters),'-map','[v]','-map','[a]','-t',str(t['durationInFrames']/30),'-c:v','libx264','-preset','ultrafast','-crf','18','-threads','2','-c:a','aac','-b:a','160k','-movflags','+faststart',str(public/'lesson-search.mp4')])
subprocess.run(args,check=True);print('Encoded animated video with caption-aligned scenes and narration.')
