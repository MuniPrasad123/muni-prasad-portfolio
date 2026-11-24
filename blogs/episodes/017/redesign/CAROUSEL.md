## Slide 1: Checkout freezes
Asha presses Place Order. Most shoppers finish quickly, but her screen freezes. A timeout does not tell her whether payment succeeded.
## Slide 2: Meet the Java heap
Think of the heap as a workbench. Cart calculations create temporary objects. Garbage collection clears objects that are no longer reachable.
## Slide 3: Why pauses matter
Some collection phases pause application threads. But a slow payment provider or database can cause the same customer symptom.
## Slide 4: Follow the evidence
Compare request traces with garbage collection logs on the same server. Check CPU and dependency waits. An overlap is evidence, not proof of the whole delay.
## Slide 5: Fix the proven cause
Use Java Flight Recorder to locate allocation hotspots. Remove repeated serialization, keep summaries compact, and bound caches without changing business calculations.
## Slide 6: Validate and protect
Repeat the same workload and compare tail latency, throughput, memory and CPU. Reconcile uncertain payments. Tune the JVM only after the evidence supports the change.