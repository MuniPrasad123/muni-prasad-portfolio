# 9:16 storyboard — 68 seconds

## 00:00-00:10
**Caption:** Customer pays once; three confirmation emails appear

**Motion:** Animate one payment card splitting into three webhook packets

**Audio cue:** Short alert pulse

## 00:10-00:20
**Caption:** Provider retries after lost ACK

**Motion:** Animate HTTP request and lost response; retry loop

**Audio cue:** Soft tick

## 00:20-00:30
**Caption:** Verify raw-body signature

**Motion:** Zoom to signed payload and green verification gate

**Audio cue:** Click

## 00:30-00:42
**Caption:** Inbox unique key + guarded state + outbox

**Motion:** Packets flow through PostgreSQL transaction; duplicates bounce

**Audio cue:** Soft impact

## 00:42-00:54
**Caption:** Asynchronous worker and downstream idempotency

**Motion:** Animate outbox to worker to email with retry path

**Audio cue:** Low whoosh

## 00:54-01:08
**Caption:** Metrics and final takeaway

**Motion:** Show duplicate counter 3, committed transitions 1, emails 1

**Audio cue:** Resolve chime

Production: 1080×1920, 30fps, animated packet paths and counters, captions in safe areas, English narration at ~145 wpm; duck music under speech.
