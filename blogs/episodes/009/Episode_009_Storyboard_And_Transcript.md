# Episode 009 — 9:16 animated video storyboard and spoken narration

**Target:** 65–90 seconds, vertical 720×1280, H.264/AAC, original sound bed. **Narrator:** intelligible English synthetic voice. **All displayed workload counts:** conceptual, not benchmarks.

| Scene | Visual animation | Spoken narration | Captions | Audio cue |
|---|---|---|---|---|
| 1 · Hook | Shopping orders fly toward a database; latency indicator pulses amber. | Your order history returns only twenty rows. So why can the database still do thousands of rows of work? | ONLY 20 ROWS. THOUSANDS EXAMINED? | Subtle opening pulse |
| 2 · Failure | Request packets pile up before a PostgreSQL icon; queue gauge rises. | In a busy store, the API filters a customer's orders, sorts by date, then skips deep pages. LIMIT caps output, not the work required to find it. | LIMIT DOES NOT LIMIT ALL WORK | Queue ticks |
| 3 · SARGability | `DATE(created_at)` glows red, transforms into a green half-open range. | First, stop wrapping the indexed timestamp in a date function. Use a half-open range, from the start time inclusive to the next boundary exclusive. | USE A HALF-OPEN TIME RANGE | Soft switch |
| 4 · Index | B-tree keys highlight customer, timestamp, and order ID; seek marker moves. | Next, align the B-tree with your query: customer ID first, then created time and order ID in descending order. The order ID breaks timestamp ties. | CUSTOMER → TIME → ORDER ID | Index seek |
| 5 · Cursor | OFFSET 100,000 counter races; cursor arrow jumps to the right position. | Deep OFFSET pages still walk past earlier results. A keyset cursor continues from the last seen timestamp and order ID, avoiding that growing skip. | KEYSET: CONTINUE, DON'T SKIP | Sweep transition |
| 6 · Evidence | Execution plan and buffer meters animate with a caution banner. | Do not guess the speedup. Run EXPLAIN ANALYZE with BUFFERS on representative data. Check actual rows, buffer reads, sorts, and latency. | MEASURE THE ACTUAL PLAN | Meter clicks |
| 7 · Guardrails | API lock, pool gauge and database write indicator move in sync. | Indexes have costs: extra storage, writes, and maintenance. Authenticate the customer, cap page size, sign cursors, and protect the connection pool. | FAST. CORRECT. SECURE. | Low resolve chord |
| 8 · Close | Flow stabilizes; packets travel smoothly; final brand title. | The lesson is simple: optimize the access path, not just the SQL syntax. Explore the interactive lab in Architecture in Motion, Episode nine. | OPTIMIZE THE ACCESS PATH | Fade out |

**Sound design:** unobtrusive synthesized ambient pad under narration, short quiet transition ticks. Never cover speech. Captions are synchronized at the scene level; exact audio timings come from the generated speech segments. **No claim of real measured speedup.**
