# 82-second vertical 9:16 production storyboard

## 0–11s — CUSTOMER
Narration: Maya pays $120 once. Her bank confirms one transaction. Then three order-confirmation emails arrive.
Motion: animate customer, provider, webhook, database and worker nodes with moving glowing packets; zoom to current node; reveal numbered stage 1; show customer consequence and correction side-by-side. Caption: `CUSTOMER`. Audio: gentle pulse on packet arrival, soft error tone on duplicate, warm resolution tone on protected action. Keep captions in bottom safe area and diagrams above.

## 11–22s — WHAT WENT WRONG?
Narration: The payment provider sent a signed success webhook. Our server processed it, but its acknowledgment was lost.
Motion: animate customer, provider, webhook, database and worker nodes with moving glowing packets; zoom to current node; reveal numbered stage 2; show customer consequence and correction side-by-side. Caption: `WHAT WENT WRONG?`. Audio: gentle pulse on packet arrival, soft error tone on duplicate, warm resolution tone on protected action. Keep captions in bottom safe area and diagrams above.

## 22–33s — RETRY
Narration: The provider retries the same event. An unsafe webhook handler sends another email and shipment request.
Motion: animate customer, provider, webhook, database and worker nodes with moving glowing packets; zoom to current node; reveal numbered stage 3; show customer consequence and correction side-by-side. Caption: `RETRY`. Audio: gentle pulse on packet arrival, soft error tone on duplicate, warm resolution tone on protected action. Keep captions in bottom safe area and diagrams above.

## 33–45s — INBOX
Narration: First fix: verify the signature and save the provider event ID in a durable PostgreSQL inbox. Duplicates stop here.
Motion: animate customer, provider, webhook, database and worker nodes with moving glowing packets; zoom to current node; reveal numbered stage 4; show customer consequence and correction side-by-side. Caption: `INBOX`. Audio: gentle pulse on packet arrival, soft error tone on duplicate, warm resolution tone on protected action. Keep captions in bottom safe area and diagrams above.

## 45–56s — STATE GUARD
Narration: Second: transition the payment from pending to succeeded only once, even if different event IDs describe the same payment.
Motion: animate customer, provider, webhook, database and worker nodes with moving glowing packets; zoom to current node; reveal numbered stage 5; show customer consequence and correction side-by-side. Caption: `STATE GUARD`. Audio: gentle pulse on packet arrival, soft error tone on duplicate, warm resolution tone on protected action. Keep captions in bottom safe area and diagrams above.

## 56–69s — OUTBOX
Narration: Third: commit one outbox intent with the payment update. A separate worker delivers it with stable downstream idempotency keys.
Motion: animate customer, provider, webhook, database and worker nodes with moving glowing packets; zoom to current node; reveal numbered stage 6; show customer consequence and correction side-by-side. Caption: `OUTBOX`. Audio: gentle pulse on packet arrival, soft error tone on duplicate, warm resolution tone on protected action. Keep captions in bottom safe area and diagrams above.

## 69–82s — CUSTOMER PROTECTED
Narration: Now repeated webhooks receive a safe acknowledgment without repeating the business action. One payment, one logical confirmation, one fulfillment intent.
Motion: animate customer, provider, webhook, database and worker nodes with moving glowing packets; zoom to current node; reveal numbered stage 7; show customer consequence and correction side-by-side. Caption: `CUSTOMER PROTECTED`. Audio: gentle pulse on packet arrival, soft error tone on duplicate, warm resolution tone on protected action. Keep captions in bottom safe area and diagrams above.

Voice: natural warm English senior architect, clear and unhurried, approximately 120–140 wpm. Time the actual recorded voice and regenerate SRT to align precisely. Background: low-volume ambient, duck under speech. Export H.264/AAC, 1080x1920, 30fps, captions burned in. Do not use synthetic benchmark numbers.
