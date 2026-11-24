## 00–12s — Checkout freezes
Narration: Asha presses Place Order. Most shoppers finish quickly, but her screen freezes. A timeout does not tell her whether payment succeeded.
Motion: highlight stage 1; animate packet across the active path; reveal caption phrase by phrase. Audio: subtle transition cue; duck background under speech.
## 12–24s — Meet the Java heap
Narration: Think of the heap as a workbench. Cart calculations create temporary objects. Garbage collection clears objects that are no longer reachable.
Motion: highlight stage 2; animate packet across the active path; reveal caption phrase by phrase. Audio: subtle transition cue; duck background under speech.
## 24–36s — Why pauses matter
Narration: Some collection phases pause application threads. But a slow payment provider or database can cause the same customer symptom.
Motion: highlight stage 3; animate packet across the active path; reveal caption phrase by phrase. Audio: subtle transition cue; duck background under speech.
## 36–48s — Follow the evidence
Narration: Compare request traces with garbage collection logs on the same server. Check CPU and dependency waits. An overlap is evidence, not proof of the whole delay.
Motion: highlight stage 4; animate packet across the active path; reveal caption phrase by phrase. Audio: subtle transition cue; duck background under speech.
## 48–60s — Fix the proven cause
Narration: Use Java Flight Recorder to locate allocation hotspots. Remove repeated serialization, keep summaries compact, and bound caches without changing business calculations.
Motion: highlight stage 5; animate packet across the active path; reveal caption phrase by phrase. Audio: subtle transition cue; duck background under speech.
## 60–72s — Validate and protect
Narration: Repeat the same workload and compare tail latency, throughput, memory and CPU. Reconcile uncertain payments. Tune the JVM only after the evidence supports the change.
Motion: highlight stage 6; animate packet across the active path; reveal caption phrase by phrase. Audio: subtle transition cue; duck background under speech.