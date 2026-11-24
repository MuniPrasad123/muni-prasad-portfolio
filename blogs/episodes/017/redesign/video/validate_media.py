"""Check actual streams, decoded narration levels, speech-aligned captions and review frames."""
import array, json, math, subprocess, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[5]
sys.path.insert(0,str(ROOT/'.cache/episode015/python'))
import imageio_ffmpeg

video=ROOT/'public/blog/episodes/017/lesson-redesign.mp4'
assert video.stat().st_mtime >= (video.parent/'timeline-redesign.json').stat().st_mtime, 'Video predates the current caption timeline'
timeline=json.loads((video.parent/'timeline-redesign.json').read_text(encoding='utf-8'))
probe=ROOT/'node_modules/@remotion/compositor-win32-x64-msvc/ffprobe.exe'
ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
streams=json.loads(subprocess.check_output([str(probe),'-v','error','-show_streams','-show_format','-of','json',str(video)],text=True))
assert any(s['codec_name']=='h264' for s in streams['streams'])
assert any(s['codec_name']=='aac' for s in streams['streams'])
picture=next(s for s in streams['streams'] if s['codec_type']=='video')
assert (picture['width'],picture['height'])==(1080,1920)
assert picture['r_frame_rate']=='30/1'
duration=float(streams['format']['duration'])
assert abs(duration-timeline['durationInFrames']/30)<0.1
assert 60 <= duration <= 90
raw=subprocess.check_output([ffmpeg,'-v','error','-i',str(video),'-vn','-ac','1','-ar','16000','-f','f32le','pipe:1'])
samples=array.array('f');samples.frombytes(raw)
rms=math.sqrt(sum(v*v for v in samples)/len(samples));peak=max(abs(v) for v in samples)
assert rms>0.003,'Narration is effectively silent'
assert peak<0.9999,'Audio clipping detected'
previous=0
for cue in timeline['cues']:
    assert cue['start']>=previous-0.002 and cue['end']>cue['start']
    assert cue['end']<=duration
    previous=cue['end']
for scene in timeline['scenes']:
    assert ' '.join(c['text'] for c in scene['cues'])==scene['voice']
review=ROOT/'.cache/episode017/review';review.mkdir(parents=True,exist_ok=True)
for i,scene in enumerate(timeline['scenes']):
    at=scene['from']/30+1
    output=review/f'video-scene-{i+1}.png'
    subprocess.run([ffmpeg,'-v','error','-y','-ss',str(at),'-i',str(video),'-frames:v','1','-update','1',str(output)],check=True)
    if i==0:
        (video.parent/'poster-redesign.png').write_bytes(output.read_bytes())
report={'durationSeconds':duration,'sizeBytes':video.stat().st_size,'narrationRmsDb':round(20*math.log10(rms),2),'peakDb':round(20*math.log10(peak),2),'captionCues':len(timeline['cues']),'voice':timeline['voice'],'captionTiming':'TTS spoken-word metadata; punctuation restored from exact script','streams':[{'type':s['codec_type'],'codec':s['codec_name']} for s in streams['streams']]}
(review/'media-qa.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
