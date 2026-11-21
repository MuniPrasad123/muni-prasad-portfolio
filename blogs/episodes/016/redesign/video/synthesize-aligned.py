"""Generate neural narration and word-timed captions; dependencies live in .cache, not the app."""
import asyncio, json, math, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
sys.path.insert(0, str(ROOT / '.cache/episode015/python'))
import edge_tts

PUBLIC = ROOT / 'public/blog/episodes/016'
SCENES = json.loads(Path(__file__).with_name('scenes-aligned.json').read_text(encoding='utf-8'))
PROBE = ROOT / 'node_modules/@remotion/compositor-win32-x64-msvc/ffprobe.exe'

def stamp(value, separator='.'):
    ms = round(value * 1000)
    return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02}{separator}{ms%1000:03}'

async def main():
    speech = PUBLIC / 'speech-aligned-v2'
    speech.mkdir(exist_ok=True)
    start = 0
    cues = []
    scenes = []
    for index, scene in enumerate(SCENES):
        target = speech / f'scene-{index+1}.mp3'
        boundaries = target.with_suffix('.json')
        if not target.exists() or not boundaries.exists():
            words = []
            voice = edge_tts.Communicate(scene['voice'], 'en-IN-PrabhatNeural', rate='+0%', boundary='WordBoundary')
            with target.open('wb') as audio:
                async for chunk in voice.stream():
                    if chunk['type'] == 'audio': audio.write(chunk['data'])
                    elif chunk['type'] == 'WordBoundary':
                        words.append({'start':chunk['offset']/1e7,'end':(chunk['offset']+chunk['duration'])/1e7,'text':chunk['text']})
            if not words: raise RuntimeError('No spoken timing metadata; captions cannot be synchronized')
            boundaries.write_text(json.dumps(words, indent=2), encoding='utf-8')
        words = json.loads(boundaries.read_text(encoding='utf-8'))
        # The speech service omits punctuation from WordBoundary text. Restore it from
        # the exact spoken script, validating alignment rather than inventing timings.
        tokens = scene['voice'].split()
        normalize = lambda text: ''.join(c.lower() for c in text if c.isalnum())
        if len(tokens) != len(words) or any(normalize(t)!=normalize(w['text']) for t,w in zip(tokens,words)):
            raise RuntimeError(f'Scene {index+1}: inspect script/word alignment before rendering')
        words = [{**word,'text':token} for word,token in zip(words,tokens)]
        duration = float(subprocess.check_output([str(PROBE),'-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',str(target)], text=True).strip())
        frames = max(round(scene['seconds']*30), math.ceil((duration+0.6)*30))
        group = []
        local_cues = []
        for word in words:
            if group and (len(' '.join(w['text'] for w in group))+len(word['text'])>58 or len(group)>=8 or group[-1]['text'].endswith(('.', '!', '?'))):
                local_cues.append({'start':group[0]['start'],'end':group[-1]['end'],'text':' '.join(w['text'] for w in group)})
                group = []
            group.append(word)
        if group: local_cues.append({'start':group[0]['start'],'end':group[-1]['end'],'text':' '.join(w['text'] for w in group)})
        for current, following in zip(local_cues, local_cues[1:]):
            current['end'] = min(current['end'], following['start'])
        for cue in local_cues: cues.append({**cue,'start':cue['start']+start/30,'end':cue['end']+start/30})
        scenes.append({**scene,'from':start,'frames':frames,'audio':f'blog/episodes/016/speech-aligned-v2/scene-{index+1}.mp3','cues':local_cues})
        start += frames
        print(f'Scene {index+1}: {duration:.2f}s narration / {frames/30:.2f}s scene', flush=True)
    assert 60 <= start/30 <= 90, f'Video must be 60–90 seconds; actual {start/30:.2f}'
    timeline = {'fps':30,'durationInFrames':start,'voice':'en-IN-PrabhatNeural','scenes':scenes,'cues':cues}
    (PUBLIC/'timeline-aligned.json').write_text(json.dumps(timeline,indent=2),encoding='utf-8')
    vtt = ['WEBVTT','']
    srt = []
    for i,cue in enumerate(cues):
        vtt += [f'{stamp(cue["start"])} --> {stamp(cue["end"])}',cue['text'],'']
        srt += [str(i+1),f'{stamp(cue["start"],",")} --> {stamp(cue["end"],",")}',cue['text'],'']
    (PUBLIC/'captions-aligned.vtt').write_text('\n'.join(vtt),encoding='utf-8')
    (PUBLIC/'captions-aligned.srt').write_text('\n'.join(srt),encoding='utf-8')
    print(f'Generated {start/30:.2f}s timeline and {len(cues)} speech-boundary caption cues.',flush=True)

asyncio.run(main())
